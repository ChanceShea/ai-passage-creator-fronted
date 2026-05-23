<template>
  <div class="article-create-view">
    <!-- Background Decorations -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="grid-overlay"></div>
    </div>

    <div class="create-layout">
      <!-- 智能体流程可视化 -->
      <aside class="sidebar-left">
        <div class="sidebar-header">
          <h3 class="sidebar-title">创作流程</h3>
          <p class="sidebar-subtitle">智能体协作可视化</p>
        </div>
        <div class="flow-timeline">
          <div
            v-for="(step, index) in agentSteps"
            :key="index"
            :class="[
              'flow-item',
              {
                active: currentStep === index,
                completed: currentStep > index,
                pending: currentStep < index,
              },
            ]"
          >
            <div class="flow-indicator">
              <LoadingOutlined v-if="currentStep === index && isCreating" class="spin-icon" />
              <CheckOutlined v-else-if="currentStep > index" class="check-icon" />
              <span v-else class="step-number">{{ index + 1 }}</span>
            </div>
            <div class="flow-content">
              <div class="flow-title">{{ step.title }}</div>
              <div class="flow-desc">{{ step.description }}</div>
              <div v-if="currentStep === index && isCreating" class="flow-status">
                <span class="status-dot"></span>
                创作中...
              </div>
            </div>
          </div>
        </div>
      </aside>
      <!-- 主内容区域 -->
      <main ref="mainContentRef" class="main-content">
        <div v-if="!isCreating && !isCompleted" class="input-state">
          <div class="input-card">
            <div class="input-header">
              <h1 class="input-title">创作文章</h1>
              <p class="input-subtitle">输入选题,AI帮你生成爆款文章</p>
            </div>
            <div class="input-area">
              <a-textarea
                v-model:value="topic"
                placeholder="请输入您想创作的文章选题,例如:2026年AI如何改变职场"
                :rows="6"
                :maxlength="500"
                show-count
                class="topic-textarea"
              />
              <a-button
                type="primary"
                size="large"
                :loading="isCreating"
                :disabled="!topic.trim() || !hasQuota"
                @click="startCreate"
                class="create-btn"
              >
                <template #icon>
                  <RocketOutlined />
                </template>
                开始创作
              </a-button>
              <div v-if="!hasQuota" class="quota-warning">
                <WarningOutlined />
                <span> 配额已用完,无法创建文章 </span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="isCreating && !isCompleted" class="creating-state">
          <div v-if="article.mainTitle" class="preview-header">
            <h1 class="article-title">{{ article.mainTitle }}</h1>
            <p class="article-subtitle">{{ article.subTitle }}</p>
            <div v-if="outlineRaw" class="outline-preview">
              <div class="section-label">
                <BulbOutlined />
                <span> 文章大纲 </span>
                <span v-if="isOutlineStreaming" class="typing-cursor"> | </span>
              </div>
              <div class="outline-list">
                <div v-for="item in parseOutline" :key="item.section" class="outline-item">
                  <ul class="outline-points">
                    <li v-for="(point, index) in item.points" :key="index">{{ point }}</li>
                  </ul>
                </div>
              </div>
            </div>
            <div v-if="article.content" class="content-preview">
              <div v-html="markdown2HTML(article.content)" class="markdown-body"></div>
              <span v-if="isStreaming" class="typing-cursor"> | </span>
            </div>
            <div v-if="currentStep === 4 && imageProgress > 0" class="image-progress-box">
              <div class="progress-header">
                <PictureOutlined />
                <span>正在生成配图</span>
              </div>
              <a-progress
                :percent="imageProgress"
                status="active"
                :stroke-color="{ from: '#22C55E', to: '#16A34A' }"
              />
              <p class="progress-hint">{{ imageCount }} / {{ totalImages }} 张图片已完成</p>
            </div>
            <div v-if="currentStep === 0 && !article.mainTitle" class="loading-placeholder">
              <a-spin size="large" />
              <p>AI正在构思标题...</p>
            </div>
          </div>
        </div>
        <div v-if="isCompleted" class="completed-state">
          <div class="success-header">
            <CheckCircleFilled class="success-icon" />
            <span>文章创作完成!</span>
          </div>
          <div class="preview-header">
            <h1 class="article-title">{{ article.mainTitle }}</h1>
            <p class="article-subtitle">{{ article.subTitle }}</p>
          </div>
          <div class="content-preview">
            <div
              v-html="markdown2HTML(article.fullContent || article.content || '')"
              class="markdown-body"
            ></div>
          </div>
        </div>
      </main>
      <!-- 辅助面板 -->
      <aside class="sidebar-right">
        <!-- 热门选题 -->
        <div v-if="!isCreating && !isCompleted" class="panel-section">
          <h4 class="panel-title">
            <BulbOutlined />
            热门选题
          </h4>

          <div class="hot-tags">
            <span
              v-for="example in exampleTopics"
              :key="example"
              class="hot-tag"
              @click="topic = example"
            >
              {{ example }}
            </span>
          </div>
        </div>

        <!-- 创作技巧 -->
        <div v-if="!isCreating && !isCompleted" class="panel-section">
          <h4 class="panel-title">
            <StarOutlined />
            爆款技巧
          </h4>
          <div class="tips-list">
            <div class="tip-item">
              <div class="tip-icon">1</div>
              <div class="tip-content">
                <div class="tip-title">抓住痛点</div>
                <div class="tip-desc">直击用户最关心的问题</div>
              </div>
            </div>

            <div class="tip-item">
              <div class="tip-icon">2</div>
              <div class="tip-content">
                <div class="tip-title">制造悬念</div>
                <div class="tip-desc">让读者产生好奇心</div>
              </div>
            </div>

            <div class="tip-item">
              <div class="tip-icon">3</div>
              <div class="tip-content">
                <div class="tip-title">数字吸引</div>
                <div class="tip-desc">使用具体数据增加说服力</div>
              </div>
            </div>
          </div>
        </div>
        <!-- 创作进行中的提示 -->
        <div v-if="isCreating && !isCompleted" class="panel-section">
          <h4 class="panel-title">
            <ClockCircleOutlined />
            创作进度
          </h4>

          <div class="progress-info">
            <div class="progress-step">
              <span class="step-label">当前步骤</span>
              <span class="step-value">{{ agentSteps[currentStep]?.title }}</span>
            </div>
            <div class="progress-step">
              <span class="step-label">已完成</span>
              <span class="step-value">{{ currentStep }}/{{ agentSteps.length }}</span>
            </div>
          </div>

          <div class="progress-tip">
            <InfoCircleOutlined />
            <span>AI 正在努力创作中，请耐心等待...</span>
          </div>
        </div>
        <!-- 操作按钮 -->
        <div v-if="isCompleted" class="panel-section">
          <h4 class="panel-title">
            <ThunderboltOutlined />
            快捷操作
          </h4>

          <div class="action-list">
            <a-button block @click="copyContent" class="action-btn">
              <CopyOutlined />
              复制全文
            </a-button>

            <a-button block @click="viewArticle" class="action-btn">
              <EyeOutlined />
              查看详情
            </a-button>

            <a-button block type="primary" @click="resetCreate" class="action-btn primary">
              <RedoOutlined />
              再创作一篇
            </a-button>
          </div>
        </div>

        <!-- 完成后的统计 -->
        <div v-if="isCompleted" class="panel-section stats-section">
          <h4 class="panel-title">
            <BarChartOutlined />
            文章统计
          </h4>

          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">
                {{ (article.fullContent || article.content || '').length }}
              </div>
              <div class="stat-label">字数</div>
            </div>

            <div class="stat-item">
              <div class="stat-value">{{ article.images?.length || 0 }}</div>
              <div class="stat-label">配图</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createArticle } from '@/api/articleController'
