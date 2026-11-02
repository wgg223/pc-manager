<template>
  <div class="file-transfer-container">
    <div class="page-header">
      <h2>远程文件传输</h2>
      <p class="subtitle">通过 SFTP 在本地与远程服务器之间传输文件</p>
    </div>

    <el-card class="connect-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon class="card-icon"><Connection /></el-icon>
          <span>连接</span>
          <el-tag v-if="connected" type="success" class="status-tag">已连接</el-tag>
          <el-tag v-else type="info" class="status-tag">未连接</el-tag>
        </div>
      </template>

      <div v-if="!connected" class="connect-form">
        <el-row :gutter="12">
          <el-col :span="8">
            <el-input v-model="connectConfig.host" placeholder="主机地址" />
          </el-col>
          <el-col :span="4">
            <el-input-number v-model="connectConfig.port" :min="1" :max="65535" placeholder="端口" controls-position="right" style="width: 100%" />
          </el-col>
          <el-col :span="6">
            <el-input v-model="connectConfig.username" placeholder="用户名" />
          </el-col>
          <el-col :span="6">
            <el-input v-model="connectConfig.password" type="password" show-password placeholder="密码" />
          </el-col>
        </el-row>
        <el-row :gutter="12" style="margin-top: 12px">
          <el-col :span="18">
            <el-select v-model="savedSftpId" placeholder="选择已保存的连接（可选）" clearable style="width: 100%" @change="loadSavedConfig">
              <el-option v-for="c in savedConnections" :key="c.id" :label="c.name" :value="c.id" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="connect" :loading="connecting" style="width: 100%">
              <el-icon><Connection /></el-icon>
              连接
            </el-button>
          </el-col>
        </el-row>
      </div>

      <div v-else class="connected-bar">
        <span class="conn-name">{{ connectionName }}</span>
        <el-button type="danger" plain size="small" @click="disconnect">
          <el-icon><SwitchButton /></el-icon>
          断开连接
        </el-button>
      </div>
    </el-card>

    <el-row :gutter="16" class="file-panels" v-if="connected">
      <el-col :span="12">
        <el-card class="file-card" shadow="hover">
          <template #header>
            <div class="panel-header">
              <span class="panel-title">远程文件</span>
              <div class="path-bar">
                <el-button size="small" text @click="goUp" :disabled="remotePath === '/'">
                  <el-icon><Top /></el-icon>
                </el-button>
                <el-input
                  v-model="remotePath"
                  size="small"
                  @keydown.enter="loadRemoteDir"
                  style="width: 200px"
                />
                <el-button size="small" @click="loadRemoteDir" :loading="remoteLoading">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </div>
            </div>
          </template>

          <div class="toolbar">
            <el-button size="small" @click="showMkdirDialog">
              <el-icon><FolderAdd /></el-icon>
              新建目录
            </el-button>
            <el-button size="small" @click="uploadFiles">
              <el-icon><Upload /></el-icon>
              上传文件
            </el-button>
            <el-button size="small" type="danger" plain :disabled="!selectedRemote.length" @click="deleteRemoteFiles">
              <el-icon><Delete /></el-icon>
              删除选中
            </el-button>
          </div>

          <el-table
            :data="remoteFiles"
            v-loading="remoteLoading"
            @selection-change="handleRemoteSelect"
            @row-dblclick="handleRemoteDblClick"
            height="400"
            size="small"
          >
            <el-table-column type="selection" width="40" />
            <el-table-column label="名称" min-width="180">
              <template #default="{ row }">
                <div class="file-name">
                  <el-icon :size="16" :color="row.isDirectory ? '#E6A23C' : '#909399'">
                    <Folder v-if="row.isDirectory" />
                    <Document v-else />
                  </el-icon>
                  <span>{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="大小" width="90" align="right">
              <template #default="{ row }">
                {{ row.isDirectory ? '-' : formatSize(row.size) }}
              </template>
            </el-table-column>
            <el-table-column label="权限" width="80" prop="permissions" />
            <el-table-column label="操作" width="80" align="center">
              <template #default="{ row }">
                <el-button v-if="!row.isDirectory" size="small" text type="primary" @click.stop="downloadFile(row)">
                  <el-icon><Download /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="file-card" shadow="hover">
          <template #header>
            <div class="panel-header">
              <span class="panel-title">本地文件</span>
              <div class="path-bar">
                <el-button size="small" text @click="localGoUp" :disabled="localPath === localRoot">
                  <el-icon><Top /></el-icon>
                </el-button>
                <el-input
                  v-model="localPath"
                  size="small"
                  @keydown.enter="loadLocalDir"
                  style="width: 200px"
                />
                <el-button size="small" @click="browseLocal">
                  <el-icon><FolderOpened /></el-icon>
                </el-button>
              </div>
            </div>
          </template>

          <div class="toolbar">
            <el-button size="small" @click="browseLocal">
              <el-icon><FolderOpened /></el-icon>
              选择目录
            </el-button>
            <el-button size="small" type="primary" plain :disabled="!selectedLocal.length" @click="downloadSelected">
              <el-icon><Download /></el-icon>
              下载到本地
            </el-button>
          </div>

          <el-table
            :data="localFiles"
            v-loading="localLoading"
            @selection-change="handleLocalSelect"
            @row-dblclick="handleLocalDblClick"
            height="400"
            size="small"
          >
            <el-table-column type="selection" width="40" />
            <el-table-column label="名称" min-width="180">
              <template #default="{ row }">
                <div class="file-name">
                  <el-icon :size="16" :color="row.isDirectory ? '#E6A23C' : '#909399'">
                    <Folder v-if="row.isDirectory" />
                    <Document v-else />
                  </el-icon>
                  <span>{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="大小" width="90" align="right">
              <template #default="{ row }">
                {{ row.isDirectory ? '-' : formatSize(row.size) }}
              </template>
            </el-table-column>
            <el-table-column label="修改时间" width="150">
              <template #default="{ row }">
                {{ row.modifyTime ? formatDate(row.modifyTime) : '-' }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="transfer-log-card" shadow="hover" v-if="transferLogs.length > 0">
      <template #header>
        <div class="card-header">
          <el-icon class="card-icon log"><Document /></el-icon>
          <span>传输日志</span>
          <el-button size="small" text @click="transferLogs = []" style="margin-left: auto">清空</el-button>
        </div>
      </template>
      <div class="transfer-log">
        <div v-for="(log, idx) in transferLogs" :key="idx" :class="['log-line', `log-${log.type}`]">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-msg">{{ log.message }}</span>
        </div>
      </div>
    </el-card>

    <el-dialog v-model="mkdirDialogVisible" title="新建远程目录" width="400px">
      <el-form @submit.prevent="doMkdir">
        <el-form-item label="目录名称">
          <el-input v-model="newDirName" placeholder="输入新目录名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="mkdirDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="doMkdir">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const connected = ref(false)
const connecting = ref(false)
const connectionName = ref('')
const sftpId = ref(null)
const savedConnections = ref([])
const savedSftpId = ref('')

const connectConfig = reactive({
  host: '',
  port: 22,
  username: 'root',
  password: ''
})

const remotePath = ref('/')
const remoteFiles = ref([])
const remoteLoading = ref(false)
const selectedRemote = ref([])

const localPath = ref('')
const localRoot = ref('')
const localFiles = ref([])
const localLoading = ref(false)
const selectedLocal = ref([])

const transferLogs = ref([])
const mkdirDialogVisible = ref(false)
const newDirName = ref('')

const addLog = (type, message) => {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  transferLogs.value.unshift({ type, message, time })
  if (transferLogs.value.length > 100) transferLogs.value.pop()
}

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + units[i]
}

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

const loadSavedSftpConnections = async () => {
  try {
    const sshConns = await window.electronAPI.sshGetConnections()
    savedConnections.value = sshConns
  } catch (e) {}
}

const loadSavedConfig = (id) => {
  const conn = savedConnections.value.find(c => c.id === id)
  if (conn) {
    connectConfig.host = conn.host
    connectConfig.port = conn.port || 22
    connectConfig.username = conn.username
    connectConfig.password = conn.password || ''
  }
}

const connect = async () => {
  if (!connectConfig.host) {
    ElMessage.warning('请输入主机地址')
    return
  }
  if (!connectConfig.username) {
    ElMessage.warning('请输入用户名')
    return
  }

  connecting.value = true
  try {
    const result = await window.electronAPI.sftpConnect({
      host: connectConfig.host,
      port: connectConfig.port,
      username: connectConfig.username,
      password: connectConfig.password,
      name: `${connectConfig.username}@${connectConfig.host}`
    })
    sftpId.value = result.id
    connectionName.value = result.name
    connected.value = true
    addLog('success', `已连接到 ${result.name}`)
    ElMessage.success(`已连接到 ${result.name}`)

    const homeDir = await window.electronAPI.sftpGetHomedir(result.id)
    remotePath.value = homeDir || '/'
    await loadRemoteDir()
    await initLocalPath()
  } catch (e) {
    const msg = typeof e === 'string' ? e : e.message
    addLog('error', '连接失败: ' + msg)
    ElMessage.error('连接失败: ' + msg)
  } finally {
    connecting.value = false
  }
}

const disconnect = async () => {
  if (sftpId.value) {
    try { await window.electronAPI.sftpDisconnect(sftpId.value) } catch (e) {}
  }
  connected.value = false
  sftpId.value = null
  remoteFiles.value = []
  localFiles.value = []
  addLog('info', '已断开连接')
  ElMessage.info('已断开连接')
}

const loadRemoteDir = async () => {
  remoteLoading.value = true
  try {
    remoteFiles.value = await window.electronAPI.sftpList(sftpId.value, remotePath.value)
  } catch (e) {
    ElMessage.error('读取目录失败: ' + (typeof e === 'string' ? e : e.message))
  } finally {
    remoteLoading.value = false
  }
}

const handleRemoteSelect = (rows) => { selectedRemote.value = rows }

const handleRemoteDblClick = (row) => {
  if (row.isDirectory) {
    remotePath.value = remotePath.value === '/' ? '/' + row.name : remotePath.value + '/' + row.name
    loadRemoteDir()
  }
}

const goUp = () => {
  if (remotePath.value === '/') return
  const parts = remotePath.value.split('/').filter(Boolean)
  parts.pop()
  remotePath.value = '/' + parts.join('/')
  loadRemoteDir()
}

const initLocalPath = async () => {
  try {
    const folder = await window.electronAPI.selectFolder()
    if (folder) {
      localPath.value = folder
      localRoot.value = folder
      await loadLocalDir()
    }
  } catch (e) {
    localPath.value = 'C:\\'
    localRoot.value = 'C:\\'
  }
}

const browseLocal = async () => {
  try {
    const folder = await window.electronAPI.selectFolder()
    if (folder) {
      localPath.value = folder
      if (!localRoot.value) localRoot.value = folder
      await loadLocalDir()
    }
  } catch (e) {}
}

const loadLocalDir = async () => {
  localLoading.value = true
  try {
    const files = await window.electronAPI.executeCommand(`dir /b /a "${localPath.value}"`)
    const lines = (files.stdout || '').trim().split('\n').filter(Boolean)
    const result = []
    for (const name of lines) {
      if (name === '.' || name === '..') continue
      const fullPath = localPath.value.replace(/\\$/, '') + '\\' + name
      try {
        const statResult = await window.electronAPI.executeCommand(`powershell -Command "(Get-Item '${fullPath}').Length; (Get-Item '${fullPath}').PSIsContainer; (Get-Item '${fullPath}').LastWriteTime.Ticks"`)
        const statLines = (statResult.stdout || '').trim().split('\n')
        const size = parseInt(statLines[0]) || 0
        const isDir = statLines[1]?.trim() === 'True'
        const ticks = parseInt(statLines[2]) || 0
        result.push({
          name,
          isDirectory: isDir,
          size: isDir ? 0 : size,
          modifyTime: ticks > 0 ? new Date((ticks - 621355968000000000) / 10000).getTime() : Date.now()
        })
      } catch {
        result.push({ name, isDirectory: false, size: 0, modifyTime: Date.now() })
      }
    }
    localFiles.value = result.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1
      if (!a.isDirectory && b.isDirectory) return 1
      return a.name.localeCompare(b.name)
    })
  } catch (e) {
    ElMessage.error('读取本地目录失败')
  } finally {
    localLoading.value = false
  }
}

