<template>
  <div class="junk-clean-container">
    <div class="page-header">
      <h2>垃圾清理</h2>
      <p class="subtitle">全盘扫描垃圾文件，智能分级清理</p>
    </div>

    <el-card class="scan-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon class="card-icon"><Search /></el-icon>
          <span>扫描设置</span>
        </div>
      </template>

      <div class="scan-settings">
        <div class="drive-select">
          <span class="label">扫描盘符：</span>
          <el-checkbox-group v-model="selectedDrives">
            <el-checkbox v-for="d in availableDrives" :key="d" :value="d" :label="d" />
          </el-checkbox-group>
          <el-button type="primary" @click="startScan" :loading="scanning" :disabled="selectedDrives.length === 0">
            <el-icon v-if="!scanning"><Search /></el-icon>
            {{ scanning ? '扫描中...' : '开始扫描' }}
          </el-button>
        </div>

        <div v-if="scanning" class="scan-progress">
          <el-progress :percentage="scanProgress" :stroke-width="16" striped striped-flow />
          <span class="progress-text">正在扫描文件...</span>
        </div>
      </div>
    </el-card>

    <template v-if="scanResult">
      <el-row :gutter="16" class="summary-row">
        <el-col :span="6">
          <el-card class="stat-card stat-total" shadow="hover">
            <div class="stat-value">{{ scanResult.summary.total }}</div>
            <div class="stat-label">垃圾文件总数</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card stat-size" shadow="hover">
            <div class="stat-value">{{ formatSize(scanResult.summary.totalSize) }}</div>
            <div class="stat-label">可释放空间</div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card stat-level1" shadow="hover">
            <div class="stat-value">{{ scanResult.summary.byLevel[1].count }}</div>
            <div class="stat-label">安全清理</div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card stat-level2" shadow="hover">
            <div class="stat-value">{{ scanResult.summary.byLevel[2].count }}</div>
            <div class="stat-label">推荐清理</div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card stat-level3" shadow="hover">
            <div class="stat-value">{{ scanResult.summary.byLevel[3].count }}</div>
            <div class="stat-label">谨慎清理</div>
          </el-card>
        </el-col>
      </el-row>

      <el-card class="level-card level-1" shadow="hover">
        <template #header>
          <div class="level-header">
            <div class="level-title">
              <el-tag type="success" effect="dark" round>安全清理</el-tag>
              <span>临时文件、日志、崩溃转储 — 删除不影响系统运行</span>
            </div>
            <div class="level-stats">
              <span>{{ scanResult.summary.byLevel[1].count }} 个文件</span>
              <span class="divider">|</span>
              <span>{{ formatSize(scanResult.summary.byLevel[1].size) }}</span>
              <el-button type="success" size="small" style="margin-left: 12px"
                @click="cleanLevel(1)" :loading="cleaning"
                :disabled="getLevelFiles(1).length === 0">
                一键清理
              </el-button>
            </div>
          </div>
        </template>
        <div class="category-list">
          <div v-for="cat in getLevelCategories(1)" :key="cat.name" class="category-item">
            <div class="cat-info">
              <el-checkbox
                :model-value="isCategorySelected(cat.files)"
                :indeterminate="isCategoryIndeterminate(cat.files)"
                @change="toggleCategory(cat.files)"
              />
              <span class="cat-name">{{ cat.name }}</span>
              <el-tag size="small">{{ cat.files.length }} 个</el-tag>
            </div>
            <span class="cat-size">{{ formatSize(cat.files.reduce((s, f) => s + f.size, 0)) }}</span>
          </div>
        </div>
        <el-collapse v-if="getLevelFiles(1).length > 0" class="file-collapse">
          <el-collapse-item title="查看文件列表" name="files">
            <div class="file-list">
              <div v-for="file in getLevelFiles(1)" :key="file.path" class="file-item">
                <el-checkbox v-model="selectedFiles" :value="file.path" size="small" />
                <span class="file-name" :title="file.path">{{ file.name }}</span>
                <span class="file-path" :title="file.path">{{ getDirName(file.path) }}</span>
                <span class="file-size">{{ formatSize(file.size) }}</span>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-card>

      <el-card class="level-card level-2" shadow="hover">
        <template #header>
          <div class="level-header">
            <div class="level-title">
              <el-tag type="warning" effect="dark" round>推荐清理</el-tag>
              <span>浏览器缓存、更新缓存、系统日志 — 清理后可能需要重新加载</span>
            </div>
            <div class="level-stats">
              <span>{{ scanResult.summary.byLevel[2].count }} 个文件</span>
              <span class="divider">|</span>
              <span>{{ formatSize(scanResult.summary.byLevel[2].size) }}</span>
              <el-button type="warning" size="small" style="margin-left: 12px"
                @click="cleanLevel(2)" :loading="cleaning"
                :disabled="getLevelFiles(2).length === 0">
                一键清理
              </el-button>
            </div>
          </div>
        </template>
        <div class="category-list">
          <div v-for="cat in getLevelCategories(2)" :key="cat.name" class="category-item">
            <div class="cat-info">
              <el-checkbox
                :model-value="isCategorySelected(cat.files)"
                :indeterminate="isCategoryIndeterminate(cat.files)"
                @change="toggleCategory(cat.files)"
              />
              <span class="cat-name">{{ cat.name }}</span>
              <el-tag size="small">{{ cat.files.length }} 个</el-tag>
            </div>
            <span class="cat-size">{{ formatSize(cat.files.reduce((s, f) => s + f.size, 0)) }}</span>
          </div>
        </div>
        <el-collapse v-if="getLevelFiles(2).length > 0" class="file-collapse">
          <el-collapse-item title="查看文件列表" name="files">
            <div class="file-list">
              <div v-for="file in getLevelFiles(2)" :key="file.path" class="file-item">
                <el-checkbox v-model="selectedFiles" :value="file.path" size="small" />
                <span class="file-name" :title="file.path">{{ file.name }}</span>
                <span class="file-path" :title="file.path">{{ getDirName(file.path) }}</span>
                <span class="file-size">{{ formatSize(file.size) }}</span>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-card>

      <el-card class="level-card level-3" shadow="hover">
        <template #header>
          <div class="level-header">
            <div class="level-title">
              <el-tag type="danger" effect="dark" round>谨慎清理</el-tag>
              <span>缩略图缓存、安装包残留 — 请确认后再清理</span>
            </div>
            <div class="level-stats">
              <span>{{ scanResult.summary.byLevel[3].count }} 个文件</span>
              <span class="divider">|</span>
              <span>{{ formatSize(scanResult.summary.byLevel[3].size) }}</span>
              <el-button type="danger" size="small" style="margin-left: 12px"
                @click="cleanLevel(3)" :loading="cleaning"
                :disabled="getLevelFiles(3).length === 0">
                一键清理
              </el-button>
            </div>
          </div>
        </template>
        <div class="category-list">
          <div v-for="cat in getLevelCategories(3)" :key="cat.name" class="category-item">
            <div class="cat-info">
              <el-checkbox
                :model-value="isCategorySelected(cat.files)"
                :indeterminate="isCategoryIndeterminate(cat.files)"
                @change="toggleCategory(cat.files)"
              />
              <span class="cat-name">{{ cat.name }}</span>
              <el-tag size="small">{{ cat.files.length }} 个</el-tag>
            </div>
            <span class="cat-size">{{ formatSize(cat.files.reduce((s, f) => s + f.size, 0)) }}</span>
          </div>
        </div>
        <el-collapse v-if="getLevelFiles(3).length > 0" class="file-collapse">
          <el-collapse-item title="查看文件列表" name="files">
            <div class="file-list">
              <div v-for="file in getLevelFiles(3)" :key="file.path" class="file-item">
                <el-checkbox v-model="selectedFiles" :value="file.path" size="small" />
                <span class="file-name" :title="file.path">{{ file.name }}</span>
                <span class="file-path" :title="file.path">{{ getDirName(file.path) }}</span>
                <span class="file-size">{{ formatSize(file.size) }}</span>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-card>

      <div class="clean-actions" v-if="selectedFiles.length > 0">
        <el-alert
          :title="`已选择 ${selectedFiles.length} 个文件，共 ${formatSize(selectedTotalSize)}`"
          type="info"
          show-icon
          :closable="false"
          style="margin-bottom: 12px"
        />
        <el-button type="primary" size="large" @click="cleanSelected" :loading="cleaning">
          <el-icon><Delete /></el-icon>
          清理选中文件
        </el-button>
      </div>
    </template>

    <el-dialog v-model="resultDialogVisible" title="清理结果" width="450px">
      <div class="result-content">
        <el-icon :size="48" color="#67C23A"><CircleCheckFilled /></el-icon>
        <h3>清理完成</h3>
        <p>成功清理 <strong>{{ cleanResult.cleaned }}</strong> 个文件</p>
        <p>释放空间 <strong>{{ formatSize(cleanResult.totalSize) }}</strong></p>
        <p v-if="cleanResult.errors.length > 0" class="error-info">
          {{ cleanResult.errors.length }} 个文件因权限不足或正在使用而无法清理
        </p>
      </div>
      <template #footer>
        <el-button type="primary" @click="resultDialogVisible = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const availableDrives = ref([])
