<template>
  <div class="vip-view">
    <div class="vip-container">
      <div class="page-header">
        <div class="header-badge">
          <CrownOutlined />
          <span>会员专属</span>
        </div>
        <h1 class="page-title">升级永久会员</h1>
        <p class="page-subtitle">解锁全部高级功能，无限创作配额，终身有效</p>
      </div>
      <!-- 主内容区 -->
      <div class="main-section">
        <!-- 价格卡片 -->
        <div class="pricing-card">
          <div class="pricing-badge">限时优惠</div>
          <div class="pricing-header">
            <div class="plan-icon">
              <CrownOutlined />
            </div>
            <div class="plan-name">永久会员</div>
            <div class="price-display">
              <span class="currency">$</span>
              <span class="price">199</span>
              <span class="period">/永久</span>
            </div>
            <div class="original-price">
              <span class="original-label">原价</span>
              <span class="original-value">$299</span>
            </div>
          </div>
          <div class="pricing-divider"></div>
          <div class="pricing-features">
            <div v-for="(item, index) in pricingFeatures" :key="index" class="pricing-feature">
              <span>{{ item }}</span>
            </div>
          </div>
          <a-button
            type="primary"
            size="large"
            :loading="purchasing"
            :disabled="isVip"
            @click="handlePurchase"
            class="purchase-btn"
          >
            <template #icon>
              <ThunderboltOutlined />
            </template>
            {{ isVip ? '您已是永久会员' : '立即升级' }}
          </a-button>
          <div class="security-notice">
            <SafetyOutlined />
            <span>安全支付，无需担心个人信息泄露，7天无理由退款</span>
          </div>
        </div>
        <!-- 会员特权 -->
        <div class="features-section">
          <h3 class="features-title">
            <GifOutlined />
            会员特权
          </h3>
          <div class="features-grid">
            <div v-for="(feature, index) in features" :key="index" class="feature-card">
              <div class="feature-icon-wrapper">
                <component :is="feature.icon" class="feature-icon" />
              </div>
              <div class="feature-content">
                <h4 class="feature-title">{{ feature.title }}</h4>
                <p class="feature-desc">{{ feature.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 常见问题 -->
      <div class="faq-section">
        <div class="section-header">
          <QuestionCircleOutlined class="section-icon" />
          <h2 class="section-title">常见问题</h2>
        </div>
        <div class="faq-grid">
          <div v-for="(faq, index) in faqs" class="faq-card">
            <h4 class="faq-question">{{ faq.question }}</h4>
            <p class="faq-answer">{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createPaymentRecord } from '@/api/paymentRecordController'
import { USER_ROLE_VIP } from '@/constants/user'
import { useLoginUserStore } from '@/stores/loginUser'
import {
  CrownOutlined,
  GifOutlined,
  PictureOutlined,
  QuestionCircleOutlined,
  RocketOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const loginUserStore = useLoginUserStore()
const purchasing = ref(false)

const isVip = computed(() => {
  return loginUserStore.loginUser?.userRole === USER_ROLE_VIP
})

// 会员特权列表
const features = [
  {
    icon: RocketOutlined,
    title: '无限创作配额',
    description: '无限次使用文章创作功能，无限创作',
  },
  {
    icon: PictureOutlined,
    title: 'AI 智能生图',
    description: '使用Nano Banana生成独特配图',
  },
]

onMounted(async () => {
  const success = route.query.success
  const cancelled = route.query.cancelled

  if (success === 'true') {
    await loginUserStore.fetchLoginUser()
    Modal.success({
      title: '支付成功!',
      content: '恭喜您成为永久会员，已解锁全部高级功能!',
      okText: '开始创作',
      onOk: () => {
        router.push('/create')
      },
    })
    router.replace('/vip')
  } else if (cancelled === 'true') {
    message.info('支付已取消')
    router.replace('/vip')
  }
})

enum ProductTypeEnum {
  VIP_PERMANENT = 'VIP_PERMANENT',
}

const ProductTypeMeta = {
  [ProductTypeEnum.VIP_PERMANENT]: {
    value: 'VIP_PERMANENT',
    description: '永久VIP会员',
    amount: '199.00',
  },
}

const handlePurchase = async () => {
  if (!loginUserStore.loginUser.id) {
    message.error('请先登录')
    router.push('/user/login')
    return
  }
  if (isVip.value) {
    message.info('您已经是永久会员')
    return
  }
  purchasing.value = true
  try {
    const paymentRecordAddDTO: API.createPaymentRecordParams = {
      currency: 'CNY',
      amount: Number(ProductTypeMeta[ProductTypeEnum.VIP_PERMANENT].amount),
      description: ProductTypeMeta[ProductTypeEnum.VIP_PERMANENT].description,
      productType: ProductTypeEnum.VIP_PERMANENT,
      paymentType: 'ALIPAY',
    }
    const res = await createPaymentRecord(paymentRecordAddDTO)
    if (res.data.code === 200 && res.data.data) {
      const query = new URLSearchParams({
        orderId: res.data.data.orderId ?? '',
        userId: loginUserStore.loginUser.id.toString(),
      })
      window.location.href = 'http://localhost:8080/api/alipay/pay?' + query.toString()
    } else {
      message.error(res.data.message || '创建支付记录失败')
    }
  } catch (err: any) {
    message.error(err.message || '创建支付记录失败')
  } finally {
    purchasing.value = false
  }
}
</script>

<style scoped lang="scss">
.vip-view {
  min-height: calc(100vh - var(--header-height));
  background: var(--bg-page);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background:
      radial-gradient(circle at 30% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 70% 80%, rgba(99, 102, 241, 0.08) 0%, transparent 50%);
    pointer-events: none;
    animation: backgroundShift 20s ease-in-out infinite;
  }
}

.vip-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 40px;
  position: relative;
  z-index: 1;
}

.page-header {
  text-align: center;
  margin-bottom: 60px;
  animation: fadeInDown 0.8s ease-out;

  .header-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 20px;
    border-radius: 50px;
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.15) 100%);
    color: #d97706;
    font-weight: 700;
    font-size: 0.9rem;
    margin-bottom: 24px;
    animation: badgePulse 2s ease-in-out infinite;

    svg {
      font-size: 1.1rem;
    }
  }

  .page-title {
    font-family: 'Playfair Display', serif;
    font-size: 3.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, #d97706 0%, #f59e0b 30%, #fbbf24 60%, #d97706 100%);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 16px 0;
    letter-spacing: -0.02em;
    animation: gradientText 5s ease infinite;
  }

  .page-subtitle {
    font-size: 1.25rem;
    color: var(--text-muted);
    font-weight: 500;
    margin: 0;
  }
}

