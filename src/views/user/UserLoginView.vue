<template>
  <div id="userLoginView">
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="grid-overlay"></div>
    </div>

    <div class="login-container">
      <header class="login-header">
        <div class="logo-area">
          <span class="logo-dot"></span>
          <span class="logo-text">AI Passage</span>
        </div>
        <h2 class="form-title">欢迎回来</h2>
        <p class="form-subtitle">登录您的账号继续创作</p>
      </header>

      <a-form :model="formState" @finish="handleSubmit" class="custom-form" layout="vertical">
        <a-form-item
          name="userAccount"
          class="custom-form-item"
          :rules="[{ required: true, message: '请输入账号' }]"
        >
          <label class="input-label">账号</label>
          <a-input
            v-model:value="formState.userAccount"
            placeholder="Your account"
            class="elegant-input"
          />
        </a-form-item>

        <a-form-item
          name="userPassword"
          class="custom-form-item"
          :rules="[
            { required: true, message: '请输入密码' },
            { min: 8, message: '密码长度不能小于8位' },
          ]"
        >
          <label class="input-label">密码</label>
          <a-input
            v-model:value="formState.userPassword"
            type="password"
            placeholder="••••••••"
            class="elegant-input"
          />
        </a-form-item>

        <div class="form-actions">
          <a-button type="primary" html-type="submit" class="submit-btn" block>
            开启创作之旅
          </a-button>
        </div>
      </a-form>

      <div class="social-login">
        <div class="divider">
          <span class="divider-text">其他登录方式</span>
        </div>
        <div class="social-icons">
          <div class="social-icon-wrapper" @click="handleGithubLogin">
            <GithubOutlined class="github-icon" />
          </div>
        </div>
      </div>

      <footer class="form-footer">
        <span class="footer-text">还没有账号？</span>
        <RouterLink to="/user/register" class="register-link">立即注册</RouterLink>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { login } from '@/api/userController'
import { useLoginUserStore } from '@/stores/loginUser'
import { message } from 'ant-design-vue'
import { GithubOutlined } from '@ant-design/icons-vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const formState = ref<API.UserLoginDTO>({
  userAccount: '',
  userPassword: '',
})

const router = useRouter()
const loginUserStore = useLoginUserStore()

const handleSubmit = async () => {
  try {
    const res = await login(formState.value)
    if (res.data.code === 200 && res.data.data) {
      await loginUserStore.fetchLoginUser()
      message.success('登录成功')
      router.push({
        path: '/',
        replace: true,
      })
    } else {
      message.error('登录失败,' + res.data.message)
    }
  } catch (err: any) {
    message.error('登录失败,' + err.message)
  }
}

const handleGithubLogin = () => {
  window.location.href = '/api/user/login/github'
}
</script>

<style scoped lang="scss">
#userLoginView {
  --primary-color: #1a1a1a;
  --accent-color: #6366f1;
  --text-main: #1f2937;
  --text-muted: #6b7280;
  --bg-glass: rgba(255, 255, 255, 0.7);
  --border-glass: rgba(255, 255, 255, 0.4);

  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f8fafc;
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

/* Container */
.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  padding: 48px;
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-glass);
  border-radius: 32px;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.05),
    inset 0 0 0 1px var(--border-glass);
  animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Header */
.login-header {
  text-align: center;
  margin-bottom: 40px;

  .logo-area {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;

    .logo-dot {
      width: 10px;
      height: 10px;
      background: var(--accent-color);
      border-radius: 50%;
    }

    .logo-text {
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--primary-color);
      text-transform: uppercase;
      font-size: 0.85rem;
    }
  }

  .form-title {
    font-family: 'Playfair Display', serif;
    font-size: 2.25rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 12px;
    letter-spacing: -0.01em;
  }

  .form-subtitle {
    color: var(--text-muted);
    font-size: 0.95rem;
    font-weight: 400;
  }
}

/* Form Styles */
.custom-form {
  .custom-form-item {
    margin-bottom: 24px;

    .input-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 8px;
      margin-left: 4px;
    }
  }
}

.elegant-input {
  height: 52px !important;
  background: rgba(255, 255, 255, 0.5) !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  border-radius: 14px !important;
  padding: 0 16px !important;
  font-size: 1rem !important;
  transition: all 0.3s ease !important;

  &:hover {
    border-color: rgba(0, 0, 0, 0.15) !important;
  }

  &:focus {
    background: #fff !important;
    border-color: var(--accent-color) !important;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
  }
}

.submit-btn {
  height: 54px !important;
  background: var(--primary-color) !important;
  border: none !important;
  border-radius: 14px !important;
  font-weight: 600 !important;
  font-size: 1rem !important;
  letter-spacing: 0.02em !important;
  margin-top: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.2) !important;
    background: #000 !important;
  }

  &:active {
    transform: translateY(0);
  }
}

/* Social Login */
.social-login {
  margin-top: 32px;

  .divider {
    position: relative;
    text-align: center;
    margin-bottom: 24px;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: rgba(0, 0, 0, 0.06);
    }

    .divider-text {
      position: relative;
      background: #fdfdfd; /* Match the blurred background feel */
      padding: 0 12px;
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  }

  .social-icons {
    display: flex;
    justify-content: center;
    gap: 16px;

    .social-icon-wrapper {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: var(--accent-color);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);

        .github-icon {
          color: var(--accent-color);
        }
      }

      .github-icon {
        font-size: 1.5rem;
        color: var(--primary-color);
        transition: all 0.3s ease;
      }
    }
  }
}

/* Footer */
.form-footer {
  margin-top: 32px;
  text-align: center;
  font-size: 0.9rem;

  .footer-text {
    color: var(--text-muted);
  }

  .register-link {
    margin-left: 6px;
    color: var(--accent-color);
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
      color: #4f46e5;
      text-decoration: underline;
    }
  }
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

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile Adjustments */
@media (max-width: 480px) {
  .login-container {
    padding: 32px 24px;
    margin: 20px;
    border-radius: 24px;
  }

  .login-header .form-title {
    font-size: 1.85rem;
  }
}
</style>
