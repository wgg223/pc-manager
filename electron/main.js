const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const { exec, execFile } = require('child_process')
const fs = require('fs')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // 始终加载打包后的文件
  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// 窗口控制
ipcMain.on('window-minimize', () => {
  mainWindow.minimize()
})

ipcMain.on('window-maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow.maximize()
  }
})

ipcMain.on('window-close', () => {
  mainWindow.close()
})

// 电源管理
ipcMain.handle('power-shutdown', async (event, delaySeconds) => {
  return new Promise((resolve, reject) => {
    const cmd = `shutdown /s /t ${delaySeconds}`
    exec(cmd, (error) => {
      if (error) reject('关机命令执行失败: ' + error.message)
      else resolve(true)
    })
  })
})

ipcMain.handle('power-restart', async (event, delaySeconds) => {
  return new Promise((resolve, reject) => {
    const cmd = `shutdown /r /t ${delaySeconds}`
    exec(cmd, (error) => {
      if (error) reject('重启的命令执行失败: ' + error.message)
      else resolve(true)
    })
  })
})

ipcMain.handle('power-hibernate', async () => {
  return new Promise((resolve, reject) => {
    exec('shutdown /h', (error) => {
      if (error) reject('休眠命令执行失败: ' + error.message)
      else resolve(true)
    })
  })
})

ipcMain.handle('power-cancel', async () => {
  return new Promise((resolve, reject) => {
    exec('shutdown /a', (error) => {
      if (error) reject('取消电源操作失败: ' + error.message)
      else resolve(true)
    })
  })
})

// 系统信息
ipcMain.handle('get-system-info', async () => {
  const si = require('systeminformation')
  const [cpu, mem, os, disk, network, gpu, baseboard] = await Promise.all([
    si.cpu(),
    si.mem(),
    si.osInfo(),
    si.fsSize(),
    si.networkInterfaces(),
    si.graphics().catch(() => ({ controllers: [], displays: [] })),
    si.baseboard().catch(() => ({}))
  ])
  return { cpu, mem, os, disk, network, gpu, baseboard }
})

ipcMain.handle('get-cpu-usage', async () => {
  const si = require('systeminformation')
  const load = await si.currentLoad()
  return load.currentLoad
})

ipcMain.handle('get-memory-usage', async () => {
  const si = require('systeminformation')
  const mem = await si.mem()
  return {
    total: mem.total,
    used: mem.used,
    free: mem.free,
    usagePercent: (mem.used / mem.total * 100).toFixed(1)
  }
})

// 进程管理
ipcMain.handle('get-processes', async () => {
  const si = require('systeminformation')
  const processes = await si.processes()
  return processes.list.map(p => ({
    pid: p.pid,
    name: p.name,
    cpu: p.cpu,
    mem: p.memRss / 1024 / 1024,
    status: p.state,
    path: p.path
  })).sort((a, b) => b.cpu - a.cpu)
})

ipcMain.handle('kill-process', async (event, pid) => {
  return new Promise((resolve, reject) => {
    exec(`taskkill /F /PID ${pid}`, (error) => {
      if (error) reject('无法结束该进程，可能权限不足或进程已退出: ' + error.message)
      else resolve(true)
    })
  })
})

// 磁盘清理
ipcMain.handle('clean-temp-files', async () => {
  const tempPaths = [
    process.env.TEMP,
    process.env.TEMP + '\\..\\Temp',
    'C:\\Windows\\Temp',
    'C:\\Windows\\Prefetch'
  ]
  
  let totalCleaned = 0
  const results = []
  
  for (const tempPath of tempPaths) {
    try {
      if (fs.existsSync(tempPath)) {
        const files = fs.readdirSync(tempPath)
        for (const file of files) {
          try {
            const filePath = path.join(tempPath, file)
            const stat = fs.statSync(filePath)
            if (stat.isFile()) {
              fs.unlinkSync(filePath)
              totalCleaned += stat.size
            }
          } catch (e) {
            // Skip locked files
          }
        }
        results.push({ path: tempPath, status: 'success' })
      }
    } catch (e) {
      results.push({ path: tempPath, status: 'error', message: e.message })
    }
  }
  
  return { totalCleaned, results }
})

ipcMain.handle('empty-recycle-bin', async () => {
  return new Promise((resolve, reject) => {
    exec('rd /s /q C:\\$Recycle.Bin', (error) => {
      if (error) reject('清空回收站失败，可能需要管理员权限: ' + error.message)
      else resolve(true)
    })
  })
})

// 启动项管理
ipcMain.handle('get-startup-items', async () => {
  return new Promise((resolve, reject) => {
    const cmd = 'powershell -Command "Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location | ConvertTo-Json"'
    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout) => {
      if (error) {
        reject('获取启动项列表失败: ' + error.message)
      } else {
        try {
          let items = JSON.parse(stdout)
          if (!Array.isArray(items)) items = [items]
          items = items.map((item, i) => ({
            id: i.toString(),
            name: item.Name || 'Unknown',
            command: item.Command || '',
            location: item.Location || '',
            enabled: true
          }))
          resolve(items)
        } catch (e) {
          reject('解析启动项数据失败: ' + e.message)
        }
      }
    })
  })
})

