import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

const layout = () => import('@/layout/index.vue')
const dashboard = () => import('@/views/dashboard/index.vue')
const projects = () => import('@/views/projects/index.vue')
const projectShell = () => import('@/views/project/index.vue')
const projectModule = () => import('@/views/project-module/index.vue')
const modulePlaceholder = () => import('@/views/module/index.vue')

export const projectModuleRoutes = [
  {
    path: 'overview',
    title: '项目总览',
    description: '查看当前小说的基础信息、进度、风险和最近工作。',
  },
  {
    path: 'world',
    title: '世界事实库',
    description: '维护当前小说的世界规则、地点、势力、时间线和权威事实。',
  },
  {
    path: 'characters',
    title: '角色关系',
    description: '维护当前小说的角色目标、知识边界、关系账本和状态演进。',
  },
  {
    path: 'chapters',
    title: '章节工作台',
    description: '管理当前小说的章节草稿、场景卡、原文回捞和导出流程。',
  },
  {
    path: 'audit',
    title: '审稿校验',
    description: '运行当前小说的本地规则检查、候选事实审查和 AI 按需审查入口。',
  },
] as const

const projectChildren: RouteRecordRaw[] = [
  {
    path: '',
    redirect: { name: 'project-overview' },
  },
  ...projectModuleRoutes.map((item) => ({
    path: item.path,
    name: `project-${item.path}`,
    component: projectModule,
    meta: {
      title: item.title,
      description: item.description,
    },
  })),
]

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: layout,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: dashboard,
        meta: { title: '工作台' },
      },
      {
        path: 'projects',
        name: 'projects',
        component: projects,
        meta: {
          title: '小说项目',
          description: '管理多部小说项目，进入项目后维护世界、角色、章节和审稿流。',
        },
      },
      {
        path: 'projects/:projectId',
        component: projectShell,
        children: projectChildren,
      },
      {
        path: 'mcp',
        name: 'mcp',
        component: modulePlaceholder,
        meta: {
          title: 'MCP 连接',
          description: '为 Codex / Claude Code 暴露本地故事上下文、工具和提示流程。',
        },
      },
      {
        path: 'settings',
        name: 'settings',
        component: modulePlaceholder,
        meta: {
          title: '本地设置',
          description: '管理数据目录、检查模式、备份恢复、更新下载和应用偏好。',
        },
      },
    ],
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
