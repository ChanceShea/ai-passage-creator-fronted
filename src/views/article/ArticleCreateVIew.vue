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
        <!-- 阶段切换，带过渡动画 -->
        <Transition name="fade-slide" mode="out-in">
          <div v-if="currentPhase === 'INPUT'" key="input" class="input-state">
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
                <!-- 文章风格选择 -->
                <div class="style-section">
                  <div class="section-header">
                    <span class="section-title">文章风格</span>
                    <span class="section-tip">(不选择使用默认风格)</span>
                  </div>
                  <a-radio-group v-model:value="selectedStyle" class="style-group">
                    <a-radio value="">默认</a-radio>
                    <a-radio value="tech">科技风格</a-radio>
                    <a-radio value="emotional">情感风格</a-radio>
                    <a-radio value="educational">教育风格</a-radio>
                    <a-radio value="humorous">幽默风格</a-radio>
                  </a-radio-group>
                </div>
                <!-- 配图方式选择 -->
                <div class="image-methods-section">
                  <div class="section-header">
                    <span class="section-title">配图方式</span>
                    <span class="section-tip">(不选择使用默认配图方式)</span>
                  </div>
                  <a-checkbox-group v-model:value="selectedImageMethods" class="methods-group">
                    <a-checkbox value="PEXELS">Pexels</a-checkbox>
                    <a-tooltip :title="isVip ? '' : '仅限VIP用户使用'">
                      <a-checkbox value="NANO_BANANA" :disabled="!isVip">
                        Nano Banana
                        <CrownOutlined v-if="!isVip" class="vip-icon" />
                      </a-checkbox>
                    </a-tooltip>
                    <a-checkbox value="MERMAID">Mermaid</a-checkbox>
                    <a-checkbox value="ICONIFY">Iconify</a-checkbox>
                    <a-checkbox value="EMOJI_PACK">表情包</a-checkbox>
                    <a-tooltip :title="isVip ? '' : '仅限VIP用户使用'">
                      <a-checkbox value="SVG_DIAGRAM" :disabled="!isVip">
                        SVG
                        <CrownOutlined v-if="!isVip" class="vip-icon" />
                      </a-checkbox>
                    </a-tooltip>
                  </a-checkbox-group>
                </div>
                <div v-if="!isVip" class="vip-notice">
                  <CrownOutlined />
                  <span>AI生图和SVG图表为VIP专属功能，</span>
                  <RouterLink to="/vip" class="upgrade-link">立即升级</RouterLink>
                </div>
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
          <div
            v-else-if="currentPhase === 'TITLE_GENERATING'"
            key="title-generating"
            class="loading-stage"
          >
            <a-spin size="large" />
            <h3>AI正在生成标题方案</h3>
            <p>请稍等片刻，即将为您呈现多个精彩标题</p>
          </div>
          <TitleSelectingStage
            v-else-if="currentPhase === 'TITLE_SELECTING'"
            key="title-selecting"
            :title-options="titleOptions"
            :loading="confirmLoading"
            @confirm="handleConfirmTitle"
          />
          <!-- 大纲生成中 -->
          <div
            v-else-if="currentPhase === 'OUTLINE_GENERATING'"
            key="outline-generating"
            class="outline-generating-state"
          >
            <div v-if="article.mainTitle" class="preview-header">
              <h1 class="article-title">{{ article.mainTitle }}</h1>
              <p class="article-subtitle">{{ article.subTitle }}</p>
            </div>
            <div class="outline-preview">
              <div class="section-label">
                <BulbOutlined />
                <span>AI正在规划文章大纲</span>
                <span class="typing-cursor">|</span>
              </div>
              <div v-if="parseOutline && parseOutline.length > 0" class="outline-list">
                <div
                  v-for="(item, index) in parseOutline"
                  :key="item?.section || index"
                  class="outline-item fade-in"
                >
                  <div class="outline-title">{{ item?.section }}. {{ item?.title }}</div>
                  <ul class="outline-points">
                    <li v-for="(point, pointIndex) in item?.points || []" :key="pointIndex">
                      {{ point }}
                    </li>
                  </ul>
                </div>
              </div>
              <div v-else class="outline-loading">
                <a-spin />
                <span>正在构建文章结构...</span>
              </div>
            </div>
          </div>
          <OutlinedEditingStage
            v-else-if="currentPhase === 'OUTLINE_EDITING'"
            key="outline-editing"
            :outline="outline"
            :task-id="taskId"
            :loading="confirmLoading"
            @confirm="handleConfirmOutline"
          />
          <!-- 正文生成 -->
          <div
            v-else-if="currentPhase === 'CONTENT_GENERATING'"
            key="content-generating"
            class="creating-state"
          >
            <div v-if="article.mainTitle" class="preview-header">
              <h1 class="article-title">{{ article.mainTitle }}</h1>
              <p class="article-subtitle">{{ article.subTitle }}</p>
            </div>
            <!-- 文章大纲预览(流式输出) -->
            <div v-if="outlineRaw" class="outline-preview">
              <div class="section-label">
                <BulbOutlined />
                <span> 文章大纲 </span>
                <span v-if="isOutlineStreaming" class="typing-cursor"> | </span>
              </div>
              <div class="outline-list">
                <div
                  v-for="(item, index) in parseOutline"
                  :key="item?.section || index"
                  class="outline-item"
                >
                  <div class="outline-title">{{ item?.section }}. {{ item?.title }}</div>
                  <ul class="outline-points">
                    <li v-for="(point, idx) in item?.points" :key="idx">
                      {{ point }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <!-- 文章正文预览(流式输出) -->
            <div v-if="article.content" class="content-preview">
              <div v-html="markdown2HTML(article.content)" class="markdown-body"></div>
              <span v-if="isStreaming" class="typing-cursor"> | </span>
            </div>
            <!-- 配图进度 -->
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
            <!-- 加载占位 -->
            <div v-if="currentStep === 0 && !article.mainTitle" class="loading-placeholder">
              <a-spin size="large" />
              <p>AI正在构思标题...</p>
            </div>
          </div>
          <div v-else-if="currentPhase === 'COMPLETED'" key="completed" class="completed-state">
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
        </Transition>
      </main>
      <!-- 辅助面板 -->
      <aside class="sidebar-right">
        <div v-if="currentPhase === 'INPUT'" class="panel-section quota-section">
          <h4 class="panel-title">
            <CrownOutlined />
            创作配额
          </h4>
          <div v-if="isAdmin" class="quota-admin">
            <span class="quota-badge admin">管理员</span>
            <span class="quota-text">无限次</span>
          </div>
          <div v-else-if="isVip" class="quota-admin">
            <span class="quota-badge vip">VIP会员</span>
            <span class="quota-text">无限次</span>
          </div>
          <div v-else class="quota-info">
            <div class="quota-display">
              <span class="quota-number" :class="{ low: quota <= 1, empty: quota === 0 }">{{
                quota
              }}</span>
              <span class="quota-unit">次</span>
            </div>
            <div class="quota-label">剩余可用</div>
            <a-progress
              :percent="(quota / 5) * 100"
              :show-info="false"
              :stroke-color="quota <= 1 ? '#FF4D4F' : '#22C55E'"
              size="small"
              class="quota-progress"
            />
          </div>
        </div>
        <!-- 热门选题 -->
        <div v-if="currentPhase === 'INPUT'" class="panel-section">
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
        <div v-if="currentPhase === 'INPUT'" class="panel-section">
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
        <div
          v-if="
            isCreating || currentPhase === 'TITLE_SELECTING' || currentPhase === 'OUTLINE_EDITING'
          "
          class="panel-section"
        >
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

          <div v-if="isCreating" class="progress-tip">
            <InfoCircleOutlined />
            <span>AI 正在努力创作中，请耐心等待...</span>
          </div>
          <div v-else class="progress-tip waiting">
            <InfoCircleOutlined />
            <span>等待您的确认</span>
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
import { confirmTitle, confirmOutline, createArticle } from '@/api/articleController'
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
  BarChartOutlined,
  RedoOutlined,
  EyeOutlined,
  CopyOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
  StarOutlined,
  ClockCircleOutlined,
  CrownOutlined,
} from '@ant-design/icons-vue'
import TitleSelectingStage from './components/TitleSelectingStage.vue'
import OutlinedEditingStage from './components/OutlinedEditingStage.vue'
import { useLoginUserStore } from '@/stores/loginUser.ts'
import { USER_ROLE_VIP } from '@/constants/user.ts'
import {
  isAdmin as checkIsAdmin,
  isVip as checkIsVip,
  hasQuota as checkHasQuota,
} from '@/utils/permission.ts'
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
const selectedStyle = ref('')
const loginUserStore = useLoginUserStore()
// 配额相关计算
const isVip = computed(() => checkIsVip(loginUserStore.loginUser))
const isAdmin = computed(() => checkIsAdmin(loginUserStore.loginUser))
const quota = computed(() => loginUserStore.loginUser.quota ?? 0)
const hasQuota = computed(() => checkHasQuota(loginUserStore.loginUser))

