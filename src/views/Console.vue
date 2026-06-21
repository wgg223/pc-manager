<template>
  <div class="console-container">
    <div class="page-header">
      <h2>控制台</h2>
      <p class="subtitle">执行系统命令，查看实时输出</p>
    </div>
    
    <el-card class="console-card" shadow="hover">
      <div class="console-output" ref="outputRef">
        <div v-for="(line, index) in outputLines" :key="index" class="output-line">
          <span v-if="line.type === 'input'" class="prompt">C:\&gt;</span>
          <span :class="line.type">{{ line.text }}</span>
        </div>
        <div v-if="running" class="running-indicator">
          <span class="blink">_</span>
        </div>
      </div>
      
      <div class="input-section">
        <el-input
          v-model="currentCommand"
          placeholder="输入命令，按 Enter 执行..."
          class="command-input"
          @keyup.enter="executeCommand"
          :disabled="running"
        >
          <template #prepend>C:\&gt;</template>
        </el-input>
        <div class="action-buttons">
          <el-button 
            type="primary" 
            @click="executeCommand"
            :disabled="!currentCommand.trim() || running"
            :loading="running"
          >
            执行
          </el-button>
          <el-button 
            type="danger" 
            @click="stopCommand"
            :disabled="!running"
          >
            终止
          </el-button>
          <el-button @click="clearOutput">清屏</el-button>
        </div>
      </div>
    </el-card>
    
    <el-card class="quick-commands" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>常用命令</span>
        </div>
      </template>
      <div class="quick-grid">
        <el-button 
          v-for="cmd in quickCommands" 
          :key="cmd.command"
          @click="runQuickCommand(cmd.command)"
          :disabled="running"
        >
          <el-icon><component :is="cmd.icon" /></el-icon>
          {{ cmd.label }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'

const currentCommand = ref('')
const outputLines = ref([])
const running = ref(false)
const outputRef = ref(null)
const commandHistory = ref([])
const historyIndex = ref(-1)

const quickCommands = [
  { label: 'IP 配置', command: 'ipconfig /all', icon: 'Connection' },
  { label: '系统信息', command: 'systeminfo', icon: 'Monitor' },
  { label: '网络连接', command: 'netstat -an', icon: 'DataLine' },
  { label: '磁盘检查', command: 'chkdsk', icon: 'Files' },
  { label: 'DNS 缓存', command: 'ipconfig /displaydns', icon: 'Search' },
  { label: '路由表', command: 'route print', icon: 'Guide' },
  { label: '主机名', command: 'hostname', icon: 'HomeFilled' },
  { label: '当前用户', command: 'whoami', icon: 'User' }
]

const scrollToBottom = () => {
  nextTick(() => {
    if (outputRef.value) {
      outputRef.value.scrollTop = outputRef.value.scrollHeight
    }
  })
}

const addOutput = (text, type = 'output') => {
  const lines = text.split('\n')
  lines.forEach(line => {
    if (line || lines.length === 1) {
      outputLines.value.push({ text: line, type })
    }
  })
  scrollToBottom()
}

const executeCommand = async () => {
  const command = currentCommand.value.trim()
  if (!command || running.value) return
  
  addOutput(command, 'input')
  commandHistory.value.unshift(command)
  if (commandHistory.value.length > 100) commandHistory.value.pop()
  historyIndex.value = -1
  currentCommand.value = ''
  running.value = true
  
  try {
    await window.electronAPI.executeCommand(command)
  } catch (error) {
    addOutput(`错误: ${error}`, 'error')
  } finally {
    running.value = false
  }
}

const stopCommand = () => {
  window.electronAPI.killCommand()
  running.value = false
  addOutput('^C', 'error')
}

const clearOutput = () => {
  outputLines.value = []
}

const runQuickCommand = (command) => {
  currentCommand.value = command
  executeCommand()
}

onMounted(() => {
  window.electronAPI.onCommandOutput((data) => {
    addOutput(data, 'output')
  })
  
  window.electronAPI.onCommandExit((code) => {
    if (code !== 0 && code !== null) {
      addOutput(`进程退出，代码: ${code}`, 'error')
    }
  })
  
  addOutput('欢迎使用控制台，输入命令开始执行。', 'info')
  addOutput('', 'info')
})
</script>

<style scoped>
.console-container {
  max-width: 1000px;
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

.console-card {
  border-radius: 12px;
  margin-bottom: 24px;
}

.console-output {
  background: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  padding: 16px;
  min-height: 400px;
  max-height: 500px;
  overflow-y: auto;
  border-radius: 8px;
  margin-bottom: 16px;
  white-space: pre-wrap;
  word-break: break-all;
}

.output-line {
  line-height: 1.6;
}

.prompt {
  color: #569cd6;
  font-weight: bold;
}

.input {
  color: #dcdcaa;
}

.output {
  color: #d4d4d4;
}

.error {
  color: #f44747;
}

.info {
  color: #6a9955;
}

.running-indicator {
  display: inline;
}

.blink {
  animation: blink-animation 1s infinite;
  color: #d4d4d4;
}

@keyframes blink-animation {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.command-input {
  flex: 1;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.quick-commands {
  border-radius: 12px;
}

.card-header {
  font-weight: 600;
}

.quick-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-grid .el-button {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
