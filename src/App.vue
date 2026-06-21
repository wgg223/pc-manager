<template>
  <div class="app-container">
    <div class="title-bar">
      <div class="title-bar-drag">
        <el-icon class="title-icon"><Monitor /></el-icon>
        <span class="title-text">鑰佺帇鐨勭淮鎶ゅ疂</span>
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
          <span class="logo-text">鑰佺帇鐨勭淮鎶ゅ疂</span>
        </div>
        
        <el-menu
          :default-active="currentRoute"
          router
          class="sidebar-menu"
        >
          <el-menu-item index="/">
            <el-icon><Timer /></el-icon>
            <span>瀹氭椂浠诲姟</span>
          </el-menu-item>
          
          <el-menu-item index="/disk-clean">
            <el-icon><Delete /></el-icon>
            <span>纾佺洏娓呯悊</span>
          </el-menu-item>
          
          <el-menu-item index="/system-info">
            <el-icon><DataAnalysis /></el-icon>
            <span>绯荤粺淇℃伅</span>
          </el-menu-item>
          
          <el-menu-item index="/process">
            <el-icon><List /></el-icon>
            <span>杩涚▼绠＄悊</span>
          </el-menu-item>
          
          <el-menu-item index="/startup">
            <el-icon><Switch /></el-icon>
            <span>鍚姩椤?/span>
          </el-menu-item>
          
          <el-menu-item index="/network">
            <el-icon><Connection /></el-icon>
            <span>缃戠粶閲嶇疆</span>
          </el-menu-item>
          
          <el-menu-item index="/software">
            <el-icon><Box /></el-icon>
            <span>杞欢鍗歌浇</span>
          </el-menu-item>
          
          <el-menu-item index="/wallpaper">
            <el-icon><Picture /></el-icon>
            <span>澹佺焊鏇存崲</span>
          </el-menu-item>
          
          <el-menu-item index="/custom">
            <el-icon><Setting /></el-icon>
            <span>鑷畾涔?/span>
          </el-menu-item>
          
          <el-menu-item index="/console">
            <el-icon><Terminal /></el-icon>
            <span>鎺у埗鍙?/span>
          </el-menu-item>
          
          <el-menu-item index="/about">
            <el-icon><InfoFilled /></el-icon>
            <span>鍏充簬杞欢</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-main class="main-content">
        <router-view />
      </el-main>
    </div>
    
    <el-dialog
      v-model="agreementVisible"
      title="鐢ㄦ埛鍗忚"
      width="700px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
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
        <p>濡傛湁浠讳綍闂鎴栧缓璁紝璇烽€氳繃 GitHub 鑱旂郴鎴戜滑銆?/p>
      </div>
      <template #footer>
        <el-button type="primary" @click="acceptAgreement" :disabled="!scrolledToBottom">
          {{ scrolledToBottom ? '鎴戝凡闃呰骞跺悓鎰? : '璇烽槄璇诲畬鏁村崗璁? }}
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
        dialogBody.addEventListener('scroll', () => {
          const { scrollTop, scrollHeight, clientHeight } = dialogBody
          if (scrollTop + clientHeight >= scrollHeight - 10) {
            scrolledToBottom.value = true
          }
        })
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