ipcMain.handle('toggle-startup-item', async (event, name, enabled) => {
  return new Promise((resolve, reject) => {
    const regKey = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
    if (enabled) {
      exec(`reg add "${regKey}" /v "${name}" /t REG_SZ /d "" /f`, (error) => {
        if (error) reject('启用启动项失败: ' + error.message)
        else resolve(true)
      })
    } else {
      exec(`reg query "${regKey}" /v "${name}"`, (queryError) => {
        if (queryError) {
          resolve(true)
          return
        }
        exec(`reg delete "${regKey}" /v "${name}" /f`, (error) => {
          if (error) reject('移除启动项失败，可能需要管理员权限: ' + error.message)
          else resolve(true)
        })
      })
    }
  })
})

// 网络重置
ipcMain.handle('reset-dns', async () => {
  return new Promise((resolve, reject) => {
    const psScript = `Start-Process -FilePath 'ipconfig' -ArgumentList '/flushdns' -Verb RunAs -Wait`
    const encoded = Buffer.from(psScript, 'utf16le').toString('base64')
    execFile('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded], (error) => {
      if (error) reject('DNS 缓存重置失败: ' + error.message)
      else resolve(true)
    })
  })
})

ipcMain.handle('reset-winsock', async () => {
  return new Promise((resolve, reject) => {
    const psScript = `Start-Process -FilePath 'netsh' -ArgumentList 'winsock reset' -Verb RunAs -Wait`
    const encoded = Buffer.from(psScript, 'utf16le').toString('base64')
    execFile('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded], (error) => {
      if (error) reject('Winsock 重置失败: ' + error.message)
      else resolve(true)
    })
  })
})

ipcMain.handle('reset-ip', async () => {
  return new Promise((resolve, reject) => {
    const psScript = `Start-Process -FilePath 'cmd' -ArgumentList '/c ipconfig /release & ipconfig /renew' -Verb RunAs -Wait`
    const encoded = Buffer.from(psScript, 'utf16le').toString('base64')
    execFile('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded], (error) => {
      if (error) reject('IP 地址重置失败: ' + error.message)
      else resolve(true)
    })
  })
})

// 软件卸载
ipcMain.handle('get-installed-software', async () => {
  return new Promise((resolve, reject) => {
    const cmd = 'powershell -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*, HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* -ErrorAction SilentlyContinue | Select-Object DisplayName, DisplayVersion, Publisher, UninstallString | ConvertTo-Json"'
    exec(cmd, { maxBuffer: 1024 * 1024 * 10, encoding: 'utf8' }, (error, stdout) => {
      if (error) {
        reject('获取已安装软件列表失败: ' + error.message)
      } else {
        try {
          let software = JSON.parse(stdout)
          if (!Array.isArray(software)) software = [software]
          software = software
            .filter(s => s.DisplayName)
            .map((s, i) => ({
              id: i.toString(),
              name: s.DisplayName,
              version: s.DisplayVersion || 'N/A',
              publisher: s.Publisher || '',
              uninstallString: s.UninstallString
            }))
          resolve(software)
        } catch (e) {
          reject('解析软件列表数据失败: ' + e.message)
        }
      }
    })
  })
})

ipcMain.handle('uninstall-software', async (event, id, uninstallString) => {
  return new Promise((resolve, reject) => {
    if (uninstallString) {
      exec(uninstallString, (error) => {
        if (error) reject('卸载程序启动失败: ' + error.message)
        else resolve(true)
      })
    } else {
      reject('未找到该软件的卸载程序')
    }
  })
})

// 壁纸设置
ipcMain.handle('set-wallpaper', async (event, filePath) => {
  return new Promise((resolve, reject) => {
    const psScript = `Add-Type -TypeDefinition @'
using System.Runtime.InteropServices;
public class Wallpaper {
    [DllImport("user32.dll", CharSet=CharSet.Auto)]
    public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
'@
[Wallpaper]::SystemParametersInfo(0x0014, 0, '${filePath.replace(/'/g, "''")}', 0x01)`
    const encoded = Buffer.from(psScript, 'utf16le').toString('base64')
    execFile('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded], (error) => {
      if (error) reject('设置壁纸失败: ' + error.message)
      else resolve(true)
    })
  })
})

ipcMain.handle('select-image', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'bmp', 'gif'] }
    ]
  })
  return result.canceled ? null : result.filePaths[0]
})

// 文件选择
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })
  return result.canceled ? null : result.filePaths[0]
})

// 控制台 - 执行命令
const { spawn } = require('child_process')
let currentProcess = null

ipcMain.handle('execute-command', async (event, command) => {
  return new Promise((resolve, reject) => {
    const wrappedCmd = `chcp 65001 >nul && ${command}`
    const child = spawn('cmd.exe', ['/c', wrappedCmd], {
      shell: true,
      env: { ...process.env, FORCE_COLOR: '0', PYTHONIOENCODING: 'utf-8' },
      windowsHide: true
    })

    currentProcess = child
    let stdout = ''
    let stderr = ''

    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')

    child.stdout.on('data', (data) => {
      const text = data.toString()
      stdout += text
      mainWindow.webContents.send('command-output', text)
    })

    child.stderr.on('data', (data) => {
      const text = data.toString()
      stderr += text
      mainWindow.webContents.send('command-output', text)
    })

    child.on('close', (code) => {
      currentProcess = null
      mainWindow.webContents.send('command-exit', code)
      resolve({ code, stdout, stderr })
    })

    child.on('error', (err) => {
      currentProcess = null
      reject('命令执行失败: ' + err.message)
    })
  })
})