import { closeSSE, connectSSE, type SSEMessage } from '@/utils/sse'
import { message } from 'ant-design-vue'
import { marked } from 'marked'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  RocketOutlined,
  WarningOutlined,
  LoadingOutlined,
  CheckOutlined,
  BulbOutlined,
  PictureOutlined,
  CheckCircleFilled,
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

const agentSteps = [
  { title: '生成标题', description: 'AI分析选题,生成吸睛标题' },
  { title: '规划大纲', description: 'AI根据标题,生成文章大纲' },
  { title: '撰写正文', description: 'AI根据大纲,生成文章正文' },
  { title: '分析配图', description: 'AI根据文章内容,分析配图需求' },
  { title: '生成配图', description: 'AI根据需求,生成文章配图' },
  { title: '图文合成', description: 'AI根据文章内容和配图,生成最终文章' },
]

const exampleTopics = [
  '2026年AI如何改变职场',
  '程序员如何提升竞争力',
  '远程办公的利与弊',
  '如何培养深度思考',
  '新能源汽车趋势',
  '健康饮食指南',
]

// 页面状态
const topic = ref('')
const isCreating = ref(false)
const isCompleted = ref(false)
const isStreaming = ref(false)
const isOutlineStreaming = ref(false)
const currentStep = ref(0)
const taskId = ref('')
const errorVisible = ref(false)
const errorMessage = ref('')
const hasQuota = ref(true)

