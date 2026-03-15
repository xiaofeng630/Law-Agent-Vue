<template>
  <div class="document-card">
    <div class="document-name">
      <span style="margin-right: 8px;">{{ fileIcon }}</span>
      {{ document.name }}
    </div>
    <div class="document-info">
      文件类型: {{ document.type?.toUpperCase() }} | 大小: {{ document.size || '未知' }} | 段落数: {{ document.chunks || '未知' }}
    </div>
    <div class="document-actions">
      <button class="document-button" @click="$emit('view', document.source)">查看详情</button>
      <button class="document-button delete" @click="$emit('delete', document.source)">删除</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getFileIcon } from '@/utils'

const props = defineProps({
  document: {
    type: Object,
    required: true
  }
})

defineEmits(['view', 'delete'])

const fileIcon = computed(() => getFileIcon(props.document.name))
</script>

<style scoped>
.document-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  border: 2px solid #e0e0e0;
  transition: all 0.3s;
}

.document-card:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.document-name {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 10px;
  color: #333;
  display: flex;
  align-items: center;
}

.document-info {
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
}

.document-actions {
  display: flex;
  gap: 8px;
}

.document-button {
  flex: 1;
  background: #f0f0f0;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.document-button:hover {
  background: #667eea;
  color: white;
}

.document-button.delete {
  background: #f8d7da;
  color: #721c24;
}

.document-button.delete:hover {
  background: #dc3545;
  color: white;
}
</style>
