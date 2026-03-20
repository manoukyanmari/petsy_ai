import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('petsy', {
  // Send events to main process
  startSimulation: (config) => ipcRenderer.invoke('start-simulation', config),
  stopSimulation: () => ipcRenderer.invoke('stop-simulation'),
  resetSimulation: () => ipcRenderer.invoke('reset-simulation'),
  setDifficulty: (difficulty) => ipcRenderer.invoke('set-difficulty', difficulty),
  
  // Receive events from main process
  onSimulationStarted: (callback) => ipcRenderer.on('simulation-started', callback),
  onSimulationStopped: (callback) => ipcRenderer.on('simulation-stopped', callback),
  onSimulationReset: (callback) => ipcRenderer.on('simulation-reset', callback),
  onShowAbout: (callback) => ipcRenderer.on('show-about', callback),
  
  // Invoke handlers - fetch data from Python bridge
  getState: () => ipcRenderer.invoke('get-state'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  getObstacles: () => ipcRenderer.invoke('get-obstacles'),
  
  // Remove listeners
  removeSimulationListener: (channel) => ipcRenderer.removeAllListeners(channel)
});
