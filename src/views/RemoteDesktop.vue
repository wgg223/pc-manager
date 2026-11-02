<template>
  <div class="remote-desktop-container">
    <div class="page-header">
      <h2>远程桌面</h2>
      <p class="subtitle">管理 RDP 远程桌面连接，快速连接到其他电脑</p>
    </div>

    <el-card class="connections-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon class="card-icon"><Monitor /></el-icon>
          <span>远程桌面连接</span>
          <el-button type="primary" class="add-btn" @click="showAddDialog">
            <el-icon><Plus /></el-icon>
            新建连接
          </el-button>
        </div>
      </template>

      <div v-loading="loading" class="connections-grid">
        <el-empty v-if="!loading && connections.length === 0" description="暂无保存的远程桌面连接，点击「新建连接」添加">
          <el-button type="primary" @click="showAddDialog">
            <el-icon><Plus /></el-icon>
            新建连接
          </el-button>
        </el-empty>

        <div v-for="conn in connections" :key="conn.id" class="connection-card">
          <div class="conn-header">
            <el-icon :size="28" class="conn-icon"><Monitor /></el-icon>
            <div class="conn-title">
              <h3>{{ conn.name }}</h3>
              <p>{{ conn.host }}:{{ conn.port }}</p>
            </div>
          </div>
          <div class="conn-info">
            <div class="info-row" v-if="conn.username">
              <span class="label">用户名</span>
              <span class="value">{{ conn.username }}</span>
            </div>
            <div class="info-row">
              <span class="label">全屏</span>
              <span class="value">{{ conn.fullscreen !== false ? '是' : '否' }}</span>
            </div>
            <div class="info-row" v-if="conn.resolution && conn.resolution !== 'default'">
              <span class="label">分辨率</span>
              <span class="value">{{ conn.resolution }}</span>
            </div>
            <div class="info-row" v-if="conn.adminMode">
              <span class="label">管理模式</span>
              <span class="value">是</span>
            </div>
          </div>
          <div class="conn-actions">
            <el-button type="primary" @click="connectTo(conn)" :loading="connecting === conn.id">
              <el-icon><Connection /></el-icon>
              连接
            </el-button>
            <el-button @click="editConnection(conn)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" plain @click="deleteConnection(conn)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑远程桌面连接' : '新建远程桌面连接'"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="100px" class="rdp-form">
        <el-form-item label="连接名称">
          <el-input v-model="form.name" placeholder="例如: 办公室电脑" />
        </el-form-item>
        <el-form-item label="主机地址">
          <el-input v-model="form.host" placeholder="IP 地址或域名" />
        </el-form-item>
        <el-form-item label="端口">
          <el-input-number v-model="form.port" :min="1" :max="65535" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="登录用户名（可选）" />
        </el-form-item>
        <el-form-item label="全屏模式">
          <el-switch v-model="form.fullscreen" />
        </el-form-item>
        <el-form-item label="分辨率">
          <el-select v-model="form.resolution" placeholder="默认">
            <el-option label="默认" value="default" />
            <el-option label="1920 x 1080" value="1920x1080" />
            <el-option label="1680 x 1050" value="1680x1050" />
            <el-option label="1440 x 900" value="1440x900" />
            <el-option label="1280 x 720" value="1280x720" />
            <el-option label="1024 x 768" value="1024x768" />
          </el-select>
        </el-form-item>
        <el-form-item label="管理模式">
          <el-switch v-model="form.adminMode" />
          <span class="form-tip">以管理员身份连接到会话</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveConnection" :loading="saving">
          {{ saving ? '保存中...' : '保存' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const connections = ref([])
const loading = ref(false)
const connecting = ref(null)
const saving = ref(false)
const dialogVisible = ref(false)
const editingId = ref(null)

const form = reactive({
  name: '',
  host: '',
  port: 3389,
  username: '',
  fullscreen: true,
  resolution: 'default',
  adminMode: false
})

const resetForm = () => {
  form.name = ''
  form.host = ''
  form.port = 3389
  form.username = ''
  form.fullscreen = true
  form.resolution = 'default'
  form.adminMode = false
  editingId.value = null
}

const showAddDialog = () => {
  resetForm()
  dialogVisible.value = true
}

const editConnection = (conn) => {
  editingId.value = conn.id
  form.name = conn.name
  form.host = conn.host
  form.port = conn.port
  form.username = conn.username || ''
  form.fullscreen = conn.fullscreen !== false
  form.resolution = conn.resolution || 'default'
  form.adminMode = conn.adminMode || false
  dialogVisible.value = true
}

const loadConnections = async () => {
  loading.value = true
  try {
    connections.value = await window.electronAPI.rdpGetConnections()
  } catch (e) {
    ElMessage.error('加载连接列表失败')
  } finally {
    loading.value = false
  }
}

const saveConnection = async () => {
  if (!form.host) {
    ElMessage.warning('请输入主机地址')
    return
  }

  saving.value = true
  try {
    await window.electronAPI.rdpSaveConnection({
      id: editingId.value,
      name: form.name || form.host,
      host: form.host,
      port: form.port,
      username: form.username,
      fullscreen: form.fullscreen,
      resolution: form.resolution,
      adminMode: form.adminMode
    })
    await loadConnections()
    dialogVisible.value = false
    ElMessage.success(editingId.value ? '连接已更新' : '连接已保存')
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const deleteConnection = async (conn) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除远程桌面连接「${conn.name}」吗？`,
      '确认删除',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
    )
  } catch {
    return
  }

  try {
    await window.electronAPI.rdpDeleteConnection(conn.id)
    await loadConnections()
    ElMessage.success(`已删除连接「${conn.name}」`)
  } catch (e) {
    ElMessage.error('删除失败')
  }
}

const connectTo = async (conn) => {
  connecting.value = conn.id
  try {
    await window.electronAPI.rdpConnect(conn)
    ElMessage.success(`正在连接到「${conn.name}」...`)
  } catch (e) {
    ElMessage.error(typeof e === 'string' ? e : '连接失败')
  } finally {
    connecting.value = null
  }
}

onMounted(() => {
  loadConnections()
})
</script>

<style scoped>
.remote-desktop-container {
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

.connections-card {
  border-radius: 12px;
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

.add-btn {
  margin-left: auto;
}

.connections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  min-height: 100px;
}

.connection-card {
  border: 1px solid #E4E7ED;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.connection-card:hover {
  border-color: #409EFF;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.conn-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.conn-icon {
  color: #409EFF;
  flex-shrink: 0;
}

.conn-title h3 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 4px;
}

.conn-title p {
  font-size: 13px;
  color: #909399;
}

.conn-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #F5F7FA;
  border-radius: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.info-row .label {
  color: #909399;
}

.info-row .value {
  color: #303133;
  font-weight: 500;
}

.conn-actions {
  display: flex;
  gap: 8px;
}

.conn-actions .el-button {
  flex: 1;
}

.rdp-form {
  padding: 0 10px;
}

.form-tip {
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
}
</style>