// 大纲数据
const outlineRaw = ref('')

// 配图进度
const imageCount = ref(0)
const totalImages = ref(5)
const imageProgress = ref(0)

// 文章数据
const article = ref<Partial<API.ArticleVO>>({
  mainTitle: '',
  subTitle: '',
  content: '',
  fullContent: '',
  images: [],
})

// SSE 事件源
let eventSource: EventSource | null = null

// 内容区域引用(用于自动滚动)
const mainContentRef = ref<HTMLElement | null>(null)

// 大纲项类型
interface OutlineItem {
  title: string
  points: string[]
  section: number
}

const parseOutline = computed<OutlineItem[]>(() => {
  if (!outlineRaw.value) {
    return []
  }

  const str = outlineRaw.value.trim()
  try {
    const parsed = JSON.parse(str)
    if (parsed && Array.isArray(parsed.sections)) {
      return parsed.sections
    }
    return []
  } catch (error) {
    try {
      // JSON不完整时,尝试解析已完成部分并返回
      const sectionsMatch = str.match(/"sections"\s*:\s*\[/)
      const sectionStart = str.indexOf('[', sectionsMatch?.index)
      if (sectionStart === -1) return []
      const afterStart = str.substring(sectionStart)
      const lastBrace = afterStart.lastIndexOf('}')

      if (lastBrace > 0) {
        const partialArray = afterStart.substring(0, lastBrace + 1) + ']'
        const parsed = JSON.parse(partialArray)
        if (parsed && Array.isArray(parsed)) {
          return parsed
        }
        return []
      }
    } catch (error) {
      return []
    }
  }
})

// markdown 转换为 HTML
const markdown2HTML = (markdown: string) => {
  return marked(markdown)
}

// 滚动到内容区域底部
const scroll2Bottom = () => {
  nextTick(() => {
    if (mainContentRef.value) {
      // 使用 scrollTo 并显式设置 behavior 为 'auto' 以避免 CSS smooth 滚动在流式更新时产生延迟
      mainContentRef.value.scrollTo({
        top: mainContentRef.value.scrollHeight,
        behavior: 'auto',
      })
    }
  })
}

// 开始创作
const startCreate = async () => {
  if (!topic.value.trim()) {
    message.warning('请输入选题')
    return
  }
  isCreating.value = true
  currentStep.value = 0
  try {
    const res = await createArticle({ topic: topic.value })
    if (res.data.code === 200) {
      taskId.value = res.data.data || ''
    }
    // 创建新连接前，确保关闭旧连接，防止连接泄漏
    if (eventSource) {
      closeSSE(eventSource)
    }
    eventSource = connectSSE(taskId.value, {
      onMessage: handleSSEMessage,
      onError: handleSSEError,
      onComplete: handleSSEComplete,
    })
  } catch (err: any) {
    message.error(err.message || '创建任务失败')
    isCreating.value = false
  }
}

// 处理SSE消息
const handleSSEMessage = (msg: SSEMessage) => {
  switch (msg.type) {
    case 'AGENT1_COMPLETE':
      currentStep.value = 1
      article.value.mainTitle = msg.title?.mainTitle
      article.value.subTitle = msg.title?.subTitle
      break
    case 'AGENT2_STREAMING':
      isOutlineStreaming.value = true
      outlineRaw.value += msg.data || ''
      scroll2Bottom()
      break
    case 'AGENT2_COMPLETE':
      isOutlineStreaming.value = false
      currentStep.value = 2
      break
    case 'AGENT3_STREAMING':
      isStreaming.value = true
      article.value.content += msg.data || ''
      scroll2Bottom()
      break
    case 'AGENT3_COMPLETE':
      isStreaming.value = false
      currentStep.value = 3
      break
    case 'AGENT4_COMPLETE':
      currentStep.value = 4
      totalImages.value = msg.imageRequirements?.length || 5
      break
    case 'IMAGE_COMPLETE':
      imageCount.value++
      imageProgress.value = Math.round((imageCount.value / totalImages.value) * 100)
      break
    case 'AGENT5_COMPLETE':
      currentStep.value = 5
      article.value.images = msg.images
      break
    case 'MERGE_COMPLETE':
      article.value.fullContent = msg.fullContent
      scroll2Bottom()
      break
    case 'ALL_COMPLETE':
      currentStep.value = 6
      isCompleted.value = true
      message.success('文章创作完成')
      break
    case 'ERROR':
      errorMessage.value = msg.message || '创作失败'
      errorVisible.value = true
      isCreating.value = false
      break
  }
}

// 处理SSE错误
const handleSSEError = (err: Event) => {
  console.error('SSE错误', err)
  message.error('连接失败,请重试')
  isCreating.value = false
}

// 处理SSE完成
const handleSSEComplete = () => {
  console.log('SSE连接关闭')
}

// 复制全文
const copyContent = async () => {
  const content = article.value.fullContent || article.value.content || ''
  try {
    await navigator.clipboard.writeText(content)
    message.success('复制成功')
  } catch (err: any) {
    message.error(err.message || '复制失败')
  }
}

const viewArticle = () => {
  router.push(`/article/${taskId.value}`)
}

const resetCreate = () => {
  // 重置时关闭现有连接
  if (eventSource) {
    closeSSE(eventSource)
    eventSource = null
  }
  topic.value = ''
  isCreating.value = false
  isCompleted.value = false
  isStreaming.value = false
  isOutlineStreaming.value = false
  currentStep.value = 0
  imageCount.value = 0
  imageProgress.value = 0
  outlineRaw.value = ''
  article.value = {
    mainTitle: '',
    subTitle: '',
    content: '',
    fullContent: '',
    images: [],
  }
}

onMounted(() => {
  if (route.query.topic) {
    topic.value = route.query.topic as string
  }
})

onBeforeUnmount(() => {
  closeSSE(eventSource)
})
</script>

<style scoped lang="scss">
.article-create-view {
  min-height: calc(100vh - 64px);
  background-color: var(--bg-page);
  position: relative;
  overflow: hidden;
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
    width: 400px;
    height: 400px;
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    top: -100px;
    right: -100px;
    animation: float 20s infinite alternate;
  }

  .circle-2 {
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%);
    bottom: -50px;
    left: -50px;
    animation: float 15s infinite alternate-reverse;
  }

  .grid-overlay {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
    background-size: 32px 32px;
    mask-image: linear-gradient(to bottom, transparent, black, transparent);
  }
}

