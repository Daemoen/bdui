import { watch, type FSWatcher } from 'fs';
import { join } from 'path';
import type { BeadsData } from '../types';
import { loadBeads, type BeadsBackend } from './parser';

export type UpdateCallback = (data: BeadsData) => void;

/**
 * Watch beads database for changes and trigger callbacks.
 * SQLite mode: fs.watch on beads.db with debouncing.
 * Dolt mode: polling interval (no single file to watch).
 */
export class BeadsWatcher {
  private watcher: FSWatcher | null = null;
  private pollInterval: Timer | null = null;
  private callbacks: Set<UpdateCallback> = new Set();
  private beadsPath: string;
  private backend: BeadsBackend;
  private debounceTimeout: Timer | null = null;

  constructor(beadsPath: string, backend: BeadsBackend = 'sqlite') {
    this.beadsPath = beadsPath;
    this.backend = backend;
  }

  /**
   * Start watching for changes
   */
  start() {
    if (this.backend === 'dolt') {
      this.startPolling();
    } else {
      this.startFileWatch();
    }
  }

  /**
   * Start file-system watching (SQLite mode)
   */
  private startFileWatch() {
    if (this.watcher) return;

    const dbPath = join(this.beadsPath, 'beads.db');

    this.watcher = watch(
      dbPath,
      { recursive: false },
      (eventType, filename) => {
        this.handleChange();
      }
    );
  }

  /**
   * Start polling (Dolt mode) — re-query every 3 seconds
   */
  private startPolling() {
    if (this.pollInterval) return;

    this.pollInterval = setInterval(async () => {
      try {
        const data = await loadBeads(this.beadsPath);
        this.notifySubscribers(data);
      } catch (error) {
        // Silently retry on next interval
      }
    }, 3000);
  }

  /**
   * Stop watching
   */
  stop() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
  }

  /**
   * Subscribe to bead updates
   */
  subscribe(callback: UpdateCallback): () => void {
    this.callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Handle file system changes with debouncing
   */
  private handleChange() {
    // Debounce rapid file changes
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(async () => {
      const data = await loadBeads(this.beadsPath);
      this.notifySubscribers(data);
    }, 100);
  }

  /**
   * Notify all subscribers of updates
   */
  private notifySubscribers(data: BeadsData) {
    for (const callback of this.callbacks) {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in watcher callback:', error);
      }
    }
  }

  /**
   * Manually trigger a reload
   */
  async reload() {
    const data = await loadBeads(this.beadsPath);
    this.notifySubscribers(data);
  }
}
