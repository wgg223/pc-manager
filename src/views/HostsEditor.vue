<template>
  <div class="hosts-container">
    <div class="page-header">
      <h2>Hosts 编辑</h2>
      <p class="subtitle">编辑系统 Hosts 文件，用于 DNS 解析自定义</p>
    </div>
    
    <el-card class="hosts-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>Hosts 文件内容</span>
          <div class="header-actions">
            <el-button type="primary" size="small" @click="loadHosts" :loading="loadingRead">
              <el-icon><Refresh /></el-icon>
              重新加载
            </el-button>
            <el-button type="success" size="small" @click="saveHosts" :loading="loadingSave">
              <el-icon><Check /></el-icon>
              保存
            </el-button>
          </div>
        </div>
      </template>
      
      <el-alert
        title="编辑 Hosts 文件需要管理员权限，保存时系统可能会弹出权限确认窗口"
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 16px"
      />
      
      <el-input
        v-model="hostsContent"
        type="textarea"
        :rows="20"
        class="hosts-editor"
        placeholder="正在加载 Hosts 文件..."
      />
      
      <div class="editor-footer">
        <span class="line-count">共 {{ lineCount }} 行</span>
        <div class="quick-actions">
          <el-button size="small" @click="addEntry">添加条目</el-button>
          <el-button size="small" @click="flushDns">刷新 DNS 缓存</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const hostsContent = ref('')
const loadingRead = ref(false)
const loadingSave = ref(false)

const lineCount = computed(() => {
  return hostsContent.value ? hostsContent.value.split('\n').length : 0
})

const loadHosts = async () => {
  loadingRead.value = true
  try {
    const result = await window.electronAPI.readHosts()
    if (result.success) {
      hostsContent.value = result.content
      ElMessage.success('Hosts 文件加载成功')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    ElMessage.error('加载 Hosts 文件失败: ' + error)
  } finally {
    loadingRead.value = false
  }
}

const saveHosts = async () => {
  try {
    await ElMessageBox.confirm(
      '保存 Hosts 文件需要管理员权限，确定要保存吗？',
      '确认保存',
      { type: 'warning', confirmButtonText: '确定保存', cancelButtonText: '取消' }
    )
  } catch {
    return
  }

  loadingSave.value = true
  try {
    const result = await window.electronAPI.saveHosts(hostsContent.value)
    if (result.success) {
      ElMessage.success('Hosts 文件保存成功')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    ElMessage.error('保存 Hosts 文件失败: ' + error)
  } finally {
    loadingSave.value = false
  }
}

const addEntry = () => {
  const newLine = hostsContent.value.endsWith('\n') ? '' : '\n'
  hostsContent.value += newLine + '\n# 新条目\n# 127.0.0.1   example.com'
  ElMessage.info('已添加注释模板，请修改为实际内容后保存')
}

const flushDns = async () => {
  try {
    await window.electronAPI.resetDns()
    ElMessage.success('DNS 缓存已刷新')
  } catch (error) {
    ElMessage.error('刷新 DNS 缓存失败: ' + error)
  }
}

onMounted(() => {
  loadHosts()
})
</script>

<style scoped>
.hosts-container {
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

.hosts-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.hosts-editor :deep(textarea) {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.line-count {
  font-size: 13px;
  color: #909399;
}

.quick-actions {
  display: flex;
  gap: 8px;
}
</style>