const selectedDrives = ref([])
const scanning = ref(false)
const scanProgress = ref(0)
const scanResult = ref(null)
const selectedFiles = ref([])
const cleaning = ref(false)
const resultDialogVisible = ref(false)
const cleanResult = ref({ cleaned: 0, totalSize: 0, errors: [] })

const levelNames = { 1: '安全清理', 2: '推荐清理', 3: '谨慎清理' }

const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + units[i]
}

const getDirName = (filePath) => {
  return filePath.replace(/\\[^\\]+$/, '')
}

const selectedTotalSize = computed(() => {
  if (!scanResult.value) return 0
  return scanResult.value.files
    .filter(f => selectedFiles.value.includes(f.path))
    .reduce((sum, f) => sum + f.size, 0)
})

const getLevelFiles = (level) => {
  if (!scanResult.value) return []
  return scanResult.value.files.filter(f => f.level === level)
}

const getLevelCategories = (level) => {
  const files = getLevelFiles(level)
  const catMap = {}
  for (const f of files) {
    if (!catMap[f.category]) catMap[f.category] = { name: f.category, files: [] }
    catMap[f.category].files.push(f)
  }
  return Object.values(catMap).sort((a, b) => b.files.length - a.files.length)
}

const isCategorySelected = (files) => {
  return files.every(f => selectedFiles.value.includes(f.path))
}

