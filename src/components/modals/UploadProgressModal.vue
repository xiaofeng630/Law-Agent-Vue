<template>
  <div class="modal" @click.self="handleClose">
    <div class="modal-content" style="max-width: 700px;">
      <span class="close-modal" @click="handleClose">&times;</span>

      <div class="modal-header">
        <h2 class="modal-title">{{ uploadComplete ? '上传完成' : '正在上传文档' }}</h2>
      </div>

      <div class="modal-body">
        <!-- 总体进度信息 -->
        <div class="upload-progress-info">
          <div class="progress-stats">
            <span>{{ progressText }}</span>
            <span>{{ progressPercent }}</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar">
              <div class="progress-bar-fill" :style="{ width: progressPercent }"></div>
            </div>
          </div>

          <!-- 详细统计 -->
          <div class="upload-stats-detail">
            <div class="stat-item">
              <span class="stat-label">总文件数</span>
              <span class="stat-value">{{ files.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">已成功</span>
              <span class="stat-value success">{{ successCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">已失败</span>
              <span class="stat-value failed">{{ failedCount }}</span>
            </div>
            <div v-if="totalChunks > 0" class="stat-item">
              <span class="stat-label">总分块</span>
              <span class="stat-value">{{ totalChunks }}</span>
            </div>
            <div v-if="totalTime > 0" class="stat-item">
              <span class="stat-label">总耗时</span>
              <span class="stat-value">{{ totalTime.toFixed(1) }}s</span>
            </div>
          </div>
        </div>

        <!-- 当前处理文件详情 -->
        <div v-if="uploading && currentFile" class="current-file-info">
          <h4>当前处理文件</h4>
          <div class="file-detail-card">
            <div class="file-name-large">{{ currentFile.name }}</div>
            <div class="file-size">{{ formatFileSize(currentFile.size) }}</div>
            <div class="file-step-info">
              <span class="step-indicator" :class="{ active: currentStep }">
                {{ currentStep || '准备中...' }}
              </span>
              <div v-if="currentStepProgress > 0" class="step-progress-bar">
                <div class="step-progress-fill" :style="{ width: currentStepProgress + '%' }"></div>
              </div>
            </div>
            <div v-if="currentFileTime > 0" class="file-time">
              已用时: {{ currentFileTime.toFixed(1) }}s
            </div>
          </div>
        </div>

        <!-- 文件列表 -->
        <div class="upload-file-list">
          <div class="file-list-header">
            <span>文件名</span>
            <span>状态</span>
          </div>
          <div
            v-for="(file, index) in files"
            :key="index"
            class="upload-file-item"
            :class="getFileStatus(file)"
          >
            <span class="file-icon">{{ getFileIcon(file.name) }}</span>
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size-small">{{ formatFileSize(file.size) }}</span>
            <span class="file-status">{{ getFileStatusText(file) }}</span>
          </div>
        </div>

        <!-- 上传完成摘要 -->
        <div v-if="uploadComplete" class="upload-summary">
          <h3>✅ 上传完成</h3>
          <div class="summary-content">
            <div class="summary-item success">
              <span class="summary-label">成功</span>
              <span class="summary-value">{{ successCount }} 个</span>
            </div>
            <div v-if="failedCount > 0" class="summary-item failed">
              <span class="summary-label">失败</span>
              <span class="summary-value">{{ failedCount }} 个</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">总分块</span>
              <span class="summary-value">{{ totalChunks }} 个</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">总耗时</span>
              <span class="summary-value">{{ totalTime.toFixed(1) }} 秒</span>
            </div>
          </div>

          <!-- 失败文件详情 -->
          <div v-if="failedFiles.length > 0" class="failed-files-detail">
            <h4>失败文件列表</h4>
            <div v-for="file in failedFiles" :key="file.filename" class="failed-file-item">
              <span class="failed-filename">{{ file.filename }}</span>
              <span class="failed-error">{{ file.error }}</span>
            </div>
          </div>

          <button class="close-btn" @click="handleClose">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ApiService } from '@/api'
import { getFileIcon } from '@/utils'

const props = defineProps({
  files: {
    type: Array,
    required: true
  },
  kbId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close'])

// 状态变量
const uploading = ref(false)
const currentIndex = ref(0)
const successCount = ref(0)
const failedCount = ref(0)
const uploadComplete = ref(false)
const fileStatuses = ref({})

// 详细信息
const totalChunks = ref(0)
const startTime = ref(Date.now())
const currentFile = ref(null)
const currentFileProgress = ref('')
const currentFileTime = ref(0)
const totalTime = ref(0)
const currentStep = ref('')
const currentStepProgress = ref(0)
const failedFiles = ref([])

// 计算属性
const progressText = computed(() => {
  if (uploadComplete.value) return '✅ 上传完成'
  if (uploading.value && currentFile.value) {
    return `正在处理: ${currentFile.value.name}`
  }
  return '准备上传...'
})

const progressPercent = computed(() => {
  if (props.files.length === 0) return '0%'
  const completed = successCount.value + failedCount.value
  const total = props.files.length
  const percent = (completed / total) * 100
  return `${percent.toFixed(1)}%`
})

// 工具函数
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const getFileStatus = (file) => {
  return fileStatuses.value[file.name] || 'pending'
}

const getFileStatusText = (file) => {
  const status = fileStatuses.value[file.name]
  if (status === 'success') return '✓ 成功'
  if (status === 'failed') return '✕ 失败'
  if (status === 'uploading') return '⏳ 处理中...'
  return '⏸ 等待'
}

const getFileStatusIcon = (file) => {
  const status = fileStatuses.value[file.name]
  if (status === 'success') return '✅'
  if (status === 'failed') return '❌'
  if (status === 'uploading') return '⏳'
  return '⏸'
}

// 上传逻辑
const uploadFiles = async () => {
  if (uploading.value) return

  uploading.value = true
  startTime.value = Date.now()

  // 逐个处理文件
  for (let i = 0; i < props.files.length; i++) {
    currentIndex.value = i
    currentFile.value = props.files[i]
    const file = props.files[i]
    const fileStartTime = Date.now()

    // 标记为处理中
    fileStatuses.value[file.name] = 'uploading'
    currentStep.value = '初始化'
    currentStepProgress.value = 0
    currentFileTime.value = 0

    try {
      // 步骤1: 准备上传 (0-10%)
      currentStep.value = '上传文件'
      currentStepProgress.value = 5

      // 调用上传API（虽然后端是批量API，但我们每次只传一个文件）
      const uploadPromise = ApiService.uploadDocumentsBatch([file], props.kbId)

      // 步骤2-4: 模拟后端处理进度 (10-90%)
      let progressInterval = setInterval(() => {
        if (currentStepProgress.value < 90) {
          currentStepProgress.value += 5

          // 根据进度更新步骤描述
          if (currentStepProgress.value < 30) {
            currentStep.value = '保存文件'
          } else if (currentStepProgress.value < 60) {
            currentStep.value = '文本分块'
          } else if (currentStepProgress.value < 90) {
            currentStep.value = '向量化处理'
          }
        }
      }, 400)

      // 等待上传完成
      const result = await uploadPromise

      clearInterval(progressInterval)
      currentStepProgress.value = 100
      currentStep.value = '完成'

      // 处理结果
      const fileResult = result.result || result
      if (fileResult.successful_count > 0 || (fileResult.results && fileResult.results.length > 0)) {
        const detail = fileResult.results ? fileResult.results[0] : null
        const fileTime = (Date.now() - fileStartTime) / 1000

        fileStatuses.value[file.name] = 'success'
        successCount.value++
        totalChunks.value += detail?.chunks_count || 0
        currentFileTime.value = fileTime
        totalTime.value += fileTime
      } else if (fileResult.failed_files && fileResult.failed_files.length > 0) {
        const failedFile = fileResult.failed_files[0]
        fileStatuses.value[file.name] = 'failed'
        failedCount.value++
        failedFiles.value.push({
          filename: file.name,
          error: failedFile.error || '处理失败'
        })
      }

      // 短暂延迟让用户看到完成状态
      await new Promise(resolve => setTimeout(resolve, 500))

    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error)
      fileStatuses.value[file.name] = 'failed'
      failedCount.value++
      failedFiles.value.push({
        filename: file.name,
        error: error.message || '上传失败'
      })
    }
  }

  uploading.value = false
  uploadComplete.value = true
  currentFile.value = null
  totalTime.value = (Date.now() - startTime.value) / 1000
}

const handleClose = () => {
  if (!uploading.value) {
    emit('close', {
      successCount: successCount.value,
      failedCount: failedCount.value,
      totalChunks: totalChunks.value
    })
  }
}

// 开始上传
uploadFiles()
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
  padding: 0;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  position: relative;
}

.close-modal {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  transition: color 0.3s;
  z-index: 10;
}

.close-modal:hover {
  color: #333;
}

.modal-header {
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  color: #333;
  font-weight: 600;
}

.modal-body {
  padding: 20px 30px;
  max-height: 70vh;
  overflow-y: auto;
}

/* 进度信息 */
.upload-progress-info {
  margin-bottom: 20px;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.progress-bar-container {
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
}

.progress-bar {
  height: 12px;
  background: #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

/* 详细统计 */
.upload-stats-detail {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
  margin-top: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.stat-value.success {
  color: #28a745;
}

.stat-value.failed {
  color: #dc3545;
}

/* 当前文件信息 */
.current-file-info {
  margin-bottom: 20px;
  padding: 15px;
  background: #f0f4ff;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.current-file-info h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #667eea;
}

.file-detail-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-name-large {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.file-size {
  font-size: 13px;
  color: #666;
}

.file-step-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.step-indicator {
  padding: 5px 10px;
  background: white;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
  transition: all 0.3s;
}

.step-indicator.active {
  background: #667eea;
  color: white;
}

.step-progress-bar {
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}

.step-progress-fill {
  height: 100%;
  background: #667eea;
  transition: width 0.2s;
}

.file-time {
  font-size: 12px;
  color: #999;
}

/* 文件列表 */
.upload-file-list {
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.file-list-header {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-size: 12px;
  color: #999;
  font-weight: 600;
}

.upload-file-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s;
}

.upload-file-item:last-child {
  border-bottom: none;
}

.upload-file-item.success {
  background: #d4edda;
}

.upload-file-item.failed {
  background: #f8d7da;
}

.upload-file-item.uploading {
  background: #fff3cd;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.file-icon {
  margin-right: 10px;
  font-size: 18px;
}

.file-name {
  flex: 1;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size-small {
  margin: 0 15px;
  font-size: 12px;
  color: #999;
}

.file-status {
  font-size: 13px;
  font-weight: 500;
}

/* 上传摘要 */
.upload-summary {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.upload-summary h3 {
  margin: 0 0 15px 0;
  color: #28a745;
  font-size: 18px;
}

.summary-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  background: white;
  border-radius: 6px;
}

.summary-item.success {
  border-left: 3px solid #28a745;
}

.summary-item.failed {
  border-left: 3px solid #dc3545;
}

.summary-label {
  font-size: 12px;
  color: #999;
}

.summary-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

/* 失败文件详情 */
.failed-files-detail {
  margin-top: 15px;
  text-align: left;
}

.failed-files-detail h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #dc3545;
}

.failed-file-item {
  padding: 10px;
  background: #fff;
  border-radius: 6px;
  margin-bottom: 8px;
  border-left: 3px solid #dc3545;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.failed-filename {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.failed-error {
  font-size: 12px;
  color: #dc3545;
}

.close-btn {
  margin-top: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 35px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s;
}

.close-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.close-btn:active {
  transform: translateY(0);
}
</style>
