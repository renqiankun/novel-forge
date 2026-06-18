import { createRouter, createWebHashHistory, type RouteLocationGeneric, type RouteRecordRaw } from 'vue-router'

const layout = () => import('@/layout/index.vue')
const dashboard = () => import('@/views/dashboard/index.vue')
const projects = () => import('@/views/projects/index.vue')
const projectShell = () => import('@/views/project/index.vue')
const projectCanvas = () => import('@/views/project-canvas/index.vue')
const styleLibrary = () => import('@/views/style-library/index.vue')
const modulePlaceholder = () => import('@/views/module/index.vue')

export const projectModuleRoutes = [
  {
    path: 'mcp-status',
    title: 'MCP 状态台',
    description: '展示未来外部 AI 通过 MCP 读取、回写和等待确认的项目状态。',
  },
  {
    path: 'manuscript',
    title: '正文与版本',
    description: '查看章节正文、候选版本、重写条件、本地检查和定版结果。',
  },
  {
    path: 'outline',
    title: '大纲与故事线',
    description: '维护全书承诺、卷目标、故事线矿脉和章节功能契约。',
  },
  {
    path: 'context-pack',
    title: '当前写作参考',
    description: '预览外部 AI 将读取的写作参考、预算、锁定项和缺失信息。',
  },
  {
    path: 'long-state',
    title: '长篇状态',
    description: '集中查看时间、消息、压力值、破声点、关系、伏笔、代价和剧情债务。',
  },
  {
    path: 'style-dialogue',
    title: '风格与对白',
    description: '维护项目风格、角色声音画像、关系语气矩阵、好样本、坏模式和禁止项。',
  },
  {
    path: 'characters',
    title: '角色关系',
    description: '查看角色属性、知识边界、压力状态、关系图和未来走向，并回填项目内关系账本。',
  },
  {
    path: 'audit',
    title: '审稿检查',
    description: '查看本地规则检查、候选事实、审稿报告和需要用户确认的高风险变更。',
  },
  {
    path: 'snapshots',
    title: '快照导出',
    description: '查看快照、回滚依据、操作日志和正文导出预览。',
  },
  {
    path: 'overview',
    title: '项目总览',
    description: '查看当前小说的进度、风险、最近章节和长篇运营健康度。',
  },
] as const

const projectChildren: RouteRecordRaw[] = [
  {
    path: '',
    redirect: { name: 'project-canvas' },
  },
  {
    path: 'ai',
    redirect: (to: RouteLocationGeneric) => ({
      name: 'project-canvas',
      params: to.params,
      query: { ...to.query, panel: 'mcp-status' },
    }),
  },
  {
    path: 'canvas',
    name: 'project-canvas',
    component: projectCanvas,
    meta: {
      title: '小说画布',
      description: '以卷、章节、版本、任务和风险节点展示项目状态，供外部 AI 控制端读取与回填。',
    },
  },
  ...projectModuleRoutes.map((item) => ({
    path: item.path,
    name: `project-${item.path}`,
    redirect: (to: RouteLocationGeneric) => ({
      name: 'project-canvas',
      params: to.params,
      query: { ...to.query, panel: item.path },
    }),
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
          description: '管理多部小说项目；进入项目后维护 MCP 可读上下文、正文版本和长篇状态。',
        },
      },
      {
        path: 'projects/:projectId',
        component: projectShell,
        children: projectChildren,
      },
      {
        path: 'style-library',
        name: 'style-library',
        component: styleLibrary,
        meta: {
          title: '风格资产库',
          description: '维护全局风格模板；小说项目引入后会生成项目内副本，可单独修改。',
        },
      },
      {
        path: 'mcp',
        name: 'mcp',
        component: modulePlaceholder,
        meta: {
          title: 'MCP 连接',
          description: '展示未来给外部 AI 使用的本地故事资源、工具和提示流程。',
        },
      },
      {
        path: 'settings',
        name: 'settings',
        component: modulePlaceholder,
        meta: {
          title: '本地设置',
          description: '管理检查模式、本地数据、正文目录、更新下载和应用偏好。',
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
