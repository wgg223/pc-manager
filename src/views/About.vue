<template>
  <div class="about-container">
    <div class="page-header">
      <h2>关于软件</h2>
      <p class="subtitle">软件信息、更新与用户协议</p>
    </div>
    
    <el-card class="info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon class="card-icon"><InfoFilled /></el-icon>
          <span>软件信息</span>
        </div>
      </template>
      <div class="software-info">
        <div class="logo-section">
          <el-icon class="app-logo"><Cpu /></el-icon>
          <h2 class="app-name">老王的维护宝</h2>
          <p class="app-version">v{{ version }}</p>
        </div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="软件名称">老王的维护宝</el-descriptions-item>
          <el-descriptions-item label="当前版本">v{{ version }}</el-descriptions-item>
          <el-descriptions-item label="技术栈">Electron + Vue 3 + Element Plus</el-descriptions-item>
          <el-descriptions-item label="开源地址">
            <el-link type="primary" @click="openGithub">https://github.com/wgg223/pc-manager</el-link>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
    
    <el-card class="update-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon class="card-icon update"><Refresh /></el-icon>
          <span>检查更新</span>
        </div>
      </template>
      <div class="update-content">
        <div class="update-status">
          <el-icon :class="updateIconClass" :size="48">
            <CircleCheckFilled v-if="updateStatus === 'latest'" />
            <Download v-else-if="updateStatus === 'available'" />
            <Loading v-else-if="updateStatus === 'checking'" />
            <WarningFilled v-else />
          </el-icon>
          <div class="update-text">
            <h3>{{ updateTitle }}</h3>
            <p>{{ updateMessage }}</p>
          </div>
        </div>
        <div class="update-actions">
          <el-button 
            type="primary" 
            :loading="updateStatus === 'checking'"
            @click="checkUpdate"
          >
            <el-icon><Refresh /></el-icon>
            检查更新
          </el-button>
          <el-button 
            v-if="updateStatus === 'available'"
            type="success"
            @click="openGithub"
          >
            <el-icon><Download /></el-icon>
            前往下载
          </el-button>
        </div>
      </div>
    </el-card>
    
    <el-card class="agreement-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon class="card-icon agreement"><Document /></el-icon>
          <span>用户协议</span>
        </div>
      </template>
      <div class="agreement-content">
        <p>使用本软件前，请仔细阅读以下用户协议：</p>
        <el-button type="primary" @click="showAgreement">查看用户协议</el-button>
      </div>
    </el-card>
    
    <el-dialog
      v-model="agreementVisible"
      title="用户协议"
      width="700px"
      top="5vh"
    >
      <div class="agreement-text">
        <h3>老王的维护宝 - 用户协议</h3>
        <p class="update-date">更新日期：2025年1月1日</p>
        
        <h4>一、协议说明</h4>
        <p>欢迎使用「老王的维护宝」（以下简称"本软件"）。本软件是一款电脑系统维护工具，提供定时任务、磁盘清理、系统信息查看、进程管理等功能。在使用本软件之前，请您仔细阅读本协议的全部内容。</p>
        
        <h4>二、软件功能说明</h4>
        <p>本软件提供以下功能：</p>
        <ul>
          <li>定时任务：设置电脑定时重启、关机或休眠</li>
          <li>磁盘清理：清理临时文件、系统缓存和回收站</li>
          <li>系统信息：查看 CPU、内存、磁盘、显卡、主板等信息</li>
          <li>进程管理：查看和管理系统运行进程</li>
          <li>启动项管理：管理开机自启动程序</li>
          <li>网络重置：重置 DNS、Winsock、IP 地址</li>
          <li>软件卸载：查看和卸载已安装软件</li>
          <li>壁纸更换：设置桌面壁纸</li>
          <li>控制台：执行系统命令</li>
        </ul>
        
        <h4>三、使用须知</h4>
        <p>1. 本软件的部分功能涉及系统级操作（如关机、重启、进程管理等），请在使用前确认操作内容，避免误操作导致数据丢失。</p>
        <p>2. 使用磁盘清理功能时，被清理的文件将无法恢复，请谨慎操作。</p>
        <p>3. 使用进程管理功能结束系统关键进程可能导致系统不稳定，请确认后再操作。</p>
        <p>4. 使用控制台功能执行的命令由用户自行负责，本软件不对命令执行结果承担责任。</p>
        
        <h4>四、免责声明</h4>
        <p>1. 本软件按"现状"提供，不作任何明示或暗示的保证。</p>
        <p>2. 用户使用本软件所产生的一切后果由用户自行承担，开发者不对因使用本软件造成的任何损失负责。</p>
        <p>3. 本软件不保证完全符合用户需求，也不保证服务不中断。</p>
        
        <h4>五、知识产权</h4>
        <p>本软件为开源软件，遵循开源协议发布。用户可以在遵守开源协议的前提下自由使用、修改和分发本软件。</p>
        
        <h4>六、隐私保护</h4>
        <p>本软件不会收集、存储或上传用户的任何个人信息。所有数据均存储在用户本地设备上。</p>
        
        <h4>七、协议修改</h4>
        <p>开发者有权随时修改本协议，修改后的协议将在软件中公布。继续使用本软件即表示您同意修改后的协议。</p>
        
        <h4>八、联系方式</h4>
        <p>如有任何问题或建议，请通过以下方式联系我们：</p>
        <p>GitHub: <el-link type="primary" @click="openGithub">https://github.com/wgg223/pc-manager</el-link></p>
      </div>
      <template #footer>
        <el-button @click="agreementVisible = false">关闭</el-button>
        <el-button type="primary" @click="acceptAgreement">我已阅读并同意</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const version = ref('1.0.0')
