<template>
  <div class="repair-container">
    <div class="page-header">
      <h2>系统修复</h2>
      <p class="subtitle">使用 Windows 内置工具修复系统文件</p>
    </div>
    
    <div class="repair-grid">
      <el-card class="repair-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon sfc"><CircleCheckFilled /></el-icon>
            <span>系统文件检查 (SFC)</span>
          </div>
        </template>
        <div class="card-body">
          <p class="desc">扫描并修复损坏的 Windows 系统文件</p>
          <el-alert
            title="将执行命令: sfc /scannow"
            type="info"
            :closable="false"
            style="margin-bottom: 16px"
          />
          <ul class="feature-list">
            <li>扫描所有受保护的系统文件</li>
            <li>用正确的 Microsoft 版本替换损坏的文件</li>
            <li>需要管理员权限运行</li>
            <li>扫描过程可能需要 10-30 分钟</li>
          </ul>
          <el-button 
            type="primary" 
            size="large" 
            :loading="sfcRunning"
            @click="runSfc"
            style="width: 100%"
          >
            <el-icon><CircleCheckFilled /></el-icon>
            开始扫描修复
          </el-button>
        </div>
      </el-card>
      
      <el-card class="repair-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon dism"><SetUp /></el-icon>
            <span>部署映像修复 (DISM)</span>
          </div>
        </template>
        <div class="card-body">
          <p class="desc">修复 Windows 系统映像，解决组件存储损坏</p>
          <el-alert
            title="将执行命令: DISM /Online /Cleanup-Image /RestoreHealth"
            type="info"
            :closable="false"
            style="margin-bottom: 16px"
          />
          <ul class="feature-list">
            <li>从 Windows Update 下载修复文件</li>
            <li>修复组件存储中的损坏</li>
            <li>需要管理员权限和网络连接</li>
            <li>建议在 SFC 之前运行</li>
          </ul>
          <el-button 
            type="warning" 
            size="large" 
            :loading="dismRunning"
            @click="runDism"
            style="width: 100%"
          >
            <el-icon><SetUp /></el-icon>
            开始映像修复
          </el-button>
        </div>
      </el-card>
    </div>
    
    <el-card class="tips-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><InfoFilled /></el-icon>
          <span>使用说明</span>
        </div>
      </template>
      <div class="tips-content">
        <p><strong>推荐修复顺序：</strong></p>
        <ol>
          <li>先运行 <strong>DISM</strong> 修复系统映像（需要联网）</li>
          <li>再运行 <strong>SFC</strong> 修复系统文件</li>
          <li>完成后重启电脑</li>
        </ol>
        <el-alert
          title="以上操作会在新窗口中以管理员权限运行，请留意弹出的命令行窗口查看进度和结果"
          type="warning"
          :closable="false"
          show-icon
          style="margin-top: 12px"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const sfcRunning = ref(false)
const dismRunning = ref(false)

const runSfc = async () => {
  try {
    await ElMessageBox.confirm(
      '系统文件检查将扫描并修复损坏的系统文件，过程可能需要 10-30 分钟。确定要开始吗？',
      '确认运行 SFC',
      { type: 'info', confirmButtonText: '开始扫描', cancelButtonText: '取消' }
    )
  } catch {
    return
  }

  sfcRunning.value = true
  try {
    await window.electronAPI.runSfc()
    ElMessage.success('系统文件检查已启动，请查看弹出的命令行窗口')
  } catch (error) {
    ElMessage.error('启动系统文件检查失败: ' + error)
  } finally {
    sfcRunning.value = false
  }
}

const runDism = async () => {
  try {
    await ElMessageBox.confirm(
      'DISM 将从 Windows Update 下载修复文件，请确保网络连接正常。过程可能需要 10-30 分钟。确定要开始吗？',
      '确认运行 DISM',
      { type: 'info', confirmButtonText: '开始修复', cancelButtonText: '取消' }
    )
  } catch {
    return
  }

  dismRunning.value = true
  try {
    await window.electronAPI.runDism()
    ElMessage.success('DISM 映像修复已启动，请查看弹出的命令行窗口')
  } catch (error) {
    ElMessage.error('启动 DISM 修复失败: ' + error)
  } finally {
    dismRunning.value = false
  }
}
</script>

<style scoped>
.repair-container {
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

.repair-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.repair-card {
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

.card-icon.sfc {
  color: #409EFF;
}

.card-icon.dism {
  color: #E6A23C;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.desc {
  font-size: 14px;
  color: #606266;
}

.feature-list {
  padding-left: 20px;
  margin: 0;
}

.feature-list li {
  font-size: 13px;
  color: #909399;
  line-height: 2;
}

.tips-card {
  border-radius: 12px;
}

.tips-content {
  font-size: 14px;
  color: #606266;
  line-height: 2;
}

.tips-content ol {
  padding-left: 20px;
  margin: 8px 0;
}

.tips-content strong {
  color: #303133;
}
</style>