const isCategoryIndeterminate = (files) => {
  const selected = files.filter(f => selectedFiles.value.includes(f.path))
  return selected.length > 0 && selected.length < files.length
}

const toggleCategory = (files) => {
  const allSelected = files.every(f => selectedFiles.value.includes(f.path))
  if (allSelected) {
    const paths = new Set(files.map(f => f.path))
    selectedFiles.value = selectedFiles.value.filter(p => !paths.has(p))
  } else {
    const paths = files.map(f => f.path).filter(p => !selectedFiles.value.includes(p))
    selectedFiles.value = [...selectedFiles.value, ...paths]
  }
}

const startScan = async () => {
  scanning.value = true
  scanProgress.value = 0
  scanResult.value = null
  selectedFiles.value = []

  const progressTimer = setInterval(() => {
    if (scanProgress.value < 90) {
      scanProgress.value += Math.random() * 15
    }
  }, 500)

  try {
    const result = await window.electronAPI.scanJunkFiles({ drives: [...selectedDrives.value] })
    scanResult.value = result
    scanProgress.value = 100
    ElMessage.success(`扫描完成，发现 ${result.summary.total} 个垃圾文件，共 ${formatSize(result.summary.totalSize)}`)
  } catch (e) {
    ElMessage.error('扫描失败: ' + (typeof e === 'string' ? e : e.message))
  } finally {
    clearInterval(progressTimer)
    scanning.value = false
  }
}

