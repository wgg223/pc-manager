<template>
  <div class="ssh-container">
    <div class="page-header">
      <h2>SSH 远程连接</h2>
      <p class="subtitle">通过 SSH 连接远程服务器并执行命令</p>
    </div>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="connections-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon class="card-icon"><Connection /></el-icon>
              <span>连接管理</span>
              <el-button type="primary" size="small" @click="showAddDialog">
                <el-icon><Plus /></el-icon>
                新建
              </el-button>
            </div>
          </template>

          <div class="connections-list">
            <el-empty v-if="savedConnections.length === 0" description="暂无保存的连接" :image-size="60" />
            <div
              v-for="conn in savedConnections"
              :key="conn.id"
              class="connection-item"
              :class="{ active: activeConnectionId === conn.id }"
            >
              <div class="conn-info" @click="connectTo(conn)">
                <div class="conn-name">
                  <el-icon :size="16"><Monitor /></el-icon>
                  <span>{{ conn.name }}</span>
                  <el-tag v-if="activeConnectionId === conn.id" type="success" size="small">已连接</el-tag>
                </div>
                <div class="conn-detail">{{ conn.username }}@{{ conn.host }}:{{ conn.port }}</div>
              </div>
              <div class="conn-actions">
                <el-button
                  v-if="activeConnectionId === conn.id"
                  type="danger"
                  size="small"
                  text
                  @click.stop="disconnect"
                >
                  <el-icon><SwitchButton /></el-icon>
                  断开
                </el-button>
                <el-button size="small" text @click.stop="editConnection(conn)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button size="small" text type="danger" @click.stop="deleteConnection(conn)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card class="terminal-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon class="card-icon terminal"><Terminal /></el-icon>
              <span>终端</span>
              <span v-if="activeConnectionName" class="terminal-conn-name">
                — {{ activeConnectionName }}
              </span>
              <el-button
                v-if="activeConnectionId"
                class="clear-btn"
                size="small"
                @click="clearTerminal"
              >
                <el-icon><Delete /></el-icon>
                清屏
              </el-button>
            </div>
          </template>

          <div class="terminal-body" ref="terminalBody">
            <div v-if="!activeConnectionId" class="terminal-placeholder">
              <el-icon :size="48"><Connection /></el-icon>
              <p>请从左侧选择或新建一个连接</p>
            </div>
            <div v-else class="terminal-output">
              <div
                v-for="(line, idx) in terminalLines"
                :key="idx"
                :class="['terminal-line', `line-${line.type}`]"
              >
                <span v-if="line.type === 'command'" class="prompt">{{ line.prompt }}</span>
                <span class="line-content">{{ line.content }}</span>
              </div>
              <div v-if="executing" class="terminal-line line-info">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span class="line-content">执行中...</span>
              </div>
            </div>
          </div>

          <div class="terminal-input-area" v-if="activeConnectionId">
            <el-input
              v-model="commandInput"
              placeholder="输入命令后按 Enter 执行"
              @keydown.enter="executeCommand"
              :disabled="executing"
              clearable
            >
              <template #prepend>$</template>
              <template #append>
                <el-button type="primary" @click="executeCommand" :loading="executing">
                  执行
                </el-button>
              </template>
            </el-input>
            <div class="quick-commands">
              <el-button size="small" @click="fillCommand('ls -la')" plain>ls -la</el-button>
              <el-button size="small" @click="fillCommand('pwd')" plain>pwd</el-button>
              <el-button size="small" @click="fillCommand('df -h')" plain>df -h</el-button>
              <el-button size="small" @click="fillCommand('free -m')" plain>free -m</el-button>
              <el-button size="small" @click="fillCommand('top -bn1 | head -20')" plain>top</el-button>
              <el-button size="small" @click="fillCommand('cat /etc/os-release')" plain>系统版本</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑连接' : '新建连接'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="100px" class="connection-form">
        <el-form-item label="连接名称">
          <el-input v-model="form.name" placeholder="例如: 生产服务器" />
        </el-form-item>
        <el-form-item label="主机地址">
          <el-input v-model="form.host" placeholder="例如: 192.168.1.100" />
        </el-form-item>
        <el-form-item label="端口">
          <el-input-number v-model="form.port" :min="1" :max="65535" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="例如: root" />
        </el-form-item>
        <el-form-item label="认证方式">
          <el-radio-group v-model="form.authType">
            <el-radio value="password">密码</el-radio>
            <el-radio value="key">私钥</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.authType === 'password'" label="密码">
          <el-input v-model="form.password" type="password" show-password placeholder="输入密码" />
        </el-form-item>
        <el-form-item v-if="form.authType === 'key'" label="私钥">
          <el-input
            v-model="form.privateKey"
            type="textarea"
            :rows="4"
            placeholder="粘贴私钥内容（PEM 格式）"
          />
        </el-form-item>
        <el-form-item v-if="form.authType === 'key'" label="密钥密码">
          <el-input v-model="form.passphrase" type="password" show-password placeholder="私钥密码（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveConnection" :loading="connecting">
          {{ connecting ? '连接中...' : '保存并连接' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const savedConnections = ref([])
const activeConnectionId = ref(null)
const activeConnectionName = ref('')
const terminalLines = ref([])
const commandInput = ref('')
const executing = ref(false)
const connecting = ref(false)
const dialogVisible = ref(false)
const editingId = ref(null)
const terminalBody = ref(null)

const form = reactive({
  name: '',
  host: '',
  port: 22,
  username: 'root',
  authType: 'password',
  password: '',
  privateKey: '',
  passphrase: ''
})

const resetForm = () => {
  form.name = ''
  form.host = ''
  form.port = 22
  form.username = 'root'
  form.authType = 'password'
  form.password = ''
  form.privateKey = ''
  form.passphrase = ''
  editingId.value = null
}

const showAddDialog = () => {
  resetForm()
  dialogVisible.value = true
}

const editConnection = (conn) => {
  editingId.value = conn.id
  form.name = conn.name
  form.host = conn.host
  form.port = conn.port
  form.username = conn.username
  form.authType = conn.authType || 'password'
  form.password = conn.password || ''
  form.privateKey = conn.privateKey || ''
  form.passphrase = conn.passphrase || ''
  dialogVisible.value = true
}

const loadConnections = async () => {
  try {
    savedConnections.value = await window.electronAPI.sshGetConnections()
  } catch (e) {
    ElMessage.error('加载连接列表失败: ' + (typeof e === 'string' ? e : e.message))
  }
}

const connectTo = async (conn) => {
  if (activeConnectionId.value === conn.id) return

  if (activeConnectionId.value) {
    await disconnect()
  }

  connecting.value = true
  try {
    const result = await window.electronAPI.sshConnect({
      ...conn,
      id: conn.id
    })
    activeConnectionId.value = result.id
    activeConnectionName.value = result.name
    terminalLines.value = [{
      type: 'info',
      content: `已连接到 ${result.name}`
    }]
    ElMessage.success(`已连接到 ${result.name}`)
  } catch (e) {
    ElMessage.error(typeof e === 'string' ? e : '连接失败: ' + e.message)
  } finally {
    connecting.value = false
  }
}

const disconnect = async () => {
  if (!activeConnectionId.value) return
  try {
    await window.electronAPI.sshDisconnect(activeConnectionId.value)
  } catch (e) {}
  terminalLines.value.push({
    type: 'info',
    content: '连接已断开'
  })
  activeConnectionId.value = null
  activeConnectionName.value = ''
  ElMessage.info('已断开连接')
}

const deleteConnection = async (conn) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除连接「${conn.name}」吗？`,
      '确认删除',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
    )
  } catch {
    return
  }

  try {
    if (activeConnectionId.value === conn.id) {
      await disconnect()
    }
    await window.electronAPI.sshDeleteConnection(conn.id)
    await loadConnections()
    ElMessage.success(`已删除连接「${conn.name}」`)
  } catch (e) {
    ElMessage.error('删除失败: ' + (typeof e === 'string' ? e : e.message))
  }
}

const saveConnection = async () => {
  if (!form.host) {
    ElMessage.warning('请输入主机地址')
    return
  }
  if (!form.username) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (form.authType === 'password' && !form.password) {
    ElMessage.warning('请输入密码')
    return
  }
  if (form.authType === 'key' && !form.privateKey) {
    ElMessage.warning('请粘贴私钥内容')
    return
  }

  connecting.value = true
  try {
    const saved = await window.electronAPI.sshSaveConnection({
      id: editingId.value,
      name: form.name || `${form.username}@${form.host}`,
      host: form.host,
      port: form.port,
      username: form.username,
      authType: form.authType,
      password: form.password,
      privateKey: form.privateKey,
      passphrase: form.passphrase
    })

    await loadConnections()
    dialogVisible.value = false

    if (activeConnectionId.value) {
      await disconnect()
    }

    const result = await window.electronAPI.sshConnect(saved)
    activeConnectionId.value = result.id
    activeConnectionName.value = result.name
    terminalLines.value = [{
      type: 'info',
      content: `已连接到 ${result.name}`
    }]
    ElMessage.success(`已连接并保存「${saved.name}」`)
  } catch (e) {
    ElMessage.error(typeof e === 'string' ? e : '连接失败: ' + e.message)
  } finally {
    connecting.value = false
  }
}

const fillCommand = (cmd) => {
  commandInput.value = cmd
}

const executeCommand = async () => {
  const cmd = commandInput.value.trim()
  if (!cmd || !activeConnectionId.value) return

  terminalLines.value.push({
    type: 'command',
    prompt: `$ `,
    content: cmd
  })
  commandInput.value = ''
  executing.value = true
  scrollToBottom()

  try {
    const result = await window.electronAPI.sshExecute(activeConnectionId.value, cmd)
    if (result.stdout.trim()) {
      result.stdout.trim().split('\n').forEach(line => {
        terminalLines.value.push({ type: 'stdout', content: line })
      })
    }
    if (result.stderr.trim()) {
      result.stderr.trim().split('\n').forEach(line => {
        terminalLines.value.push({ type: 'stderr', content: line })
      })
    }
    if (result.code !== 0 && result.code !== null) {
      terminalLines.value.push({
        type: 'info',
        content: `命令退出，返回码: ${result.code}`
      })
    }
  } catch (e) {
    terminalLines.value.push({
      type: 'stderr',
      content: typeof e === 'string' ? e : e.message
    })
  } finally {
    executing.value = false
    scrollToBottom()
  }
}

const clearTerminal = () => {
  terminalLines.value = []
}

const scrollToBottom = () => {
  nextTick(() => {
    if (terminalBody.value) {
      terminalBody.value.scrollTop = terminalBody.value.scrollHeight
    }
  })
}

let outputHandler = null
let closedHandler = null

onMounted(() => {
  loadConnections()

  outputHandler = (id, data) => {
    if (id !== activeConnectionId.value) return
    if (data.type === 'stdout') {
      data.data.trim().split('\n').forEach(line => {
        if (line.trim()) terminalLines.value.push({ type: 'stdout', content: line })
      })
    } else if (data.type === 'stderr') {
      data.data.trim().split('\n').forEach(line => {
        if (line.trim()) terminalLines.value.push({ type: 'stderr', content: line })
      })
    }
    scrollToBottom()
  }

  closedHandler = (id) => {
    if (id === activeConnectionId.value) {
      terminalLines.value.push({ type: 'info', content: '连接已断开' })
      activeConnectionId.value = null
      activeConnectionName.value = ''
    }
  }

  window.electronAPI.onSshOutput(outputHandler)
  window.electronAPI.onSshClosed(closedHandler)
})

onUnmounted(() => {
  if (activeConnectionId.value) {
    window.electronAPI.sshDisconnect(activeConnectionId.value)
  }
})
</script>

<style scoped>
.ssh-container {
  height: 100%;
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

.connections-card,
.terminal-card {
  border-radius: 12px;
  height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
}

.connections-card :deep(.el-card__body),
.terminal-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
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

.card-icon.terminal {
  color: #67C23A;
}

.terminal-conn-name {
  color: #606266;
  font-size: 13px;
  margin-left: 4px;
}

.clear-btn {
  margin-left: auto;
}

.connections-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.connection-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: background 0.2s;
  border: 1px solid transparent;
}

.connection-item:hover {
  background: #F5F7FA;
}

.connection-item.active {
  background: #ECF5FF;
  border-color: #B3D8FF;
}

.conn-info {
  flex: 1;
  min-width: 0;
}

.conn-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.conn-detail {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conn-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.terminal-body {
  flex: 1;
  overflow-y: auto;
  background: #1e1e1e;
  padding: 16px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.terminal-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  gap: 12px;
}

.terminal-placeholder p {
  color: #999;
  font-size: 14px;
}

.terminal-output {
  min-height: 100%;
}

.terminal-line {
  display: flex;
  gap: 4px;
  word-break: break-all;
}

.terminal-line .prompt {
  color: #67C23A;
  user-select: none;
  flex-shrink: 0;
}

.line-command .line-content {
  color: #E6E6E6;
  font-weight: 500;
}

.line-stdout .line-content {
  color: #CCCCCC;
}

.line-stderr .line-content {
  color: #F56C6C;
}

.line-info .line-content {
  color: #909399;
  font-style: italic;
}

.terminal-input-area {
  padding: 12px 16px;
  background: #2d2d2d;
  border-top: 1px solid #3a3a3a;
}

.terminal-input-area :deep(.el-input-group__prepend) {
  background: #1e1e1e;
  border-color: #4a4a4a;
  color: #67C23A;
  font-family: 'Consolas', monospace;
  font-weight: 700;
}

.terminal-input-area :deep(.el-input__inner) {
  background: #1e1e1e;
  border-color: #4a4a4a;
  color: #E6E6E6;
  font-family: 'Consolas', monospace;
}

.terminal-input-area :deep(.el-input-group__append) {
  background: #409EFF;
  border-color: #409EFF;
}

.terminal-input-area :deep(.el-input-group__append .el-button) {
  color: white;
}

.quick-commands {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.quick-commands .el-button {
  background: #3a3a3a;
  border-color: #4a4a4a;
  color: #CCCCCC;
  font-family: 'Consolas', monospace;
  font-size: 11px;
}

.quick-commands .el-button:hover {
  background: #4a4a4a;
  color: #409EFF;
}

.connection-form {
  padding: 0 10px;
}
</style>
