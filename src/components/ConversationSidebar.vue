<template>
  <div class="conversation-sidebar">
    <div class="sidebar-header">
      <h3>对话列表</h3>
      <button class="new-conv-btn" @click="createNewConversation">+ 新对话</button>
    </div>
    <div class="conversation-list">
      <div
        v-for="conv in conversations"
        :key="conv.id"
        class="conversation-item"
        :class="{ active: currentConversation?.id === conv.id }"
        @click="selectConversation(conv)"
      >
        <div class="conv-title">{{ conv.title }}</div>
        <div class="conv-meta">
          <span>{{ formatDate(conv.updated_at) }}</span>
          <button class="delete-btn" @click.stop="deleteConv(conv.id)">删除</button>
        </div>
      </div>
      <div v-if="conversations.length === 0" class="no-conversations">
        暂无对话，点击"新对话"开始
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useConversationStore } from '@/store/conversation'
import { useChatStore } from '@/store/chat'
import { showToast } from '@/utils'

const convStore = useConversationStore()
const chatStore = useChatStore()

const conversations = computed(() => convStore.conversations)
const currentConversation = computed(() => convStore.currentConversation)

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleDateString()
}

const createNewConversation = async () => {
  try {
    const conv = await convStore.createConversation('新对话', chatStore.selectedKbIds)
    chatStore.clearMessages()
    showToast('新对话已创建', 'success')
  } catch (error) {
    showToast('创建对话失败', 'error')
  }
}

const selectConversation = async (conv) => {
  try {
    const fullConv = await convStore.loadConversation(conv.id)
    chatStore.loadConversation(fullConv)
  } catch (error) {
    showToast('加载对话失败', 'error')
  }
}

const deleteConv = async (convId) => {
  if (!confirm('确定要删除这个对话吗？')) return

  try {
    await convStore.deleteConversation(convId)
    if (currentConversation.value?.id === convId) {
      chatStore.clearMessages()
    }
    showToast('对话已删除', 'success')
  } catch (error) {
    showToast('删除失败', 'error')
  }
}

onMounted(() => {
  convStore.fetchConversations()
})
</script>

<style scoped>
.conversation-sidebar {
  width: 280px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-right: 20px;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.new-conv-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.new-conv-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  background: white;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.conversation-item:hover {
  background: #e9ecef;
}

.conversation-item.active {
  background: #667eea;
  color: white;
}

.conv-title {
  font-weight: 500;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conv-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  opacity: 0.7;
}

.delete-btn {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.delete-btn:hover {
  background: rgba(255, 0, 0, 0.1);
  color: #ff4757;
}

.no-conversations {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 14px;
}
</style>