ipcMain.on('kill-command', () => {
  if (currentProcess) {
    currentProcess.kill()
    currentProcess = null
  }
})

// 打开外部链接
ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url)
  return true
})

// 自动更新
let autoUpdater = null

function setupAutoUpdater() {
  try {
    autoUpdater = require('electron-updater').autoUpdater
  } catch (e) {
    console.log('自动更新模块加载失败（开发模式下正常）:', e.message)
    return
  }

  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    mainWindow && mainWindow.webContents.send('update-status', { type: 'checking' })
  })

  autoUpdater.on('update-available', (info) => {
    mainWindow && mainWindow.webContents.send('update-status', {
      type: 'available',
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes
    })
  })

  autoUpdater.on('update-not-available', (info) => {
    mainWindow && mainWindow.webContents.send('update-status', {
      type: 'latest',
      version: info.version
    })
  })

  autoUpdater.on('download-progress', (progress) => {
    mainWindow && mainWindow.webContents.send('update-status', {
      type: 'downloading',
      percent: Number(progress.percent.toFixed(1)),
      transferred: progress.transferred,
      total: progress.total,
      speed: progress.bytesPerSecond
    })
  })

  autoUpdater.on('update-downloaded', () => {
    mainWindow && mainWindow.webContents.send('update-status', { type: 'downloaded' })
  })

  autoUpdater.on('error', (err) => {
    mainWindow && mainWindow.webContents.send('update-status', {
      type: 'error',
      message: err.message || '更新过程中发生未知错误'
    })
  })
}

ipcMain.handle('check-for-update', async () => {
  if (!autoUpdater) {
    setupAutoUpdater()
  }
  if (!autoUpdater) {
    return { success: false, message: '自动更新功能不可用（仅在打包后生效）' }
  }
  try {
    await autoUpdater.checkForUpdates()
    return { success: true }
  } catch (error) {
    return { success: false, message: '检查更新失败: ' + error.message }
  }
})

ipcMain.handle('download-update', async () => {
  if (!autoUpdater) {
    return { success: false, message: '自动更新功能不可用' }
  }
  try {
    await autoUpdater.downloadUpdate()
    return { success: true }
  } catch (error) {
    return { success: false, message: '下载更新失败: ' + error.message }
  }
})

ipcMain.handle('install-update', async () => {
  if (!autoUpdater) {
    return { success: false, message: '自动更新功能不可用' }
  }
  autoUpdater.quitAndInstall(false, true)
  return { success: true }
})

ipcMain.handle('get-app-version', async () => {
  return app.getVersion()
})

// Hosts 文件管理
ipcMain.handle('read-hosts', async () => {
  const hostsPath = 'C:\\Windows\\System32\\drivers\\etc\\hosts'
  try {
    const content = fs.readFileSync(hostsPath, 'utf-8')
    return { success: true, content }
  } catch (error) {
    return { success: false, message: '读取 Hosts 文件失败: ' + error.message }
  }
})

ipcMain.handle('save-hosts', async (event, content) => {
  const hostsPath = 'C:\\Windows\\System32\\drivers\\etc\\hosts'
  return new Promise((resolve) => {
    const tempPath = path.join(app.getPath('temp'), 'hosts_tmp')
    fs.writeFileSync(tempPath, content, 'utf-8')
    const psScript = `Start-Process cmd -ArgumentList '/c copy /y "${tempPath}" "${hostsPath}"' -Verb RunAs -Wait`
    const encoded = Buffer.from(psScript, 'utf16le').toString('base64')
    execFile('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded], (error) => {
      try { fs.unlinkSync(tempPath) } catch {}
      if (error) {
        resolve({ success: false, message: '保存 Hosts 文件失败，可能需要管理员权限: ' + error.message })
      } else {
        resolve({ success: true })
      }
    })
  })
})

// 系统修复 (SFC / DISM)
ipcMain.handle('run-sfc', async () => {
  return new Promise((resolve, reject) => {
    const psScript = `Start-Process -FilePath 'sfc.exe' -ArgumentList '/scannow' -Verb RunAs -Wait`
    const encoded = Buffer.from(psScript, 'utf16le').toString('base64')
    execFile('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded], (error) => {
      if (error) reject('系统文件检查启动失败: ' + error.message)
      else resolve(true)
    })
  })
})

ipcMain.handle('run-dism', async () => {
  return new Promise((resolve, reject) => {
    const psScript = `Start-Process -FilePath 'DISM.exe' -ArgumentList '/Online /Cleanup-Image /RestoreHealth' -Verb RunAs -Wait`
    const encoded = Buffer.from(psScript, 'utf16le').toString('base64')
    execFile('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded], (error) => {
      if (error) reject('DISM 修复启动失败: ' + error.message)
      else resolve(true)
    })
  })
})

