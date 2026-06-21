<template>
  <div class="custom-container">
    <div class="page-header">
      <h2>鑷畾涔夐〉闈?/h2>
      <p class="subtitle">鑷畾涔夊姛鑳藉崱鐗囧竷灞€</p>
    </div>
    
    <div class="toolbar">
      <el-button type="primary" @click="addCard">
        <el-icon><Plus /></el-icon>
        娣诲姞鍗＄墖
      </el-button>
      <el-button @click="resetLayout">
        <el-icon><RefreshLeft /></el-icon>
        閲嶇疆甯冨眬
      </el-button>
    </div>
    
    <div class="cards-grid">
      <el-card 
        v-for="(card, index) in cards" 
        :key="card.id"
        class="custom-card"
        shadow="hover"
      >
        <template #header>
          <div class="card-header">
            <el-input 
              v-model="card.title" 
              placeholder="鍗＄墖鏍囬"
              class="title-input"
            />
            <el-button 
              type="danger" 
              :icon="Delete" 
              circle
              size="small"
              @click="removeCard(index)"
            />
          </div>
        </template>
        <div class="card-content">
          <el-input
            v-model="card.content"
            type="textarea"
            :rows="4"
            placeholder="杈撳叆鍐呭..."
          />
        </div>
        <div class="card-footer">
          <el-color-picker v-model="card.color" size="small" />
          <el-select v-model="card.size" size="small" style="width: 100px">
            <el-option label="灏? value="small" />
            <el-option label="涓? value="medium" />
            <el-option label="澶? value="large" />
          </el-select>
        </div>
      </el-card>
    </div>
    
    <el-dialog v-model="dialogVisible" title="娣诲姞鍗＄墖" width="400px">
      <el-form :model="newCard" label-width="80px">
        <el-form-item label="鏍囬">
          <el-input v-model="newCard.title" placeholder="杈撳叆鍗＄墖鏍囬" />
        </el-form-item>
        <el-form-item label="鍐呭">
          <el-input 
            v-model="newCard.content" 
            type="textarea" 
            :rows="3"
            placeholder="杈撳叆鍗＄墖鍐呭" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">鍙栨秷</el-button>
        <el-button type="primary" @click="confirmAdd">纭畾</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Delete } from '@element-plus/icons-vue'

const dialogVisible = ref(false)
const newCard = ref({ title: '', content: '' })

const defaultCards = [
  { id: 1, title: '甯哥敤鍛戒护', content: 'ping 127.0.0.1\nipconfig /all\nsysteminfo', color: '#409EFF', size: 'medium' },
  { id: 2, title: '澶囧繕褰?, content: '鍦ㄨ繖閲岃褰曢噸瑕佷俊鎭?..', color: '#67C23A', size: 'medium' },
  { id: 3, title: '蹇嵎鎿嶄綔', content: '1. 娓呯悊纾佺洏\n2. 妫€鏌ユ洿鏂癨n3. 澶囦唤鏁版嵁', color: '#E6A23C', size: 'medium' }
]

const cards = ref([])

const addCard = () => {
  newCard.value = { title: '', content: '' }
  dialogVisible.value = true
}

const confirmAdd = () => {
  if (!newCard.value.title) {
    return
  }
  
  cards.value.push({
    id: Date.now(),
    title: newCard.value.title,
    content: newCard.value.content,
    color: '#409EFF',
    size: 'medium'
  })
  
  dialogVisible.value = false
  saveCards()
}

const removeCard = (index) => {
  cards.value.splice(index, 1)
  saveCards()
}

const resetLayout = () => {
  cards.value = [...defaultCards]
  saveCards()
}

const saveCards = () => {
  localStorage.setItem('custom-cards', JSON.stringify(cards.value))
}

const loadCards = () => {
  const saved = localStorage.getItem('custom-cards')
  if (saved) {
    cards.value = JSON.parse(saved)
  } else {
    cards.value = [...defaultCards]
  }
}

watch(cards, saveCards, { deep: true })

onMounted(() => {
  loadCards()
})
</script>

<style scoped>
.custom-container {
  max-width: 1200px;
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

.toolbar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.custom-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-input {
  flex: 1;
  margin-right: 10px;
}

.card-content {
  margin-bottom: 15px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
