const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // 绐楀彛鎺у埗
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowClose: () => ipcRenderer.send('window-close'),
  
  // 鐢垫簮绠＄悊
  shutdown: (delay) => ipcRenderer.invoke('power-shutdown', delay),
  restart: (delay) => ipcRenderer.invoke('power-restart', delay),
  hibernate: () => ipcRenderer.invoke('power-hibernate'),
  cancelPowerAction: () => ipcRenderer.invoke('power-cancel'),
  
  // 绯荤粺淇℃伅
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getCpuUsage: () => ipcRenderer.invoke('get-cpu-usage'),
  getMemoryUsage: () => ipcRenderer.invoke('get-memory-usage'),
  
  // 杩涚▼绠＄悊
  getProcesses: () => ipcRenderer.invoke('get-processes'),
  killProcess: (pid) => ipcRenderer.invoke('kill-process', pid),
  
  // 纾佺洏娓呯悊
  cleanTempFiles: () => ipcRenderer.invoke('clean-temp-files'),
  emptyRecycleBin: () => ipcRenderer.invoke('empty-recycle-bin'),
  
  // 鍚姩椤圭鐞?  getStartupItems: () => ipcRenderer.invoke('get-startup-items'),
  toggleStartupItem: (name, enabled) => ipcRenderer.invoke('toggle-startup-item', name, enabled),
  
  // 缃戠粶閲嶇疆
  resetDns: () => ipcRenderer.invoke('reset-dns'),
  resetWinsock: () => ipcRenderer.invoke('reset-winsock'),
  resetIp: () => ipcRenderer.invoke('reset-ip'),
  
  // 杞欢鍗歌浇
  getInstalledSoftware: () => ipcRenderer.invoke('get-installed-software'),
  uninstallSoftware: (id, uninstallString) => ipcRenderer.invoke('uninstall-software', id, uninstallString),
  
  // 澹佺焊
  setWallpaper: (path) => ipcRenderer.invoke('set-wallpaper', path),
  selectImage: () => ipcRenderer.invoke('select-image'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  
  // 鎺у埗鍙?  executeCommand: (command) => ipcRenderer.invoke('execute-command', command),
  killCommand: () => ipcRenderer.send('kill-command'),
  onCommandOutput: (callback) => ipcRenderer.on('command-output', (event, data) => callback(data)),
  onCommandExit: (callback) => ipcRenderer.on('command-exit', (event, code) => callback(code)),
  
  // 澶栭儴閾炬帴
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
})