// 系统服务管理
ipcMain.handle('get-services', async () => {
  return new Promise((resolve, reject) => {
    const cmd = 'powershell -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Get-Service | Select-Object Name, DisplayName, Status, StartType | ConvertTo-Json"'
    exec(cmd, { maxBuffer: 1024 * 1024 * 10, encoding: 'utf8' }, (error, stdout) => {
      if (error) {
        reject('获取服务列表失败: ' + error.message)
      } else {
        try {
          let services = JSON.parse(stdout)
          if (!Array.isArray(services)) services = [services]
          const statusMap = { Running: 'running', Stopped: 'stopped', Paused: 'paused' }
          services = services.map((s, i) => ({
            id: i.toString(),
            name: s.Name || '',
            displayName: s.DisplayName || s.Name || '',
            status: statusMap[s.Status] || s.Status || 'unknown',
            startType: s.StartType || ''
          })).sort((a, b) => a.displayName.localeCompare(b.displayName, 'zh'))
          resolve(services)
        } catch (e) {
          reject('解析服务数据失败: ' + e.message)
        }
      }
    })
  })
})

ipcMain.handle('control-service', async (event, serviceName, action) => {
  return new Promise((resolve, reject) => {
    let cmd
    if (action === 'start') {
      cmd = `Start-Service '${serviceName}'`
    } else if (action === 'stop') {
      cmd = `Stop-Service '${serviceName}' -Force`
    } else if (action === 'restart') {
      cmd = `Restart-Service '${serviceName}' -Force`
    } else {
      reject('未知的服务操作: ' + action)
      return
    }
    const psScript = `Start-Process powershell -ArgumentList '-Command', '${cmd}' -Verb RunAs -Wait`
    const encoded = Buffer.from(psScript, 'utf16le').toString('base64')
    execFile('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded], (error) => {
      if (error) reject(`服务${action === 'start' ? '启动' : action === 'stop' ? '停止' : '重启'}失败: ` + error.message)
      else resolve(true)
    })
  })
})

// 硬盘健康信息
ipcMain.handle('get-disk-health', async () => {
  return new Promise((resolve, reject) => {
    const cmd = 'powershell -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Get-PhysicalDisk | Select-Object DeviceId, FriendlyName, MediaType, Size, HealthStatus, OperationalStatus | ConvertTo-Json"'
    exec(cmd, { maxBuffer: 1024 * 1024 * 5, encoding: 'utf8' }, (error, stdout) => {
      if (error) {
        reject('获取硬盘信息失败: ' + error.message)
      } else {
        try {
          let disks = JSON.parse(stdout)
          if (!Array.isArray(disks)) disks = [disks]
          disks = disks.map(d => ({
            deviceId: d.DeviceId || '',
            name: d.FriendlyName || '未知硬盘',
            type: d.MediaType || '未知',
            size: d.Size ? (d.Size / 1024 / 1024 / 1024).toFixed(1) + ' GB' : '-',
            health: d.HealthStatus || '未知',
            status: d.OperationalStatus || '未知'
          }))
          resolve(disks)
        } catch (e) {
          reject('解析硬盘数据失败: ' + e.message)
        }
      }
    })
  })
})

// 电池信息
ipcMain.handle('get-battery-info', async () => {
  return new Promise((resolve, reject) => {
    const cmd = 'powershell -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Get-WmiObject Win32_Battery | Select-Object Status, EstimatedChargeRemaining, BatteryStatus, DesignVoltage, ExpectedLife | ConvertTo-Json"'
    exec(cmd, { maxBuffer: 1024 * 1024 * 5, encoding: 'utf8' }, (error, stdout) => {
      if (error) {
        resolve(null)
        return
      }
      try {
        if (!stdout || stdout.trim() === '') {
          resolve(null)
          return
        }
        const battery = JSON.parse(stdout)
        const statusMap = {
          '1': '正在放电', '2': '交流供电', '3': '已充满',
          '4': '充电中', '5': '电量低', '6': '未充电',
          '7': '电量高', '8': '未知', '9': '充电中(高)',
          '10': '充电中(低)', '11': '充电警告'
        }
        resolve({
          status: battery.Status || '未知',
          percent: battery.EstimatedChargeRemaining || 0,
          chargeStatus: statusMap[String(battery.BatteryStatus)] || '未知',
          designVoltage: battery.DesignVoltage ? battery.DesignVoltage + ' mV' : '-'
        })
      } catch {
        resolve(null)
      }
    })
  })
})

// SSH 远程连接
const { Client } = require('ssh2')
const sshConnections = new Map()
let sshIdCounter = 0

const sshConnectionsFile = path.join(app.getPath('userData'), 'ssh-connections.json')

function loadSavedConnections() {
  try {
    if (fs.existsSync(sshConnectionsFile)) {
      return JSON.parse(fs.readFileSync(sshConnectionsFile, 'utf8'))
    }
  } catch (e) {}
  return []
}

function saveConnections(connections) {
  try {
    fs.writeFileSync(sshConnectionsFile, JSON.stringify(connections, null, 2), 'utf8')
  } catch (e) {}
}

