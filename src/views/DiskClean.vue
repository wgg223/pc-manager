<template>
  <div class="disk-clean-container">
    <div class="page-header">
      <h2>磁盘清理</h2>
      <p class="subtitle">清理临时文件和系统缓存，释放磁盘空间</p>
    </div>
    
    <div class="clean-options">
      <el-card class="option-card" shadow="hover">
        <div class="option-content">
          <el-icon class="option-icon temp"><FolderDelete /></el-icon>
          <div class="option-info">
            <h3>临时文件</h3>
            <p>清理系统和应用程序临时文件</p>
          </div>
          <el-switch v-model="cleanOptions.temp" />
        </div>
      </el-card>
      
      <el-card class="option-card" shadow="hover">
        <div class="option-content">
          <el-icon class="option-icon cache"><Delete /></el-icon>
          <div class="option-info">
            <h3>系统缓存</h3>
            <p>清理 Windows 更新缓存和系统日志</p>
          </div>
          <el-switch v-model="cleanOptions.cache" />
        </div>
      </el-card>
      
      <el-card class="option-card" shadow="hover">
        <div class="option-content">
          <el-icon class="option-icon recycle"><DeleteFilled /></el-icon>
          <div class="option-info">
            <h3>回收站</h3>
            <p>清空回收站中的所有文件</p>
          </div>
          <el-switch v-model="cleanOptions.recycle" />
        </div>
      </el-card>
    </div>
    
    <div class="action-section">
      <el-button 
        type="primary" 
        size="large"
        :loading="cleaning"
        @click="startClean"
      >
        <el-icon><Delete /></el-icon>
        开始清理
      </el-button>
    </div>
    
    <el-card v-if="cleanResult" class="result-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>清理结果</span>
        </div>
      </template>
      
      <div class="result-content">
        <div class="result-item">
          <span class="result-label">已清理空间</span>
          <span class="result-value">{{ formatSize(cleanResult.totalCleaned) }}</span>
        </div>
        
        <el-divider />
        
        <div v-for="(item, index) in cleanResult.results" :key="index" class="result-detail">
          <el-icon :class="item.status === 'success' ? 'success' : 'error'">
            <CircleCheckFilled v-if="item.status === 'success'" />
            <CircleCloseFilled v-else />
          </el-icon>
          <span>{{ item.path }}</span>
          <el-tag :type="item.status === 'success' ? 'success' : 'danger'" size="small">
            {{ item.status === 'success' ? '成功' : '失败' }}
          </el-tag>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const cleaning = ref(false)
const cleanResult = ref(null)

const cleanOptions = ref({
  temp: true,
  cache: true,
  recycle: true
})

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const startClean = async () => {
  cleaning.value = true
  cleanResult.value = null
  
  try {
    let totalCleaned = 0
    const results = []
    
    if (cleanOptions.value.temp) {
      const result = await window.electronAPI.cleanTempFiles()
      totalCleaned += result.totalCleaned
      results.push(...result.results)
    }
    
    if (cleanOptions.value.recycle) {
      try {
        await window.electronAPI.emptyRecycleBin()
        results.push({ path: '回收站', status: 'success' })
      } catch (e) {
        results.push({ path: '回收站', status: 'error', message: e })
      }
    }
    
    cleanResult.value = { totalCleaned, results }
    ElMessage.success('清理完成')
  } catch (error) {
    ElMessage.error('清理失败: ' + error)
  } finally {
    cleaning.value = false
  }
}
</script>

<style scoped>
.disk-clean-container {
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

.clean-options {
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

.option-icon.temp {
  color: #409EFF;
}

.option-icon.cache {
  color: #E6A23C;
}

.option-icon.recycle {
  color: #F56C6C;
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

.action-section {
  text-align: center;
  margin-bottom: 24px;
}

.result-card {
  border-radius: 12px;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-label {
  color: #606266;
}

.result-value {
  font-size: 20px;
  font-weight: 600;
  color: #67C23A;
}

.result-detail {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.success {
  color: #67C23A;
}

.error {
  color: #F56C6C;
}
</style>
