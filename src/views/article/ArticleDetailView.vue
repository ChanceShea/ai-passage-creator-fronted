<template>
  <div class="article-detail-view">
    <!-- Background Decorations -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="grid-overlay"></div>
    </div>

    <div class="page-header">
      <div class="header-container">
        <div class="header-actions">
          <a-button @click="goBack" class="back-btn">
            <template #icon><ArrowLeftOutlined /></template>
            返回列表
          </a-button>
          <div class="right-actions">
            <a-button
              v-if="article?.status === 'FAILED'"
              type="primary"
              danger
              @click="handleRetry"
              class="retry-btn"
            >
              <template #icon><RedoOutlined /></template>
              重新创建
            </a-button>
            <a-button type="primary" @click="exportMarkdown" class="export-btn">
              <template #icon><DownloadOutlined /></template>
              导出 Markdown
            </a-button>
          </div>
        </div>
      </div>
    </div>
    <div class="container">
      <a-spin :spinning="loading" tip="正在为您加载文章内容...">
        <a-card :bordered="false" v-if="article" class="article-card">
          <div class="title-section">
            <div class="meta-header">
              <span :class="['status-badge', `status-${article.status?.toLowerCase()}`]">
                {{ getStatusText(article.status ?? '') }}
              </span>
              <span class="time-text">
                {{ article.createTime ? formatDate(article.createTime) : '' }}
              </span>
            </div>
            <h1 class="main-title">{{ article.mainTitle || article.topic }}</h1>
            <p class="sub-title" v-if="article.subTitle">{{ article.subTitle }}</p>
          </div>

          <div v-if="article.outline && article.outline.length > 0" class="outline-section">
            <div class="section-header">
              <div class="section-line"></div>
              <h2 class="section-title">
                <OrderedListOutlined class="section-icon" />
                <span>文章大纲</span>
              </h2>
            </div>
            <div class="outline-list">
              <div v-for="item in article.outline" :key="item.section" class="outline-item">
                <div class="outline-title">
                  <span class="num">{{ item.section }}</span>
                  <span class="text">{{ item.title }}</span>
                </div>
                <ul class="outline-points">
                  <li v-for="(point, idx) in item.points" :key="idx">{{ point }}</li>
                </ul>
              </div>
            </div>
          </div>

          <div v-if="article.fullContent" class="content-section">
            <div class="section-header">
              <div class="section-line"></div>
              <h2 class="section-title">
                <FileTextOutlined class="section-icon" />
                <span>全文阅读</span>
              </h2>
            </div>
            <div v-html="markdown2HTML(article.fullContent || '')" class="markdown-content"></div>
          </div>
          <div v-else-if="article.content" class="content-section">
            <div class="section-header">
              <div class="section-line"></div>
              <h2 class="section-title">
                <FileTextOutlined class="section-icon" />
                <span>正文内容</span>
              </h2>
            </div>
            <div v-html="markdown2HTML(article.content || '')" class="markdown-content"></div>
          </div>
        </a-card>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getArticle } from '@/api/articleController'
import { message } from 'ant-design-vue'
import { onMounted, ref } from 'vue'
import {
  RedoOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  OrderedListOutlined,
  DownloadOutlined,
} from '@ant-design/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { marked } from 'marked'
import { Modal } from 'ant-design-vue'

const route = useRoute()
const article = ref<API.ArticleVO | null>(null)
const loading = ref(false)
const router = useRouter()

