<template>
  <div class="home-container">
    <div class="page-header">
      <h2>定时任务</h2>
      <p class="subtitle">设置电脑定时重启、关机或休眠</p>
    </div>
    
    <div class="task-grid">
      <el-card class="task-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon restart"><RefreshRight /></el-icon>
            <span>定时重启</span>
          </div>
        </template>
        <div class="card-content">
          <el-time-picker
            v-model="restartTime"
            placeholder="选择时间"
            format="HH:mm"
            value-format="HH:mm"
            style="width: 100%"
          />
          <el-button 
            type="primary" 
            class="task-btn"
            @click="addTask('restart', restartTime)"
            :disabled="!restartTime"
          >
            添加任务
          </el-button>
        </div>
      </el-card>
      
      <el-card class="task-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon shutdown"><SwitchButton /></el-icon>
            <span>定时关机</span>
          </div>
        </template>
        <div class="card-content">
          <el-time-picker
            v-model="shutdownTime"
            placeholder="选择时间"
            format="HH:mm"
            value-format="HH:mm"
            style="width: 100%"
          />
          <el-button 
            type="warning" 
            class="task-btn"
            @click="addTask('shutdown', shutdownTime)"
            :disabled="!shutdownTime"
          >
            添加任务
          </el-button>
        </div>
      </el-card>
      
      <el-card class="task-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon hibernate"><Moon /></el-icon>
            <span>定时休眠</span>
          </div>
        </template>
        <div class="card-content">
          <el-time-picker
            v-model="hibernateTime"
            placeholder="选择时间"
            format="HH:mm"
            value-format="HH:mm"
            style="width: 100%"
          />
          <el-button 
            type="info" 
            class="task-btn"
            @click="addTask('hibernate', hibernateTime)"
            :disabled="!hibernateTime"
          >
            添加任务
          </el-button>
        </div>
      </el-card>
    </div>
    
    <el-card class="task-list-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>任务列表</span>
          <el-button type="danger" size="small" @click="cancelAllTasks">
            取消所有任务
          </el-button>
        </div>
      </template>
      
      <el-table :data="tasks" style="width: 100%" empty-text="暂无任务">
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTagType(row.type)">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="执行时间" width="150" />
        <el-table-column prop="countdown" label="倒计时" width="150">
          <template #default="{ row }">
            <span class="countdown">{{ row.countdown }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.active ? 'success' : 'info'" size="small">
              {{ row.active ? '执行中' : '已暂停' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row, $index }">
            <el-button 
              :type="row.active ? 'warning' : 'success'" 
              size="small"
              @click="toggleTask($index)"
            >
              {{ row.active ? '暂停' : '启用' }}
            </el-button>
            <el-button 
              type="danger" 
              size="small"
              @click="removeTask($index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const restartTime = ref('')
const shutdownTime = ref('')
const hibernateTime = ref('')
const tasks = ref([])
let timer = null

const getTypeName = (type) => {
  const names = { restart: '重启', shutdown: '关机', hibernate: '休眠' }
  return names[type] || type
}

const getTagType = (type) => {
  const types = { restart: 'primary', shutdown: 'warning', hibernate: 'info' }
  return types[type] || ''
}

const calculateCountdown = (targetTime) => {
  const now = new Date()
  const [hours, minutes] = targetTime.split(':').map(Number)
  const target = new Date()
  target.setHours(hours, minutes, 0, 0)
  
  if (target <= now) {
    target.setDate(target.getDate() + 1)
  }
  
  const diff = target - now
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const updateCountdowns = () => {
  tasks.value.forEach(task => {
    if (task.active) {
      task.countdown = calculateCountdown(task.time)
      
      const now = new Date()
      const [hours, minutes] = task.time.split(':').map(Number)
      if (now.getHours() === hours && now.getMinutes() === minutes && now.getSeconds() === 0) {
        executeTask(task)
      }
    }
  })
}

const executeTask = async (task) => {
  try {
    const delaySeconds = 0
    switch (task.type) {
      case 'restart':
        await window.electronAPI.restart(delaySeconds)
        break
      case 'shutdown':
        await window.electronAPI.shutdown(delaySeconds)
        break
      case 'hibernate':
        await window.electronAPI.hibernate()
        break
    }
    task.active = false
    ElMessage.success(`${getTypeName(task.type)}任务已执行`)
  } catch (error) {
    ElMessage.error(`执行失败: ${error}`)
  }
}

const addTask = (type, time) => {
  if (!time) {
    ElMessage.warning('请选择时间')
    return
  }
  
  tasks.value.push({
    type,
    time,
    countdown: calculateCountdown(time),
    active: true
  })
  
  ElMessage.success('任务已添加')
  
  if (type === 'restart') restartTime.value = ''
  else if (type === 'shutdown') shutdownTime.value = ''
  else hibernateTime.value = ''
}

const removeTask = (index) => {
  tasks.value.splice(index, 1)
}

const toggleTask = (index) => {
  tasks.value[index].active = !tasks.value[index].active
}

const cancelAllTasks = async () => {
  try {
    await ElMessageBox.confirm('确定要取消所有任务吗？', '确认', {
      type: 'warning'
    })
    
    await window.electronAPI.cancelPowerAction()
    tasks.value = []
    ElMessage.success('所有任务已取消')
  } catch {
    // User cancelled
  }
}

onMounted(() => {
  timer = setInterval(updateCountdowns, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.home-container {
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

.task-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.task-card {
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

.card-icon.restart {
  color: #409EFF;
}

.card-icon.shutdown {
  color: #E6A23C;
}

.card-icon.hibernate {
  color: #909399;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-btn {
  width: 100%;
}

.task-list-card {
  border-radius: 12px;
}

.countdown {
  font-family: monospace;
  font-size: 14px;
  color: #F56C6C;
  font-weight: 600;
}
</style>
