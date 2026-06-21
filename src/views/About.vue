<template>
  <div class="about-container">
    <div class="page-header">
      <h2>鍏充簬杞欢</h2>
      <p class="subtitle">杞欢淇℃伅銆佹洿鏂颁笌鐢ㄦ埛鍗忚</p>
    </div>
    
    <el-card class="info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon class="card-icon"><InfoFilled /></el-icon>
          <span>杞欢淇℃伅</span>
        </div>
      </template>
      <div class="software-info">
        <div class="logo-section">
          <el-icon class="app-logo"><Cpu /></el-icon>
          <h2 class="app-name">鑰佺帇鐨勭淮鎶ゅ疂</h2>
          <p class="app-version">v{{ version }}</p>
        </div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="杞欢鍚嶇О">鑰佺帇鐨勭淮鎶ゅ疂</el-descriptions-item>
          <el-descriptions-item label="褰撳墠鐗堟湰">v{{ version }}</el-descriptions-item>
          <el-descriptions-item label="鎶€鏈爤">Electron + Vue 3 + Element Plus</el-descriptions-item>
          <el-descriptions-item label="寮€婧愬湴鍧€">
            <el-link type="primary" @click="openGithub">https://github.com/wgg223/systeam-weihu.git</el-link>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
    
    <el-card class="update-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon class="card-icon update"><Refresh /></el-icon>
          <span>妫€鏌ユ洿鏂?/span>
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
            妫€鏌ユ洿鏂?          </el-button>
          <el-button 
            v-if="updateStatus === 'available'"
            type="success"
            @click="openGithub"
          >
            <el-icon><Download /></el-icon>
            鍓嶅線涓嬭浇
          </el-button>
        </div>
      </div>
    </el-card>
    
    <el-card class="agreement-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon class="card-icon agreement"><Document /></el-icon>
          <span>鐢ㄦ埛鍗忚</span>
        </div>
      </template>
      <div class="agreement-content">
        <p>浣跨敤鏈蒋浠跺墠锛岃浠旂粏闃呰浠ヤ笅鐢ㄦ埛鍗忚锛?/p>
        <el-button type="primary" @click="showAgreement">鏌ョ湅鐢ㄦ埛鍗忚</el-button>
      </div>
    </el-card>
    
    <el-dialog
      v-model="agreementVisible"
      title="鐢ㄦ埛鍗忚"
      width="700px"
      top="5vh"
    >
      <div class="agreement-text">
        <h3>鑰佺帇鐨勭淮鎶ゅ疂 - 鐢ㄦ埛鍗忚</h3>
        <p class="update-date">鏇存柊鏃ユ湡锛?025骞?鏈?鏃?/p>
        
        <h4>涓€銆佸崗璁鏄?/h4>
        <p>娆㈣繋浣跨敤銆岃€佺帇鐨勭淮鎶ゅ疂銆嶏紙浠ヤ笅绠€绉?鏈蒋浠?锛夈€傛湰杞欢鏄竴娆剧數鑴戠郴缁熺淮鎶ゅ伐鍏凤紝鎻愪緵瀹氭椂浠诲姟銆佺鐩樻竻鐞嗐€佺郴缁熶俊鎭煡鐪嬨€佽繘绋嬬鐞嗙瓑鍔熻兘銆傚湪浣跨敤鏈蒋浠朵箣鍓嶏紝璇锋偍浠旂粏闃呰鏈崗璁殑鍏ㄩ儴鍐呭銆?/p>
        
        <h4>浜屻€佽蒋浠跺姛鑳借鏄?/h4>
        <p>鏈蒋浠舵彁渚涗互涓嬪姛鑳斤細</p>
        <ul>
          <li>瀹氭椂浠诲姟锛氳缃數鑴戝畾鏃堕噸鍚€佸叧鏈烘垨浼戠湢</li>
          <li>纾佺洏娓呯悊锛氭竻鐞嗕复鏃舵枃浠躲€佺郴缁熺紦瀛樺拰鍥炴敹绔?/li>
          <li>绯荤粺淇℃伅锛氭煡鐪?CPU銆佸唴瀛樸€佺鐩樸€佹樉鍗°€佷富鏉跨瓑淇℃伅</li>
          <li>杩涚▼绠＄悊锛氭煡鐪嬪拰绠＄悊绯荤粺杩愯杩涚▼</li>
          <li>鍚姩椤圭鐞嗭細绠＄悊寮€鏈鸿嚜鍚姩绋嬪簭</li>
          <li>缃戠粶閲嶇疆锛氶噸缃?DNS銆乄insock銆両P 鍦板潃</li>
          <li>杞欢鍗歌浇锛氭煡鐪嬪拰鍗歌浇宸插畨瑁呰蒋浠?/li>
          <li>澹佺焊鏇存崲锛氳缃闈㈠绾?/li>
          <li>鎺у埗鍙帮細鎵ц绯荤粺鍛戒护</li>
        </ul>
        
        <h4>涓夈€佷娇鐢ㄩ』鐭?/h4>
        <p>1. 鏈蒋浠剁殑閮ㄥ垎鍔熻兘娑夊強绯荤粺绾ф搷浣滐紙濡傚叧鏈恒€侀噸鍚€佽繘绋嬬鐞嗙瓑锛夛紝璇峰湪浣跨敤鍓嶇‘璁ゆ搷浣滃唴瀹癸紝閬垮厤璇搷浣滃鑷存暟鎹涪澶便€?/p>
        <p>2. 浣跨敤纾佺洏娓呯悊鍔熻兘鏃讹紝琚竻鐞嗙殑鏂囦欢灏嗘棤娉曟仮澶嶏紝璇疯皑鎱庢搷浣溿€?/p>
        <p>3. 浣跨敤杩涚▼绠＄悊鍔熻兘缁撴潫绯荤粺鍏抽敭杩涚▼鍙兘瀵艰嚧绯荤粺涓嶇ǔ瀹氾紝璇风‘璁ゅ悗鍐嶆搷浣溿€?/p>
        <p>4. 浣跨敤鎺у埗鍙板姛鑳芥墽琛岀殑鍛戒护鐢辩敤鎴疯嚜琛岃礋璐ｏ紝鏈蒋浠朵笉瀵瑰懡浠ゆ墽琛岀粨鏋滄壙鎷呰矗浠汇€?/p>
        
        <h4>鍥涖€佸厤璐ｅ０鏄?/h4>
        <p>1. 鏈蒋浠舵寜"鐜扮姸"鎻愪緵锛屼笉浣滀换浣曟槑绀烘垨鏆楃ず鐨勪繚璇併€?/p>
        <p>2. 鐢ㄦ埛浣跨敤鏈蒋浠舵墍浜х敓鐨勪竴鍒囧悗鏋滅敱鐢ㄦ埛鑷鎵挎媴锛屽紑鍙戣€呬笉瀵瑰洜浣跨敤鏈蒋浠堕€犳垚鐨勪换浣曟崯澶辫礋璐ｃ€?/p>
        <p>3. 鏈蒋浠朵笉淇濊瘉瀹屽叏绗﹀悎鐢ㄦ埛闇€姹傦紝涔熶笉淇濊瘉鏈嶅姟涓嶄腑鏂€?/p>
        
        <h4>浜斻€佺煡璇嗕骇鏉?/h4>
        <p>鏈蒋浠朵负寮€婧愯蒋浠讹紝閬靛惊寮€婧愬崗璁彂甯冦€傜敤鎴峰彲浠ュ湪閬靛畧寮€婧愬崗璁殑鍓嶆彁涓嬭嚜鐢变娇鐢ㄣ€佷慨鏀瑰拰鍒嗗彂鏈蒋浠躲€?/p>
        
        <h4>鍏€侀殣绉佷繚鎶?/h4>
        <p>鏈蒋浠朵笉浼氭敹闆嗐€佸瓨鍌ㄦ垨涓婁紶鐢ㄦ埛鐨勪换浣曚釜浜轰俊鎭€傛墍鏈夋暟鎹潎瀛樺偍鍦ㄧ敤鎴锋湰鍦拌澶囦笂銆?/p>
        
        <h4>涓冦€佸崗璁慨鏀?/h4>
        <p>寮€鍙戣€呮湁鏉冮殢鏃朵慨鏀规湰鍗忚锛屼慨鏀瑰悗鐨勫崗璁皢鍦ㄨ蒋浠朵腑鍏竷銆傜户缁娇鐢ㄦ湰杞欢鍗宠〃绀烘偍鍚屾剰淇敼鍚庣殑鍗忚銆?/p>
        
        <h4>鍏€佽仈绯绘柟寮?/h4>
        <p>濡傛湁浠讳綍闂鎴栧缓璁紝璇烽€氳繃浠ヤ笅鏂瑰紡鑱旂郴鎴戜滑锛?/p>
        <p>GitHub: <el-link type="primary" @click="openGithub">https://github.com/wgg223/systeam-weihu.git</el-link></p>
      </div>
      <template #footer>
        <el-button @click="agreementVisible = false">鍏抽棴</el-button>
        <el-button type="primary" @click="acceptAgreement">鎴戝凡闃呰骞跺悓鎰?/el-button>
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
    idle: '鏈鏌?,
    checking: '妫€鏌ヤ腑...',
    latest: '宸叉槸鏈€鏂扮増鏈?,
    available: '鍙戠幇鏂扮増鏈?,
    error: '妫€鏌ュけ璐?
  }
  return titles[updateStatus.value]
})

