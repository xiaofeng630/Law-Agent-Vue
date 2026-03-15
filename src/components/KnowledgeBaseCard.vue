<template>
  <div class="kb-card" :class="{ disabled: !kb.enabled }">
    <div class="kb-card-header">
      <div class="kb-name">{{ kb.name }}</div>
      <span class="kb-status-badge" :class="kb.enabled ? 'enabled' : 'disabled'">
        {{ kb.enabled ? '启用' : '禁用' }}
      </span>
    </div>
    <div class="kb-description">{{ kb.description || '暂无描述' }}</div>
    <div class="kb-strategy">
      <span class="strategy-label">分块策略：</span>
      <span class="strategy-value">{{ getChunkStrategyLabel(kb.chunk_strategy) }}</span>
    </div>
    <div class="kb-stats">
      <div class="kb-stat">
        <span>📄</span>
        <span>{{ kb.document_count || 0 }} 文档</span>
      </div>
      <div class="kb-stat">
        <span>📝</span>
        <span>{{ kb.chunk_count || 0 }} 段落</span>
      </div>
      <div class="kb-stat">
        <span>💾</span>
        <span>{{ kb.total_size_str || '0 KB' }}</span>
      </div>
    </div>
    <div class="kb-actions">
      <button class="kb-button" @click="$emit('view-documents', kb.id)">管理文档</button>
      <button class="kb-button" @click="$emit('edit', kb)">编辑</button>
      <button class="kb-button toggle" @click="$emit('toggle-status', kb.id, !kb.enabled)">
        {{ kb.enabled ? '禁用' : '启用' }}
      </button>
      <button class="kb-button delete" @click="$emit('delete', kb.id, kb.name)">删除</button>
    </div>
  </div>
</template>

<script setup>
import { getChunkStrategyLabel } from '@/utils'

defineProps({
  kb: {
    type: Object,
    required: true
  }
})

defineEmits(['view-documents', 'edit', 'toggle-status', 'delete'])
</script>

<style scoped>
.kb-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 2px solid #e0e0e0;
  transition: all 0.3s;
}

.kb-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.kb-card.disabled {
  opacity: 0.6;
}

.kb-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.kb-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.kb-status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.kb-status-badge.enabled {
  background: #d4edda;
  color: #155724;
}

.kb-status-badge.disabled {
  background: #f8d7da;
  color: #721c24;
}

.kb-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
  line-height: 1.6;
}

.kb-strategy {
  margin-bottom: 15px;
  font-size: 14px;
}

.strategy-label {
  color: #666;
}

.strategy-value {
  color: #667eea;
  font-weight: 500;
}

.kb-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  padding: 10px 0;
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
}

.kb-stat {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #666;
}

.kb-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.kb-button {
  background: #f0f0f0;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.kb-button:hover {
  background: #667eea;
  color: white;
}

.kb-button.delete {
  background: #f8d7da;
  color: #721c24;
}

.kb-button.delete:hover {
  background: #dc3545;
  color: white;
}
</style>
