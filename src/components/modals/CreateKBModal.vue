<template>
  <div class="modal" @click.self="$emit('close')">
    <div class="modal-content">
      <span class="close-modal" @click="$emit('close')">&times;</span>
      <div class="modal-header">
        <h2 class="modal-title">创建新知识库</h2>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="kbName">知识库名称 *</label>
          <input
            type="text"
            id="kbName"
            v-model="form.name"
            placeholder="请输入知识库名称"
          />
        </div>
        <div class="form-group">
          <label for="kbDescription">描述</label>
          <textarea
            id="kbDescription"
            v-model="form.description"
            placeholder="请输入知识库描述（可选）"
          ></textarea>
        </div>
        <div class="form-group">
          <label for="chunkStrategy">分块策略</label>
          <select id="chunkStrategy" v-model="form.chunkStrategy">
            <option value="intelligent">智能分块（推荐）</option>
            <option value="fixed_size">固定大小分块</option>
            <option value="recursive_character">递归字符分块</option>
            <option value="legal_article">条例分块（法律专用）</option>
          </select>
          <small>选择文档分块的方式，智能分块会根据语义和结构进行分块</small>
        </div>
        <div class="form-actions">
          <button class="cancel-button" @click="$emit('close')">取消</button>
          <button class="upload-button" @click="handleCreate">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['close', 'create'])

const form = ref({
  name: '',
  description: '',
  chunkStrategy: 'intelligent'
})

const handleCreate = () => {
  if (!form.value.name.trim()) {
    alert('请输入知识库名称')
    return
  }

  emit('create', {
    name: form.value.name.trim(),
    description: form.value.description.trim(),
    chunkStrategy: form.value.chunkStrategy
  })
}
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
  max-width: 500px;
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

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.form-group small {
  display: block;
  margin-top: 5px;
  color: #999;
  font-size: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

.cancel-button {
  background: #f0f0f0;
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.cancel-button:hover {
  background: #e0e0e0;
}

.upload-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.upload-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>