// 加载文章详情
const loadArticle = async () => {
  const taskId = route.params.taskId as string
  if (!taskId) {
    message.error('文章 ID 不存在')
    return
  }
  try {
    loading.value = true
    const res = await getArticle({ taskId })
    if (res.data.code === 200 && res.data.data) {
      article.value = res.data.data
    }
  } catch (err: any) {
    message.error(err.message || '加载文章详情失败')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/article/list')
}

// 导出Markdown
const exportMarkdown = () => {
  if (!article.value) {
    message.error('文章不存在')
    return
  }
  let markdown = `# ${article.value.mainTitle || article.value.topic}\n\n`
  if (article.value.subTitle) {
    markdown += `> ${article.value.subTitle}\n\n`
  }

  if (article.value.fullContent) {
    markdown += article.value.fullContent
  } else {
    if (article.value.outline && article.value.outline.length > 0) {
      markdown += `## 目录\n\n`
      article.value.outline.forEach((item) => {
        markdown += `${item.section}. ${item.title}\n`
      })
      markdown += `\n---\n\n`
    }
    markdown += article.value.content || ''
    if (article.value.images && article.value.images.length > 0) {
      markdown += `\n\n## 配图\n\n`
      article.value.images.forEach((item) => {
        markdown += `![${item.description}](${item.url})\n\n`
      })
    }
  }

  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${article.value.mainTitle || article.value.topic || 'article'}.md`
  a.click()
  URL.revokeObjectURL(url)
  message.success('导出成功')
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    PENDING: '等待中',
    PROCESSING: '生成中',
    COMPLETED: '已完成',
    FAILED: '失败',
  }
  return textMap[status] || status
}

// Markdown转换为HTML
const markdown2HTML = (markdown: string) => {
  return marked(markdown)
}

// 重试生成
const handleRetry = () => {
  if (!article.value) {
    message.error('文章不存在')
    return
  }
  Modal.confirm({
    title: '确认重试',
    content: '将使用相同的选题和配置重新创建文章，是否继续？',
    okText: '确认',
    okType: 'danger',
    onOk: () => {
      router.push({
        path: '/article/create',
        query: {
          topic: article.value?.topic,
        },
      })
    },
  })
}

onMounted(() => {
  loadArticle()
})
</script>

<style scoped lang="scss">
.article-detail-view {
  --primary-color: #1a1a1a;
  --accent-color: #6366f1;
  --text-main: #1f2937;
  --text-muted: #6b7280;
  --bg-glass: rgba(255, 255, 255, 0.7);
  --border-glass: rgba(255, 255, 255, 0.4);

  min-height: 100vh;
  background-color: #f8fafc;
  position: relative;
  overflow: hidden;
  padding-bottom: 80px;
  font-family: 'Montserrat', sans-serif;
}

/* Background Decorations */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;

  .circle {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.4;
  }

  .circle-1 {
    width: 500px;
    height: 500px;
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    top: -150px;
    right: -100px;
    animation: float 25s infinite alternate;
  }

  .circle-2 {
    width: 400px;
    height: 400px;
    background: linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%);
    bottom: -100px;
    left: -100px;
    animation: float 20s infinite alternate-reverse;
  }

  .grid-overlay {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
    background-size: 32px 32px;
    mask-image: linear-gradient(to bottom, transparent, black, transparent);
  }
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  padding: 20px 0;
  border-bottom: 1px solid var(--border-glass);
  margin-bottom: 40px;

  .header-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 40px;
  }

  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .back-btn {
      height: 44px;
      padding: 0 20px;
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.06);
      background: white;
      font-weight: 600;
      color: var(--text-main);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        transform: translateX(-4px);
        border-color: var(--accent-color);
        color: var(--accent-color);
      }
    }

    .right-actions {
      display: flex;
      gap: 12px;

      .export-btn,
      .retry-btn {
        height: 44px;
        padding: 0 24px;
        border-radius: 12px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
      }

      .export-btn {
        background: var(--primary-color);
        border: none;
        &:hover {
          background: #000;
        }
      }
    }
  }
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 40px;
  position: relative;
  z-index: 1;
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.article-card {
  background: var(--bg-glass) !important;
  backdrop-filter: blur(30px);
  border-radius: 40px !important;
  border: 1px solid var(--border-glass) !important;
  box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.08) !important;
  padding: 40px 20px;

  :deep(.ant-card-body) {
    padding: 0 40px;
  }
}

.title-section {
  text-align: center;
  margin-bottom: 60px;

  .meta-header {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
  }

  .status-badge {
    padding: 6px 14px;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;

    &.status-completed {
      background: #ecfdf5;
      color: #059669;
    }
    &.status-processing {
      background: #eef2ff;
      color: #4f46e5;
    }
    &.status-pending {
      background: #fffbeb;
      color: #d97706;
    }
    &.status-failed {
      background: #fef2f2;
      color: #dc2626;
    }
  }

  .time-text {
    font-size: 0.85rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  .main-title {
    font-family: 'Playfair Display', serif;
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1.2;
    color: var(--primary-color);
    margin-bottom: 20px;
    letter-spacing: -0.02em;
  }

  .sub-title {
    font-size: 1.25rem;
    color: var(--text-muted);
    font-weight: 400;
    max-width: 800px;
    margin: 0 auto;
    line-height: 1.6;
    font-style: italic;
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;

  .section-line {
    width: 60px;
    height: 1px;
    background: linear-gradient(to right, transparent, var(--accent-color));
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--accent-color);
    font-weight: 700;

    .section-icon {
      font-size: 1.2rem;
    }
  }
}

.outline-section {
  margin-bottom: 60px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);

  .outline-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 32px;
  }

  .outline-item {
    .outline-title {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin-bottom: 16px;

      .num {
        font-family: 'Playfair Display', serif;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--accent-color);
        opacity: 0.5;
      }

      .text {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--primary-color);
      }
    }

    .outline-points {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        position: relative;
        padding-left: 20px;
        margin-bottom: 8px;
        color: var(--text-muted);
        font-size: 0.9rem;
        line-height: 1.5;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 10px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--accent-color);
          opacity: 0.6;
        }
      }
    }
  }
}

.content-section {
  .markdown-content {
    font-size: 1.15rem;
    line-height: 1.8;
    color: var(--text-main);

    :deep(h1),
    :deep(h2),
    :deep(h3) {
      font-family: 'Playfair Display', serif;
      color: var(--primary-color);
      margin-top: 2em;
      margin-bottom: 1em;
      font-weight: 700;
    }

    :deep(h2) {
      font-size: 2rem;
    }
    :deep(h3) {
      font-size: 1.5rem;
    }

    :deep(p) {
      margin-bottom: 1.5em;
    }

    :deep(blockquote) {
      margin: 2em 0;
      padding: 20px 30px;
      background: rgba(99, 102, 241, 0.05);
      border-left: 4px solid var(--accent-color);
      border-radius: 0 16px 16px 0;
      font-style: italic;
      color: var(--text-muted);
    }

    :deep(img) {
      max-width: 100%;
      border-radius: 24px;
      margin: 2em 0;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }

    :deep(ul),
    :deep(ol) {
      margin-bottom: 1.5em;
      li {
        margin-bottom: 0.5em;
      }
    }
  }
}

@keyframes float {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(30px, 50px) scale(1.05);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .page-header {
    .header-container {
      padding: 0 20px;
    }
  }

  .container {
    padding: 0 20px;
  }

  .article-card {
    border-radius: 30px !important;
    :deep(.ant-card-body) {
      padding: 0 20px;
    }
  }

  .title-section {
    .main-title {
      font-size: 2.25rem;
    }
  }

  .outline-section {
    padding: 24px;
  }
}
</style>
