<template>
  <a-layout-footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-brand">
          <div class="logo-area">
            <div class="logo-dot"></div>
            <span class="logo-text">AI Passage</span>
          </div>
          <p class="brand-desc">用 AI 开启创作新时代，让灵感随处可见。</p>
        </div>
        <div class="footer-links">
          <div class="link-group">
            <h4 class="group-title">产品</h4>
            <RouterLink to="/article/create" class="footer-link">文章创作</RouterLink>
            <RouterLink to="/article/list" class="footer-link">历史记录</RouterLink>
          </div>
          <div class="link-group">
            <h4 class="group-title">支持</h4>
            <a href="#" class="footer-link">使用指南</a>
            <a href="#" class="footer-link">隐私政策</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="copyright">© 2026 AI Passage Creator. All rights reserved.</p>
        <div class="social-links">
          <a href="https://github.com" target="_blank" class="social-link">
            <GithubOutlined />
          </a>
        </div>
      </div>
    </div>
  </a-layout-footer>
</template>

<script setup lang="ts">
import { GithubOutlined } from '@ant-design/icons-vue'
</script>

<style scoped lang="scss">
.footer {
  --bg-glass: rgba(255, 255, 255, 0.7);
  --border-glass: rgba(255, 255, 255, 0.4);
  --accent-color: #6366f1;

  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--border-glass);
  padding: 60px 0 30px;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  margin-bottom: 60px;
  gap: 40px;
}

.footer-brand {
  max-width: 320px;

  .logo-area {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;

    .logo-dot {
      width: 10px;
      height: 10px;
      background: var(--accent-color);
      border-radius: 50%;
    }

    .logo-text {
      font-family: 'Playfair Display', serif;
      font-size: 1.25rem;
      font-weight: 800;
      color: #1a1a1a;
      letter-spacing: -0.01em;
    }
  }

  .brand-desc {
    color: #6b7280;
    font-size: 0.95rem;
    line-height: 1.6;
  }
}

.footer-links {
  display: flex;
  gap: 80px;
}

.link-group {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .group-title {
    font-size: 0.85rem;
    font-weight: 700;
    color: #1a1a1a;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 8px;
  }

  .footer-link {
    color: #6b7280;
    font-size: 0.9rem;
    text-decoration: none;
    transition: all 0.3s;

    &:hover {
      color: var(--accent-color);
      transform: translateX(4px);
    }
  }
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 30px;
  border-top: 1px solid rgba(0, 0, 0, 0.04);

  .copyright {
    color: #9ca3af;
    font-size: 0.85rem;
    margin: 0;
  }
}

.social-links {
  display: flex;
  gap: 20px;

  .social-link {
    color: #9ca3af;
    font-size: 1.25rem;
    transition: all 0.3s;

    &:hover {
      color: #1a1a1a;
      transform: translateY(-2px);
    }
  }
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 40px;
  }

  .footer-links {
    gap: 40px;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
}
</style>
