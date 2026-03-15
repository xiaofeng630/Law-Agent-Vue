<template>
  <div class="modal" @click.self="$emit('close')">
    <div class="modal-content" style="max-width: 800px;">
      <span class="close-modal" @click="$emit('close')">&times;</span>
      <div class="modal-header">
        <h2 class="modal-title">文档详情</h2>
      </div>
      <div class="modal-body">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else>
          <div class="document-info">
            <p><strong>文件名：</strong>{{ documentData.filename || source }}</p>
            <p><strong>总页数：</strong>{{ documentData.total_pages || 0 }}</p>
            <p><strong>当前页：</strong>{{ currentPage }} / {{ documentData.total_pages || 1 }}</p>
          </div>
          <div class="document-content" v-html="formattedContent"></div>
          <div v-if="documentData.total_pages > 1" class="pagination">
            <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
            <span>第 {{ currentPage }} 页</span>
            <button @click="nextPage" :disabled="currentPage >= documentData.total_pages">下一页</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ApiService } from '@/api'
import { formatDocumentContent } from '@/utils'

const props = defineProps({
  source: {
    type: String,
    required: true
  },
  kbId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close'])

const loading = ref(false)
const documentData = ref({})
const currentPage = ref(1)

const formattedContent = computed(() => {
  return formatDocumentContent(documentData.value.content || '')
})

const loadDocument = async (page = 1) => {
  loading.value = true
  try {
    const data = await ApiService.getDocumentContent(props.source, props.kbId, page, 5000)
    documentData.value = data
    currentPage.value = page
  } catch (error) {
    console.error('Failed to load document:', error)
    alert('加载文档失败')
  } finally {
    loading.value = false
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    loadDocument(currentPage.value - 1)
  }
}

const nextPage = () => {
  if (currentPage.value < documentData.value.total_pages) {
    loadDocument(currentPage.value + 1)
  }
}

onMounted(() => {
  loadDocument(1)
})
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-modal {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  line-height: 1;
}

.close-modal:hover {
  color: #333;
}

.modal-header {
  margin-bottom: 20px;
}

.modal-title {
  font-size: 22px;
  color: #333;
  margin: 0;
}

.document-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.document-info p {
  margin: 5px 0;
  font-size: 14px;
}

.document-content {
  line-height: 1.8;
  color: #333;
  max-height: 500px;
  overflow-y: auto;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.pagination button {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination button:hover:not(:disabled) {
  background: #764ba2;
}

.pagination button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
