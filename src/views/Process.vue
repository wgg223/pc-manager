<template>
  <div class="process-container">
    <div class="page-header">
      <h2>进程管理</h2>
      <p class="subtitle">查看和管理系统运行进程</p>
    </div>
    
    <el-card class="process-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="search-section">
            <el-input
              v-model="searchText"
              placeholder="搜索进程..."
              clearable
              style="width: 300px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <el-button type="primary" @click="refreshProcesses">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <el-table 
        :data="filteredProcesses" 
        style="width: 100%"
        height="500"
        v-loading="loading"
      >
        <el-table-column prop="pid" label="PID" width="80" sortable />
        <el-table-column prop="name" label="进程名称" min-width="200" sortable />
        <el-table-column prop="cpu" label="CPU %" width="100" sortable>
          <template #default="{ row }">
            <el-tag :type="getCpuTagType(row.cpu)" size="small">
              {{ row.cpu.toFixed(1) }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="mem" label="内存 (MB)" width="120" sortable>
          <template #default="{ row }">
            {{ row.mem.toFixed(1) }} MB
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'running' ? 'success' : 'info'" size="small">
              {{ row.status === 'running' ? '运行中' : row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="danger" 
              size="small"
              @click="killProcess(row)"
            >
              结束
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const processes = ref([])
const searchText = ref('')
const loading = ref(false)
let timer = null

const filteredProcesses = computed(() => {
  if (!searchText.value) return processes.value
  const search = searchText.value.toLowerCase()
  return processes.value.filter(p => 
    p.name.toLowerCase().includes(search) || 
    p.pid.toString().includes(search)
  )
})

const getCpuTagType = (cpu) => {
  if (cpu > 50) return 'danger'
  if (cpu > 20) return 'warning'
  return 'success'
}

const refreshProcesses = async () => {
  loading.value = true
  try {
    processes.value = await window.electronAPI.getProcesses()
  } catch (error) {
    ElMessage.error('获取进程列表失败: ' + error)
  } finally {
    loading.value = false
  }
}

const killProcess = async (process) => {
  try {
    await ElMessageBox.confirm(
      `确定要结束进程 "${process.name}" (PID: ${process.pid}) 吗？`,
      '确认',
      { type: 'warning' }
    )
    
    await window.electronAPI.killProcess(process.pid)
    ElMessage.success('进程已结束')
    refreshProcesses()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('结束进程失败: ' + error)
    }
  }
}

onMounted(() => {
  refreshProcesses()
  timer = setInterval(refreshProcesses, 5000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.process-container {
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

.process-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
