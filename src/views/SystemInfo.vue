<template>
  <div class="system-info-container">
    <div class="page-header">
      <h2>绯荤粺淇℃伅</h2>
      <p class="subtitle">鏌ョ湅 CPU銆佸唴瀛樸€佺鐩樸€佹樉鍗°€佷富鏉跨瓑璇︾粏淇℃伅</p>
    </div>
    
    <div class="info-grid">
      <el-card class="info-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon cpu"><Cpu /></el-icon>
            <span>CPU</span>
          </div>
        </template>
        <div class="card-content">
          <el-progress 
            type="dashboard" 
            :percentage="cpuUsage" 
            :color="getProgressColor(cpuUsage)"
          />
          <div class="info-details">
            <p><strong>鍨嬪彿:</strong> {{ systemInfo.cpu?.brand || '鍔犺浇涓?..' }}</p>
            <p><strong>鍒堕€犲晢:</strong> {{ systemInfo.cpu?.manufacturer || '-' }}</p>
            <p><strong>鏍稿績/绾跨▼:</strong> {{ systemInfo.cpu?.cores || '-' }} 鏍?/ {{ systemInfo.cpu?.physicalCores || '-' }} 绾跨▼</p>
            <p><strong>涓婚:</strong> {{ systemInfo.cpu?.speed || '-' }} GHz</p>
            <p><strong>浣跨敤鐜?</strong> {{ cpuUsage }}%</p>
          </div>
        </div>
      </el-card>
      
      <el-card class="info-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon memory"><Coin /></el-icon>
            <span>鍐呭瓨</span>
          </div>
        </template>
        <div class="card-content">
          <el-progress 
            type="dashboard" 
            :percentage="memoryUsage" 
            :color="getProgressColor(memoryUsage)"
          />
          <div class="info-details">
            <p><strong>鎬昏:</strong> {{ formatGB(memoryInfo.total) }}</p>
            <p><strong>宸茬敤:</strong> {{ formatGB(memoryInfo.used) }}</p>
            <p><strong>鍙敤:</strong> {{ formatGB(memoryInfo.free) }}</p>
            <p><strong>浣跨敤鐜?</strong> {{ memoryUsage }}%</p>
          </div>
        </div>
      </el-card>
      
      <el-card class="info-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon disk"><Files /></el-icon>
            <span>纾佺洏</span>
          </div>
        </template>
        <div class="card-content">
          <div v-for="(disk, index) in disks" :key="index" class="disk-item">
            <div class="disk-header">
              <span>{{ disk.fs }}</span>
              <span>{{ disk.label || '鏈湴纾佺洏' }}</span>
            </div>
            <el-progress 
              :percentage="disk.use" 
              :color="getProgressColor(disk.use)"
            />
            <div class="disk-size">
              {{ formatGB(disk.used) }} / {{ formatGB(disk.size) }}
            </div>
          </div>
        </div>
      </el-card>
    </div>
    
    <div class="info-grid">
      <el-card class="info-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon gpu"><Monitor /></el-icon>
            <span>鏄惧崱</span>
          </div>
        </template>
        <div class="card-content">
          <div v-if="gpus.length > 0">
            <div v-for="(gpu, index) in gpus" :key="index" class="gpu-item">
              <p><strong>鍨嬪彿:</strong> {{ gpu.model || '-' }}</p>
              <p><strong>鍒堕€犲晢:</strong> {{ gpu.vendor || '-' }}</p>
              <p><strong>鏄惧瓨:</strong> {{ gpu.vram ? formatVram(gpu.vram) : '-' }}</p>
              <el-divider v-if="index < gpus.length - 1" />
            </div>
          </div>
          <div v-else class="info-details">
            <p>鏈娴嬪埌鏄惧崱淇℃伅</p>
          </div>
        </div>
      </el-card>
      
      <el-card class="info-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon board"><Cpu /></el-icon>
            <span>涓绘澘</span>
          </div>
        </template>
        <div class="card-content">
          <div class="info-details">
            <p><strong>鍒堕€犲晢:</strong> {{ systemInfo.baseboard?.manufacturer || '-' }}</p>
            <p><strong>鍨嬪彿:</strong> {{ systemInfo.baseboard?.model || '-' }}</p>
            <p><strong>鐗堟湰:</strong> {{ systemInfo.baseboard?.version || '-' }}</p>
            <p><strong>搴忓垪鍙?</strong> {{ systemInfo.baseboard?.serial || '-' }}</p>
          </div>
        </div>
      </el-card>
      
      <el-card class="info-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon os"><Monitor /></el-icon>
            <span>鎿嶄綔绯荤粺</span>
          </div>
        </template>
        <div class="card-content">
          <div class="info-details">
            <p><strong>绯荤粺:</strong> {{ systemInfo.os?.distro || '-' }}</p>
            <p><strong>鐗堟湰:</strong> {{ systemInfo.os?.release || '-' }}</p>
            <p><strong>鏋舵瀯:</strong> {{ systemInfo.os?.arch || '-' }}</p>
            <p><strong>涓绘満鍚?</strong> {{ systemInfo.os?.hostname || '-' }}</p>
            <p><strong>鍐呮牳:</strong> {{ systemInfo.os?.kernel || '-' }}</p>
          </div>
        </div>
      </el-card>
    </div>
    
    <el-card class="network-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon class="card-icon network"><Connection /></el-icon>
          <span>缃戠粶淇℃伅</span>
        </div>
      </template>
      <div class="network-content">
        <div v-for="(net, index) in networks" :key="index" class="network-item">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="鍚嶇О">{{ net.iface }}</el-descriptions-item>
            <el-descriptions-item label="绫诲瀷">{{ net.type || '-' }}</el-descriptions-item>
            <el-descriptions-item label="IP 鍦板潃">{{ net.ip4 || '-' }}</el-descriptions-item>
            <el-descriptions-item label="MAC 鍦板潃">{{ net.mac || '-' }}</el-descriptions-item>
            <el-descriptions-item label="閫熷害">{{ net.speed ? net.speed + ' Mbps' : '-' }}</el-descriptions-item>
            <el-descriptions-item label="鐘舵€?>
              <el-tag :type="net.operstate === 'up' ? 'success' : 'info'" size="small">
                {{ net.operstate === 'up' ? '宸茶繛鎺? : '鏈繛鎺? }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-card>
    
    <div class="refresh-section">
      <el-button type="primary" @click="refreshInfo">
        <el-icon><Refresh /></el-icon>
        鍒锋柊淇℃伅
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const systemInfo = ref({})
const cpuUsage = ref(0)
const memoryInfo = ref({ total: 0, used: 0, free: 0, usagePercent: 0 })
const memoryUsage = ref(0)
const disks = ref([])
const gpus = ref([])
const networks = ref([])
let timer = null

const formatGB = (bytes) => {
  if (!bytes) return '0 GB'
  return (bytes / 1024 / 1024 / 1024).toFixed(1) + ' GB'
}

const formatVram = (vram) => {
  if (!vram) return '-'
  if (vram >= 1048576) return (vram / 1048576).toFixed(0) + ' GB'
  if (vram >= 1024) return (vram / 1024).toFixed(0) + ' MB'
  return vram + ' KB'
}

const getProgressColor = (percentage) => {
  if (percentage < 50) return '#67C23A'
  if (percentage < 80) return '#E6A23C'
  return '#F56C6C'
}

const refreshInfo = async () => {
  try {
    const info = await window.electronAPI.getSystemInfo()
    systemInfo.value = info
    
    if (info.disk) {
      disks.value = info.disk.filter(d => d.size > 0).map(d => ({
        fs: d.fs,
        label: d.label,
        size: d.size,
        used: d.used,
        use: d.use
      }))
    }
    
    if (info.gpu && info.gpu.controllers) {
      gpus.value = info.gpu.controllers.filter(g => g.model && g.model !== 'Unknown')
    }
    
    if (info.network) {
      networks.value = info.network.filter(n => !n.iface.includes('Loopback') && n.ip4)
    }
  } catch (error) {
    console.error('鑾峰彇绯荤粺淇℃伅澶辫触:', error)
  }
  
  try {
    const usage = await window.electronAPI.getCpuUsage()
    cpuUsage.value = Math.round(usage)
  } catch (error) {
    console.error('鑾峰彇CPU浣跨敤鐜囧け璐?', error)
  }
  
  try {
    const mem = await window.electronAPI.getMemoryUsage()
    memoryInfo.value = mem
    memoryUsage.value = Math.round(parseFloat(mem.usagePercent))
  } catch (error) {
    console.error('鑾峰彇鍐呭瓨浣跨敤鎯呭喌澶辫触:', error)
  }
}

onMounted(() => {
  refreshInfo()
  timer = setInterval(refreshInfo, 5000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.system-info-container {
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

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.info-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.card-icon {
  font-size: 24px;
}

.card-icon.cpu {
  color: #409EFF;
}

.card-icon.memory {
  color: #E6A23C;
}

.card-icon.disk {
  color: #67C23A;
}

.card-icon.gpu {
  color: #F56C6C;
}

.card-icon.board {
  color: #9B59B6;
}

.card-icon.os {
  color: #909399;
}

.card-icon.network {
  color: #3498DB;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.info-details {
  width: 100%;
}

.info-details p {
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.gpu-item p {
  margin-bottom: 6px;
  font-size: 14px;
  color: #606266;
}

.disk-item {
  width: 100%;
  margin-bottom: 16px;
}

.disk-item:last-child {
  margin-bottom: 0;
}

.disk-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: #606266;
}

.disk-size {
  text-align: right;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.network-card {
  border-radius: 12px;
  margin-bottom: 24px;
}

.network-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.network-item {
  margin-bottom: 8px;
}

.network-item:last-child {
  margin-bottom: 0;
}

.refresh-section {
  text-align: center;
}
</style>
