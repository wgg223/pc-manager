<template>
  <div class="hardware-health-container">
    <div class="page-header">
      <h2>硬件健康</h2>
      <p class="subtitle">查看硬盘健康状态与电池信息</p>
    </div>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="disk-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon class="card-icon"><Box /></el-icon>
              <span>硬盘健康</span>
              <el-button
                class="refresh-btn"
                size="small"
                :loading="diskLoading"
                @click="loadDiskHealth"
              >
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>

          <div v-loading="diskLoading" class="disk-list">
            <el-empty v-if="!diskLoading && disks.length === 0" description="未检测到硬盘信息" />
            <div v-for="disk in disks" :key="disk.deviceId" class="disk-item">
              <div class="disk-info">
                <div class="disk-name-row">
                  <el-icon :size="20" class="disk-icon"><Box /></el-icon>
                  <span class="disk-name">{{ disk.name }}</span>
                  <el-tag :type="healthTagType(disk.health)" size="small">
                    {{ healthLabel(disk.health) }}
                  </el-tag>
                </div>
                <el-descriptions :column="3" border size="small" class="disk-details">
                  <el-descriptions-item label="设备 ID">{{ disk.deviceId }}</el-descriptions-item>
                  <el-descriptions-item label="类型">{{ disk.type }}</el-descriptions-item>
                  <el-descriptions-item label="容量">{{ disk.size }}</el-descriptions-item>
                  <el-descriptions-item label="健康状态">{{ healthLabel(disk.health) }}</el-descriptions-item>
                  <el-descriptions-item label="运行状态">{{ disk.status }}</el-descriptions-item>
                  <el-descriptions-item label="介质类型">{{ disk.type }}</el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="battery-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon class="card-icon battery"><Lightning /></el-icon>
              <span>电池信息</span>
              <el-button
                class="refresh-btn"
                size="small"
                :loading="batteryLoading"
                @click="loadBatteryInfo"
              >
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>

          <div v-loading="batteryLoading" class="battery-content">
            <el-empty v-if="!batteryLoading && !battery" description="未检测到电池（可能是台式机）" />
            <template v-if="battery">
              <div class="battery-gauge">
                <el-progress
                  type="dashboard"
                  :percentage="battery.percent"
                  :color="batteryColor"
                  :width="160"
                >
                  <template #default>
                    <div class="battery-percent-text">{{ battery.percent }}%</div>
                    <div class="battery-status-text">{{ battery.chargeStatus }}</div>
                  </template>
                </el-progress>
              </div>
              <el-descriptions :column="2" border class="battery-details">
                <el-descriptions-item label="电池状态">{{ battery.status }}</el-descriptions-item>
                <el-descriptions-item label="充电状态">{{ battery.chargeStatus }}</el-descriptions-item>
                <el-descriptions-item label="当前电量">{{ battery.percent }}%</el-descriptions-item>
                <el-descriptions-item label="设计电压">{{ battery.designVoltage }}</el-descriptions-item>
              </el-descriptions>
            </template>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const disks = ref([])
const battery = ref(null)
const diskLoading = ref(false)
const batteryLoading = ref(false)

const healthLabel = (health) => {
  const map = { Healthy: '健康', OK: '正常', Warning: '警告', Unhealthy: '不健康' }
  return map[health] || health || '未知'
}

const healthTagType = (health) => {
  const map = { Healthy: 'success', OK: 'success', Warning: 'warning', Unhealthy: 'danger' }
  return map[health] || 'info'
}

const batteryColor = computed(() => {
  if (!battery) return '#409EFF'
  const p = battery.value?.percent || 0
  if (p <= 20) return '#F56C6C'
  if (p <= 50) return '#E6A23C'
  return '#67C23A'
})

const loadDiskHealth = async () => {
  diskLoading.value = true
  try {
    disks.value = await window.electronAPI.getDiskHealth()
  } catch (e) {
    ElMessage.error(typeof e === 'string' ? e : '获取硬盘健康信息失败')
  } finally {
    diskLoading.value = false
  }
}

const loadBatteryInfo = async () => {
  batteryLoading.value = true
  try {
    battery.value = await window.electronAPI.getBatteryInfo()
  } catch (e) {
    ElMessage.error(typeof e === 'string' ? e : '获取电池信息失败')
  } finally {
    batteryLoading.value = false
  }
}

onMounted(() => {
  loadDiskHealth()
  loadBatteryInfo()
})
</script>

<style scoped>
.hardware-health-container {
  max-width: 900px;
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

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-icon {
  font-size: 22px;
  color: #409EFF;
}

.card-icon.battery {
  color: #67C23A;
}

.refresh-btn {
  margin-left: auto;
}

.disk-list {
  min-height: 100px;
}

.disk-item {
  margin-bottom: 16px;
}

.disk-item:last-child {
  margin-bottom: 0;
}

.disk-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.disk-icon {
  color: #409EFF;
}

.disk-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.disk-details {
  width: 100%;
}

.battery-content {
  min-height: 100px;
}

.battery-gauge {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.battery-percent-text {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.battery-status-text {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.battery-details {
  max-width: 500px;
  margin: 0 auto;
}

.disk-card,
.battery-card {
  border-radius: 12px;
}
</style>
