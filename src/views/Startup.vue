<template>
  <div class="startup-container">
    <div class="page-header">
      <h2>鍚姩椤圭鐞?/h2>
      <p class="subtitle">绠＄悊寮€鏈鸿嚜鍚姩绋嬪簭</p>
    </div>
    
    <el-card class="startup-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>鍚姩椤瑰垪琛?/span>
          <el-button type="primary" @click="refreshStartup">
            <el-icon><Refresh /></el-icon>
            鍒锋柊
          </el-button>
        </div>
      </template>
      
      <el-table 
        :data="startupItems" 
        style="width: 100%"
        v-loading="loading"
        empty-text="鏆傛棤鍚姩椤?
      >
        <el-table-column prop="name" label="鍚嶇О" min-width="200" />
        <el-table-column prop="command" label="鍛戒护" min-width="250" show-overflow-tooltip />
        <el-table-column prop="location" label="浣嶇疆" width="150" />
        <el-table-column label="鎿嶄綔" width="120">
          <template #default="{ row }">
            <el-button 
              type="danger" 
              size="small"
              @click="removeStartup(row)"
            >
              绉婚櫎
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const startupItems = ref([])
const loading = ref(false)

const refreshStartup = async () => {
  loading.value = true
  try {
    startupItems.value = await window.electronAPI.getStartupItems()
  } catch (error) {
    ElMessage.error('鑾峰彇鍚姩椤瑰け璐? ' + error)
  } finally {
    loading.value = false
  }
}

const removeStartup = async (item) => {
  try {
    await ElMessageBox.confirm(
      `纭畾瑕佺Щ闄ゅ惎鍔ㄩ」 "${item.name}" 鍚楋紵`,
      '纭',
      { type: 'warning' }
    )
    await window.electronAPI.toggleStartupItem(item.name, false)
    ElMessage.success('鍚姩椤瑰凡绉婚櫎')
    refreshStartup()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('鎿嶄綔澶辫触: ' + error)
    }
  }
}

onMounted(() => {
  refreshStartup()
})
</script>

<style scoped>
.startup-container {
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

.startup-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}
</style>