ipcMain.handle('ssh-connect', async (event, config) => {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    const id = String(++sshIdCounter)

    conn.on('ready', () => {
      sshConnections.set(id, { conn, config })
      resolve({ id, name: config.name || `${config.username}@${config.host}` })
    })

    conn.on('error', (err) => {
      reject('SSH 连接失败: ' + err.message)
    })

    conn.on('close', () => {
      sshConnections.delete(id)
      mainWindow.webContents.send('ssh-closed', id)
    })

    const connectConfig = {
      host: config.host,
      port: config.port || 22,
      username: config.username,
      readyTimeout: 15000,
      keepaliveInterval: 10000,
      keepaliveCountMax: 3
    }

    if (config.authType === 'key' && config.privateKey) {
      connectConfig.privateKey = config.privateKey
      if (config.passphrase) connectConfig.passphrase = config.passphrase
    } else {
      connectConfig.password = config.password
    }

    conn.connect(connectConfig)
  })
})

ipcMain.handle('ssh-execute', async (event, id, command) => {
  return new Promise((resolve, reject) => {
    const connInfo = sshConnections.get(id)
    if (!connInfo) {
      reject('SSH 连接不存在或已断开')
      return
    }

    connInfo.conn.exec(command, (err, stream) => {
      if (err) {
        reject('命令执行失败: ' + err.message)
        return
      }

      let stdout = ''
      let stderr = ''

      stream.on('close', (code) => {
        mainWindow.webContents.send('ssh-output', id, { type: 'exit', code })
        resolve({ stdout, stderr, code })
      })

      stream.on('data', (data) => {
        const text = data.toString()
        stdout += text
        mainWindow.webContents.send('ssh-output', id, { type: 'stdout', data: text })
      })

      stream.stderr.on('data', (data) => {
        const text = data.toString()
        stderr += text
        mainWindow.webContents.send('ssh-output', id, { type: 'stderr', data: text })
      })
    })
  })
})

ipcMain.handle('ssh-disconnect', async (event, id) => {
  const connInfo = sshConnections.get(id)
  if (connInfo) {
    connInfo.conn.end()
    sshConnections.delete(id)
  }
  return true
})

ipcMain.handle('ssh-disconnect-all', async () => {
  for (const [, connInfo] of sshConnections) {
    connInfo.conn.end()
  }
  sshConnections.clear()
  return true
})

ipcMain.handle('ssh-get-connections', async () => {
  return loadSavedConnections()
})

ipcMain.handle('ssh-save-connection', async (event, config) => {
  const connections = loadSavedConnections()
  const existing = connections.findIndex(c => c.id === config.id)
  const entry = {
    id: config.id || String(Date.now()),
    name: config.name || `${config.username}@${config.host}`,
    host: config.host,
    port: config.port || 22,
    username: config.username,
    authType: config.authType || 'password',
    password: config.password || '',
    privateKey: config.privateKey || '',
    passphrase: config.passphrase || ''
  }
  if (existing >= 0) {
    connections[existing] = entry
  } else {
    connections.push(entry)
  }
  saveConnections(connections)
  return entry
})

ipcMain.handle('ssh-delete-connection', async (event, id) => {
  const connections = loadSavedConnections()
  const filtered = connections.filter(c => c.id !== id)
  saveConnections(filtered)
  const connInfo = sshConnections.get(id)
  if (connInfo) {
    connInfo.conn.end()
    sshConnections.delete(id)
  }
  return true
})

ipcMain.handle('ssh-get-active', async () => {
  const active = []
  for (const [id, connInfo] of sshConnections) {
    active.push({ id, name: connInfo.config.name || `${connInfo.config.username}@${connInfo.config.host}` })
  }
  return active
})

// 远程桌面 (RDP)
const rdpConnectionsFile = path.join(app.getPath('userData'), 'rdp-connections.json')

function loadRdpConnections() {
  try {
    if (fs.existsSync(rdpConnectionsFile)) {
      return JSON.parse(fs.readFileSync(rdpConnectionsFile, 'utf8'))
    }
  } catch (e) {}
  return []
}

function saveRdpConnections(connections) {
  try {
    fs.writeFileSync(rdpConnectionsFile, JSON.stringify(connections, null, 2), 'utf8')
  } catch (e) {}
}

ipcMain.handle('rdp-get-connections', async () => {
  return loadRdpConnections()
})

ipcMain.handle('rdp-save-connection', async (event, config) => {
  const connections = loadRdpConnections()
  const existing = connections.findIndex(c => c.id === config.id)
  const entry = {
    id: config.id || String(Date.now()),
    name: config.name || config.host,
    host: config.host,
    port: config.port || 3389,
    username: config.username || '',
    fullscreen: config.fullscreen !== false,
    resolution: config.resolution || 'default',
    adminMode: config.adminMode || false
  }
  if (existing >= 0) {
    connections[existing] = entry
  } else {
    connections.push(entry)
  }
  saveRdpConnections(connections)
  return entry
})

ipcMain.handle('rdp-delete-connection', async (event, id) => {
  const connections = loadRdpConnections()
  saveRdpConnections(connections.filter(c => c.id !== id))
  return true
})

