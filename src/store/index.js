/**
 * 知识库状态管理
 */
import { defineStore } from 'pinia'
import { ApiService } from '@/api'

export const useKnowledgeBaseStore = defineStore('knowledgeBase', {
  state: () => ({
    knowledgeBases: [],
    currentKbId: null,
    currentDocuments: [],
    loading: false
  }),

  getters: {
    enabledKnowledgeBases: (state) => state.knowledgeBases.filter(kb => kb.enabled),
    currentKnowledgeBase: (state) => state.knowledgeBases.find(kb => kb.id === state.currentKbId)
  },

  actions: {
    async fetchKnowledgeBases() {
      this.loading = true
      try {
        this.knowledgeBases = await ApiService.getKnowledgeBases()
      } catch (error) {
        console.error('Failed to fetch knowledge bases:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createKnowledgeBase(data) {
      try {
        await ApiService.createKnowledgeBase(data.name, data.description, data.chunkStrategy)
        await this.fetchKnowledgeBases()
      } catch (error) {
        console.error('Failed to create knowledge base:', error)
        throw error
      }
    },

    async updateKnowledgeBase(kbId, data) {
      try {
        await ApiService.updateKnowledgeBase(kbId, data)
        await this.fetchKnowledgeBases()
      } catch (error) {
        console.error('Failed to update knowledge base:', error)
        throw error
      }
    },

    async deleteKnowledgeBase(kbId) {
      try {
        await ApiService.deleteKnowledgeBase(kbId)
        await this.fetchKnowledgeBases()
      } catch (error) {
        console.error('Failed to delete knowledge base:', error)
        throw error
      }
    },

    async fetchDocuments(kbId) {
      this.loading = true
      try {
        this.currentKbId = kbId
        this.currentDocuments = await ApiService.getDocuments(kbId)
      } catch (error) {
        console.error('Failed to fetch documents:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteDocument(source) {
      try {
        await ApiService.deleteDocument(source, this.currentKbId)
        await this.fetchDocuments(this.currentKbId)
      } catch (error) {
        console.error('Failed to delete document:', error)
        throw error
      }
    },

    clearCurrentKb() {
      this.currentKbId = null
      this.currentDocuments = []
    }
  }
})
