<template>
  <div class="outline-editing-stage">
    <div class="stage-header">
      <div class="stage-title">编辑文章大纲</div>
      <p class="stage-subtitle">您可以编辑、调整章节顺序，或添加新章节</p>
    </div>
    <div class="outline-list" ref="outlineListRef">
      <div
        v-for="(section, index) in outlineSections"
        :key="section.section"
        class="outline-section"
        :data-section-id="section.section"
      >
        <div class="section-header">
          <span class="drag-handle" title="拖动排序">⋮⋮</span>
          <span class="section-number">{{ index + 1 }}</span>
          <a-input
            v-model:value="section.title"
            placeholder="章节标题"
            class="section-title-input"
          />
          <a-button type="text" danger @click="deleteSection(index)" class="delete-btn">
            <template #icon><DeleteOutlined /></template>
          </a-button>
        </div>
        <div class="section-points">
          <div v-for="(point, pointIdx) in section.points" :key="pointIdx" class="point-item">
            <span class="point-bullet">•</span>
            <a-input
              v-model:value="section.points[pointIdx]"
              placeholder="要点内容"
              class="point-input"
            />
            <a-button
              type="text"
              size="small"
              @click="deletePoint(index, pointIdx)"
              class="delete-point-btn"
            >
              x
            </a-button>
          </div>
          <a-button type="dashed" @click="addPoint(index)" class="add-point-btn">
            <template #icon><PlusOutlined /></template>
            添加要点
          </a-button>
        </div>
      </div>
    </div>
    <div class="ai-chat-section" :class="{ 'vip-only': !isVip }">
      <div class="chat-header">
        <RobotOutlined />
        <span class="chat-title"> AI助手修改大纲 </span>
      </div>
      <div v-if="isVip" class="chat-input wrapper">
        <a-textarea
          v-model:value="modifySuggestion"
          placeholder="告诉AI如何修改大纲，例如：请在第二章节后面增加一个关于实践案例的章节"
          :rows="5"
          :maxlength="500"
          show-count
          class="chat-textarea"
        />
        <a-button
          type="primary"
          :loading="aiModifying"
          :disabled="!modifySuggestion.trim()"
          @click="handleAiModify"
          class="ai-modify-btn"
        >
          <template #icon><RobotOutlined /></template>
          AI修改大纲
        </a-button>
      </div>
      <div v-else class="vip-upgrade-notice">
        <CrownOutlined class="vip-icon" />
        <p>AI修改大纲功能仅限VIP会员使用</p>
        <RouterLink to="/vip" class="upgrade-btn"> 立即升级VIP </RouterLink>
      </div>
    </div>
    <div class="actions">
      <a-button size="large" @click="addSection" class="add-section-btn">
        <template #icon><PlusOutlined /></template>
        添加章节
      </a-button>
      <a-button
        type="primary"
        size="large"
        :loading="loading"
        :disable="!canConfirm"
        @click="handleConfirm"
        class="confirm-btn"
      >
        <template #icon><CheckOutlined /></template>
        确认并生成正文
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import {
  DeleteOutlined,
  PlusOutlined,
  RobotOutlined,
  CheckOutlined,
  CrownOutlined,
} from '@ant-design/icons-vue'
import Sortable from 'sortablejs'
import { message } from 'ant-design-vue'
import { aiModifyOutline } from '@/api/articleController'
import { isVip as checkIfVip } from '@/utils/permission'
import { useLoginUserStore } from '@/stores/loginUser'

interface OutlineSection {
  section: number
  title: string
  points: string[]
}

interface Props {
  outline: API.OutlineSection[]
  taskId: string
  loading?: boolean
}

interface Emits {
  (e: 'confirm', outline: OutlineSection[]): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const loginUserStore = useLoginUserStore()

const isVip = computed(() => checkIfVip(loginUserStore.loginUser))

const emit = defineEmits<Emits>()

const initOutlineSections = (outline: API.OutlineSection[]) => {
  return outline.map((item, index) => ({
    section: item.section ?? index + 1,
    title: item.title ?? '',
    points: item.points ?? [''],
  }))
}

const outlineSections = ref<OutlineSection[]>(initOutlineSections(props.outline))

watch(
  () => props.outline,
  (newOutline) => {
    if (newOutline && newOutline.length > 0) {
      outlineSections.value = initOutlineSections(newOutline)
    }
  },
  { deep: true, immediate: true },
)

const outlineListRef = ref<HTMLElement | null>(null)
const modifySuggestion = ref('')
const aiModifying = ref(false)

const canConfirm = computed(() => {
  return (
    outlineSections.value.length > 0 &&
    outlineSections.value.every(
      (section) =>
        section.title.trim() &&
        section.points.length > 0 &&
        section.points.every((point) => point.trim()),
    )
  )
})

onMounted(() => {
  nextTick(() => {
    if (outlineListRef.value) {
      Sortable.create(outlineListRef.value, {
        animation: 150,
        handle: '.drag-handle',
        onEnd: (evt) => {
          const { oldIndex, newIndex } = evt
          if (oldIndex !== undefined && newIndex !== undefined) {
            const item = outlineSections.value.splice(oldIndex, 1)[0]
            outlineSections.value.splice(newIndex, 0, item)
            outlineSections.value.forEach((sec, idx) => {
              sec.section = idx + 1
            })
          }
        },
      })
    }
  })
})

const addSection = () => {
  const newSection: OutlineSection = {
    section: outlineSections.value.length + 1,
    title: '',
    points: [''],
  }
  outlineSections.value.push(newSection)
}

const deleteSection = (index: number) => {
  outlineSections.value.splice(index, 1)
  outlineSections.value.forEach((sec, idx) => {
    sec.section = idx + 1
  })
}

const addPoint = (sectionIndex: number) => {
  outlineSections.value[sectionIndex].points.push('')
}

const deletePoint = (sectionIndex: number, pointIndex: number) => {
  const section = outlineSections.value[sectionIndex]
  if (section.points.length > 1) {
    section?.points.splice(pointIndex, 1)
  }
}

const handleConfirm = () => {
  emit('confirm', outlineSections.value)
}

const handleAiModify = async () => {
  if (!modifySuggestion.value.trim()) {
    message.warn('请输入修改建议')
    return
  }
  aiModifying.value = true
  try {
    const res = await aiModifyOutline({
      taskId: props.taskId,
      modifySuggestion: modifySuggestion.value,
    })
    if (res.data.data) {
      outlineSections.value = res.data.data.map((item, index) => ({
        section: item.section ?? index + 1,
        title: item.title ?? '',
        points: item.points ?? [],
      }))
      modifySuggestion.value = ''
      message.success('AI已根据您的建议修改大纲')
    }
  } catch (error: any) {
    message.error(error.message || 'AI修改大纲失败')
    aiModifying.value = false
  } finally {
    aiModifying.value = false
  }
}
</script>

<style scoped lang="scss">
.outline-editing-stage {
  width: 100%;
  max-width: 900px;
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: 'Montserrat', sans-serif;
}

.stage-header {
  text-align: center;
  margin-bottom: 40px;

  .stage-title {
    font-family: 'Playfair Display', serif;
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 12px;
    letter-spacing: -0.01em;
  }

  .stage-subtitle {
    font-size: 1rem;
    color: var(--text-muted);
    font-weight: 400;
  }
}

.outline-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
}

