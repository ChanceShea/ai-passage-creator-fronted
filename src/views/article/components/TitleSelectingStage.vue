<template>
  <div class="title-selecting-stage">
    <div class="stage-header">
      <h2 class="stage-title">选择标题方案</h2>
      <p class="stage-subtitle">AI为您生成了以下标题，请选择一个或者自定义标题</p>
    </div>
    <a-radio-group v-model:value="selectedIndex" class="title-options">
      <div v-for="(option, index) in titleOptions" :key="index" class="title-option">
        <a-radio :value="index">
          <div class="title-content">
            <div class="title-main">{{ option.mainTitle }}</div>
            <div class="title-sub">{{ option.subTitle }}</div>
          </div>
        </a-radio>
      </div>
      <div class="title-option custom">
        <a-radio :value="-1">
          <div class="title-content">
            <div class="title-main">自定义标题</div>
          </div>
        </a-radio>
        <div class="custom-inputs" v-if="selectedIndex === -1">
          <a-input
            v-model:value="customMainTitle"
            placeholder="请输入主标题"
            class="custom-input"
          />
          <a-input v-model:value="customSubTitle" placeholder="请输入副标题" class="custom-input" />
        </div>
      </div>
    </a-radio-group>
    <div class="description-section">
      <label class="section-label">补充描述（可选）</label>
      <p class="section-tip">补充您对文章的期望、重点强调的内容等</p>
      <a-textarea
        v-model:value="userDescription"
        placeholder="例如：请重点强调技术原理，用通俗的语言讲解..."
        :rows="4"
        :maxlength="500"
        show-count
        class="description-textarea"
      />
    </div>
    <div class="actions">
      <a-button
        type="primary"
        size="large"
        :loading="loading"
        :disabled="!canComfirm"
        @click="handleConfirm"
        class="confirm-btn"
      >
        <template #icon>
          <CheckOutlined />
        </template>
        确认并生成正文
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { CheckOutlined } from '@ant-design/icons-vue'

interface TitleOption {
  mainTitle: string
  subTitle: string
}

interface Props {
  titleOptions: TitleOption[]
  loading?: boolean
}

interface Emits {
  (
    e: 'confirm',
    data: {
      mainTitle: string
      subTitle: string
      userDescription: string
    },
  ): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<Emits>()

const selectedIndex = ref(0)
const customMainTitle = ref('')
const customSubTitle = ref('')
const userDescription = ref('')
const loading = ref(false)

const canComfirm = computed(() => {
  if (selectedIndex.value === -1) {
    return customMainTitle.value.trim() && customSubTitle.value.trim()
  }
  return selectedIndex.value >= 0 && selectedIndex.value < props.titleOptions.length
})

const handleConfirm = () => {
  let mainTitle = ''
  let subTitle = ''

  if (selectedIndex.value === -1) {
    mainTitle = customMainTitle.value
    subTitle = customSubTitle.value
  } else {
    const selected = props.titleOptions[selectedIndex.value]
    mainTitle = selected?.mainTitle || ''
    subTitle = selected?.subTitle || ''
  }

  emit('confirm', {
    mainTitle,
    subTitle,
    userDescription: userDescription.value,
  })
}
</script>

<style scoped lang="scss">
.title-selecting-stage {
  width: 100%;
  max-width: 850px;
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: 'Montserrat', sans-serif;
}

.stage-header {
  text-align: center;
  margin-bottom: 48px;

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

.title-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.title-option {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-glass);
  border-radius: 24px;
  padding: 24px;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.08);
    border-color: var(--accent-color);
  }

  :deep(.ant-radio-wrapper) {
    margin: 0 !important;
    width: 100%;

    .ant-radio {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }
  }

  .title-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .title-main {
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--primary-color);
    line-height: 1.4;
  }

  .title-sub {
    font-size: 0.95rem;
    color: var(--text-muted);
    line-height: 1.6;
  }

  &.custom {
    .custom-inputs {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      animation: fadeIn 0.4s ease;

      .custom-input {
        background: var(--bg-surface) !important;
        border: 1px solid var(--border-glass) !important;
        border-radius: 12px !important;
        padding: 12px 16px !important;
        color: var(--text-main) !important;

        &:focus {
          border-color: var(--accent-color) !important;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
        }
      }
    }
  }

  &:has(:deep(.ant-radio-wrapper-checked)) {
    background: rgba(99, 102, 241, 0.06);
    border-color: var(--accent-color);
    box-shadow: 0 12px 32px rgba(99, 102, 241, 0.12);
  }
}

.description-section {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-glass);
  border-radius: 28px;
  padding: 32px;
  margin-bottom: 32px;

  .section-label {
    display: block;
    font-weight: 700;
    color: var(--primary-color);
    font-size: 1rem;
    margin-bottom: 6px;
    letter-spacing: 0.02em;
  }

  .section-tip {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-bottom: 16px;
  }

  .description-textarea {
    background: var(--bg-surface) !important;
    border: 1px solid var(--border-glass) !important;
    border-radius: 16px !important;
    padding: 16px !important;
    color: var(--text-main) !important;

    &:focus {
      border-color: var(--accent-color) !important;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
    }
  }
}

.actions {
  display: flex;
  justify-content: center;
}

.confirm-btn {
  height: 56px !important;
  border-radius: 16px !important;
  background: var(--primary-color) !important;
  border: none !important;
  font-weight: 700 !important;
  font-size: 1.1rem !important;
  width: 100%;
  max-width: 400px;
  letter-spacing: 0.02em;
  color: var(--text-inverse) !important;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;

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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
