/**
 * 聊天状态管理
 */
import { defineStore } from 'pinia'
import { ApiService } from '@/api'
import { useKnowledgeBaseStore } from './index'

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [],
    selectedKbIds: [],
    conversationHistory: [],
    maxHistoryRounds: 5,
    isSending: false,
    currentSources: []
  }),

  getters: {
    historyForRequest: (state) => {
      const maxMessages = state.maxHistoryRounds * 2
      if (state.conversationHistory.length <= maxMessages) {
        return state.conversationHistory.slice()
      }
      return state.conversationHistory.slice(-maxMessages)
    }
  },

  actions: {
    async sendMessage(query, convId = null) {
      if (this.isSending || !query.trim()) return

      if (this.selectedKbIds.length === 0) {
        throw new Error('请先选择至少一个知识库进行查询')
      }

      this.isSending = true

      // 添加用户消息
      this.messages.push({
        role: 'user',
        content: query,
        timestamp: Date.now()
      })

      try {
        const data = await ApiService.chat(
          query,
          5, // topK
          this.selectedKbIds,
          this.historyForRequest,
          convId
        )

        // 添加助手回复
        this.messages.push({
          role: 'assistant',
          content: data.answer,
          timestamp: Date.now()
        })

        // 更新对话历史
        this.conversationHistory.push(
          { role: 'user', content: query },
          { role: 'assistant', content: data.answer }
        )

        // 保持历史不超过最大轮数
        const maxMessages = this.maxHistoryRounds * 2
        if (this.conversationHistory.length > maxMessages) {
          this.conversationHistory = this.conversationHistory.slice(-maxMessages)
        }

        // 保存来源
        this.currentSources = data.sources || []

        return data
      } catch (error) {
        console.error('Failed to send message:', error)
        this.messages.push({
          role: 'assistant',
          content: '抱歉，发生了错误，请稍后重试。',
          timestamp: Date.now()
        })
        throw error
      } finally {
        this.isSending = false
      }
    },

    toggleKbSelection(kbId) {
      const kbStore = useKnowledgeBaseStore()
      const kb = kbStore.knowledgeBases.find(k => k.id === kbId)
      if (!kb || !kb.enabled) return

      const index = this.selectedKbIds.indexOf(kbId)
      if (index > -1) {
        this.selectedKbIds.splice(index, 1)
      } else {
        this.selectedKbIds.push(kbId)
      }
    },

    clearMessages() {
      this.messages = []
      this.conversationHistory = []
      this.currentSources = []
    },

    loadConversation(conv) {
      this.clearMessages()

      // 恢复知识库选择
      if (conv.selected_kb_ids && conv.selected_kb_ids.length > 0) {
        this.selectedKbIds = conv.selected_kb_ids.slice()
      }

      // 恢复消息
      if (conv.messages && conv.messages.length > 0) {
        this.messages = conv.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp || Date.now()
        }))

        this.conversationHistory = conv.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      }
    }
  }
})