const cleanLevel = async (level) => {
  const files = getLevelFiles(level)
  if (files.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要清理「${levelNames[level]}」级别的 ${files.length} 个文件吗？\n共 ${formatSize(files.reduce((s, f) => s + f.size, 0))}`,
      '确认清理',
      { type: level === 3 ? 'warning' : 'info', confirmButtonText: '清理', cancelButtonText: '取消' }
    )
  } catch { return }

  cleaning.value = true
  try {
    const result = await window.electronAPI.cleanJunkFiles(files.map(f => f.path))
    cleanResult.value = result
    resultDialogVisible.value = true

    const paths = new Set(files.map(f => f.path))
    selectedFiles.value = selectedFiles.value.filter(p => !paths.has(p))

    await startScan()
  } catch (e) {
    ElMessage.error('清理失败: ' + (typeof e === 'string' ? e : e.message))
  } finally {
    cleaning.value = false
  }
}

const cleanSelected = async () => {
  if (selectedFiles.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要清理选中的 ${selectedFiles.value.length} 个文件吗？\n共 ${formatSize(selectedTotalSize.value)}`,
      '确认清理',
      { type: 'warning', confirmButtonText: '清理', cancelButtonText: '取消' }
    )
  } catch { return }

  cleaning.value = true
  try {
    const result = await window.electronAPI.cleanJunkFiles(selectedFiles.value)
    cleanResult.value = result
    resultDialogVisible.value = true
    selectedFiles.value = []
    await startScan()
  } catch (e) {
    ElMessage.error('清理失败: ' + (typeof e === 'string' ? e : e.message))
  } finally {
    cleaning.value = false
  }
}

const loadDrives = async () => {
  try {
    const drives = await window.electronAPI.getAvailableDrives()
    availableDrives.value = drives
    selectedDrives.value = [...drives]
  } catch (e) {
    ElMessage.error('获取盘符列表失败')
  }
}

loadDrives()
</script>

<style scoped>
.junk-clean-container {
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

.scan-card {
  border-radius: 12px;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.card-icon {
  font-size: 22px;
  color: #409EFF;
}

.scan-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drive-select {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.drive-select .label {
  font-size: 14px;
  color: #606266;
  flex-shrink: 0;
}

.scan-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.scan-progress .el-progress {
  flex: 1;
}

.progress-text {
  font-size: 13px;
  color: #909399;
  white-space: nowrap;
}

.summary-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
  text-align: center;
  padding: 8px 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

.stat-total .stat-value { color: #409EFF; }
.stat-size .stat-value { color: #67C23A; }
.stat-level1 .stat-value { color: #67C23A; }
.stat-level2 .stat-value { color: #E6A23C; }
.stat-level3 .stat-value { color: #F56C6C; }

.level-card {
  border-radius: 12px;
  margin-bottom: 16px;
}

.level-card.level-1 { border-left: 4px solid #67C23A; }
.level-card.level-2 { border-left: 4px solid #E6A23C; }
.level-card.level-3 { border-left: 4px solid #F56C6C; }

.level-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.level-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #606266;
}

.level-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #909399;
}

.divider {
  color: #DCDFE6;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #FAFAFA;
  border-radius: 8px;
}

.cat-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cat-name {
  font-size: 14px;
  color: #303133;
}

.cat-size {
  font-size: 13px;
  color: #909399;
}

.file-collapse {
  margin-top: 12px;
}

.file-list {
  max-height: 300px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid #F0F0F0;
  font-size: 13px;
}

.file-name {
  color: #303133;
  min-width: 150px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-path {
  color: #909399;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}

.file-size {
  color: #606266;
  flex-shrink: 0;
  min-width: 80px;
  text-align: right;
}

.clean-actions {
  margin-top: 20px;
  text-align: center;
}

.result-content {
  text-align: center;
  padding: 20px 0;
}

.result-content h3 {
  font-size: 20px;
  color: #303133;
  margin: 16px 0 12px;
}

.result-content p {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.result-content .error-info {
  color: #E6A23C;
  margin-top: 12px;
}
</style>
