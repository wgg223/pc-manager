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
      if (error) reject(error.message)
      else resolve(true)
    })
  })
})

ipcMain.handle('power-restart', async (event, delaySeconds) => {
  return new Promise((resolve, reject) => {
    const cmd = `shutdown /r /t ${delaySeconds}`
    exec(cmd, (error) => {
      if (error) reject(error.message)
      else resolve(true)
    })
  })
})

ipcMain.handle('power-hibernate', async () => {
  return new Promise((resolve, reject) => {
    exec('shutdown /h', (error) => {
      if (error) reject(error.message)
      else resolve(true)
    })
  })
})

ipcMain.handle('power-cancel', async () => {
  return new Promise((resolve, reject) => {
    exec('shutdown /a', (error) => {
      if (error) reject(error.message)
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
      if (error) reject(error.message)
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
      if (error) reject(error.message)
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
        reject(error.message)
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
          reject(e.message)
        }
      }
    })
  })
})

ipcMain.handle('toggle-startup-item', async (event, name, enabled) => {
  return new Promise((resolve, reject) => {
    const regKey = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
    const cmd = enabled
      ? `reg add "${regKey}" /v "${name}" /t REG_SZ /d "" /f`
      : `reg delete "${regKey}" /v "${name}" /f`
    exec(cmd, (error) => {
      if (error) reject(error.message)
      else resolve(true)
    })
  })
})

// 网络重置
ipcMain.handle('reset-dns', async () => {
  return new Promise((resolve, reject) => {
    const psScript = `Start-Process -FilePath 'ipconfig' -ArgumentList '/flushdns' -Verb RunAs -Wait`
    const encoded = Buffer.from(psScript, 'utf16le').toString('base64')
    execFile('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded], (error) => {
      if (error) reject(error.message)
      else resolve(true)
    })
  })
})

ipcMain.handle('reset-winsock', async () => {
  return new Promise((resolve, reject) => {
    const psScript = `Start-Process -FilePath 'netsh' -ArgumentList 'winsock reset' -Verb RunAs -Wait`
    const encoded = Buffer.from(psScript, 'utf16le').toString('base64')
    execFile('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded], (error) => {
      if (error) reject(error.message)
      else resolve(true)
    })
  })
})

ipcMain.handle('reset-ip', async () => {
  return new Promise((resolve, reject) => {
    const psScript = `Start-Process -FilePath 'cmd' -ArgumentList '/c ipconfig /release & ipconfig /renew' -Verb RunAs -Wait`
    const encoded = Buffer.from(psScript, 'utf16le').toString('base64')
    execFile('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded], (error) => {
      if (error) reject(error.message)
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
        reject(error.message)
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
          reject(e.message)
        }
      }
    })
  })
})

ipcMain.handle('uninstall-software', async (event, id, uninstallString) => {
  return new Promise((resolve, reject) => {
    if (uninstallString) {
      exec(uninstallString, (error) => {
        if (error) reject(error.message)
        else resolve(true)
      })
    } else {
      reject('No uninstall string found')
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
      if (error) reject(error.message)
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
      reject(err.message)
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