const selectedImageMethods = ref<string[]>([])
// 当前阶段
const currentPhase = ref<string>('INPUT')
// 标题选项
const titleOptions = ref<Array<{ mainTitle: string; subTitle: string }>>([])
// 大纲
const outline = ref<Array<{ section: number; title: string; points: string[] }>>([])
// 确认操作
const confirmLoading = ref(false)

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
      return []
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
    const res = await createArticle({
      topic: topic.value,
      style: selectedStyle.value || undefined,
      enableImageMethods:
        selectedImageMethods.value && selectedImageMethods.value.length > 0
          ? selectedImageMethods.value
          : undefined,
    })
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
      currentPhase.value = 'TITLE_GENERATING'
      break
    case 'TITLE_GENERATED':
      currentPhase.value = 'TITLE_SELECTING'
      titleOptions.value = msg.titleOptions || []
      isCreating.value = false
      break
    case 'AGENT2_STREAMING':
      currentPhase.value = 'OUTLINE_GENERATING'
      isOutlineStreaming.value = true
      outlineRaw.value += msg.data || ''
      scroll2Bottom()
      break
    case 'OUTLINE_GENERATED':
      currentPhase.value = 'OUTLINE_EDITING'

      // 如果 msg.outline 存在，尝试解析
      if (msg.outline) {
        let outlineData = msg.outline
        // 如果是字符串，先解析 JSON
        if (typeof outlineData === 'string') {
          try {
            outlineData = JSON.parse(outlineData)
          } catch (e) {
            console.error('解析 msg.outline 失败:', e)
          }
        }
        // 检查是否有 sections 字段
        if (outlineData.sections && Array.isArray(outlineData.sections)) {
          outline.value = outlineData.sections
        } else if (Array.isArray(outlineData)) {
          outline.value = outlineData
        }
      }
      // 如果 msg.outline 没有，尝试从 outlineRaw 中解析
      else if (outlineRaw.value) {
        try {
          const parsed = JSON.parse(outlineRaw.value)
          if (parsed && parsed.sections && Array.isArray(parsed.sections)) {
            outline.value = parsed.sections
            console.log('从 outlineRaw 解析出的 outline:', outline.value)
          }
        } catch (e) {
          console.error('解析 outlineRaw 失败:', e)
        }
      }

      isCreating.value = false
      isOutlineStreaming.value = false
      break
    case 'AGENT2_COMPLETE':
      // isOutlineStreaming.value = false
      // currentStep.value = 2
      break
    case 'AGENT3_STREAMING':
      console.log('msg.content:', msg.content)
      console.log('msg.data:', msg.data)
      currentPhase.value = 'CONTENT_GENERATING'
      isStreaming.value = true
      currentStep.value = 2
      // 同时检查 content 和 data 字段
      article.value.content += msg.content || msg.data || ''
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
      currentPhase.value = 'COMPLETED'
      currentStep.value = 6
      isCompleted.value = true
      message.success('文章创作完成')
      break
    case 'ERROR':
      console.log('=== ERROR 消息 ===')
      console.log('msg:', msg)
      console.log('当前 outlineRaw:', outlineRaw.value)
      console.log('outlineRaw 长度:', outlineRaw.value?.length)
      errorMessage.value = msg.message || '创作失败'
      errorVisible.value = true
      isCreating.value = false
      currentPhase.value = 'INPUT'
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

