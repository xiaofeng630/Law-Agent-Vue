<template>
  <div id="app">
    <!-- 头部导航 -->
    <header>
      <h1>。。。</h1>
      <p class="subtitle">。。。</p>
      <div class="nav-tabs">
        <router-link to="/chat" class="tab-button" :class="{ active: $route.path === '/chat' }">
          问答系统
        </router-link>
        <router-link to="/knowledge" class="tab-button" :class="{ active: $route.path === '/knowledge' }">
          知识库管理
        </router-link>
      </div>
    </header>

    <!-- 主要内容 -->
    <div class="container">
      <router-view />
    </div>

    <!-- Toast 通知容器 -->
    <div id="toastContainer"></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useKnowledgeBaseStore } from '@/store'

const kbStore = useKnowledgeBaseStore()

onMounted(() => {
  // 初始化加载知识库列表
  kbStore.fetchKnowledgeBases()
})
</script>

<style>
@import './assets/css/main.css';
</style>
