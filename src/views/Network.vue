<template>
  <div class="network-container">
    <div class="page-header">
      <h2>网络重置</h2>
      <p class="subtitle">重置网络设置，修复网络连接问题</p>
    </div>
    
    <div class="network-options">
      <el-card class="option-card" shadow="hover">
        <div class="option-content">
          <el-icon class="option-icon dns"><Connection /></el-icon>
          <div class="option-info">
            <h3>重置 DNS 缓存</h3>
            <p>清除本地 DNS 解析缓存，解决域名解析问题</p>
          </div>
          <el-button 
            type="primary" 
            :loading="loading.dns"
            @click="resetDns"
          >
            执行
          </el-button>
        </div>
      </el-card>
      
      <el-card class="option-card" shadow="hover">
        <div class="option-content">
          <el-icon class="option-icon winsock"><SetUp /></el-icon>
          <div class="option-info">
            <h3>重置 Winsock</h3>
            <p>重置 Windows 套接字目录，修复网络连接异常</p>
          </div>
          <el-button 
            type="warning" 
            :loading="loading.winsock"
            @click="resetWinsock"
          >
            执行
          </el-button>
        </div>
      </el-card>
      
      <el-card class="option-card" shadow="hover">
        <div class="option-content">
          <el-icon class="option-icon ip"><RefreshRight /></el-icon>
          <div class="option-info">
            <h3>释放/更新 IP 地址</h3>
            <p>重新获取 IP 地址，解决 IP 冲突问题</p>
          </div>
          <el-button 
            type="success" 
            :loading="loading.ip"
            @click="resetIp"
          >
            执行
          </el-button>
        </div>
      </el-card>
    </div>
    
    <el-card class="one-click-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><MagicStick /></el-icon>
          <span>一键网络修复</span>
        </div>
      </template>
      <div class="one-click-content">
        <p>自动执行所有网络重置操作，全面修复网络问题</p>
        <el-button 
          type="danger" 
          size="large"
          :loading="loading.all"
          @click="resetAll"
        >
          <el-icon><MagicStick /></el-icon>
          一键修复
        </el-button>
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
    ElMessage.success('DNS 缓存已重置')
  } catch (error) {
    ElMessage.error('重置失败: ' + error)
  } finally {
    loading.value.dns = false
  }
}

const resetWinsock = async () => {
  loading.value.winsock = true
  try {
    await window.electronAPI.resetWinsock()
    ElMessage.success('Winsock 已重置，可能需要重启电脑')
  } catch (error) {
    ElMessage.error('重置失败: ' + error)
  } finally {
    loading.value.winsock = false
  }
}

const resetIp = async () => {
  loading.value.ip = true
  try {
    await window.electronAPI.resetIp()
    ElMessage.success('IP 地址已更新')
  } catch (error) {
    ElMessage.error('重置失败: ' + error)
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
    ElMessage.success('网络修复完成')
  } catch (error) {
    ElMessage.error('修复过程中出现错误')
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
