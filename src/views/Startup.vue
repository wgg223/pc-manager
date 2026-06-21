<template>
  <div class="startup-container">
    <div class="page-header">
      <h2>启动项管理</h2>
      <p class="subtitle">管理开机自启动程序</p>
    </div>
    
    <el-card class="startup-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>启动项列表</span>
          <el-button type="primary" @click="refreshStartup">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <el-table 
        :data="startupItems" 
        style="width: 100%"
        v-loading="loading"
        empty-text="暂无启动项"
      >
        <el-table-column prop="name" label="名称" min-width="200" />
        <el-table-column prop="command" label="命令" min-width="250" show-overflow-tooltip />
        <el-table-column prop="location" label="位置" width="150" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button 
              type="danger" 
              size="small"
              @click="removeStartup(row)"
            >
              移除
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
    ElMessage.error('获取启动项失败: ' + error)
  } finally {
    loading.value = false
  }
}

const removeStartup = async (item) => {
  try {
    await ElMessageBox.confirm(
      `确定要移除启动项 "${item.name}" 吗？`,
      '确认',
      { type: 'warning' }
    )
    await window.electronAPI.toggleStartupItem(item.name, false)
    ElMessage.success('启动项已移除')
    refreshStartup()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败: ' + error)
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