.create-layout {
  display: flex;
  height: calc(100vh - 64px);
  position: relative;
  z-index: 1;
}

/* Sidebar Left */
.sidebar-left {
  width: 300px;
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-glass);
  display: flex;
  flex-direction: column;
  padding: 40px 24px;
  animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1);

  .sidebar-header {
    margin-bottom: 48px;

    .sidebar-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 8px;
    }

    .sidebar-subtitle {
      font-size: 0.8rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 600;
    }
  }
}

.flow-timeline {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.flow-item {
  display: flex;
  gap: 16px;
  opacity: 0.4;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  &.active {
    opacity: 1;
    transform: translateX(12px);

    .flow-indicator {
      background: var(--primary-color);
      color: var(--text-inverse);
      box-shadow: 0 10px 20px rgba(var(--primary-color-rgb), 0.1);
      border-color: transparent;
    }
  }

  &.completed {
    opacity: 0.8;
    .flow-indicator {
      background: #22c55e;
      color: white;
      border-color: transparent;
    }
  }

  .flow-indicator {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    background: var(--bg-page);
    border: 1px solid var(--border-glass);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-weight: 700;
    font-size: 0.9rem;
    transition: all 0.3s ease;
  }

  .flow-content {
    .flow-title {
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 4px;
      font-size: 0.95rem;
    }
    .flow-desc {
      font-size: 0.8rem;
      color: var(--text-muted);
      line-height: 1.5;
    }
    .flow-status {
      margin-top: 10px;
      font-size: 0.75rem;
      color: var(--accent-color);
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;

      .status-dot {
        width: 6px;
        height: 6px;
        background: currentColor;
        border-radius: 50%;
        animation: pulse 1.5s infinite;
      }
    }
  }
}

/* Main Content */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;

  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
}

