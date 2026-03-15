/**
 * 工具函数库
 */
import { CHUNK_STRATEGY_LABELS, FILE_ICONS, TOAST_ICONS, DEFAULTS } from '@/api/config'

/**
 * 获取分块策略的中文标签
 */
export function getChunkStrategyLabel(strategy) {
  return CHUNK_STRATEGY_LABELS[strategy] || strategy || '智能分块'
}

/**
 * 显示Toast通知
 */
export function showToast(message, type = 'info') {
  const toast = document.createElement('div')
  toast.className = `toast ${type}`

  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${TOAST_ICONS[type]}</span>
      <span class="toast-message">${message}</span>
      <span class="toast-close" onclick="this.parentElement.parentElement.remove()">×</span>
    </div>
  `

  const container = document.getElementById('toastContainer')
  if (container) {
    container.appendChild(toast)
  } else {
    document.body.appendChild(toast)
  }

  setTimeout(() => {
    toast.remove()
  }, DEFAULTS.TOAST_DURATION)
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 KB'

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  } else {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }
}

/**
 * 格式化文档内容（Markdown 转 HTML）
 */
export function formatDocumentContent(content) {
  if (!content) return ''

  let formatted = content
    .replace(/^#{1,6}\s+(.+)$/gm, (match, p1) => {
      const level = match.trim().length - p1.length
      const size = 32 - (level * 4)
      return `<h${level + 1} style="margin: 1.5em 0 0.5em 0; font-size: ${size}px; color: #333; font-weight: bold;">${p1}</h${level + 1}>`
    })
    .replace(/\[表格\]\n((?:\|.*\n)+)/g, (match, tableContent) => {
      const rows = tableContent.trim().split('\n')
      let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 1em 0;">'

      rows.forEach(row => {
        if (row.trim()) {
          const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell)
          tableHTML += '<tr style="border: 1px solid #ddd;">'
          cells.forEach(cell => {
            tableHTML += `<td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${cell}</td>`
          })
          tableHTML += '</tr>'
        }
      })

      tableHTML += '</table>'
      return tableHTML
    })
    .replace(/---\s*第\s*(\d+)\s*页\s*---\s*/g, '<hr style="margin: 2em 0; border: 2px solid #667eea;"><div style="text-align: center; color: #667eea; font-weight: bold; margin: 1em 0;">第 $1 页</div>')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map(line => {
      if (line.trim()) {
        return `<p style="margin: 1em 0;">${line}</p>`
      } else {
        return '<br>'
      }
    })
    .join('')

  return formatted
}

/**
 * 防抖函数
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数
 */
export function throttle(func, limit) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 转义HTML特殊字符
 */
export function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

/**
 * 获取文件图标
 */
export function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  return FILE_ICONS[ext] || FILE_ICONS.default
}
