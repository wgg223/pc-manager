const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // 窗口控制
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowClose: () => ipcRenderer.send('window-close'),
  
  // 电源管理
  shutdown: (delay) => ipcRenderer.invoke('power-shutdown', delay),
  restart: (delay) => ipcRenderer.invoke('power-restart', delay),
  hibernate: () => ipcRenderer.invoke('power-hibernate'),
  cancelPowerAction: () => ipcRenderer.invoke('power-cancel'),
  
  // 系统信息
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getCpuUsage: () => ipcRenderer.invoke('get-cpu-usage'),
  getMemoryUsage: () => ipcRenderer.invoke('get-memory-usage'),
  
  // 进程管理
  getProcesses: () => ipcRenderer.invoke('get-processes'),
  killProcess: (pid) => ipcRenderer.invoke('kill-process', pid),
  
  // 磁盘清理
  cleanTempFiles: () => ipcRenderer.invoke('clean-temp-files'),
  emptyRecycleBin: () => ipcRenderer.invoke('empty-recycle-bin'),
  
  // 启动项管理
  getStartupItems: () => ipcRenderer.invoke('get-startup-items'),
  toggleStartupItem: (name, enabled) => ipcRenderer.invoke('toggle-startup-item', name, enabled),
  
  // 网络重置
  resetDns: () => ipcRenderer.invoke('reset-dns'),
  resetWinsock: () => ipcRenderer.invoke('reset-winsock'),
  resetIp: () => ipcRenderer.invoke('reset-ip'),
  
  // 软件卸载
  getInstalledSoftware: () => ipcRenderer.invoke('get-installed-software'),
  uninstallSoftware: (id, uninstallString) => ipcRenderer.invoke('uninstall-software', id, uninstallString),
  
  // 壁纸
  setWallpaper: (path) => ipcRenderer.invoke('set-wallpaper', path),
  selectImage: () => ipcRenderer.invoke('select-image'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  
  // 控制台
  executeCommand: (command) => ipcRenderer.invoke('execute-command', command),
  killCommand: () => ipcRenderer.send('kill-command'),
  onCommandOutput: (callback) => ipcRenderer.on('command-output', (event, data) => callback(data)),
  onCommandExit: (callback) => ipcRenderer.on('command-exit', (event, code) => callback(code)),
  
  // 外部链接
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
})