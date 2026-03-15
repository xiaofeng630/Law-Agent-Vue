<template>
  <div class="knowledge-container">
    <div class="knowledge-header">
      <h2>📚 知识库管理</h2>
      <button class="create-kb-button" @click="showCreateModal = true">
        <span>+</span> 创建知识库
      </button>
    </div>

    <!-- 知识库列表 -->
    <div v-if="!currentKbId" class="kb-grid">
      <KnowledgeBaseCard
        v-for="kb in knowledgeBases"
        :key="kb.id"
        :kb="kb"
        @view-documents="viewDocuments"
        @edit="editKnowledgeBase"
        @toggle-status="toggleKbStatus"
        @delete="deleteKnowledgeBase"
      />
      <div v-if="knowledgeBases.length === 0" class="no-knowledge-bases">
        暂无知识库，点击上方"创建知识库"按钮添加
      </div>
    </div>

    <!-- 文档管理区域 -->
    <div v-if="currentKbId" class="document-section">
      <h3>文档管理 - {{ currentKb?.name }}</h3>
      <div class="knowledge-header">
        <button class="upload-button" @click="triggerFileUpload">
          <span>+</span> 上传文档 (支持多选)
        </button>
        <input
          ref="fileInput"
          type="file"
          style="display: none"
          multiple
          accept=".docx,.pdf"
          @change="handleFileUpload"
        />
        <button class="cancel-button" @click="closeDocumentSection">返回知识库列表</button>
      </div>

      <div class="search-bar">
        <input
          type="text"
          v-model="searchTerm"
          placeholder="搜索文档..."
        />
        <span class="search-icon">🔍</span>
      </div>

      <div class="documents-grid">
        <DocumentCard
          v-for="doc in filteredDocuments"
          :key="doc.source"
          :document="doc"
          @view="viewDocument"
          @delete="deleteDocument"
        />
        <div v-if="filteredDocuments.length === 0" class="no-documents">
          暂无文档，点击上方"上传文档"按钮添加
        </div>
      </div>
    </div>

    <!-- 创建知识库模态框 -->
    <CreateKBModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @create="handleCreateKB"
    />

    <!-- 编辑知识库模态框 -->
    <EditKBModal
      v-if="showEditModal"
      :kb="editingKb"
      @close="showEditModal = false"
      @update="handleUpdateKB"
    />

    <!-- 文档详情模态框 -->
    <DocumentDetailModal
      v-if="showDocumentModal"
      :source="viewingDocument"
      :kb-id="currentKbId"
      @close="showDocumentModal = false"
    />

    <!-- 上传进度模态框 -->
    <UploadProgressModal
      v-if="showUploadProgress"
      :files="uploadingFiles"
      :kb-id="currentKbId"
      @close="handleUploadComplete"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useKnowledgeBaseStore } from '@/store'
import { showToast } from '@/utils'
import KnowledgeBaseCard from '@/components/KnowledgeBaseCard.vue'
import DocumentCard from '@/components/DocumentCard.vue'
import CreateKBModal from '@/components/modals/CreateKBModal.vue'
import EditKBModal from '@/components/modals/EditKBModal.vue'
import DocumentDetailModal from '@/components/modals/DocumentDetailModal.vue'
import UploadProgressModal from '@/components/modals/UploadProgressModal.vue'

const kbStore = useKnowledgeBaseStore()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDocumentModal = ref(false)
const showUploadProgress = ref(false)

const editingKb = ref(null)
const viewingDocument = ref(null)
const uploadingFiles = ref([])
const fileInput = ref(null)
const searchTerm = ref('')

const knowledgeBases = computed(() => kbStore.knowledgeBases)
const currentKbId = computed(() => kbStore.currentKbId)
const currentKb = computed(() => kbStore.currentKnowledgeBase)
const currentDocuments = computed(() => kbStore.currentDocuments)

const filteredDocuments = computed(() => {
  if (!searchTerm.value) return currentDocuments.value
  return currentDocuments.value.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

const viewDocuments = async (kbId) => {
  try {
    await kbStore.fetchDocuments(kbId)
  } catch (error) {
    showToast('加载文档失败', 'error')
  }
}

const closeDocumentSection = () => {
  kbStore.clearCurrentKb()
}

const editKnowledgeBase = (kb) => {
  editingKb.value = kb
  showEditModal.value = true
}

const toggleKbStatus = async (kbId, enabled) => {
  try {
    await kbStore.updateKnowledgeBase(kbId, { enabled })
    showToast(`知识库已${enabled ? '启用' : '禁用'}`, 'success')
  } catch (error) {
    showToast('操作失败', 'error')
  }
}

const deleteKnowledgeBase = async (kbId, kbName) => {
  if (!confirm(`确定要删除知识库 "${kbName}" 吗？删除后无法恢复！`)) return

  try {
    await kbStore.deleteKnowledgeBase(kbId)
    showToast('知识库删除成功', 'success')
  } catch (error) {
    showToast('删除失败', 'error')
  }
}

const handleCreateKB = async (data) => {
  try {
    await kbStore.createKnowledgeBase(data)
    showToast('知识库创建成功', 'success')
    showCreateModal.value = false
  } catch (error) {
    showToast('创建失败', 'error')
  }
}

const handleUpdateKB = async (data) => {
  try {
    await kbStore.updateKnowledgeBase(editingKb.value.id, data)
    showToast('知识库更新成功', 'success')
    showEditModal.value = false
    editingKb.value = null
  } catch (error) {
    showToast('更新失败', 'error')
  }
}

const triggerFileUpload = () => {
  fileInput.value.click()
}

const handleFileUpload = (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  uploadingFiles.value = Array.from(files)
  showUploadProgress.value = true
  event.target.value = '' // 重置input
}

const handleUploadComplete = () => {
  showUploadProgress.value = false
  uploadingFiles.value = []
  kbStore.fetchDocuments(currentKbId.value)
  kbStore.fetchKnowledgeBases()
}

const viewDocument = (source) => {
  viewingDocument.value = source
  showDocumentModal.value = true
}

const deleteDocument = async (source) => {
  const filename = source.split('/').pop() || source.split('\\').pop()
  if (!confirm(`确定要删除文档 "${filename}" 吗？`)) return

  try {
    await kbStore.deleteDocument(source)
    showToast('文档删除成功', 'success')
    kbStore.fetchKnowledgeBases()
  } catch (error) {
    showToast('删除失败', 'error')
  }
}
</script>

<style scoped>
.knowledge-container {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  min-height: calc(100vh - 250px);
}

.knowledge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.knowledge-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.create-kb-button,
.upload-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
}

.create-kb-button:hover,
.upload-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.cancel-button {
  background: #f0f0f0;
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.cancel-button:hover {
  background: #e0e0e0;
}

.kb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.no-knowledge-bases,
.no-documents {
  text-align: center;
  color: #999;
  padding: 40px;
  font-size: 16px;
  grid-column: 1 / -1;
}

.document-section h3 {
  margin-bottom: 20px;
  color: #333;
}

.search-bar {
  position: relative;
  margin-bottom: 20px;
}

.search-bar input {
  width: 100%;
  padding: 12px 40px 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.search-bar input:focus {
  outline: none;
  border-color: #667eea;
}

.search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}
</style>