ipcMain.handle('rdp-connect', async (event, config) => {
  return new Promise((resolve, reject) => {
    const args = [`/v:${config.host}:${config.port || 3389}`]
    if (config.fullscreen !== false) args.push('/f')
    if (config.adminMode) args.push('/admin')
    if (config.resolution && config.resolution !== 'default') {
      const parts = config.resolution.split('x')
      if (parts.length === 2) {
        args.push(`/w:${parts[0]}`)
        args.push(`/h:${parts[1]}`)
      }
    }

    const rdpContent = [
      `full address:s:${config.host}:${config.port || 3389}`,
      `username:s:${config.username || ''}`,
      `screen mode id:i:${config.fullscreen !== false ? '2' : '1'}`,
      `administrative session:i:${config.adminMode ? '1' : '0'}`
    ]

    if (config.resolution && config.resolution !== 'default') {
      const parts = config.resolution.split('x')
      if (parts.length === 2) {
        rdpContent.push(`desktopwidth:i:${parts[0]}`)
        rdpContent.push(`desktopheight:i:${parts[1]}`)
      }
    }

    const tempRdp = path.join(app.getPath('temp'), `rdp-${Date.now()}.rdp`)
    fs.writeFileSync(tempRdp, rdpContent.join('\r\n'), 'utf8')

    execFile('mstsc.exe', [tempRdp], (error) => {
      try { fs.unlinkSync(tempRdp) } catch (e) {}
      if (error) reject('启动远程桌面失败: ' + error.message)
      else resolve(true)
    })
  })
})

// SFTP 远程文件传输
const { SFTPClient } = require('ssh2')
const sftpSessions = new Map()
let sftpIdCounter = 0

ipcMain.handle('sftp-connect', async (event, config) => {
  return new Promise((resolve, reject) => {
    const conn = new (require('ssh2').Client)()
    const id = String(++sftpIdCounter)

    conn.on('ready', () => {
      conn.sftp((err, sftp) => {
        if (err) {
          conn.end()
          reject('SFTP 初始化失败: ' + err.message)
          return
        }
        sftpSessions.set(id, { conn, sftp, config })
        resolve({ id, name: config.name || `${config.username}@${config.host}` })
      })
    })

    conn.on('error', (err) => {
      reject('SFTP 连接失败: ' + err.message)
    })

    const connectConfig = {
      host: config.host,
      port: config.port || 22,
      username: config.username,
      readyTimeout: 15000
    }

    if (config.authType === 'key' && config.privateKey) {
      connectConfig.privateKey = config.privateKey
      if (config.passphrase) connectConfig.passphrase = config.passphrase
    } else {
      connectConfig.password = config.password
    }

    conn.connect(connectConfig)
  })
})

ipcMain.handle('sftp-list', async (event, id, remotePath) => {
  return new Promise((resolve, reject) => {
    const session = sftpSessions.get(id)
    if (!session) { reject('SFTP 连接不存在或已断开'); return }

    session.sftp.readdir(remotePath || '/', (err, list) => {
      if (err) { reject('读取目录失败: ' + err.message); return }
      resolve(list.map(item => ({
        name: item.filename,
        longname: item.longname,
        isDirectory: item.attrs.isDirectory(),
        isFile: item.attrs.isFile(),
        size: item.attrs.size,
        modifyTime: item.attrs.mtime * 1000,
        permissions: '0' + (item.attrs.mode & 0o777).toString(8)
      })).sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1
        if (!a.isDirectory && b.isDirectory) return 1
        return a.name.localeCompare(b.name)
      }))
    })
  })
})

ipcMain.handle('sftp-download', async (event, id, remotePath, localPath) => {
  return new Promise((resolve, reject) => {
    const session = sftpSessions.get(id)
    if (!session) { reject('SFTP 连接不存在或已断开'); return }

    session.sftp.fastGet(remotePath, localPath, (err) => {
      if (err) reject('下载文件失败: ' + err.message)
      else resolve(true)
    })
  })
})

ipcMain.handle('sftp-upload', async (event, id, localPath, remotePath) => {
  return new Promise((resolve, reject) => {
    const session = sftpSessions.get(id)
    if (!session) { reject('SFTP 连接不存在或已断开'); return }

    session.sftp.fastPut(localPath, remotePath, (err) => {
      if (err) reject('上传文件失败: ' + err.message)
      else resolve(true)
    })
  })
})

ipcMain.handle('sftp-delete', async (event, id, remotePath, isDirectory) => {
  return new Promise((resolve, reject) => {
    const session = sftpSessions.get(id)
    if (!session) { reject('SFTP 连接不存在或已断开'); return }

    if (isDirectory) {
      session.sftp.rmdir(remotePath, (err) => {
        if (err) reject('删除目录失败: ' + err.message)
        else resolve(true)
      })
    } else {
      session.sftp.unlink(remotePath, (err) => {
        if (err) reject('删除文件失败: ' + err.message)
        else resolve(true)
      })
    }
  })
})

ipcMain.handle('sftp-mkdir', async (event, id, remotePath) => {
  return new Promise((resolve, reject) => {
    const session = sftpSessions.get(id)
    if (!session) { reject('SFTP 连接不存在或已断开'); return }

    session.sftp.mkdir(remotePath, (err) => {
      if (err) reject('创建目录失败: ' + err.message)
      else resolve(true)
    })
  })
})

ipcMain.handle('sftp-disconnect', async (event, id) => {
  const session = sftpSessions.get(id)
  if (session) {
    session.conn.end()
    sftpSessions.delete(id)
  }
  return true
})

