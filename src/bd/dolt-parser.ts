import { exec } from 'child_process';
import { promisify } from 'util';
import { dirname } from 'path';
import type { Issue, BeadsData } from '../types';

const execAsync = promisify(exec);

/**
 * Run a bd sql query with JSON output, using the workspace containing .beads/
 */
async function bdSql<T>(beadsPath: string, query: string): Promise<T[]> {
  const workspaceDir = dirname(beadsPath);
  // Collapse whitespace to single spaces — bd sql chokes on escaped newlines
  const cleanQuery = query.replace(/\s+/g, ' ').trim();
  const { stdout } = await execAsync(`bd sql --json ${JSON.stringify(cleanQuery)}`, {
    cwd: workspaceDir,
    timeout: 10000,
  });
  const trimmed = stdout.trim();
  if (!trimmed || trimmed === '[]') return [];
  return JSON.parse(trimmed) as T[];
}

/**
 * Read all issues from bd's Dolt database via bd sql CLI
 */
export async function loadBeadsDolt(beadsPath: string): Promise<BeadsData> {
  try {
    // Query all three tables in parallel
    const [issues, labelsRows, dependencies] = await Promise.all([
      bdSql<{
        id: string;
        title: string;
        description: string;
        status: string;
        priority: number;
        issue_type: string;
        assignee: string | null;
        created_at: string;
        updated_at: string;
        closed_at: string | null;
      }>(beadsPath, `
        SELECT id, title, description, status, priority, issue_type,
               assignee, created_at, updated_at, closed_at
        FROM issues
        ORDER BY priority DESC, created_at DESC
      `),
      bdSql<{ issue_id: string; label: string }>(
        beadsPath,
        'SELECT issue_id, label FROM labels'
      ),
      bdSql<{ issue_id: string; depends_on_id: string; type: string }>(
        beadsPath,
        'SELECT issue_id, depends_on_id, type FROM dependencies'
      ),
    ]);

    // Build labels map
    const labelsMap = new Map<string, string[]>();
    for (const row of labelsRows) {
      if (!labelsMap.has(row.issue_id)) {
        labelsMap.set(row.issue_id, []);
      }
      labelsMap.get(row.issue_id)!.push(row.label);
    }

    const byId = new Map<string, Issue>();
    const typedIssues: Issue[] = issues.map((row) => ({
      ...row,
      status: row.status as Issue['status'],
      issue_type: row.issue_type as Issue['issue_type'],
      labels: labelsMap.get(row.id) || [],
    }));

    // Attach to byId map
    for (const issue of typedIssues) {
      byId.set(issue.id, issue);
    }

    // Build dependency relationships
    for (const dep of dependencies) {
      const issue = byId.get(dep.issue_id);
      if (!issue) continue;

      if (dep.type === 'parent-child') {
        issue.parent = dep.depends_on_id;
        const parent = byId.get(dep.depends_on_id);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(dep.issue_id);
        }
      } else if (dep.type === 'blocks') {
        if (!issue.blockedBy) issue.blockedBy = [];
        issue.blockedBy.push(dep.depends_on_id);
        const blocker = byId.get(dep.depends_on_id);
        if (blocker) {
          if (!blocker.blocks) blocker.blocks = [];
          blocker.blocks.push(dep.issue_id);
        }
      }
    }

    // Group by status
    const byStatus: Record<string, Issue[]> = {
      open: [],
      closed: [],
      in_progress: [],
      blocked: [],
    };

    const stats = {
      total: typedIssues.length,
      open: 0,
      closed: 0,
      blocked: 0,
    };

    for (const issue of typedIssues) {
      // Filter blockedBy to only include open blockers
      if (issue.blockedBy) {
        issue.blockedBy = issue.blockedBy.filter((blockerId) => {
          const blocker = byId.get(blockerId);
          return blocker && blocker.status !== 'closed';
        });
      }

      const isBlocked = issue.blockedBy && issue.blockedBy.length > 0;
      const actualStatus =
        isBlocked && issue.status === 'open' ? 'blocked' : issue.status;

      if (byStatus[actualStatus]) {
        byStatus[actualStatus].push(issue);
      }

      if (actualStatus === 'open') stats.open++;
      else if (actualStatus === 'closed') stats.closed++;
      else if (actualStatus === 'blocked') stats.blocked++;
    }

    return { issues: typedIssues, byStatus, byId, stats };
  } catch (error) {
    console.error('Error loading beads from Dolt:', error);
    return {
      issues: [],
      byStatus: { open: [], closed: [], in_progress: [], blocked: [] },
      byId: new Map(),
      stats: { total: 0, open: 0, closed: 0, blocked: 0 },
    };
  }
}
