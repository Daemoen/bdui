export interface Theme {
  name: string;
  colors: {
    // Status colors
    statusOpen: string;
    statusInProgress: string;
    statusBlocked: string;
    statusClosed: string;

    // Priority colors
    priorityCritical: string;
    priorityHigh: string;
    priorityMedium: string;
    priorityLow: string;
    priorityLowest: string;

    // Issue type colors
    typeEpic: string;
    typeFeature: string;
    typeBug: string;
    typeTask: string;
    typeChore: string;

    // UI colors
    primary: string;
    selection: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textDim: string;
    border: string;
    success: string;
    error: string;
    warning: string;
  };
}

export const themes: Record<string, Theme> = {
  default: {
    name: 'Default',
    colors: {
      statusOpen: 'blue',
      statusInProgress: 'yellow',
      statusBlocked: 'red',
      statusClosed: 'green',

      priorityCritical: 'red',
      priorityHigh: 'yellow',
      priorityMedium: 'cyan',
      priorityLow: 'blue',
      priorityLowest: 'gray',

      typeEpic: 'magenta',
      typeFeature: 'green',
      typeBug: 'red',
      typeTask: 'blue',
      typeChore: 'gray',

      primary: 'cyan',
      selection: 'cyan',
      secondary: 'blue',
      accent: 'magenta',
      background: 'black',
      text: 'white',
      textDim: 'gray',
      border: 'gray',
      success: 'green',
      error: 'red',
      warning: 'yellow',
    },
  },

  ocean: {
    name: 'Ocean',
    colors: {
      statusOpen: 'cyan',
      statusInProgress: 'blue',
      statusBlocked: 'magenta',
      statusClosed: 'green',

      priorityCritical: 'magenta',
      priorityHigh: 'blue',
      priorityMedium: 'cyan',
      priorityLow: 'green',
      priorityLowest: 'gray',

      typeEpic: 'blue',
      typeFeature: 'cyan',
      typeBug: 'magenta',
      typeTask: 'green',
      typeChore: 'gray',

      primary: 'cyan',
      selection: 'cyan',
      secondary: 'blue',
      accent: 'green',
      background: 'black',
      text: 'white',
      textDim: 'gray',
      border: 'cyan',
      success: 'green',
      error: 'magenta',
      warning: 'blue',
    },
  },

  forest: {
    name: 'Forest',
    colors: {
      statusOpen: 'green',
      statusInProgress: 'yellow',
      statusBlocked: 'red',
      statusClosed: 'cyan',

      priorityCritical: 'red',
      priorityHigh: 'yellow',
      priorityMedium: 'green',
      priorityLow: 'cyan',
      priorityLowest: 'gray',

      typeEpic: 'yellow',
      typeFeature: 'green',
      typeBug: 'red',
      typeTask: 'cyan',
      typeChore: 'gray',

      primary: 'green',
      selection: 'green',
      secondary: 'cyan',
      accent: 'yellow',
      background: 'black',
      text: 'white',
      textDim: 'gray',
      border: 'green',
      success: 'cyan',
      error: 'red',
      warning: 'yellow',
    },
  },

  sunset: {
    name: 'Sunset',
    colors: {
      statusOpen: 'yellow',
      statusInProgress: 'magenta',
      statusBlocked: 'red',
      statusClosed: 'cyan',

      priorityCritical: 'red',
      priorityHigh: 'magenta',
      priorityMedium: 'yellow',
      priorityLow: 'cyan',
      priorityLowest: 'gray',

      typeEpic: 'magenta',
      typeFeature: 'yellow',
      typeBug: 'red',
      typeTask: 'cyan',
      typeChore: 'gray',

      primary: 'magenta',
      selection: 'magenta',
      secondary: 'yellow',
      accent: 'red',
      background: 'black',
      text: 'white',
      textDim: 'gray',
      border: 'magenta',
      success: 'cyan',
      error: 'red',
      warning: 'yellow',
    },
  },

  sonokai: {
    name: 'Sonokai',
    colors: {
      statusOpen: '#0087ff',
      statusInProgress: '#e7c664',
      statusBlocked: '#af0000',
      statusClosed: '#9ed072',

      priorityCritical: '#fc5d7c',
      priorityHigh: '#f39660',
      priorityMedium: '#e7c664',
      priorityLow: '#76cce0',
      priorityLowest: '#7f8490',

      typeEpic: '#b39df3',
      typeFeature: '#9ed072',
      typeBug: '#fc5d7c',
      typeTask: '#76cce0',
      typeChore: '#7f8490',

      primary: '#0087ff',
      selection: '#ff005f',
      secondary: '#76cce0',
      accent: '#b39df3',
      background: '#2c2e34',
      text: '#0087ff',
      textDim: '#7f8490',
      border: '#00af87',
      success: '#9ed072',
      error: '#fc5d7c',
      warning: '#e7c664',
    },
  },

  monochrome: {
    name: 'Monochrome',
    colors: {
      statusOpen: 'white',
      statusInProgress: 'gray',
      statusBlocked: 'white',
      statusClosed: 'gray',

      priorityCritical: 'white',
      priorityHigh: 'white',
      priorityMedium: 'gray',
      priorityLow: 'gray',
      priorityLowest: 'gray',

      typeEpic: 'white',
      typeFeature: 'white',
      typeBug: 'white',
      typeTask: 'gray',
      typeChore: 'gray',

      primary: 'white',
      selection: 'white',
      secondary: 'gray',
      accent: 'white',
      background: 'black',
      text: 'white',
      textDim: 'gray',
      border: 'white',
      success: 'white',
      error: 'white',
      warning: 'white',
    },
  },
};

export const getTheme = (themeName: string): Theme => {
  return themes[themeName] || themes.default;
};

export const getThemeNames = (): string[] => {
  return Object.keys(themes);
};
