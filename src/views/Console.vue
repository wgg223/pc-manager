<template>
  <div class="console-container">
    <div class="page-header">
      <h2>鎺у埗鍙?/h2>
      <p class="subtitle">鎵ц绯荤粺鍛戒护锛屾煡鐪嬪疄鏃惰緭鍑?/p>
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
          placeholder="杈撳叆鍛戒护锛屾寜 Enter 鎵ц..."
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
            鎵ц
          </el-button>
          <el-button 
            type="danger" 
            @click="stopCommand"
            :disabled="!running"
          >
            缁堟
          </el-button>
          <el-button @click="clearOutput">娓呭睆</el-button>
        </div>
      </div>
    </el-card>
    
    <el-card class="quick-commands" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>甯哥敤鍛戒护</span>
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
  { label: 'IP 閰嶇疆', command: 'ipconfig /all', icon: 'Connection' },
  { label: '绯荤粺淇℃伅', command: 'systeminfo', icon: 'Monitor' },
  { label: '缃戠粶杩炴帴', command: 'netstat -an', icon: 'DataLine' },
  { label: '纾佺洏妫€鏌?, command: 'chkdsk', icon: 'Files' },
  { label: 'DNS 缂撳瓨', command: 'ipconfig /displaydns', icon: 'Search' },
  { label: '璺敱琛?, command: 'route print', icon: 'Guide' },
  { label: '涓绘満鍚?, command: 'hostname', icon: 'HomeFilled' },
  { label: '褰撳墠鐢ㄦ埛', command: 'whoami', icon: 'User' }
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
    addOutput(`閿欒: ${error}`, 'error')
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
      addOutput(`杩涚▼閫€鍑猴紝浠ｇ爜: ${code}`, 'error')
    }
  })
  
  addOutput('娆㈣繋浣跨敤鎺у埗鍙帮紝杈撳叆鍛戒护寮€濮嬫墽琛屻€?, 'info')
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