// 重新创作
const resetCreate = () => {
  currentPhase.value = 'INPUT'
  topic.value = ''
  selectedStyle.value = ''
  titleOptions.value = []
  outline.value = []
  isCreating.value = false
  isCompleted.value = false
  isStreaming.value = false
  currentStep.value = 0
  imageCount.value = 0
  imageProgress.value = 0
  outlineRaw.value = ''
  confirmLoading.value = false
  article.value = {
    mainTitle: '',
    subTitle: '',
    content: '',
    fullContent: '',
  }
  closeSSE(eventSource)
}

onMounted(() => {
  if (route.query.topic) {
    topic.value = route.query.topic as string
  }
})

onBeforeUnmount(() => {
  closeSSE(eventSource)
})

const handleConfirmTitle = async (data: {
  mainTitle: string
  subTitle: string
  userDescription: string
}) => {
  confirmLoading.value = true
  try {
    await confirmTitle({
      taskId: taskId.value,
      selectedMainTitle: data.mainTitle,
      selectedSubTitle: data.subTitle,
      userDescription: data.userDescription,
    })
    article.value.mainTitle = data.mainTitle
    article.value.subTitle = data.subTitle
    message.success('标题已确认，正在生成大纲...')
  } catch (error: any) {
    message.error(error.message || '确认标题失败')
  } finally {
    confirmLoading.value = false
  }
}