const handleLocalSelect = (rows) => { selectedLocal.value = rows }

const handleLocalDblClick = (row) => {
  if (row.isDirectory) {
    localPath.value = localPath.value.replace(/\\$/, '') + '\\' + row.name
    loadLocalDir()
  }
}

const localGoUp = () => {
  if (localPath.value === localRoot.value) return
  const parts = localPath.value.split('\\').filter(Boolean)
  parts.pop()
  localPath.value = parts.join('\\') || localRoot.value
  loadLocalDir()
}

const downloadFile = async (row) => {
  if (!localPath.value) {
    ElMessage.warning('请先选择本地保存目录')
    return
  }
  const remoteFile = remotePath.value === '/' ? '/' + row.name : remotePath.value + '/' + row.name
  const localFile = localPath.value.replace(/\\$/, '') + '\\' + row.name
  addLog('info', `正在下载 ${row.name}...`)
  try {
    await window.electronAPI.sftpDownload(sftpId.value, remoteFile, localFile)
    addLog('success', `已下载 ${row.name} → ${localFile}`)
    ElMessage.success(`已下载 ${row.name}`)
    await loadLocalDir()
  } catch (e) {
    addLog('error', `下载 ${row.name} 失败: ${e.message || e}`)
    ElMessage.error('下载失败: ' + (typeof e === 'string' ? e : e.message))
  }
}

