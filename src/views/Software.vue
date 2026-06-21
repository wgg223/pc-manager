<template>
  <div class="software-container">
    <div class="page-header">
      <h2>杞欢鍗歌浇</h2>
      <p class="subtitle">鏌ョ湅鍜屽嵏杞藉凡瀹夎鐨勮蒋浠?/p>
    </div>
    
    <el-card class="software-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="search-section">
            <el-input
              v-model="searchText"
              placeholder="鎼滅储杞欢..."
              clearable
              style="width: 300px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <el-button type="primary" @click="refreshSoftware">
            <el-icon><Refresh /></el-icon>
            鍒锋柊
          </el-button>
        </div>
      </template>
      
      <el-table 
        :data="filteredSoftware" 
        style="width: 100%"
        v-loading="loading"
        empty-text="鏆傛棤杞欢淇℃伅"
      >
        <el-table-column prop="name" label="杞欢鍚嶇О" min-width="250" sortable />
        <el-table-column prop="version" label="鐗堟湰" width="120" />
        <el-table-column prop="publisher" label="鍙戝竷鑰? min-width="180" show-overflow-tooltip />
        <el-table-column label="鎿嶄綔" width="100" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="danger" 
              size="small"
              @click="uninstall(row)"
            >
              鍗歌浇
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const software = ref([])
const searchText = ref('')
const loading = ref(false)

const filteredSoftware = computed(() => {
  if (!searchText.value) return software.value
  const search = searchText.value.toLowerCase()
  return software.value.filter(s => 
    s.name.toLowerCase().includes(search)
  )
})

const refreshSoftware = async () => {
  loading.value = true
  try {
    software.value = await window.electronAPI.getInstalledSoftware()
  } catch (error) {
    ElMessage.error('鑾峰彇杞欢鍒楄〃澶辫触: ' + error)
  } finally {
    loading.value = false
  }
}

const uninstall = async (item) => {
  try {
    await ElMessageBox.confirm(
      `纭畾瑕佸嵏杞?"${item.name}" 鍚楋紵姝ゆ搷浣滀笉鍙挙閿€銆俙,
      '纭鍗歌浇',
      { type: 'warning' }
    )
    
    await window.electronAPI.uninstallSoftware(item.id, item.uninstallString)
    ElMessage.success('鍗歌浇鎸囦护宸插彂閫?)
    refreshSoftware()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('鍗歌浇澶辫触: ' + error)
    }
  }
}

onMounted(() => {
  refreshSoftware()
})
</script>

<style scoped>
.software-container {
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

.software-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
