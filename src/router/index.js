import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/disk-clean',
    name: 'DiskClean',
    component: () => import('../views/DiskClean.vue')
  },
  {
    path: '/system-info',
    name: 'SystemInfo',
    component: () => import('../views/SystemInfo.vue')
  },
  {
    path: '/process',
    name: 'Process',
    component: () => import('../views/Process.vue')
  },
  {
    path: '/startup',
    name: 'Startup',
    component: () => import('../views/Startup.vue')
  },
  {
    path: '/network',
    name: 'Network',
    component: () => import('../views/Network.vue')
  },
  {
    path: '/software',
    name: 'Software',
    component: () => import('../views/Software.vue')
  },
  {
    path: '/wallpaper',
    name: 'Wallpaper',
    component: () => import('../views/Wallpaper.vue')
  },
  {
    path: '/custom',
    name: 'Custom',
    component: () => import('../views/Custom.vue')
  },
  {
    path: '/console',
    name: 'Console',
    component: () => import('../views/Console.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