.outline-section {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-glass);
  border-radius: 24px;
  padding: 24px;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(99, 102, 241, 0.3);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  .drag-handle {
    cursor: grab;
    font-size: 1.2rem;
    color: var(--text-muted);
    padding: 4px;
    user-select: none;
    transition: color 0.2s;

    &:hover {
      color: var(--accent-color);
    }

    &:active {
      cursor: grabbing;
    }
  }

  .section-number {
    width: 36px;
    height: 36px;
    background: var(--accent-color);
    color: white;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.95rem;
    flex-shrink: 0;
  }

  .section-title-input {
    flex: 1;
    background: var(--bg-surface) !important;
    border: 1px solid var(--border-glass) !important;
    border-radius: 12px !important;
    padding: 10px 16px !important;
    color: var(--text-main) !important;
    font-weight: 600 !important;
    font-size: 1.05rem !important;

    &:focus {
      border-color: var(--accent-color) !important;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
    }
  }

  .delete-btn {
    color: #ef4444;
    padding: 8px;
    border-radius: 10px;
    transition: all 0.2s;

    &:hover {
      background: rgba(239, 68, 68, 0.1) !important;
      color: #ef4444 !important;
    }
  }
}

.section-points {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-left: 48px;
}

.point-item {
  display: flex;
  align-items: center;
  gap: 10px;

  .point-bullet {
    color: var(--accent-color);
    font-size: 1.2rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  .point-input {
    flex: 1;
    background: var(--bg-surface) !important;
    border: 1px solid var(--border-glass) !important;
    border-radius: 10px !important;
    padding: 8px 14px !important;
    color: var(--text-main) !important;
    font-size: 0.95rem !important;

    &:focus {
      border-color: var(--accent-color) !important;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1) !important;
    }
  }

  .delete-point-btn {
    color: #ef4444;
    padding: 4px 8px;
    border-radius: 8px;
    font-weight: 700;
    opacity: 0.7;
    transition: all 0.2s;

    &:hover {
      opacity: 1;
      background: rgba(239, 68, 68, 0.1) !important;
      color: #ef4444 !important;
    }
  }
}

.add-point-btn {
  width: fit-content;
  color: var(--accent-color);
  border-color: rgba(99, 102, 241, 0.3);
  border-radius: 12px;
  padding: 8px 16px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    border-color: var(--accent-color) !important;
    color: var(--accent-color) !important;
    background: rgba(99, 102, 241, 0.05) !important;
  }
}

.ai-chat-section {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-glass);
  border-radius: 24px;
  padding: 28px;
  margin-bottom: 32px;

  .chat-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;

    .chat-title {
      font-weight: 700;
      color: var(--primary-color);
      font-size: 1rem;
    }
  }

  .chat-textarea {
    background: var(--bg-surface) !important;
    border: 1px solid var(--border-glass) !important;
    border-radius: 16px !important;
    padding: 14px !important;
    color: var(--text-main) !important;
    margin-bottom: 12px;

    &:focus {
      border-color: var(--accent-color) !important;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
    }
  }

  .ai-modify-btn {
    width: 100%;
    height: 48px !important;
    border-radius: 14px !important;
    background: linear-gradient(135deg, var(--accent-color), #8b5cf6) !important;
    border: none !important;
    font-weight: 700 !important;
    color: white !important;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(99, 102, 241, 0.25) !important;
      opacity: 0.9;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.add-section-btn,
.confirm-btn {
  height: 56px !important;
  border-radius: 16px !important;
  font-weight: 700 !important;
  font-size: 1rem !important;
  padding: 0 32px !important;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.add-section-btn {
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-glass) !important;
  color: var(--accent-color) !important;

  &:hover {
    border-color: var(--accent-color) !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(99, 102, 241, 0.1) !important;
    background: rgba(99, 102, 241, 0.05) !important;
  }
}

.confirm-btn {
  background: var(--primary-color) !important;
  border: none !important;
  color: var(--text-inverse) !important;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(var(--primary-color-rgb), 0.2) !important;
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
</style>
