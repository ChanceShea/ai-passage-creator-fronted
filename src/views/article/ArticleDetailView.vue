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

          <a-divider />
          <!-- 执行日志面板 -->
          <div
            v-if="executionStats && executionStats.logs && executionStats.logs.length > 0"
            class="execution-logs-section"
          >
            <div class="logs-header" @click="showExecutionLogs = !showExecutionLogs">
              <h2 class="section-title">
                <ClockCircleOutlined class="section-icon" />
                执行日志
                <a-tag
                  :color="getStatusColor(executionStats.overallStatus ?? '')"
                  class="status-tag-small"
                >
                  {{ executionStats.overallStatus ?? '' }}
                </a-tag>
              </h2>
              <ThunderboltOutlined :class="['toggle-icon', { expanded: showExecutionLogs }]" />
            </div>
            <Transition name="expand">
              <div v-show="showExecutionLogs" class="logs-content">
                <div class="staus-summary">
                  <div class="stat-item">
                    <span class="label">总耗时</span>
                    <span class="value">{{ executionStats.totalDurationMs || 0 }}ms</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">智能体数量</span>
                    <span class="value">{{ executionStats.agentCount || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">平均耗时</span>
                    <span class="value"
                      >{{
                        executionStats.agentCount && executionStats.totalDurationMs
                          ? Math.round(executionStats.totalDurationMs / executionStats.agentCount)
                          : 0
                      }}ms</span
                    >
                  </div>
                </div>
                <div class="agent-timeline">
                  <div
                    v-for="log in executionStats.logs"
                    :key="log.id"
                    :class="['timeline-item', log.status?.toLowerCase()]"
                  >
                    <div class="timeline-indicator">
                      <CheckCircleOutlined v-if="log.status === 'SUCCESS'" class="icon success" />
                      <CloseCircleOutlined
                        v-else-if="log.status === 'FAILED'"
                        class="icon failed"
                      />
                      <LoadingOutlined v-else class="icon running" />
                    </div>
                    <div class="timeline-content">
                      <div class="timeline-header">
                        <span class="agent-name">{{
                          getAgentDisplayName(log.agentName ?? '')
                        }}</span>
                        <span class="duration">{{ log.durationMs || 0 }}ms</span>
                      </div>
                      <div class="timeline-time">
                        {{ log.startTime ? formatDate(log.startTime) : '' }}
                      </div>
                      <div v-if="log.errorMessage" class="error-message">
                        <CloseCircleOutlined /> {{ log.errorMessage }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
          <a-divider
            v-if="executionStats && executionStats.logs && executionStats.logs.length > 0"
          />

          <!-- 大纲 -->
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
  ClockCircleOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { marked } from 'marked'
import { Modal } from 'ant-design-vue'
import { getExecutionLogs } from '@/api/agentLogController'

const route = useRoute()
const article = ref<API.ArticleVO | null>(null)
const loading = ref(false)
const router = useRouter()
const executionStats = ref<API.AgentExecutionStatsVO | null>(null)
const logLoading = ref(false)
const showExecutionLogs = ref(false)

const loadExecutionLogs = async (taskId: string) => {
  logLoading.value = true
  try {
    const res = await getExecutionLogs({ taskId: taskId })
    if (res.data.code === 200 && res.data.data) {
    }
    executionStats.value = res.data.data ?? null
  } catch (e: any) {
    console.error('加载执行日志失败：', e)
  } finally {
    logLoading.value = false
  }
}

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
    await loadExecutionLogs(taskId)
  } catch (err: any) {
    message.error(err.message || '加载文章详情失败')
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    PENDING: 'default',
    PROCESSING: 'processing',
    COMPLETED: 'success',
    FAILED: 'error',
  }
  return colorMap[status] || 'default'
}

const getAgentDisplayName = (agentName: string) => {
  const nameMap: Record<string, string> = {
    agent1_generate_titles: '生成标题',
    agent2_generate_outline: '生成大纲',
    agent3_generate_content: '生成正文',
    agent4_analyze_image_requirements: '分析配图需求',
    agent5_generate_images: '生成配图',
    merge_images_into_content: '图文合成',
    ai_modify_outline: 'AI修改大纲',
  }
  return nameMap[agentName] || agentName
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
  min-height: 100vh;
  background-color: var(--bg-page);
  position: relative;
  overflow: hidden;
  padding-bottom: 80px;
  font-family: 'Montserrat', sans-serif;
  transition: background-color 0.3s ease;
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
      border: 1px solid var(--border-glass);
      background: var(--bg-surface);
      font-weight: 600;
      color: var(--text-main);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        transform: translateX(-4px);
        border-color: var(--accent-color);
        color: var(--accent-color);
        background: var(--bg-surface-soft);
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
        box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.1);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(var(--primary-color-rgb), 0.15);
        }
      }

      .export-btn {
        background: var(--primary-color);
        color: var(--text-inverse);
        border: none;
        &:hover {
          opacity: 0.9;
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
  box-shadow: var(--card-shadow) !important;
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

/* Execution Logs Section */
.execution-logs-section {
  margin-bottom: 60px;

  .logs-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 24px 32px;
    background: var(--bg-surface);
    border: 1px solid var(--border-glass);
    border-radius: 20px;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
      border-color: rgba(99, 102, 241, 0.3);
      background: var(--bg-surface-soft);
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--primary-color);
      font-weight: 700;

      .section-icon {
        font-size: 1.2rem;
      }

      .status-tag-small {
        margin-left: 12px;
        font-weight: 600;
        font-size: 0.75rem;
        border-radius: 8px;
      }
    }

    .toggle-icon {
      font-size: 1.2rem;
      color: var(--text-muted);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);

      &.expanded {
        transform: rotate(180deg);
        color: var(--accent-color);
      }
    }
  }

  .logs-content {
    padding: 32px;
    background: rgba(255, 255, 255, 0.3);
    border: 1px solid var(--border-glass);
    border-top: none;
    border-radius: 0 0 20px 20px;
    animation: expandIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .staus-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 40px;
    padding-bottom: 32px;
    border-bottom: 1px solid var(--border-glass);

    .stat-item {
      text-align: center;
      padding: 20px;
      background: var(--bg-surface);
      border-radius: 16px;
      border: 1px solid var(--border-glass);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
      }

      .label {
        display: block;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--text-muted);
        font-weight: 600;
        margin-bottom: 8px;
      }

      .value {
        display: block;
        font-family: 'Playfair Display', serif;
        font-size: 1.8rem;
        font-weight: 700;
        color: var(--primary-color);
      }
    }
  }

  .agent-timeline {
    position: relative;
    padding-left: 40px;

    &::before {
      content: '';
      position: absolute;
      left: 15px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(to bottom, var(--accent-color), transparent);
      opacity: 0.3;
    }

    .timeline-item {
      position: relative;
      margin-bottom: 32px;
      padding: 24px;
      background: var(--bg-surface);
      border: 1px solid var(--border-glass);
      border-radius: 16px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

      &:last-child {
        margin-bottom: 0;
      }

      &:hover {
        border-color: rgba(99, 102, 241, 0.2);
        transform: translateX(8px);
      }

      &.success {
        border-left: 3px solid #22c55e;
      }

      &.failed {
        border-left: 3px solid #ef4444;
      }

      &.processing,
      &.pending {
        border-left: 3px solid #f59e0b;
      }

      .timeline-indicator {
        position: absolute;
        left: -52px;
        top: 28px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-glass);
        border: 2px solid var(--border-glass);
        border-radius: 50%;

        .icon {
          font-size: 1.1rem;

          &.success {
            color: #22c55e;
          }

          &.failed {
            color: #ef4444;
          }

          &.running {
            color: #f59e0b;
            animation: pulse 1.5s infinite;
          }
        }
      }

      .timeline-content {
        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .agent-name {
            font-family: 'Playfair Display', serif;
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--primary-color);
          }

          .duration {
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--accent-color);
            padding: 4px 12px;
            background: rgba(99, 102, 241, 0.1);
            border-radius: 10px;
          }
        }

        .timeline-time {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .error-message {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          color: #dc2626;
          font-size: 0.9rem;
          line-height: 1.5;
        }
      }
    }
  }
}

/* Expand Transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes expandIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
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
