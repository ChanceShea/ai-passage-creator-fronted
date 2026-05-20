<template>
  <a-layout-header class="header">
    <div class="header-container">
      <div class="header-left">
        <RouterLink to="/" class="logo-link">
          <div class="logo-wrapper">
            <img src="@assets/logo.png" alt="Logo" class="logo-img" />
            <h1 class="site-title">AI文章创作器</h1>
          </div>
        </RouterLink>
      </div>
      <nav class="nav-center">
        <RouterLink
          v-for="item in menuItems"
          :key="item.key"
          :to="item.key"
          class="['nav-item', { active: selectedKeys.includes(item.key) }]"
        >
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
      <div class="header-right">
        <div v-if="loginUserStore.loginUser.id" class="user-dropdown">
          <RouterLink v-if="!isVip" to="/vip" class="upgrade-vip-btn">
            <CrownOutlined />
            <span>升级VIP</span>
          </RouterLink>
          <RouterLink v-else to="/vip" class="vip-btn">
            <CrownOutlined />
            <span>VIP</span>
          </RouterLink>
          <a-dropdown>
            <a-space class="user-info">
              <a-avatar :src="loginUserStore.loginUser.userAvatar" :size="36" class="user-avatar" />
              <span class="user-name">
                {{ loginUserStore.loginUser.userName ?? '无名' }}
              </span>
            </a-space>
            <template #overlay>
              <a-menu class="dropdown-menu">
                <a-menu-item
                  v-if="isVip"
                  key="vip-info"
                  class="vip-info-item"
                  @click="router.push('/vip')"
                >
                  <CrownOutlined />
                  <span>永久会员权益</span>
                </a-menu-item>
                <a-menu-divider v-if="isVip" />
                <a-menu-item @click="doLogout" class="dropdown-item">
                  <LogoutOutlined />
                  <span>退出登录</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
        <div v-else>
          <RouterLink to="/user/login" class="login-btn">登录</RouterLink>
        </div>
      </div>
    </div>
  </a-layout-header>
</template>

<script setup lang="ts">
const menuItems = []
</script>
