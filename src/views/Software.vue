<template>
  <div class="software-container">
    <div class="page-header">
      <h2>软件卸载</h2>
      <p class="subtitle">查看和卸载已安装的软件</p>
    </div>
    
    <el-card class="software-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="search-section">
            <el-input
              v-model="searchText"
              placeholder="搜索软件..."
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
            刷新
          </el-button>
        </div>
      </template>
      
      <el-table 
        :data="filteredSoftware" 
        style="width: 100%"
        v-loading="loading"
        empty-text="暂无软件信息"
      >
        <el-table-column prop="name" label="软件名称" min-width="250" sortable />
        <el-table-column prop="version" label="版本" width="120" />
        <el-table-column prop="publisher" label="发布者" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="danger" 
              size="small"
              @click="uninstall(row)"
            >
              卸载
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
    ElMessage.error('获取软件列表失败: ' + error)
  } finally {
    loading.value = false
  }
}

const uninstall = async (item) => {
  try {
    await ElMessageBox.confirm(
      `确定要卸载 "${item.name}" 吗？此操作不可撤销。`,
      '确认卸载',
      { type: 'warning' }
    )
    
    await window.electronAPI.uninstallSoftware(item.id, item.uninstallString)
    ElMessage.success('卸载指令已发送')
    refreshSoftware()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('卸载失败: ' + error)
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