ipcMain.handle('sftp-stat', async (event, id, remotePath) => {
  return new Promise((resolve, reject) => {
    const session = sftpSessions.get(id)
    if (!session) { reject('SFTP 连接不存在或已断开'); return }

    session.sftp.stat(remotePath, (err, stats) => {
      if (err) reject('获取文件信息失败: ' + err.message)
      else resolve({
        size: stats.size,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        modifyTime: stats.mtime * 1000,
        permissions: '0' + (stats.mode & 0o777).toString(8)
      })
    })
  })
})

ipcMain.handle('sftp-get-homedir', async (event, id) => {
  return new Promise((resolve, reject) => {
    const session = sftpSessions.get(id)
    if (!session) { reject('SFTP 连接不存在或已断开'); return }

    session.conn.exec('echo $HOME', (err, stream) => {
      if (err) { resolve('/'); return }
      let output = ''
      stream.on('data', (data) => { output += data.toString() })
      stream.on('close', () => {
        resolve(output.trim() || '/')
      })
    })
  })
})

// 垃圾文件扫描与清理
function getAvailableDrives() {
  const drives = []
  for (let code = 65; code <= 90; code++) {
    const drive = String.fromCharCode(code) + ':'
    try {
      if (fs.existsSync(drive + '\\')) {
        const stat = fs.statSync(drive + '\\')
        if (stat.isDirectory()) {
          drives.push(drive)
        }
      }
    } catch (e) {}
  }
  return drives
}

function scanDirectory(dirPath, patterns, maxDepth, currentDepth, results, level, category) {
  if (currentDepth > maxDepth) return
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      try {
        if (entry.isDirectory()) {
          const dirName = entry.name.toLowerCase()
          if (['$recycle.bin', 'system volume information', 'windows', 'program files', 'program files (x86)'].includes(dirName)) continue
          scanDirectory(fullPath, patterns, maxDepth, currentDepth + 1, results, level, category)
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase()
          const name = entry.name.toLowerCase()
          let matched = false
          for (const pattern of patterns) {
            if (pattern.startsWith('*.')) {
              if (ext === pattern.slice(1)) { matched = true; break }
            } else if (pattern.startsWith('*.') === false) {
              if (name.includes(pattern.toLowerCase())) { matched = true; break }
            }
          }
          if (matched) {
            try {
              const stat = fs.statSync(fullPath)
              results.push({
                path: String(fullPath),
                name: String(entry.name),
                size: Number(stat.size) || 0,
                modified: Number(stat.mtimeMs) || 0,
                level: Number(level) || 1,
                category: String(category)
              })
            } catch (e) {}
          }
        }
      } catch (e) {}
    }
  } catch (e) {}
}

function scanFixedPaths(drive, results) {
  const userHome = process.env.USERPROFILE || (drive + '\\Users\\Default')
  const tempDirs = [
    { path: process.env.TEMP || (userHome + '\\AppData\\Local\\Temp'), level: 1, category: '临时文件' },
    { path: drive + '\\Windows\\Temp', level: 1, category: '系统临时文件' },
    { path: drive + '\\Windows\\Prefetch', level: 2, category: '预读取缓存' }
  ]

  for (const td of tempDirs) {
    try {
      if (!fs.existsSync(td.path)) continue
      const entries = fs.readdirSync(td.path, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(td.path, entry.name)
        try {
          const stat = fs.statSync(fullPath)
          if (stat.isFile()) {
            results.push({
              path: String(fullPath),
              name: String(entry.name),
              size: Number(stat.size) || 0,
              modified: Number(stat.mtimeMs) || 0,
              level: Number(td.level) || 1,
              category: String(td.category)
            })
          } else if (stat.isDirectory()) {
            const subEntries = fs.readdirSync(fullPath, { withFileTypes: true })
            for (const sub of subEntries) {
              try {
                const subPath = path.join(fullPath, sub.name)
                const subStat = fs.statSync(subPath)
                if (subStat.isFile()) {
                  results.push({
                    path: String(subPath),
                    name: String(sub.name),
                    size: Number(subStat.size) || 0,
                    modified: Number(subStat.mtimeMs) || 0,
                    level: Number(td.level) || 1,
                    category: String(td.category)
                  })
                }
              } catch (e) {}
            }
          }
        } catch (e) {}
      }
    } catch (e) {}
  }

  const browserCaches = [
    { path: userHome + '\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache', level: 2, category: '浏览器缓存' },
    { path: userHome + '\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Code Cache', level: 2, category: '浏览器缓存' },
    { path: userHome + '\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Cache', level: 2, category: '浏览器缓存' },
    { path: userHome + '\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Code Cache', level: 2, category: '浏览器缓存' },
    { path: userHome + '\\AppData\\Local\\Mozilla\\Firefox\\Profiles', level: 2, category: '浏览器缓存' },
    { path: userHome + '\\AppData\\Local\\Temp\\chrome_crashpad', level: 1, category: '崩溃报告' }
  ]

  for (const bc of browserCaches) {
    try {
      if (!fs.existsSync(bc.path)) continue
      scanDirectory(bc.path, ['*.*'], 2, 0, results, bc.level, bc.category)
    } catch (e) {}
  }

  const systemJunk = [
    { path: drive + '\\Windows\\Logs', level: 2, category: '系统日志' },
    { path: drive + '\\Windows\\SoftwareDistribution\\Download', level: 2, category: '更新缓存' },
    { path: userHome + '\\AppData\\Local\\CrashDumps', level: 1, category: '崩溃转储' },
    { path: drive + '\\ProgramData\\Microsoft\\Windows\\WER', level: 2, category: '错误报告' },
    { path: userHome + '\\AppData\\Local\\Microsoft\\Windows\\INetCache', level: 2, category: 'IE 缓存' },
    { path: userHome + '\\AppData\\Local\\Microsoft\\Windows\\Explorer', level: 3, category: '缩略图缓存' }
  ]

  for (const sj of systemJunk) {
    try {
      if (!fs.existsSync(sj.path)) continue
      scanDirectory(sj.path, ['*.*'], 2, 0, results, sj.level, sj.category)
    } catch (e) {}
  }

  const thumbCachePatterns = ['thumbcache_']
  try {
    const explorerPath = userHome + '\\AppData\\Local\\Microsoft\\Windows\\Explorer'
    if (fs.existsSync(explorerPath)) {
      const entries = fs.readdirSync(explorerPath)
      for (const entry of entries) {
        const fullPath = path.join(explorerPath, entry)
        try {
          const stat = fs.statSync(fullPath)
          if (stat.isFile() && thumbCachePatterns.some(p => entry.toLowerCase().startsWith(p))) {
            results.push({
              path: String(fullPath),
              name: String(entry),
              size: Number(stat.size) || 0,
              modified: Number(stat.mtimeMs) || 0,
              level: 3,
              category: '缩略图缓存'
            })
          }
        } catch (e) {}
      }
    }
  } catch (e) {}
}

