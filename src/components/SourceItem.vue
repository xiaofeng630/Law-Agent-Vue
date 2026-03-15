<template>
  <div class="source-item" @click="$emit('view', source)">
    <div class="source-kb">📚 {{ kbName }}</div>
    <div class="source-name">{{ source.filename || source.source }}</div>
    <div class="source-similarity">
      <span class="similarity-label">相似度:</span>
      <span class="similarity-value">{{ similarityText }}</span>
      <div class="similarity-bar">
        <div class="similarity-bar-fill" :style="{ width: similarityPercent + '%' }"></div>
      </div>
    </div>
    <div class="source-text">{{ truncatedText }}...</div>
    <div class="source-view-detail">查看详情</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { escapeHtml } from '@/utils'

const props = defineProps({
  source: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  knowledgeBases: {
    type: Array,
    default: () => []
  }
})

defineEmits(['view'])

const kbName = computed(() => {
  const kb = props.knowledgeBases.find(kb => kb.id === props.source.kb_id)
  return kb ? kb.name : '未知知识库'
})

const similarityText = computed(() => {
  return props.source.similarity !== undefined
    ? (props.source.similarity * 100).toFixed(1) + '%'
    : 'N/A'
})

const similarityPercent = computed(() => {
  return props.source.similarity !== undefined
    ? props.source.similarity * 100
    : 0
})

const truncatedText = computed(() => {
  return escapeHtml(props.source.text.substring(0, 200))
})
</script>

<style scoped>
.source-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.source-item:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.source-kb {
  font-size: 13px;
  color: #667eea;
  margin-bottom: 5px;
}

.source-name {
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
}

.source-similarity {
  margin-bottom: 10px;
}

.similarity-label {
  font-size: 13px;
  color: #666;
  margin-right: 8px;
}

.similarity-value {
  font-weight: 600;
  color: #667eea;
  margin-right: 10px;
}

.similarity-bar {
  display: inline-block;
  width: 120px;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  vertical-align: middle;
}

.similarity-bar-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.source-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 10px;
}

.source-view-detail {
  color: #667eea;
  font-size: 13px;
  font-weight: 500;
}
</style>