/* Input State */
.input-state {
  width: 100%;
  max-width: 800px;
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);

  .input-card {
    background: var(--bg-glass);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-glass);
    border-radius: 40px;
    padding: 60px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.05);
  }

  .input-header {
    text-align: center;
    margin-bottom: 48px;

    .input-title {
      font-family: 'Playfair Display', serif;
      font-size: 3rem;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 16px;
      letter-spacing: -0.01em;
    }
    .input-subtitle {
      color: var(--text-muted);
      font-size: 1.1rem;
      font-weight: 400;
    }
  }

  .topic-textarea {
    background: var(--bg-glass-deep) !important;
    border: 1px solid var(--border-glass) !important;
    border-radius: 20px !important;
    padding: 24px !important;
    font-size: 1.15rem !important;
    transition: all 0.3s ease;
    margin-bottom: 32px;
    color: var(--text-main) !important;

    &:focus {
      background: var(--bg-glass) !important;
      border-color: var(--accent-color) !important;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
    }
  }

  .create-btn {
    height: 64px !important;
    border-radius: 18px !important;
    background: var(--primary-color) !important;
    border: none !important;
    font-weight: 700 !important;
    font-size: 1.15rem !important;
    width: 100%;
    letter-spacing: 0.02em;
    color: var(--text-inverse) !important;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px rgba(var(--primary-color-rgb), 0.2) !important;
      opacity: 0.9;
    }
  }
}

/* Creating/Completed State */
.creating-state,
.completed-state {
  width: 100%;
  max-width: 900px;
  animation: fadeIn 1s ease;
}

.preview-header {
  text-align: center;
  margin-bottom: 60px;

  .article-title {
    font-family: 'Playfair Display', serif;
    font-size: 3.25rem;
    font-weight: 800;
    color: var(--primary-color);
    margin-bottom: 20px;
    line-height: 1.15;
    letter-spacing: -0.02em;
  }

  .article-subtitle {
    font-size: 1.35rem;
    color: var(--text-muted);
    font-weight: 400;
    max-width: 700px;
    margin: 0 auto;
  }
}

.outline-preview {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  border-radius: 32px;
  padding: 40px;
  margin-bottom: 48px;
  border: 1px solid var(--border-glass);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);

  .section-label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 24px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.8rem;
  }
}

.outline-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.outline-points {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    position: relative;
    padding-left: 20px;
    margin-bottom: 8px;
    color: var(--text-main);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 10px;
      width: 6px;
      height: 6px;
      background: var(--accent-color);
      border-radius: 50%;
    }
  }
}

.content-preview {
  background: var(--bg-surface);
  border-radius: 40px;
  padding: 80px;
  box-shadow: var(--card-shadow);
  width: 100%;
  border: 1px solid var(--border-glass);
}

.markdown-body {
  line-height: 1.85;
  color: var(--text-main);
  font-size: 1.15rem;
  font-family: 'Montserrat', sans-serif;

  :deep(h1),
  :deep(h2),
  :deep(h3) {
    font-family: 'Playfair Display', serif;
    color: var(--primary-color);
    margin-top: 2.2em;
    margin-bottom: 1.2em;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  :deep(h1) {
    font-size: 2.5rem;
  }
  :deep(h2) {
    font-size: 2rem;
    border-bottom: 1px solid var(--border-glass);
    padding-bottom: 0.6em;
  }
  :deep(h3) {
    font-size: 1.6rem;
  }

  :deep(p) {
    margin-bottom: 1.8em;
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 24px;
    margin: 48px auto;
    display: block;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.12);
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
      transform: scale(1.02) translateY(-8px);
    }
  }

  :deep(blockquote) {
    margin: 2.5em 0;
    padding: 2em 2.5em;
    background: var(--bg-surface-soft);
    border-left: 5px solid var(--accent-color);
    border-radius: 0 24px 24px 0;
    font-style: italic;
    color: var(--text-muted);
    font-size: 1.2rem;
  }

  :deep(ul),
  :deep(ol) {
    margin-bottom: 1.8em;
    padding-left: 1.5em;
    li {
      margin-bottom: 0.6em;
    }
  }

  :deep(code) {
    background: var(--bg-surface-soft);
    padding: 0.2em 0.4em;
    border-radius: 6px;
    font-size: 0.9em;
    color: var(--accent-color);
  }
}

