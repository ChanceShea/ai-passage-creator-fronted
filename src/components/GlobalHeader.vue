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
        <div class="theme-switcher">
          <a-tooltip>
            <a-dropdown placement="bottomRight">
              <div class="theme-btn">
                <BulbOutlined v-if="themeStore.theme === 'light'" />
                <BulbFilled v-else-if="themeStore.theme === 'dark'" />
                <DesktopOutlined v-else />
              </div>
              <template #overlay>
                <a-menu :selected-keys="[themeStore.theme]">
                  <a-menu-item key="light" @click="themeStore.setTheme('light')">
                    <BulbOutlined />
                    <span>浅色模式</span>
                  </a-menu-item>
                  <a-menu-item key="dark" @click="themeStore.setTheme('dark')">
                    <BulbFilled />
                    <span>深色模式</span>
                  </a-menu-item>
                  <a-menu-item key="auto" @click="themeStore.setTheme('auto')">
                    <DesktopOutlined />
                    <span>跟随系统</span>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </a-tooltip>
        </div>

        <div v-if="loginUserStore.loginUser.id" class="user-area">
          <RouterLink v-if="isVip" to="/vip" class="upgrade-vip-btn">
            <CrownOutlined />
            <span>升级会员</span>
          </RouterLink>
          <RouterLink v-else to="/vip" class="vip-badge">
            <CrownFilled />
            <span>VIP</span>
          </RouterLink>
          <a-dropdown placement="bottomRight">
            <div class="user-info">
              <a-avatar :src="loginUserStore.loginUser.userAvatar" :size="36" class="user-avatar">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <span class="user-name">{{ loginUserStore.loginUser.userName ?? 'User' }}</span>
            </div>
            <template #overlay>
              <a-menu class="dropdown-menu">
                <a-menu-item
                  v-if="isVip"
                  key="vip-info"
                  class="vip-info-item"
                  @click="router.push('/vip')"
                >
                  <CrownFilled />
                  <span>永久会员权益</span>
                </a-menu-item>
                <a-menu-divider v-if="isVip" />
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
import { useThemeStore } from '@/stores/theme'
import { logout } from '@/api/userController'
import { message } from 'ant-design-vue'
import {
  LogoutOutlined,
  UserOutlined,
  BulbOutlined,
  DesktopOutlined,
  BulbFilled,
  CrownFilled,
  CrownOutlined,
} from '@ant-design/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { USER_ROLE_VIP } from '@/constants/user'
import { computed } from 'vue'

const loginUserStore = useLoginUserStore()
const themeStore = useThemeStore()
const router = useRouter()
const currentRoute = useRoute()

const isVip = computed(() => {
  return loginUserStore.loginUser.userRole === USER_ROLE_VIP
})

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
  height: var(--header-height);
  line-height: var(--header-height);
  background: var(--header-bg);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-glass);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
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
    color: var(--text-main);
    margin: 0;
    letter-spacing: -0.02em;
  }
}

.nav-center {
  display: flex;
  gap: 32px;

  .nav-item {
    color: var(--text-muted);
    font-weight: 600;
    font-size: 0.95rem;
    padding: 0 12px;
    height: 40px;
    display: flex;
    align-items: center;
    border-radius: 12px;
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;

    &:hover {
      color: var(--text-main);
      background: rgba(0, 0, 0, 0.03);
    }

    &.active {
      color: var(--accent-color);
      background: rgba(99, 102, 241, 0.06);
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-switcher {
  .theme-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    cursor: pointer;
    font-size: 1.2rem;
    color: var(--text-main);
    transition: all 0.3s;
    border: 1px solid transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
      color: var(--accent-color);
    }
  }
}

.user-area {
  display: flex;
  align-items: center;
  gap: 12px;

  .vip-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 20px;
    text-decoration: none;
    font-weight: 700;
    font-size: 0.85rem;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
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
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      transition: left 0.6s;
    }

    &:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 8px 25px rgba(245, 158, 11, 0.5);

      &::before {
        left: 100%;
      }
    }

    svg {
      font-size: 1rem;
      animation: crownShine 2s ease-in-out infinite;
    }
  }

  .upgrade-vip-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 18px;
    border-radius: 20px;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.85rem;
    background: linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #4f46e5 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(45deg, #f59e0b, #7c3aed, #6366f1, #f59e0b);
      background-size: 400% 400%;
      border-radius: 22px;
      z-index: -1;
      animation: gradientBorder 3s ease infinite;
      opacity: 0;
      transition: opacity 0.3s;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5);

      &::before {
        opacity: 1;
      }
    }

    svg {
      font-size: 1rem;
    }
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
      color: var(--text-main);
      font-size: 0.9rem;
    }
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

  .vip-info-item {
    background: linear-gradient(
      135deg,
      rgba(245, 158, 11, 0.1) 0%,
      rgba(217, 119, 6, 0.1) 100%
    ) !important;
    color: #d97706 !important;
    font-weight: 600 !important;
    border-radius: 10px !important;
    padding: 12px 16px !important;
    margin-bottom: 4px !important;

    &:hover {
      background: linear-gradient(
        135deg,
        rgba(245, 158, 11, 0.2) 0%,
        rgba(217, 119, 6, 0.2) 100%
      ) !important;
    }

    svg {
      color: #f59e0b !important;
    }
  }

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

@keyframes crownShine {
  0%,
  100% {
    filter: drop-shadow(0 0 0 transparent);
  }
  50% {
    filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));
  }
}

@keyframes gradientBorder {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 20px;
  }

  .nav-center {
    display: none;
  }

  .user-area {
    .vip-badge,
    .upgrade-vip-btn {
      padding: 6px 12px;
      font-size: 0.75rem;
    }
  }
}
</style>
