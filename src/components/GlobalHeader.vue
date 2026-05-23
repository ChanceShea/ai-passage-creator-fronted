<template>
  <a-layout-header class="header">
    <div class="header-container">
      <div class="header-left">
        <RouterLink to="/" class="logo-link">
          <div class="logo-wrapper">
            <div class="logo-dot"></div>
            <h1 class="site-title">AI Passage</h1>
          </div>
        </RouterLink>
      </div>

      <nav class="nav-center">
        <RouterLink
          v-for="item in menuItems"
          :key="item.key"
          :to="item.key"
          :class="['nav-item', { active: currentRoute.path === item.key }]"
        >
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="header-right">
        <div v-if="loginUserStore.loginUser.id" class="user-area">
          <a-dropdown placement="bottomRight">
            <div class="user-info">
              <a-avatar :src="loginUserStore.loginUser.userAvatar" :size="36" class="user-avatar">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <span class="user-name">{{ loginUserStore.loginUser.userName ?? 'User' }}</span>
            </div>
            <template #overlay>
              <a-menu class="dropdown-menu">
                <a-menu-item key="logout" @click="handleLogout" class="dropdown-item">
                  <LogoutOutlined />
                  <span>退出登录</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
        <div v-else class="auth-btns">
          <RouterLink to="/user/login" class="login-btn">登录</RouterLink>
          <RouterLink to="/user/register" class="register-btn">注册</RouterLink>
        </div>
      </div>
    </div>
  </a-layout-header>
</template>

<script setup lang="ts">
import { useLoginUserStore } from '@/stores/loginUser'
import { logout } from '@/api/userController'
import { message } from 'ant-design-vue'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'

const loginUserStore = useLoginUserStore()
const router = useRouter()
const currentRoute = useRoute()

const menuItems = [
  { key: '/article/create', label: '文章创作' },
  { key: '/article/list', label: '历史记录' },
]

const handleLogout = async () => {
  try {
    const res = await logout()
    if (res.data.code === 200) {
      loginUserStore.setLoginUser({})
      message.success('已退出登录')
      router.push('/user/login')
    }
  } catch (err: any) {
    message.error('登出失败')
  }
}
</script>

<style scoped lang="scss">
.header {
  --header-height: 72px;
  --bg-glass: rgba(255, 255, 255, 0.7);
  --border-glass: rgba(255, 255, 255, 0.4);
  --accent-color: #6366f1;

  height: var(--header-height);
  line-height: var(--header-height);
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-glass);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;

  .logo-dot {
    width: 12px;
    height: 12px;
    background: var(--accent-color);
    border-radius: 50%;
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
  }

  .site-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-weight: 800;
    color: #1a1a1a;
    margin: 0;
    letter-spacing: -0.02em;
  }
}

.nav-center {
  display: flex;
  gap: 32px;

  .nav-item {
    font-size: 0.95rem;
    font-weight: 600;
    color: #6b7280;
    text-decoration: none;
    transition: all 0.3s ease;
    position: relative;
    padding: 4px 0;

    &:hover {
      color: #1a1a1a;
    }

    &.active {
      color: var(--accent-color);

      &::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--accent-color);
        border-radius: 2px;
      }
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  .user-avatar {
    border: 2px solid white;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  }

  .user-name {
    font-weight: 600;
    color: #1a1a1a;
    font-size: 0.9rem;
  }
}

.auth-btns {
  display: flex;
  gap: 16px;

  .login-btn {
    color: #1a1a1a;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 8px 20px;
    border-radius: 10px;
    transition: all 0.3s;

    &:hover {
      background: rgba(0, 0, 0, 0.03);
    }
  }

  .register-btn {
    background: #1a1a1a;
    color: white;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 8px 20px;
    border-radius: 10px;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    &:hover {
      background: #333;
      transform: translateY(-1px);
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
    }
  }
}

.dropdown-menu {
  border-radius: 16px !important;
  padding: 8px !important;
  border: 1px solid rgba(0, 0, 0, 0.04) !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08) !important;
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.9) !important;

  .dropdown-item {
    border-radius: 10px !important;
    font-weight: 500 !important;
    padding: 10px 16px !important;

    &:hover {
      background: rgba(239, 68, 68, 0.05) !important;
      color: #ef4444 !important;
    }
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 20px;
  }

  .nav-center {
    display: none;
  }
}
</style>
