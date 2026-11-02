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
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // 自动更新
  checkForUpdate: () => ipcRenderer.invoke('check-for-update'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', (event, data) => callback(data)),
  
  // Hosts 管理
  readHosts: () => ipcRenderer.invoke('read-hosts'),
  saveHosts: (content) => ipcRenderer.invoke('save-hosts', content),
  
  // 系统修复
  runSfc: () => ipcRenderer.invoke('run-sfc'),
  runDism: () => ipcRenderer.invoke('run-dism'),
  
  // 服务管理
  getServices: () => ipcRenderer.invoke('get-services'),
  controlService: (name, action) => ipcRenderer.invoke('control-service', name, action),
  
  // 硬件健康
  getDiskHealth: () => ipcRenderer.invoke('get-disk-health'),
  getBatteryInfo: () => ipcRenderer.invoke('get-battery-info'),
  
  // SSH 远程连接
  sshConnect: (config) => ipcRenderer.invoke('ssh-connect', config),
  sshExecute: (id, command) => ipcRenderer.invoke('ssh-execute', id, command),
  sshDisconnect: (id) => ipcRenderer.invoke('ssh-disconnect', id),
  sshDisconnectAll: () => ipcRenderer.invoke('ssh-disconnect-all'),
  sshGetConnections: () => ipcRenderer.invoke('ssh-get-connections'),
  sshSaveConnection: (config) => ipcRenderer.invoke('ssh-save-connection', config),
  sshDeleteConnection: (id) => ipcRenderer.invoke('ssh-delete-connection', id),
  sshGetActive: () => ipcRenderer.invoke('ssh-get-active'),
  onSshOutput: (callback) => ipcRenderer.on('ssh-output', (event, id, data) => callback(id, data)),
  onSshClosed: (callback) => ipcRenderer.on('ssh-closed', (event, id) => callback(id)),
  
  // 远程桌面 (RDP)
  rdpGetConnections: () => ipcRenderer.invoke('rdp-get-connections'),
  rdpSaveConnection: (config) => ipcRenderer.invoke('rdp-save-connection', config),
  rdpDeleteConnection: (id) => ipcRenderer.invoke('rdp-delete-connection', id),
  rdpConnect: (config) => ipcRenderer.invoke('rdp-connect', config),
  
  // SFTP 文件传输
  sftpConnect: (config) => ipcRenderer.invoke('sftp-connect', config),
  sftpList: (id, path) => ipcRenderer.invoke('sftp-list', id, path),
  sftpDownload: (id, remotePath, localPath) => ipcRenderer.invoke('sftp-download', id, remotePath, localPath),
  sftpUpload: (id, localPath, remotePath) => ipcRenderer.invoke('sftp-upload', id, localPath, remotePath),
  sftpDelete: (id, remotePath, isDirectory) => ipcRenderer.invoke('sftp-delete', id, remotePath, isDirectory),
  sftpMkdir: (id, remotePath) => ipcRenderer.invoke('sftp-mkdir', id, remotePath),
  sftpDisconnect: (id) => ipcRenderer.invoke('sftp-disconnect', id),
  sftpStat: (id, remotePath) => ipcRenderer.invoke('sftp-stat', id, remotePath),
  sftpGetHomedir: (id) => ipcRenderer.invoke('sftp-get-homedir', id)
})