const handleConfirmOutline = async (
  outlineData: Array<{ section: number; title: string; points: Array<string> }>,
) => {
  confirmLoading.value = true

  try {
    const requestData = {
      taskId: taskId.value,
      outlines: outlineData,
    }
    await confirmOutline(requestData)
    outlineRaw.value = JSON.stringify({ sections: outlineData })
    message.success('大纲已确认，正在生成内容...')
  } catch (error: any) {
    console.error('确认大纲失败:', error)
    message.error(error.message || '确认大纲失败')
  } finally {
    confirmLoading.value = false
  }
}
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
  padding: 32px 20px;
  animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1);

  .sidebar-header {
    margin-bottom: 32px;

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
  gap: 20px;
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
  padding: 40px 32px;
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
    padding: 40px 48px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.05);
  }

  .input-header {
    text-align: center;
    margin-bottom: 32px;

    .input-title {
      font-family: 'Playfair Display', serif;
      font-size: 2.75rem;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 12px;
      letter-spacing: -0.01em;
    }
    .input-subtitle {
      color: var(--text-muted);
      font-size: 1rem;
      font-weight: 400;
    }
  }

  .topic-textarea {
    background: var(--bg-glass-deep) !important;
    border: 1px solid var(--border-glass) !important;
    border-radius: 20px !important;
    padding: 16px 20px !important;
    font-size: 1.1rem !important;
    transition: all 0.3s ease;
    margin-bottom: 20px;
    color: var(--text-main) !important;

    &:focus {
      background: var(--bg-glass) !important;
      border-color: var(--accent-color) !important;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
    }
  }

  .create-btn {
    height: 56px !important;
    border-radius: 16px !important;
    background: var(--primary-color) !important;
    border: none !important;
    font-weight: 700 !important;
    font-size: 1.1rem !important;
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

/* Style & Image Methods Sections */
.style-section,
.image-methods-section {
  margin-bottom: 24px;
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;

  .section-header {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 12px;

    .section-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--primary-color);
      letter-spacing: 0.02em;
    }

    .section-tip {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 500;
    }
  }

  :deep(.ant-radio-group),
  :deep(.ant-checkbox-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
  }

  /* Custom Radio & Checkbox Style */
  :deep(.ant-radio-wrapper),
  :deep(.ant-checkbox-wrapper) {
    margin: 0 !important;
    padding: 8px 14px;
    background: var(--bg-surface);
    border: 1px solid var(--border-glass);
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    align-items: center;
    cursor: pointer;

    span:last-child {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-main);
      padding-inline-start: 8px;
      padding-inline-end: 0;
    }

    &:hover {
      border-color: var(--accent-color);
      background: var(--bg-surface-soft);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08);
    }

    /* Selected State */
    &.ant-radio-wrapper-checked,
    &.ant-checkbox-wrapper-checked {
      background: rgba(99, 102, 241, 0.06);
      border-color: var(--accent-color);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);

      span:last-child {
        color: var(--accent-color);
      }
    }

    /* Hide Original Radio/Checkbox Dot/Box */
    .ant-radio,
    .ant-checkbox {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }
  }
}

