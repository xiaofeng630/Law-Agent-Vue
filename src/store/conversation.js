/**
 * 会话管理状态
 */
import { defineStore } from 'pinia'
import { ApiService } from '@/api'

export const useConversationStore = defineStore('conversation', {
  state: () => ({
    conversations: [],
    currentConversation: null,
    loading: false
  }),

  actions: {
    async fetchConversations() {
      this.loading = true
      try {
        this.conversations = await ApiService.getConversations()
      } catch (error) {
        console.error('Failed to fetch conversations:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createConversation(title = '新对话', selectedKbIds = []) {
      try {
        const conv = await ApiService.createConversation(title, selectedKbIds)
        this.conversations.unshift(conv)
        this.currentConversation = conv
        return conv
      } catch (error) {
        console.error('Failed to create conversation:', error)
        throw error
      }
    },

    async updateConversation(convId, data) {
      try {
        const conv = await ApiService.updateConversation(convId, data)
        const index = this.conversations.findIndex(c => c.id === convId)
        if (index > -1) {
          this.conversations[index] = conv
        }
        if (this.currentConversation?.id === convId) {
          this.currentConversation = conv
        }
        return conv
      } catch (error) {
        console.error('Failed to update conversation:', error)
        throw error
      }
    },

    async deleteConversation(convId) {
      try {
        await ApiService.deleteConversation(convId)
        this.conversations = this.conversations.filter(c => c.id !== convId)
        if (this.currentConversation?.id === convId) {
          this.currentConversation = null
        }
      } catch (error) {
        console.error('Failed to delete conversation:', error)
        throw error
      }
    },

    async loadConversation(convId) {
      try {
        this.currentConversation = await ApiService.getConversation(convId)
        return this.currentConversation
      } catch (error) {
        console.error('Failed to load conversation:', error)
        throw error
      }
    },

    async addMessage(convId, role, content) {
      try {
        const result = await ApiService.addMessage(convId, role, content)

        // 更新当前会话的消息列表
        if (this.currentConversation?.id === convId) {
          if (!this.currentConversation.messages) {
            this.currentConversation.messages = []
          }
          this.currentConversation.messages.push({
            role,
            content,
            timestamp: Date.now()
          })
        }

        return result
      } catch (error) {
        console.error('Failed to add message:', error)
        throw error
      }
    },

    setCurrentConversation(conv) {
      this.currentConversation = conv
    }
  }
})
