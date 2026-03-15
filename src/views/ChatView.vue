<template>
  <div class="chat-layout">
    <!-- 对话侧边栏 -->
    <ConversationSidebar />

    <!-- 右侧主区域（聊天+参考来源） -->
    <div class="main-area">
      <!-- 聊天区域 -->
      <div class="chat-container">
        <div class="chat-header">
          <h3>{{ currentConversationTitle }}</h3>
        </div>

        <!-- 知识库选择器 -->
        <div class="kb-selector">
          <h3>选择知识库（可多选）:</h3>
          <div class="kb-chips">
            <div
              v-for="kb in enabledKnowledgeBases"
              :key="kb.id"
              class="kb-chip"
              :class="{ selected: selectedKbIds.includes(kb.id), disabled: !kb.enabled }"
              @click="toggleKb(kb.id)"
            >
              <span class="kb-status"></span>
              {{ kb.name }}
            </div>
            <div v-if="enabledKnowledgeBases.length === 0" class="kb-empty">
              暂无可用知识库
            </div>
          </div>
        </div>

        <!-- 聊天消息 -->
        <div class="chat-messages" ref="messagesContainer">
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="message"
            :class="message.role"
          >
            <div class="message-content">
              {{ message.content }}
              <div class="message-info">
                {{ message.role === 'user' ? '用户' : '助手' }}
              </div>
            </div>
          </div>

          <div v-if="messages.length === 0" class="message assistant">
            <div class="message-content">
              您好！我是法律知识库问答助手，请输入您想咨询的法律问题。
              <div class="message-info">系统</div>
            </div>
          </div>
        </div>

        <!-- 加载动画 -->
        <div v-if="isSending" class="loading show">
          <div class="spinner"></div>
          <p>正在思考中...</p>
        </div>

        <!-- 输入框 -->
        <div class="chat-input-container">
          <div class="input-group">
            <input
              type="text"
              v-model="queryInput"
              class="query-input"
              placeholder="请输入您的法律问题..."
              @keypress.enter="sendMessage"
              :disabled="isSending"
            />
            <button class="send-button" @click="sendMessage" :disabled="isSending">发送</button>
            <button @click="clearChat" class="clear-chat-btn">清除对话</button>
          </div>
        </div>
      </div>

      <!-- 参考来源（独立容器，在聊天容器下方） -->
      <div v-if="currentSources.length > 0" class="sources-panel">
        <h3 class="sources-title">📚 参考来源</h3>
        <div class="similarity-info">
          <strong>相似度说明：</strong>使用 text2vec-base-chinese 向量模型将文本编码为向量，通过 FAISS 内积计算余弦相似度。数值范围 0-1，值越大表示与问题语义越相关。注：由于向量检索的特性，即使不相关的文本也可能显示一定程度的相似度。
        </div>
        <div class="sources-list">
          <SourceItem
            v-for="(source, index) in currentSources"
            :key="index"
            :source="source"
            :index="index"
            :knowledgeBases="knowledgeBases"
            @view="viewSourceDetail"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useChatStore } from '@/store/chat'
import { useKnowledgeBaseStore } from '@/store'
import { useConversationStore } from '@/store/conversation'
import { showToast } from '@/utils'
import ConversationSidebar from '@/components/ConversationSidebar.vue'
import SourceItem from '@/components/SourceItem.vue'

const chatStore = useChatStore()
const kbStore = useKnowledgeBaseStore()
const convStore = useConversationStore()

const queryInput = ref('')
const messagesContainer = ref(null)

const messages = computed(() => chatStore.messages)
const selectedKbIds = computed(() => chatStore.selectedKbIds)
const isSending = computed(() => chatStore.isSending)
const currentSources = computed(() => chatStore.currentSources)
const knowledgeBases = computed(() => kbStore.knowledgeBases)
const enabledKnowledgeBases = computed(() => kbStore.enabledKnowledgeBases)

const currentConversationTitle = computed(() => {
  return convStore.currentConversation?.title || '请选择或创建对话'
})

// 监听消息变化，自动滚动到底部
watch(messages, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}, { deep: true })

const toggleKb = (kbId) => {
  chatStore.toggleKbSelection(kbId)
}

const sendMessage = async () => {
  if (!queryInput.value.trim() || isSending.value) return

  try {
    // 保存用户的问题（发送前）
    const userQuestion = queryInput.value

    await chatStore.sendMessage(queryInput.value)
    queryInput.value = ''

    // 如果有当前会话，保存消息到后端
    if (convStore.currentConversation) {
      // 保存最近的两条消息（用户问题 + 助手回答）
      const recentMessages = chatStore.messages.slice(-2)

      for (const msg of recentMessages) {
        await convStore.addMessage(
          convStore.currentConversation.id,
          msg.role,
          msg.content
        )
      }
    }
  } catch (error) {
    showToast(error.message || '发送失败', 'error')
  }
}

const clearChat = () => {
  if (chatStore.messages.length === 0) {
    showToast('当前没有对话记录', 'info')
    return
  }
  if (confirm('确定要清除所有对话记录吗？')) {
    chatStore.clearMessages()
    showToast('对话已清除', 'success')
  }
}

const viewSourceDetail = (source) => {
  // TODO: 实现查看来源详情的模态框
  console.log('View source:', source)
}

onMounted(() => {
  // 加载知识库列表
  if (kbStore.knowledgeBases.length === 0) {
    kbStore.fetchKnowledgeBases()
  }
})
</script>

<style scoped>
.chat-layout {
  display: flex;
  gap: 20px;
  height: calc(100vh - 200px);
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 0;
}

.sources-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-height: 350px;
  overflow-y: auto;
  flex-shrink: 0;
  margin-top: 0;
}

.sources-panel:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.sources-panel .sources-title {
  font-size: 18px;
  color: #667eea;
  margin-bottom: 15px;
  font-weight: 600;
}

.sources-panel .similarity-info {
  padding: 12px;
  background: #f0f4ff;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
  margin-bottom: 15px;
  line-height: 1.6;
}

.sources-panel .sources-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