ipcMain.handle('scan-junk-files', async (event, options) => {
  try {
    const drives = getAvailableDrives()
    const results = []
    const scanDrives = (options && options.drives && options.drives.length > 0) ? options.drives : drives

    for (const drive of scanDrives) {
      scanFixedPaths(drive, results)

      const junkPatterns = {
        1: { patterns: ['*.tmp', '*.temp', '*.bak', '*.old', '*.log', '*.dmp', 'thumbs.db', 'desktop.ini', '~$'], category: '临时文件', depth: 4 },
        2: { patterns: ['*.cache', '*.chk', '*.gid', '*.err', '*.old'], category: '系统垃圾', depth: 3 },
        3: { patterns: ['*.msi', '*.exe', '*.zip', '*.rar', '*.7z'], category: '安装包残留', depth: 2 }
      }

      for (const [level, config] of Object.entries(junkPatterns)) {
        const searchDirs = [
          drive + '\\Users',
          process.env.TEMP || (drive + '\\Users\\Default\\AppData\\Local\\Temp')
        ]
        for (const dir of searchDirs) {
          try {
            if (!fs.existsSync(dir)) continue
            scanDirectory(dir, config.patterns, config.depth, 0, results, parseInt(level), config.category)
          } catch (e) {}
        }
      }
    }

    const uniqueResults = []
    const seen = new Set()
    for (const r of results) {
      if (!seen.has(r.path)) {
        seen.add(r.path)
        uniqueResults.push({
          path: String(r.path),
          name: String(r.name),
          size: Number(r.size) || 0,
          modified: Number(r.modified) || 0,
          level: Number(r.level) || 1,
          category: String(r.category)
        })
      }
    }

    const byLevel = { 1: { count: 0, size: 0 }, 2: { count: 0, size: 0 }, 3: { count: 0, size: 0 } }
    const byCategory = {}

    for (const f of uniqueResults) {
      const lvl = Number(f.level) || 1
      if (byLevel[lvl]) {
        byLevel[lvl].count++
        byLevel[lvl].size += Number(f.size) || 0
      }
      const cat = String(f.category)
      if (!byCategory[cat]) {
        byCategory[cat] = { count: 0, size: 0, level: lvl }
      }
      byCategory[cat].count++
      byCategory[cat].size += Number(f.size) || 0
    }

    const result = {
      files: uniqueResults,
      summary: {
        total: Number(uniqueResults.length),
        totalSize: Number(uniqueResults.reduce((sum, f) => sum + (Number(f.size) || 0), 0)),
        byLevel: {
          1: { count: Number(byLevel[1].count), size: Number(byLevel[1].size) },
          2: { count: Number(byLevel[2].count), size: Number(byLevel[2].size) },
          3: { count: Number(byLevel[3].count), size: Number(byLevel[3].size) }
        },
        byCategory: byCategory
      },
      drives: drives.map(d => String(d))
    }

    return JSON.parse(JSON.stringify(result))
  } catch (e) {
    throw new Error('扫描失败: ' + e.message)
  }
})

ipcMain.handle('clean-junk-files', async (event, filePaths) => {
  let cleaned = 0
  let totalSize = 0
  const errors = []

  for (const filePath of filePaths) {
    try {
      const stat = fs.statSync(filePath)
      fs.unlinkSync(filePath)
      cleaned++
      totalSize += Number(stat.size) || 0
    } catch (e) {
      errors.push({ path: String(filePath), error: String(e.message || e) })
    }
  }

  return JSON.parse(JSON.stringify({ cleaned: Number(cleaned), totalSize: Number(totalSize), errors }))
})

ipcMain.handle('get-available-drives', async () => {
  return getAvailableDrives()
})