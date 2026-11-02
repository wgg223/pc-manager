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
    path: '/hosts',
    name: 'HostsEditor',
    component: () => import('../views/HostsEditor.vue')
  },
  {
    path: '/system-repair',
    name: 'SystemRepair',
    component: () => import('../views/SystemRepair.vue')
  },
  {
    path: '/services',
    name: 'Services',
    component: () => import('../views/Services.vue')
  },
  {
    path: '/hardware-health',
    name: 'HardwareHealth',
    component: () => import('../views/HardwareHealth.vue')
  },
  {
    path: '/ssh',
    name: 'SSH',
    component: () => import('../views/SSH.vue')
  },
  {
    path: '/remote-desktop',
    name: 'RemoteDesktop',
    component: () => import('../views/RemoteDesktop.vue')
  },
  {
    path: '/file-transfer',
    name: 'FileTransfer',
    component: () => import('../views/FileTransfer.vue')
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