const updateMessage = computed(() => {
  const messages = {
    idle: '鐐瑰嚮"妫€鏌ユ洿鏂?鎸夐挳鏌ョ湅鏄惁鏈夋柊鐗堟湰',
    checking: '姝ｅ湪杩炴帴鏈嶅姟鍣ㄦ鏌ユ洿鏂?..',
    latest: '鎮ㄥ綋鍓嶄娇鐢ㄧ殑宸叉槸鏈€鏂扮増鏈紝鏃犻渶鏇存柊',
    available: '鍙戠幇鏂扮増鏈紝璇峰墠寰€ GitHub 涓嬭浇鏈€鏂扮増鏈?,
    error: '鏃犳硶杩炴帴鍒版洿鏂版湇鍔″櫒锛岃妫€鏌ョ綉缁滃悗閲嶈瘯'
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
    const response = await fetch('https://api.github.com/repos/wgg223/systeam-weihu/releases/latest')
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
  window.electronAPI.openExternal('https://github.com/wgg223/systeam-weihu.git')
}

const showAgreement = () => {
  agreementVisible.value = true
}

const acceptAgreement = () => {
  localStorage.setItem('agreement-accepted', 'true')
  localStorage.setItem('agreement-accepted-date', new Date().toISOString())
  agreementVisible.value = false
  ElMessage.success('宸插悓鎰忕敤鎴峰崗璁?)
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
