<template>
  <div class="wallpaper-container">
    <div class="page-header">
      <h2>澹佺焊鏇存崲</h2>
      <p class="subtitle">閫夋嫨鍥剧墖璁剧疆涓烘闈㈠绾?/p>
    </div>
    
    <el-card class="wallpaper-card" shadow="hover">
      <div class="wallpaper-content">
        <div class="preview-section">
          <div v-if="selectedImage" class="image-preview">
            <img :src="selectedImage" alt="澹佺焊棰勮" />
          </div>
          <div v-else class="placeholder">
            <el-icon class="placeholder-icon"><Picture /></el-icon>
            <p>閫夋嫨鍥剧墖棰勮</p>
          </div>
        </div>
        
        <div class="action-section">
          <el-button type="primary" size="large" @click="selectImage">
            <el-icon><FolderOpened /></el-icon>
            閫夋嫨鍥剧墖
          </el-button>
          
          <el-button 
            type="success" 
            size="large"
            :disabled="!selectedImage"
            :loading="applying"
            @click="applyWallpaper"
          >
            <el-icon><Check /></el-icon>
            搴旂敤澹佺焊
          </el-button>
        </div>
        
        <div v-if="imagePath" class="image-info">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="鏂囦欢璺緞">{{ imagePath }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-card>
    
    <el-card class="tips-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><InfoFilled /></el-icon>
          <span>浣跨敤鎻愮ず</span>
        </div>
      </template>
      <ul class="tips-list">
        <li>鏀寔 JPG銆丳NG銆丅MP銆丟IF 鏍煎紡</li>
        <li>寤鸿浣跨敤涓庡睆骞曞垎杈ㄧ巼鍖归厤鐨勫浘鐗?/li>
        <li>澹佺焊璁剧疆鍚庝細鑷姩閫傚簲灞忓箷</li>
      </ul>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const selectedImage = ref('')
const imagePath = ref('')
const applying = ref(false)

const selectImage = async () => {
  try {
    const path = await window.electronAPI.selectImage()
    if (path) {
      imagePath.value = path
      selectedImage.value = `file:///${path.replace(/\\/g, '/')}`
    }
  } catch (error) {
    ElMessage.error('閫夋嫨鍥剧墖澶辫触: ' + error)
  }
}

const applyWallpaper = async () => {
  applying.value = true
  try {
    await window.electronAPI.setWallpaper(imagePath.value)
    ElMessage.success('澹佺焊璁剧疆鎴愬姛')
  } catch (error) {
    ElMessage.error('璁剧疆澹佺焊澶辫触: ' + error)
  } finally {
    applying.value = false
  }
}
</script>

<style scoped>
.wallpaper-container {
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

.wallpaper-card {
  border-radius: 12px;
  margin-bottom: 24px;
}

.wallpaper-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-section {
  width: 100%;
  height: 300px;
  border: 2px dashed #DCDFE6;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview {
  width: 100%;
  height: 100%;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.placeholder {
  text-align: center;
  color: #909399;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.action-section {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.image-info {
  margin-top: 10px;
}

.tips-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.tips-list {
  padding-left: 20px;
  color: #606266;
}

.tips-list li {
  margin-bottom: 8px;
}

.tips-list li:last-child {
  margin-bottom: 0;
}
</style>