const updateStatus = ref('idle')
const agreementVisible = ref(false)

const updateTitle = computed(() => {
  const titles = {
    idle: '未检查',
    checking: '检查中...',
    latest: '已是最新版本',
    available: '发现新版本',
    error: '检查失败'
  }
  return titles[updateStatus.value]
})

const updateMessage = computed(() => {
  const messages = {
    idle: '点击"检查更新"按钮查看是否有新版本',
    checking: '正在连接服务器检查更新...',
    latest: '您当前使用的已是最新版本，无需更新',
    available: '发现新版本，请前往 GitHub 下载最新版本',
    error: '无法连接到更新服务器，请检查网络后重试'
  }
  return messages[updateStatus.value]
})

const updateIconClass = computed(() => {
  const classes = {
    idle: 'icon-idle',
    checking: 'icon-checking',
    latest: 'icon-latest',
    available: 'icon-available',
    error: 'icon-error'
  }
  return classes[updateStatus.value]
})

const checkUpdate = async () => {
  updateStatus.value = 'checking'
  
  try {
    const response = await fetch('https://api.github.com/repos/wgg223/pc-manager/releases/latest')
    if (response.ok) {
      const data = await response.json()
      const latestVersion = data.tag_name?.replace('v', '') || '0.0.0'
      
      if (compareVersions(latestVersion, version.value) > 0) {
        updateStatus.value = 'available'
      } else {
        updateStatus.value = 'latest'
      }
    } else {
      updateStatus.value = 'error'
    }
  } catch (error) {
    updateStatus.value = 'error'
  }
}

const compareVersions = (v1, v2) => {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0
    const p2 = parts2[i] || 0
    if (p1 > p2) return 1
    if (p1 < p2) return -1
  }
  return 0
}

const openGithub = () => {
  window.electronAPI.openExternal('https://github.com/wgg223/pc-manager')
}

const showAgreement = () => {
  agreementVisible.value = true
}

const acceptAgreement = () => {
  localStorage.setItem('agreement-accepted', 'true')
  localStorage.setItem('agreement-accepted-date', new Date().toISOString())
  agreementVisible.value = false
  ElMessage.success('已同意用户协议')
}
</script>

<style scoped>
.about-container {
  max-width: 800px;
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

.info-card,
.update-card,
.agreement-card {
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
  font-size: 24px;
  color: #409EFF;
}

.card-icon.update {
  color: #67C23A;
}

.card-icon.agreement {
  color: #E6A23C;
}

.software-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.logo-section {
  text-align: center;
  padding: 20px 0;
}

.app-logo {
  font-size: 64px;
  color: #409EFF;
  margin-bottom: 12px;
}

.app-name {
  font-size: 24px;
  color: #303133;
  margin-bottom: 8px;
}

.app-version {
  font-size: 16px;
  color: #909399;
}

.update-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
}

.update-status {
  display: flex;
  align-items: center;
  gap: 20px;
}

.update-text h3 {
  font-size: 18px;
  color: #303133;
  margin-bottom: 8px;
}

.update-text p {
  font-size: 14px;
  color: #606266;
}

.icon-idle {
  color: #909399;
}

.icon-checking {
  color: #409EFF;
  animation: rotate 1s linear infinite;
}

.icon-latest {
  color: #67C23A;
}

.icon-available {
  color: #E6A23C;
}

.icon-error {
  color: #F56C6C;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.update-actions {
  display: flex;
  gap: 12px;
}

.agreement-content {
  text-align: center;
  padding: 20px 0;
}

.agreement-content p {
  margin-bottom: 16px;
  color: #606266;
}

.agreement-text {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 10px;
}

.agreement-text h3 {
  text-align: center;
  font-size: 20px;
  color: #303133;
  margin-bottom: 8px;
}

.agreement-text .update-date {
  text-align: center;
  color: #909399;
  margin-bottom: 20px;
}

.agreement-text h4 {
  font-size: 16px;
  color: #303133;
  margin: 16px 0 8px;
}

.agreement-text p {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  margin-bottom: 8px;
}

.agreement-text ul {
  padding-left: 20px;
  margin-bottom: 12px;
}

.agreement-text ul li {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
}
</style>
