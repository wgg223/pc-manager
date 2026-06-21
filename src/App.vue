<template>
  <div class="app-container">
    <div class="title-bar">
      <div class="title-bar-drag">
        <el-icon class="title-icon"><Monitor /></el-icon>
        <span class="title-text">老王的维护宝</span>
      </div>
      <div class="title-bar-controls">
        <el-button class="title-btn" @click="minimize">
          <el-icon><Minus /></el-icon>
        </el-button>
        <el-button class="title-btn" @click="maximize">
          <el-icon><FullScreen /></el-icon>
        </el-button>
        <el-button class="title-btn close-btn" @click="close">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </div>

    <div class="main-layout">
      <el-aside width="220px" class="sidebar">
        <div class="logo-section">
          <el-icon class="logo-icon"><Cpu /></el-icon>
          <span class="logo-text">老王的维护宝</span>
        </div>

        <el-menu
          :default-active="currentRoute"
          router
          class="sidebar-menu"
        >
          <el-menu-item index="/">
            <el-icon><Timer /></el-icon>
            <span>定时任务</span>
          </el-menu-item>

          <el-menu-item index="/disk-clean">
            <el-icon><Delete /></el-icon>
            <span>磁盘清理</span>
          </el-menu-item>

          <el-menu-item index="/system-info">
            <el-icon><DataAnalysis /></el-icon>
            <span>系统信息</span>
          </el-menu-item>

          <el-menu-item index="/process">
            <el-icon><List /></el-icon>
            <span>进程管理</span>
          </el-menu-item>

          <el-menu-item index="/startup">
            <el-icon><Switch /></el-icon>
            <span>启动项</span>
          </el-menu-item>

          <el-menu-item index="/network">
            <el-icon><Connection /></el-icon>
            <span>网络重置</span>
          </el-menu-item>

          <el-menu-item index="/software">
            <el-icon><Box /></el-icon>
            <span>软件卸载</span>
          </el-menu-item>

          <el-menu-item index="/wallpaper">
            <el-icon><Picture /></el-icon>
            <span>壁纸更换</span>
          </el-menu-item>

          <el-menu-item index="/custom">
            <el-icon><Setting /></el-icon>
            <span>自定义</span>
          </el-menu-item>

          <el-menu-item index="/console">
            <el-icon><Terminal /></el-icon>
            <span>控制台</span>
          </el-menu-item>

          <el-menu-item index="/about">
            <el-icon><InfoFilled /></el-icon>
            <span>关于软件</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </div>

    <el-dialog
      v-model="agreementVisible"
      title="用户协议"
      width="700px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
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

        <h4>四、免费声明</h4>
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
        <p>如有任何问题或建议，请通过 GitHub 联系我们。</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="acceptAgreement" :disabled="!scrolledToBottom">
          {{ scrolledToBottom ? '我已阅读并同意' : '请阅读完整协议' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentRoute = computed(() => route.path)
const agreementVisible = ref(false)
const scrolledToBottom = ref(false)

const minimize = () => window.electronAPI.windowMinimize()
const maximize = () => window.electronAPI.windowMaximize()
const close = () => window.electronAPI.windowClose()

const checkAgreement = () => {
  const accepted = localStorage.getItem('agreement-accepted')
  if (!accepted) {
    agreementVisible.value = true
    nextTick(() => {
      const dialogBody = document.querySelector('.el-dialog__body')
      if (dialogBody) {
        const { scrollHeight, clientHeight } = dialogBody
        if (scrollHeight <= clientHeight + 5) {
          scrolledToBottom.value = true
        } else {
          dialogBody.addEventListener('scroll', () => {
            const { scrollTop, scrollHeight: sh, clientHeight: ch } = dialogBody
            if (scrollTop + ch >= sh - 10) {
              scrolledToBottom.value = true
            }
          })
        }
      }
    })
  }
}

const acceptAgreement = () => {
  localStorage.setItem('agreement-accepted', 'true')
  localStorage.setItem('agreement-accepted-date', new Date().toISOString())
  agreementVisible.value = false
}

onMounted(() => {
  checkAgreement()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  background: #F5F7FA;
}

.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.title-bar {
  height: 36px;
  background: #409EFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  -webkit-app-region: drag;
}

.title-bar-drag {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  color: white;
  font-size: 18px;
}

.title-text {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.title-bar-controls {
  display: flex;
  gap: 4px;
  -webkit-app-region: no-drag;
}

.title-btn {
  width: 32px;
  height: 28px;
  border: none;
  background: transparent;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.title-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.close-btn:hover {
  background: #F56C6C;
}

.main-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  background: white;
  border-right: 1px solid #E4E7ED;
  overflow-y: auto;
}

.logo-section {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #E4E7ED;
}

.logo-icon {
  font-size: 28px;
  color: #409EFF;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.sidebar-menu {
  border-right: none;
}

.sidebar-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
}

.sidebar-menu .el-menu-item.is-active {
  background: #ECF5FF;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #F5F7FA;
}

.agreement-text {
  max-height: 50vh;
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
