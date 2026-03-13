import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/folder/:folder',
      name: 'folder',
      component: () => import('../views/FolderView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guard: redirect to login if no access code
router.beforeEach((to) => {
  const hasCode = !!localStorage.getItem('access_code')
  if (to.meta.requiresAuth && !hasCode) {
    return { name: 'login' }
  }
  if (to.name === 'login' && hasCode) {
    return { name: 'home' }
  }
})

export default router
