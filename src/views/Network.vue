<template>
  <div class="network-container">
    <div class="page-header">
      <h2>缃戠粶閲嶇疆</h2>
      <p class="subtitle">閲嶇疆缃戠粶璁剧疆锛屼慨澶嶇綉缁滆繛鎺ラ棶棰?/p>
    </div>
    
    <div class="network-options">
      <el-card class="option-card" shadow="hover">
        <div class="option-content">
          <el-icon class="option-icon dns"><Connection /></el-icon>
          <div class="option-info">
            <h3>閲嶇疆 DNS 缂撳瓨</h3>
            <p>娓呴櫎鏈湴 DNS 瑙ｆ瀽缂撳瓨锛岃В鍐冲煙鍚嶈В鏋愰棶棰?/p>
          </div>
          <el-button 
            type="primary" 
            :loading="loading.dns"
            @click="resetDns"
          >
            鎵ц
          </el-button>
        </div>
      </el-card>
      
      <el-card class="option-card" shadow="hover">
        <div class="option-content">
          <el-icon class="option-icon winsock"><SetUp /></el-icon>
          <div class="option-info">
            <h3>閲嶇疆 Winsock</h3>
            <p>閲嶇疆 Windows 濂楁帴瀛楃洰褰曪紝淇缃戠粶杩炴帴寮傚父</p>
          </div>
          <el-button 
            type="warning" 
            :loading="loading.winsock"
            @click="resetWinsock"
          >
            鎵ц
          </el-button>
        </div>
      </el-card>
      
      <el-card class="option-card" shadow="hover">
        <div class="option-content">
          <el-icon class="option-icon ip"><RefreshRight /></el-icon>
          <div class="option-info">
            <h3>閲婃斁/鏇存柊 IP 鍦板潃</h3>
            <p>閲嶆柊鑾峰彇 IP 鍦板潃锛岃В鍐?IP 鍐茬獊闂</p>
          </div>
          <el-button 
            type="success" 
            :loading="loading.ip"
            @click="resetIp"
          >
            鎵ц
          </el-button>
        </div>
      </el-card>
    </div>
    
    <el-card class="one-click-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><MagicStick /></el-icon>
          <span>涓€閿綉缁滀慨澶?/span>
        </div>
      </template>
      <div class="one-click-content">
        <p>鑷姩鎵ц鎵€鏈夌綉缁滈噸缃搷浣滐紝鍏ㄩ潰淇缃戠粶闂</p>
        <el-button 
          type="danger" 
          size="large"
          :loading="loading.all"
          @click="resetAll"
        >
          <el-icon><MagicStick /></el-icon>
          涓€閿慨澶?        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const loading = ref({
  dns: false,
  winsock: false,
  ip: false,
  all: false
})

const resetDns = async () => {
  loading.value.dns = true
  try {
    await window.electronAPI.resetDns()
    ElMessage.success('DNS 缂撳瓨宸查噸缃?)
  } catch (error) {
    ElMessage.error('閲嶇疆澶辫触: ' + error)
  } finally {
    loading.value.dns = false
  }
}

const resetWinsock = async () => {
  loading.value.winsock = true
  try {
    await window.electronAPI.resetWinsock()
    ElMessage.success('Winsock 宸查噸缃紝鍙兘闇€瑕侀噸鍚數鑴?)
  } catch (error) {
    ElMessage.error('閲嶇疆澶辫触: ' + error)
  } finally {
    loading.value.winsock = false
  }
}

const resetIp = async () => {
  loading.value.ip = true
  try {
    await window.electronAPI.resetIp()
    ElMessage.success('IP 鍦板潃宸叉洿鏂?)
  } catch (error) {
    ElMessage.error('閲嶇疆澶辫触: ' + error)
  } finally {
    loading.value.ip = false
  }
}

const resetAll = async () => {
  loading.value.all = true
  try {
    await resetDns()
    await resetWinsock()
    await resetIp()
    ElMessage.success('缃戠粶淇瀹屾垚')
  } catch (error) {
    ElMessage.error('淇杩囩▼涓嚭鐜伴敊璇?)
  } finally {
    loading.value.all = false
  }
}
</script>

<style scoped>
.network-container {
  max-width: 800px;
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

.network-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.option-card {
  border-radius: 12px;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.option-icon {
  font-size: 36px;
}

.option-icon.dns {
  color: #409EFF;
}

.option-icon.winsock {
  color: #E6A23C;
}

.option-icon.ip {
  color: #67C23A;
}

.option-info {
  flex: 1;
}

.option-info h3 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 4px;
}

.option-info p {
  font-size: 13px;
  color: #909399;
}

.one-click-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.one-click-content {
  text-align: center;
  padding: 20px 0;
}

.one-click-content p {
  margin-bottom: 20px;
  color: #606266;
}
</style>
