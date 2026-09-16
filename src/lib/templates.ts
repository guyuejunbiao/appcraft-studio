import type { ThemeConfig } from './types';

/** 模板组件（id 可选，服务端补齐；需要被连接引用的组件必须显式给 id） */
export interface TplComponent {
  id?: string;
  type: string;
  props?: Record<string, any>;
}

export interface TplPage {
  key: string;
  name: string;
  isHome?: boolean;
  background?: string;
  components: TplComponent[];
}

export interface TemplateConnection {
  fromPage: string;
  fromWidget: string;
  toPage: string;
  animation?: 'slide' | 'slide-up' | 'slide-down' | 'fade' | 'push' | 'zoom' | 'none';
  /** 复合组件槽位（tabbar 第 N 个标签 / 宫格第 N 格） */
  slot?: string;
}

export interface AppTemplate {
  id: string;
  name: string;
  desc: string;
  icon: string;
  accent: string;
  gradient: string;
  pages: TplPage[];
  connections: TemplateConnection[];
}

const BG = '#f6f7fb';

export const templates: AppTemplate[] = [
  {
    id: 'blank',
    name: '空白项目',
    desc: '从零开始，自由拖拽搭建你的专属 App',
    icon: 'Sparkles',
    accent: '#f97316',
    gradient: 'from-amber-400 to-orange-500',
    pages: [{ key: 'home', name: '首页', isHome: true, background: BG, components: [] }],
    connections: [],
  },
  {
    id: 'login-demo',
    name: '登录注册 App',
    desc: '密码/短信登录、注册、第三方授权，成功后进入首页（完整闭环）',
    icon: 'LockKeyhole',
    accent: '#10b981',
    gradient: 'from-emerald-400 to-teal-500',
    pages: [
      {
        key: 'login',
        name: '登录页',
        isHome: true,
        background: BG,
        components: [
          { type: 'fn.navbar', props: { title: '登录', showBack: false } },
          { type: 'login.logo', props: { brand: '星云 App', shape: 'square', size: 64 } },
          { type: 'login.app-title' },
          { type: 'login.login-tabs' },
          { type: 'login.phone-input' },
          { type: 'login.password-input' },
          { type: 'login.sms-input' },
          { type: 'login.forgot-link', id: 'tpl_login_forgot' },
          { type: 'login.primary-btn', id: 'tpl_login_btn' },
          { type: 'login.register-btn', id: 'tpl_login_register', props: { text: '注册新账号' } },
          { type: 'login.agreement-check' },
          { type: 'login.divider' },
          { type: 'login.social-row', id: 'tpl_login_social' },
        ],
      },
      {
        key: 'sms',
        name: '短信登录',
        background: BG,
        components: [
          { type: 'fn.navbar', props: { title: '短信登录', showBack: true } },
          { type: 'login.app-title', props: { title: '验证码登录', subtitle: '未注册的手机号将自动创建账号' } },
          { type: 'login.phone-input' },
          { type: 'login.sms-input' },
          { type: 'login.primary-btn', id: 'tpl_sms_btn', props: { text: '登录 / 注册' } },
          { type: 'login.agreement-check' },
          { type: 'fn.empty-state', props: { title: '收不到验证码？', desc: '请检查短信拦截或稍后再试', btn: '联系客服' } },
        ],
      },
      {
        key: 'register',
        name: '注册页',
        background: BG,
        components: [
          { type: 'fn.navbar', props: { title: '注册账号', showBack: true } },
          { type: 'login.app-title', props: { title: '创建账号', subtitle: '加入星云，开启你的专属体验' } },
          { type: 'login.phone-input' },
          { type: 'login.sms-input' },
          { type: 'login.password-input' },
          { type: 'login.agreement-check' },
          { type: 'login.primary-btn', id: 'tpl_reg_btn', props: { text: '注 册' } },
        ],
      },
      {
        key: 'main',
        name: '首页',
        background: BG,
        components: [
          { type: 'fn.navbar', props: { title: '星云 App', showBack: false } },
          { type: 'login.app-title', props: { title: '欢迎回来', subtitle: '登录成功，开始你的专属体验' } },
          { type: 'fn.avatar-profile' },
          /* 设置分组：深色模式行已绑定「切换昼夜」，预览中点击整个 App 真实变亮/变暗 */
          {
            type: 'fn.settings-group',
            props: {
              cells: [
                { label: '开启推送通知', icon: 'bell', act: '', on: true },
                { label: '深色模式', icon: 'moon', act: 'theme', on: false },
                { label: '自动播放视频', icon: 'play', act: '', on: true },
                { label: '省流模式', icon: 'zap', act: '', on: false },
              ],
            },
          },
          { type: 'fn.list-item', props: { label: '账号与安全', value: '密码、设备管理' } },
          { type: 'fn.list-item', props: { label: '消息通知', value: '推送、免打扰' } },
          { type: 'fn.list-item', props: { label: '退出登录', value: '' } },
        ],
      },
    ],
    connections: [
      { fromPage: 'login', fromWidget: 'tpl_login_btn', toPage: 'main' },
      { fromPage: 'login', fromWidget: 'tpl_login_register', toPage: 'register' },
      { fromPage: 'login', fromWidget: 'tpl_login_forgot', toPage: 'sms' },
      { fromPage: 'login', fromWidget: 'tpl_login_social', toPage: 'main' },
      { fromPage: 'sms', fromWidget: 'tpl_sms_btn', toPage: 'main' },
      { fromPage: 'register', fromWidget: 'tpl_reg_btn', toPage: 'main' },
    ],
  },
  {
    id: 'mall-demo',
    name: '商城购物 App',
    desc: '搜索轮播、金刚区、商品流、详情加购全流程',
    icon: 'ShoppingBag',
    accent: '#f43f5e',
    gradient: 'from-rose-400 to-pink-500',
    pages: [
      {
        key: 'home',
        name: '商城首页',
        isHome: true,
        background: BG,
        components: [
          { type: 'fn.navbar', props: { title: '星云商城', showBack: false } },
          { type: 'mall.search' },
          { type: 'mall.banner', props: { title: '年中大促 · 全场 5 折起', subtitle: '百万爆款限时抢', height: 160 } },
          { type: 'mall.notice-bar', props: { text: '新用户下单立减 30 元，全场包邮（偏远地区除外）' } },
          { type: 'mall.category-grid' },
          { type: 'mall.section-header', props: { title: '猜你喜欢' } },
          { type: 'mall.product-grid', id: 'tpl_mall_grid', props: { count: 4 } },
          { type: 'fn.tabbar', props: { items: '首页,分类,购物车,我的', active: 0 } },
        ],
      },
      {
        key: 'detail',
        name: '商品详情',
        background: BG,
        components: [
          { type: 'shop.detail-hero' },
          { type: 'shop.price-row' },
          { type: 'shop.sku-select' },
          { type: 'shop.qty-stepper' },
          { type: 'shop.service-row' },
          { type: 'shop.address-bar' },
          { type: 'shop.review-item' },
          { type: 'shop.order-summary' },
          { type: 'shop.add-cart-bar' },
        ],
      },
    ],
    connections: [{ fromPage: 'home', fromWidget: 'tpl_mall_grid', toPage: 'detail', animation: 'push' }],
  },
  {
    id: 'chat-demo',
    name: '即时聊天 App',
    desc: '会话列表、消息气泡、语音、聊天输入栏，四页底部导航',
    icon: 'MessageCircle',
    accent: '#22c55e',
    gradient: 'from-green-400 to-emerald-500',
    pages: [
      {
        key: 'list',
        name: '消息列表',
        isHome: true,
        background: BG,
        components: [
          { type: 'fn.navbar', props: { title: '消息', showBack: false } },
          { type: 'chat.contact-item', id: 'tpl_chat_item1', props: { name: '产品小助手', lastMsg: '新版本交互稿我发你邮箱了', time: '10:24', unread: 3 } },
          { type: 'chat.contact-item', props: { name: '设计部·阿岚', lastMsg: '图标已更新到最新版', time: '09:41', unread: 0 } },
          { type: 'chat.contact-item', props: { name: '研发小张', lastMsg: '[语音] 18″', time: '昨天', unread: 1 } },
          { type: 'chat.contact-item', props: { name: '星云内推官', lastMsg: '恭喜获得内推资格！', time: '周二', unread: 0 } },
          { type: 'chat.tabbar', id: 'tpl_chat_tabbar_list', props: { active: 'msg' } },
        ],
      },
      {
        key: 'chat',
        name: '聊天窗口',
        background: BG,
        components: [
          { type: 'chat.header', props: { name: '产品小助手', online: true } },
          { type: 'chat.system-tip' },
          { type: 'chat.msg-left', props: { text: '新版本交互稿我发你邮箱了，重点看下登录页改版～' } },
          { type: 'chat.msg-right', props: { text: '收到！下午给你反馈 👌' } },
          { type: 'chat.msg-image', props: { caption: '登录页 v2.3' } },
          { type: 'chat.msg-voice', props: { seconds: 12, side: 'left' } },
          { type: 'chat.input-bar' },
        ],
      },
      {
        key: 'contacts',
        name: '通讯录',
        background: BG,
        components: [
          { type: 'fn.navbar', props: { title: '通讯录', showBack: false } },
          { type: 'social.user-suggest', props: { users: '林小满,阿岚,陈默' } },
          { type: 'social.fan-row', props: { name: '周叙', bio: '交互设计师 · 分享日常', followBack: false } },
          { type: 'social.fan-row', props: { name: '苏叶', bio: '前端工程师 · 咖啡爱好者', followBack: true } },
          { type: 'chat.tabbar', id: 'tpl_chat_tabbar_contacts', props: { active: 'contacts' } },
        ],
      },
      {
        key: 'discover',
        name: '发现',
        background: BG,
        components: [
          { type: 'fn.navbar', props: { title: '发现', showBack: false } },
          { type: 'social.topic-wall', props: { topics: '深夜代码,今天穿什么,健身打卡,周末去哪儿' } },
          { type: 'social.rank-list' },
          { type: 'chat.tabbar', id: 'tpl_chat_tabbar_discover', props: { active: 'discover' } },
        ],
      },
      {
        key: 'me',
        name: '我的',
        background: BG,
        components: [
          { type: 'fn.navbar', props: { title: '我的', showBack: false } },
          { type: 'fn.avatar-profile', props: { name: '云间漫步者', uid: 'ID 82390112', vip: true } },
          { type: 'me.order-grid', props: { labels: '待付款,待发货,待收货,评价', badges: '1,0,2,0' } },
          { type: 'me.theme-row' },
          { type: 'chat.tabbar', id: 'tpl_chat_tabbar_me', props: { active: 'me' } },
        ],
      },
    ],
    connections: [
      { fromPage: 'list', fromWidget: 'tpl_chat_item1', toPage: 'chat' },
      /* 底部导航逐标签换根跳页（每页的 tabbar 都绑全套，真实 App 多页互切） */
      ...(['list', 'contacts', 'discover', 'me'] as const).flatMap((from) => [
        { fromPage: from, fromWidget: `tpl_chat_tabbar_${from}`, toPage: 'list', slot: 'msg', animation: 'fade' as const },
        { fromPage: from, fromWidget: `tpl_chat_tabbar_${from}`, toPage: 'contacts', slot: 'contacts', animation: 'fade' as const },
        { fromPage: from, fromWidget: `tpl_chat_tabbar_${from}`, toPage: 'discover', slot: 'discover', animation: 'fade' as const },
        { fromPage: from, fromWidget: `tpl_chat_tabbar_${from}`, toPage: 'me', slot: 'me', animation: 'fade' as const },
      ]),
    ],
  },
  {
    id: 'food-demo',
    name: '外卖点餐 App',
    desc: '店铺头、菜单分类、购物车、订单状态',
    icon: 'UtensilsCrossed',
    accent: '#f59e0b',
    gradient: 'from-orange-400 to-amber-500',
    pages: [
      {
        key: 'order',
        name: '点餐页',
        isHome: true,
        background: BG,
        components: [
          { type: 'fn.navbar', props: { title: '外卖点餐', showBack: false } },
          { type: 'food.banner', props: { name: '星云私厨 · 招牌菜', sales: '月售 3280', fee: '配送 ¥3 · 30分钟', notice: '本店支持免预约自取，满 30 减 8' } },
          { type: 'food.coupon-row' },
          { type: 'food.category-sidebar' },
          { type: 'food.dish-card', props: { name: '招牌麻辣香锅', desc: '精选牛蛙+虾滑+时蔬，微辣邪教', price: 42, sales: '月售 866 · 好评 98%' } },
          { type: 'food.dish-card', props: { name: '黑椒牛柳意面', desc: '手工现做，酱汁浓郁', price: 32, sales: '月售 512 · 好评 97%' } },
          { type: 'food.cart-bar', id: 'tpl_food_cart', props: { total: 74, fee: 3 } },
        ],
      },
      {
        key: 'status',
        name: '订单跟踪',
        background: BG,
        components: [
          { type: 'fn.navbar', props: { title: '订单跟踪', showBack: true } },
          { type: 'food.order-status', props: { status: '配送中', rider: '骑手·王师傅' } },
          { type: 'shop.order-summary' },
          { type: 'food.table-head', props: { no: 66, queue: 3 } },
          { type: 'food.rate-tags' },
        ],
      },
    ],
    connections: [{ fromPage: 'order', fromWidget: 'tpl_food_cart', toPage: 'status', animation: 'push' }],
  },
  {
    id: 'tool-demo',
    name: '效率工具 App',
    desc: '个人中心、统计卡、天气、目标进度',
    icon: 'LayoutGrid',
    accent: '#8b5cf6',
    gradient: 'from-violet-400 to-purple-500',
    pages: [
      {
        key: 'home',
        name: '我的主页',
        isHome: true,
        background: BG,
        components: [
          { type: 'fn.avatar-profile', props: { name: '星云旅人', uid: 'ID 88823666', vip: true } },
          { type: 'me.assets-row' },
          { type: 'me.order-grid' },
          { type: 'me.service-grid' },
          /* 昼夜切换行：预览中点击开关，整个 App 真实切换白天/黑夜场景 */
          { type: 'me.theme-row' },
          { type: 'fn.weather-card', props: { city: '上海 · 浦东', temp: 26, desc: '多云转晴', date: '10月24日 周五' } },
          { type: 'fn.progress-card', props: { title: '本月阅读目标', percent: 72, sub: '已读 18 / 25 本' } },
          { type: 'fn.tabbar', props: { items: '首页,目标,社区,我的', active: 3 } },
        ],
      },
    ],
    connections: [],
  },
];

export function getTemplate(id: string): AppTemplate | undefined {
  return templates.find((t) => t.id === id);
}

export const DEFAULT_THEME: ThemeConfig = {
  primary: '#f97316',
  radius: 'md',
  dark: false,
};
