import { LockKeyhole, ShoppingBag, ShoppingCart, MessageCircle, UtensilsCrossed, LayoutGrid,
  Users, PlayCircle, Newspaper, ChartColumn, CircleUserRound, Dumbbell, Pointer } from 'lucide-react';
import type { WidgetDef, CategoryMeta } from '@/lib/widget-types';
import { widgets as loginWidgets } from './login';
import { widgets as mallWidgets } from './mall';
import { widgets as shoppingWidgets } from './shopping';
import { widgets as chatWidgets } from './chat';
import { widgets as foodWidgets } from './food';
import { widgets as functionalWidgets } from './functional';
import { widgets as buttonWidgets } from './buttons';
import { widgets as socialWidgets } from './social';
import { widgets as mediaWidgets } from './media';
import { widgets as newsWidgets } from './news';
import { widgets as chartsWidgets } from './charts';
import { widgets as profileWidgets } from './profile';
import { widgets as fitnessWidgets } from './fitness';

export const categories: CategoryMeta[] = [
  { id: 'login', name: '登录 / 注册', desc: '手机号、密码、验证码、第三方登录…', icon: LockKeyhole },
  { id: 'mall', name: '商城首页', desc: '搜索、轮播、金刚区、商品卡片…', icon: ShoppingBag },
  { id: 'shopping', name: '购物 / 商品详情', desc: '主图、SKU、加购、评价、订单…', icon: ShoppingCart },
  { id: 'chat', name: '即时聊天', desc: '会话列表、气泡、语音、输入栏…', icon: MessageCircle },
  { id: 'food', name: '外卖点餐', desc: '店铺头、菜单、购物车、订单状态…', icon: UtensilsCrossed },
  { id: 'social', name: '社区 / 内容', desc: '动态、九宫格、榜单、直播、评论…', icon: Users },
  { id: 'media', name: '影音 / 阅读', desc: '播放器、歌单、电台、书城、章节…', icon: PlayCircle },
  { id: 'news', name: '资讯 / 新闻', desc: '头条、频道、快讯、热点榜、订阅…', icon: Newspaper },
  { id: 'charts', name: '数据图表', desc: '柱状、折线、饼图、热力、仪表盘…', icon: ChartColumn },
  { id: 'profile', name: '个人中心', desc: '会员、钱包、订单宫格、签到、设置…', icon: CircleUserRound },
  { id: 'fitness', name: '健康运动', desc: '运动圆环、步数、喝水打卡、训练计划…', icon: Dumbbell },
  { id: 'functional', name: '功能通用', desc: '导航、按钮、表单、卡片、底部栏…', icon: LayoutGrid },
  { id: 'buttons', name: '功能按钮', desc: '返回、确认取消、点赞、分享、关闭、危险操作…', icon: Pointer },
];

export const allWidgets: WidgetDef[] = [
  ...loginWidgets,
  ...mallWidgets,
  ...shoppingWidgets,
  ...chatWidgets,
  ...foodWidgets,
  ...socialWidgets,
  ...mediaWidgets,
  ...newsWidgets,
  ...chartsWidgets,
  ...profileWidgets,
  ...fitnessWidgets,
  ...functionalWidgets,
  ...buttonWidgets,
];

export function getWidget(type: string): WidgetDef | undefined {
  return allWidgets.find((w) => w.type === type);
}

export function widgetsByCategory(cat: CategoryMeta['id']): WidgetDef[] {
  return allWidgets.filter((w) => w.category === cat);
}
