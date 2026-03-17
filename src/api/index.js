/**
 * API服务封装
 */
import axios from 'axios'
import { API_ENDPOINTS } from './config'

// 创建axios实例
const apiClient = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const ApiService = {
  /**
   * 发送聊天请求
   */
  async chat(query, topK = 5, kbIds = [], history = [], convId = null) {
    try {
      const payload = {
        query,
        top_k: topK,
        kb_ids: kbIds,
        history,
        conv_id: convId
      }
      const response = await apiClient.post(API_ENDPOINTS.CHAT, payload)
      return response.data
    } catch (error) {
      console.error('Chat API Error:', error)
      throw error
    }
  },

  /**
   * 获取知识库列表
   */
  async getKnowledgeBases() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.KNOWLEDGE_BASES)
      return response.data.knowledge_bases || []
    } catch (error) {
      console.error('Get Knowledge Bases Error:', error)
      throw error
    }
  },

  /**
   * 创建知识库
   */
  async createKnowledgeBase(name, description = '', chunkStrategy = 'intelligent') {
    try {
      const response = await apiClient.post(API_ENDPOINTS.KNOWLEDGE_BASES, {
        name,
        description,
        chunk_strategy: chunkStrategy
      })
      return response.data
    } catch (error) {
      console.error('Create Knowledge Base Error:', error)
      throw error
    }
  },

  /**
   * 更新知识库
   */
  async updateKnowledgeBase(kbId, data) {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.KNOWLEDGE_BASES}/${kbId}`, data)
      return response.data
    } catch (error) {
      console.error('Update Knowledge Base Error:', error)
      throw error
    }
  },

  /**
   * 删除知识库
   */
  async deleteKnowledgeBase(kbId) {
    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.KNOWLEDGE_BASES}/${kbId}`)
      return response.data
    } catch (error) {
      console.error('Delete Knowledge Base Error:', error)
      throw error
    }
  },

  /**
   * 获取文档列表
   */
  async getDocuments(kbId) {
    try {
      const url = kbId
        ? `${API_ENDPOINTS.DOCUMENTS}?kb_id=${encodeURIComponent(kbId)}`
        : API_ENDPOINTS.DOCUMENTS
      const response = await apiClient.get(url)
      return response.data.documents || []
    } catch (error) {
      console.error('Get Documents Error:', error)
      throw error
    }
  },

  /**
   * 获取文档内容
   */
  async getDocumentContent(source, kbId, page = 1, pageSize = 5000) {
    try {
      let url = `${API_ENDPOINTS.DOCUMENTS}/content?source=${encodeURIComponent(source)}&page=${page}&page_size=${pageSize}`
      if (kbId) {
        url += `&kb_id=${encodeURIComponent(kbId)}`
      }
      const response = await apiClient.get(url)
      return response.data
    } catch (error) {
      console.error('Get Document Content Error:', error)
      throw error
    }
  },

  /**
   * 上传单个文档
   */
  async uploadDocument(file, kbId) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post(
        `${API_ENDPOINTS.DOCUMENTS}?kb_id=${encodeURIComponent(kbId)}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('Upload Document Error:', error)
      throw error
    }
  },

  /**
   * 批量上传文档
   */
  async uploadDocumentsBatch(files, kbId) {
    try {
      const formData = new FormData()
      for (let file of files) {
        formData.append('files', file)
      }

      const response = await apiClient.post(
        `${API_ENDPOINTS.DOCUMENTS}/batch?kb_id=${encodeURIComponent(kbId)}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('Batch Upload Error:', error)
      throw error
    }
  },

  /**
   * 删除文档
   */
  async deleteDocument(source, kbId) {
    try {
      let url = API_ENDPOINTS.DOCUMENTS
      if (kbId) {
        url += `?kb_id=${encodeURIComponent(kbId)}`
      }

      const response = await apiClient.delete(url, {
        data: { source }
      })
      return response.data
    } catch (error) {
      console.error('Delete Document Error:', error)
      throw error
    }
  },

  // ============ 对话会话API ============

  /**
   * 获取对话列表
   */
  async getConversations() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CONVERSATIONS)
      return response.data.conversations || []
    } catch (error) {
      console.error('Get Conversations Error:', error)
      throw error
    }
  },

  /**
   * 获取单个对话
   */
  async getConversation(convId) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.CONVERSATIONS}/${convId}`)
      return response.data
    } catch (error) {
      console.error('Get Conversation Error:', error)
      throw error
    }
  },

  /**
   * 创建对话
   */
  async createConversation(title = '新对话', selectedKbIds = []) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CONVERSATIONS, {
        title,
        selected_kb_ids: selectedKbIds
      })
      return response.data
    } catch (error) {
      console.error('Create Conversation Error:', error)
      throw error
    }
  },

  /**
   * 更新对话
   */
  async updateConversation(convId, data) {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.CONVERSATIONS}/${convId}`, data)
      return response.data
    } catch (error) {
      console.error('Update Conversation Error:', error)
      throw error
    }
  },

  /**
   * 向对话添加消息
   */
  async addMessage(convId, role, content) {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.CONVERSATIONS}/${convId}/messages`, {
        role,
        content
      })
      return response.data
    } catch (error) {
      console.error('Add Message Error:', error)
      throw error
    }
  },

  /**
   * 删除对话
   */
  async deleteConversation(convId) {
    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.CONVERSATIONS}/${convId}`)
      return response.data
    } catch (error) {
      console.error('Delete Conversation Error:', error)
      throw error
    }
  }
}
