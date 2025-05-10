import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/lab-1',
      name: 'lab-1',
      component: () => import('../views/Lab1.vue'),
    },
    {
      path: '/lab-2',
      name: 'lab-2',
      component: () => import('../views/Lab2.vue'),
    },
  ],
})

export default router