.typing-cursor {
  display: inline-block;
  width: 2px;
  height: 1.2em;
  background: var(--accent-color);
  margin-left: 4px;
  vertical-align: middle;
  animation: blink 1s infinite;
}

.image-progress-box {
  margin-top: 48px;
  background: var(--bg-surface);
  padding: 32px;
  border-radius: 24px;
  border: 1px solid var(--border-glass);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.02);

  .progress-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    font-weight: 700;
    color: var(--primary-color);
  }

  .progress-hint {
    margin-top: 16px;
    font-size: 0.9rem;
    color: var(--text-muted);
    text-align: right;
    font-weight: 500;
  }
}

.loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 80px 0;
  color: var(--text-muted);
  font-weight: 500;
}

.success-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 40px;
  font-size: 1.75rem;
  font-weight: 700;
  color: #22c55e;

  .success-icon {
    font-size: 2.25rem;
  }
}

/* Sidebar Right */
.sidebar-right {
  width: 340px;
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  border-left: 1px solid var(--border-glass);
  padding: 40px 28px;
  overflow-y: auto;
  animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1);

  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 2px;
  }

  .panel-section {
    margin-bottom: 40px;
    padding-bottom: 40px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);

    &:last-child {
      border-bottom: none;
    }

    .panel-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 24px;
    }
  }
}

.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  .hot-tag {
    padding: 10px 18px;
    background: var(--bg-surface);
    border: 1px solid var(--border-glass);
    border-radius: 12px;
    font-size: 0.85rem;
    color: var(--text-main);
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 500;

    &:hover {
      border-color: var(--accent-color);
      color: var(--accent-color);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
      background: var(--bg-surface-soft);
    }
  }
}

.tip-item {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;

  .tip-icon {
    width: 28px;
    height: 28px;
    background: var(--bg-surface-soft);
    color: var(--accent-color);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.8rem;
    flex-shrink: 0;
    border: 1px solid var(--border-glass);
  }

  .tip-title {
    font-weight: 700;
    color: var(--primary-color);
    font-size: 0.95rem;
    margin-bottom: 2px;
  }
  .tip-desc {
    font-size: 0.8rem;
    color: var(--text-muted);
    line-height: 1.4;
  }
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;

  .progress-step {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .step-label {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .step-value {
      font-size: 0.9rem;
      color: var(--primary-color);
      font-weight: 700;
    }
  }
}

.progress-tip {
  background: rgba(99, 102, 241, 0.05);
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.8rem;
  color: var(--accent-color);
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.4;
  font-weight: 500;
}

.action-btn {
  height: 52px !important;
  border-radius: 14px !important;
  font-weight: 700 !important;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s !important;

  &:not(.primary) {
    background: var(--bg-surface) !important;
    border: 1px solid var(--border-glass) !important;
    color: var(--text-main) !important;

    &:hover {
      border-color: var(--accent-color) !important;
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05) !important;
      background: var(--bg-surface-soft) !important;
    }
  }

  &.primary {
    background: var(--primary-color) !important;
    color: var(--text-inverse) !important;
    border: none !important;

    &:hover {
      opacity: 0.9;
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(var(--primary-color-rgb), 0.15) !important;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  .stat-item {
    background: var(--bg-surface);
    padding: 16px;
    border-radius: 16px;
    border: 1px solid var(--border-glass);
    text-align: center;

    .stat-value {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--primary-color);
      margin-bottom: 4px;
    }
    .stat-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
  }
}

.quota-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  color: #ef4444;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 14px;
  background: rgba(239, 68, 68, 0.05);
  border-radius: 14px;
}

/* Animations */
@keyframes float {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(20px, 40px) scale(1.1);
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

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(0.95);
    opacity: 1;
  }
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

@media (max-width: 1200px) {
  .sidebar-left {
    width: 260px;
  }
  .sidebar-right {
    width: 240px;
  }
}

@media (max-width: 1024px) {
  .sidebar-left,
  .sidebar-right {
    display: none;
  }
}
</style>