.main-section {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 40px;
  margin-bottom: 80px;
}

.pricing-card {
  position: relative;
  background: var(--bg-surface);
  border-radius: 32px;
  padding: 48px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-glass);
  overflow: hidden;
  animation: fadeInLeft 0.8s ease-out 0.2s both;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b);
    background-size: 200% 100%;
    animation: borderFlow 3s linear infinite;
  }

  .pricing-badge {
    position: absolute;
    top: 20px;
    right: -30px;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    padding: 6px 40px;
    font-size: 0.8rem;
    font-weight: 700;
    transform: rotate(45deg);
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
  }

  .pricing-header {
    text-align: center;
    margin-bottom: 32px;

    .plan-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%);
      animation: iconFloat 3s ease-in-out infinite;

      svg {
        font-size: 2.5rem;
        color: #d97706;
      }
    }

    .plan-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 24px;
    }

    .price-display {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 4px;
      margin-bottom: 8px;

      .currency {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-muted);
      }

      .price {
        font-size: 4rem;
        font-weight: 800;
        background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1;
      }

      .period {
        font-size: 1.1rem;
        color: var(--text-muted);
        font-weight: 500;
        margin-bottom: 8px;
      }
    }

    .original-price {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      color: var(--text-muted);
      font-size: 1rem;

      .original-label {
        text-decoration: line-through;
      }

      .original-value {
        text-decoration: line-through;
        font-weight: 600;
      }
    }
  }

  .pricing-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border-glass), transparent);
    margin: 32px 0;
  }

  .pricing-features {
    margin-bottom: 32px;

    .pricing-feature {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 0;
      font-size: 1rem;
      color: var(--text-main);
      font-weight: 500;
      border-bottom: 1px solid var(--border-glass);

      &:last-child {
        border-bottom: none;
      }

      &::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
      }
    }
  }

  .purchase-btn {
    width: 100%;
    height: 56px;
    font-size: 1.1rem;
    font-weight: 700;
    border-radius: 16px;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
    border: none;
    box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.6s;
    }

    &:hover:not(:disabled) {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 12px 35px rgba(245, 158, 11, 0.5);

      &::before {
        left: 100%;
      }
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .security-notice {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 20px;
    font-size: 0.85rem;
    color: var(--text-muted);

    svg {
      color: #22c55e;
    }
  }
}

.features-section {
  animation: fadeInRight 0.8s ease-out 0.4s both;

  .features-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-main);
    margin-bottom: 32px;

    svg {
      color: #d97706;
      font-size: 2rem;
    }
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .feature-card {
    background: var(--bg-surface);
    border-radius: 24px;
    padding: 28px;
    border: 1px solid var(--border-glass);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--card-shadow);
      border-color: rgba(245, 158, 11, 0.3);
    }

    .feature-icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
      margin-bottom: 16px;

      svg {
        font-size: 1.8rem;
        background: linear-gradient(135deg, #f59e0b 0%, #6366f1 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .feature-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 8px;
    }

    .feature-desc {
      font-size: 0.95rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.6;
    }
  }
}

.faq-section {
  animation: fadeInUp 0.8s ease-out 0.6s both;

  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: center;
    margin-bottom: 40px;

    .section-icon {
      font-size: 2rem;
      color: var(--accent-color);
    }

    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0;
    }
  }

  .faq-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .faq-card {
    background: var(--bg-surface);
    border-radius: 20px;
    padding: 28px;
    border: 1px solid var(--border-glass);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--card-shadow);
    }

    .faq-question {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0 0 12px 0;
    }

    .faq-answer {
      font-size: 0.95rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.7;
    }
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes badgePulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes gradientText {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes borderFlow {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 200% 0%;
  }
}

@keyframes iconFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes backgroundShift {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(2%, 2%);
  }
}

@media (max-width: 1024px) {
  .main-section {
    grid-template-columns: 1fr;
  }

  .faq-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .vip-container {
    padding: 40px 20px;
  }

  .page-header {
    .page-title {
      font-size: 2.5rem;
    }

    .page-subtitle {
      font-size: 1.1rem;
    }
  }

  .pricing-card {
    padding: 32px 24px;

    .pricing-header {
      .price-display {
        .price {
          font-size: 3rem;
        }
      }
    }
  }

  .features-section {
    .features-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