/* Loading Stage */
.loading-stage,
.outline-generating-state {
  width: 100%;
  max-width: 800px;
  text-align: center;
  animation: fadeIn 0.8s ease;
  padding: 60px 0;

  :deep(.ant-spin-dot) {
    width: 48px;
    height: 48px;
  }

  h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.75rem;
    color: var(--primary-color);
    margin-top: 24px;
    margin-bottom: 12px;
  }

  p {
    color: var(--text-muted);
    font-size: 1rem;
  }
}

.outline-generating-state {
  text-align: left;

  .preview-header {
    text-align: center;
    margin-bottom: 40px;

    .article-title {
      font-family: 'Playfair Display', serif;
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 12px;
    }

    .article-subtitle {
      font-size: 1.1rem;
      color: var(--text-muted);
    }
  }

  .outline-preview {
    background: var(--bg-glass);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-glass);
    border-radius: 28px;
    padding: 32px;
    margin-bottom: 0;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  }

  .section-label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 20px;
    font-size: 1rem;

    .typing-cursor {
      display: inline-block;
      width: 3px;
      height: 1.2em;
      background: var(--accent-color);
      animation: blink 1s infinite;
      margin-left: 4px;
    }
  }

  .outline-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .outline-item {
    background: var(--bg-surface);
    padding: 20px;
    border-radius: 16px;
    border: 1px solid var(--border-glass);
    animation: fadeIn 0.5s ease;

    .outline-title {
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 12px;
      font-size: 1.1rem;
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
        line-height: 1.6;

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
  padding: 32px 24px;
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
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border-glass);

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
      margin-bottom: 16px;
    }
  }
}

.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .hot-tag {
    padding: 8px 14px;
    background: var(--bg-surface);
    border: 1px solid var(--border-glass);
    border-radius: 12px;
    font-size: 0.8rem;
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
  gap: 12px;
  margin-bottom: 16px;

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
    font-size: 0.9rem;
    margin-bottom: 2px;
  }
  .tip-desc {
    font-size: 0.75rem;
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

.quota-section {
  .quota-admin {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 20px;
    background: var(--bg-surface);
    border: 1px solid var(--border-glass);
    border-radius: 16px;

    .quota-badge {
      padding: 6px 16px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

      &.admin {
        background: rgba(99, 102, 241, 0.1);
        color: var(--accent-color);
        border: 1px solid rgba(99, 102, 241, 0.2);
      }

      &.vip {
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
        border: 1px solid rgba(245, 158, 11, 0.2);
      }
    }

    .quota-text {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--primary-color);
    }
  }

  .quota-info {
    padding: 20px;
    background: var(--bg-surface);
    border: 1px solid var(--border-glass);
    border-radius: 16px;
    text-align: center;

    .quota-display {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 6px;
      margin-bottom: 12px;

      .quota-number {
        font-family: 'Playfair Display', serif;
        font-size: 3rem;
        font-weight: 700;
        color: var(--primary-color);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

        &.low {
          color: #f59e0b;
        }

        &.empty {
          color: #ef4444;
        }
      }

      .quota-unit {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-muted);
      }
    }

    .quota-label {
      font-size: 0.85rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .quota-progress {
      :deep(.ant-progress-bg) {
        border-radius: 8px;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
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
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
    }

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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
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
