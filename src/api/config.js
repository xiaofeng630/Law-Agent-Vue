/**
 * API配置文件
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export const API_ENDPOINTS = {
  CHAT: `${API_BASE_URL}/chat`,
  DOCUMENTS: `${API_BASE_URL}/api/documents`,
  KNOWLEDGE_BASES: `${API_BASE_URL}/api/knowledge-bases`,
  CONVERSATIONS: `${API_BASE_URL}/api/conversations`
}

export const DEFAULTS = {
  TOP_K: 5,
  PAGE_SIZE: 5000,
  TOAST_DURATION: 3000
}

export const CHUNK_STRATEGY_LABELS = {
  'intelligent': '智能分块',
  'fixed_size': '固定大小',
  'recursive_character': '递归字符',
  'legal_article': '条例分块'
}

export const FILE_ICONS = {
  'pdf': '📄',
  'docx': '📝',
  'default': '📁'
}

export const TOAST_ICONS = {
  success: '✓',
  error: '✕',
  info: 'i'
}
