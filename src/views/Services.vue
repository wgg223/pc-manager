<template>
  <div class="services-container">
    <div class="page-header">
      <h2>服务管理</h2>
      <p class="subtitle">查看和管理 Windows 系统服务</p>
    </div>
    
    <el-card class="services-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="search-section">
            <el-input
              v-model="searchText"
              placeholder="搜索服务名称..."
              clearable
              style="width: 300px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 140px; margin-left: 10px">
              <el-option label="运行中" value="running" />
              <el-option label="已停止" value="stopped" />
            </el-select>
          </div>
          <el-button type="primary" @click="refreshServices" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <el-alert
        title="启动、停止或重启服务需要管理员权限，操作时系统会弹出权限确认窗口"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 16px"
      />
      
      <el-table 
        :data="filteredServices" 
        style="width: 100%"
        height="500"
        v-loading="loading"
        empty-text="暂无服务信息"
      >
        <el-table-column prop="displayName" label="服务名称" min-width="250" sortable show-overflow-tooltip />
        <el-table-column prop="name" label="服务标识" min-width="180" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" sortable>
          <template #default="{ row }">
            <el-tag :type="row.status === 'running' ? 'success' : 'info'" size="small">
              {{ row.status === 'running' ? '运行中' : '已停止' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startType" label="启动类型" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status !== 'running'"
              type="success" 
              size="small"
              @click="controlService(row, 'start')"
              :loading="row._loading"
            >
              启动
            </el-button>
            <el-button 
              v-if="row.status === 'running'"
              type="warning" 
              size="small"
              @click="controlService(row, 'stop')"
              :loading="row._loading"
            >
              停止
            </el-button>
            <el-button 
              v-if="row.status === 'running'"
              type="primary" 
              size="small"
              @click="controlService(row, 'restart')"
              :loading="row._loading"
            >
              重启
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

const services = ref([])
const searchText = ref('')
const statusFilter = ref('')
const loading = ref(false)

const filteredServices = computed(() => {
  let result = services.value
  if (statusFilter.value) {
    result = result.filter(s => s.status === statusFilter.value)
  }
  if (!searchText.value) return result
  const search = searchText.value.toLowerCase()
  return result.filter(s => 
    s.displayName.toLowerCase().includes(search) || 
    s.name.toLowerCase().includes(search)
  )
})

const refreshServices = async () => {
  loading.value = true
  try {
    services.value = await window.electronAPI.getServices()
  } catch (error) {
    ElMessage.error('获取服务列表失败: ' + error)
  } finally {
    loading.value = false
  }
}

const controlService = async (service, action) => {
  const actionNames = { start: '启动', stop: '停止', restart: '重启' }
  const actionName = actionNames[action]
  
  try {
    await ElMessageBox.confirm(
      `确定要${actionName}服务 "${service.displayName}" 吗？`,
      `确认${actionName}`,
      { 
        type: action === 'stop' ? 'warning' : 'info',
        confirmButtonText: `确定${actionName}`,
        cancelButtonText: '取消'
      }
    )
  } catch {
    return
  }

  service._loading = true
  try {
    await window.electronAPI.controlService(service.name, action)
    ElMessage.success(`服务 "${service.displayName}" ${actionName}指令已发送`)
    setTimeout(refreshServices, 2000)
  } catch (error) {
    ElMessage.error(`${actionName}服务 "${service.displayName}" 失败: ${error}`)
  } finally {
    service._loading = false
  }
}

onMounted(() => {
  refreshServices()
})
</script>

<style scoped>
.services-container {
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

.services-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-section {
  display: flex;
  align-items: center;
}
</style>