const downloadSelected = async () => {
  for (const file of selectedRemote.value) {
    if (!file.isDirectory) {
      await downloadFile(file)
    }
  }
}

const uploadFiles = async () => {
  if (!localPath.value) {
    ElMessage.warning('请先选择本地目录')
    return
  }
  for (const file of selectedLocal.value) {
    if (!file.isDirectory) {
      const localFile = localPath.value.replace(/\\$/, '') + '\\' + file.name
      const remoteFile = remotePath.value === '/' ? '/' + file.name : remotePath.value + '/' + file.name
      addLog('info', `正在上传 ${file.name}...`)
      try {
        await window.electronAPI.sftpUpload(sftpId.value, localFile, remoteFile)
        addLog('success', `已上传 ${file.name} → ${remoteFile}`)
        ElMessage.success(`已上传 ${file.name}`)
      } catch (e) {
        addLog('error', `上传 ${file.name} 失败: ${e.message || e}`)
        ElMessage.error('上传失败: ' + (typeof e === 'string' ? e : e.message))
      }
    }
  }
  await loadRemoteDir()
}

const deleteRemoteFiles = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRemote.value.length} 个文件/目录吗？此操作不可恢复。`,
      '确认删除',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
    )
  } catch { return }

  for (const file of selectedRemote.value) {
    const filePath = remotePath.value === '/' ? '/' + file.name : remotePath.value + '/' + file.name
    try {
      await window.electronAPI.sftpDelete(sftpId.value, filePath, file.isDirectory)
      addLog('success', `已删除 ${file.name}`)
    } catch (e) {
      addLog('error', `删除 ${file.name} 失败: ${e.message || e}`)
      ElMessage.error(`删除 ${file.name} 失败`)
    }
  }
  await loadRemoteDir()
}

const showMkdirDialog = () => {
  newDirName.value = ''
  mkdirDialogVisible.value = true
}

const doMkdir = async () => {
  if (!newDirName.value.trim()) {
    ElMessage.warning('请输入目录名称')
    return
  }
  const newPath = remotePath.value === '/' ? '/' + newDirName.value : remotePath.value + '/' + newDirName.value
  try {
    await window.electronAPI.sftpMkdir(sftpId.value, newPath)
    addLog('success', `已创建目录 ${newDirName.value}`)
    ElMessage.success('目录创建成功')
    mkdirDialogVisible.value = false
    await loadRemoteDir()
  } catch (e) {
    addLog('error', `创建目录失败: ${e.message || e}`)
    ElMessage.error('创建目录失败: ' + (typeof e === 'string' ? e : e.message))
  }
}

onMounted(() => {
  loadSavedSftpConnections()
})

onUnmounted(() => {
  if (sftpId.value) {
    window.electronAPI.sftpDisconnect(sftpId.value)
  }
})
</script>

<style scoped>
.file-transfer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 8px;
}

.subtitle {
  color: #909399;
  font-size: 14px;
}

.connect-card,
.file-card,
.transfer-log-card {
  border-radius: 12px;
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-icon {
  font-size: 22px;
  color: #409EFF;
}

.card-icon.log {
  color: #909399;
}

.status-tag {
  margin-left: auto;
}

.connect-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.connected-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.conn-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.file-panels {
  margin-top: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-title {
  font-weight: 600;
  font-size: 15px;
  color: #303133;
}

.path-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 6px;
}

.transfer-log {
  max-height: 200px;
  overflow-y: auto;
  font-family: 'Consolas', monospace;
  font-size: 12px;
}

.log-line {
  display: flex;
  gap: 12px;
  padding: 4px 0;
  border-bottom: 1px solid #F0F0F0;
}

.log-time {
  color: #909399;
  flex-shrink: 0;
}

.log-success .log-msg { color: #67C23A; }
.log-error .log-msg { color: #F56C6C; }
.log-info .log-msg { color: #606266; }
</style>
