import type { PresetDef } from './types';
import { p } from './types';

/**
 * profile 类目精选预设（90 个）：覆盖 13 个个人中心基础组件。
 * 场景分配：电商个人中心 / 内容社区 / 金融钱包 / 教育学习 / 会员等级 / 签到积分 / 生活服务。
 * 注意：me.* 基础组件的类目是 profile，p() 前缀推导为 'me'，因此全部显式传入 category。
 */
export const profilePresets: PresetDef[] = [
  // —— me.member-card 会员卡（8）——
  p('me.member-card', '视频黄金会员卡', { name: '陈小满', level: '黄金VIP · 年卡', expire: '2026-03-21 到期', style: 'gold' }, ['会员', '视频', 'VIP'], 'profile'),
  p('me.member-card', '音乐豪华会员卡', { name: '苏一然', level: '豪华VIP · 连续包年', expire: '2026-07-02 到期', style: 'purple' }, ['会员', '音乐', 'VIP'], 'profile'),
  p('me.member-card', '电商 PLUS 会员卡', { name: '何雨桐', level: '会员PLUS · 全年包邮', expire: '2026-05-15 到期', style: 'gold' }, ['会员', '电商', 'PLUS'], 'profile'),
  p('me.member-card', '外卖吃货会员卡', { name: '周予安', level: '超级吃货卡 · 月卡', expire: '2025-12-08 到期', style: 'purple' }, ['会员', '外卖', '吃货卡'], 'profile'),
  p('me.member-card', '网盘超级会员卡', { name: '郑北', level: '超级会员 SVIP', expire: '2026-01-30 到期', style: 'gold' }, ['会员', '网盘', 'SVIP'], 'profile'),
  p('me.member-card', '阅读会员卡', { name: '江晚吟', level: '阅读会员 · 连续包月', expire: '2025-11-18 到期', style: 'purple' }, ['会员', '阅读', '书城'], 'profile'),
  p('me.member-card', '健身房年卡会员卡', { name: '高远', level: '铂金年卡 · 全门店通用', expire: '2026-10-01 到期', style: 'gold' }, ['会员', '健身', '年卡'], 'profile'),
  p('me.member-card', '学习 VIP 会员卡', { name: '顾星野', level: '学习VIP · 考研季卡', expire: '2026-06-20 到期', style: 'purple' }, ['会员', '学习', '考研'], 'profile'),

  // —— me.wallet-card 钱包卡（8）——
  p('me.wallet-card', '零钱钱包卡', { balance: '12,860.50', withdraw: '提现', recharge: '充值' }, ['钱包', '零钱', '余额'], 'profile'),
  p('me.wallet-card', '红包钱包卡', { balance: '328.00', withdraw: '去使用', recharge: '提现' }, ['钱包', '红包', '优惠'], 'profile'),
  p('me.wallet-card', '基金钱包卡', { balance: '46,235.18', withdraw: '赎回', recharge: '买入' }, ['钱包', '基金', '理财'], 'profile'),
  p('me.wallet-card', '金币钱包卡', { balance: '8,640', withdraw: '去兑换', recharge: '做任务赚金币' }, ['钱包', '金币', '兑换'], 'profile'),
  p('me.wallet-card', '话费余额卡', { balance: '86.40', withdraw: '查详单', recharge: '去充值' }, ['钱包', '话费', '充值'], 'profile'),
  p('me.wallet-card', '油卡余额卡', { balance: '1,200.00', withdraw: '查消费', recharge: '去充值' }, ['钱包', '加油卡', '充值'], 'profile'),
  p('me.wallet-card', '公交卡余额卡', { balance: '56.50', withdraw: '查乘车记录', recharge: '去充值' }, ['钱包', '公交卡', '通勤'], 'profile'),
  p('me.wallet-card', '校园卡余额卡', { balance: '238.60', withdraw: '查消费明细', recharge: '去充值' }, ['钱包', '校园卡', '学生'], 'profile'),

  // —— me.order-grid 订单宫格（14）——
  p('me.order-grid', '电商订单四格', { cells: [
    { label: '待付款', icon: 'credit-card', act: '', badge: '2' },
    { label: '待发货', icon: 'package', act: '' },
    { label: '待收货', icon: 'truck', act: '', badge: '1' },
    { label: '评价', icon: 'star', act: '' },
  ] }, ['电商', '订单', '个人中心'], 'profile'),
  p('me.order-grid', '外卖订单三格', { cells: [
    { label: '待支付', icon: 'credit-card', act: '', badge: '1' },
    { label: '待取送', icon: 'utensils-crossed', act: '', badge: '1' },
    { label: '待评价', icon: 'star', act: '' },
  ] }, ['外卖', '订单', '点餐'], 'profile'),
  p('me.order-grid', '课程订单四格', { cells: [
    { label: '待开课', icon: 'play', act: '', badge: '1' },
    { label: '直播中', icon: 'video', act: '' },
    { label: '待回放', icon: 'clapperboard', act: '' },
    { label: '已结课', icon: 'circle-check', act: '' },
  ] }, ['课程', '订单', '教育'], 'profile'),
  p('me.order-grid', '机票酒店订单格', { cells: [
    { label: '待出行', icon: 'plane', act: '', badge: '1' },
    { label: '待入住', icon: 'home', act: '' },
    { label: '待点评', icon: 'star', act: '' },
    { label: '退改签', icon: 'receipt-text', act: '' },
  ] }, ['旅行', '订单', '机票酒店'], 'profile'),
  p('me.order-grid', '家政服务订单格', { cells: [
    { label: '待上门', icon: 'clock', act: '', badge: '1' },
    { label: '服务中', icon: 'bell', act: '' },
    { label: '待验收', icon: 'circle-check', act: '' },
    { label: '待评价', icon: 'star', act: '' },
  ] }, ['家政', '订单', '上门服务'], 'profile'),
  p('me.order-grid', '宠物服务订单格', { cells: [
    { label: '待到店', icon: 'heart', act: '', badge: '1' },
    { label: '洗护中', icon: 'droplets', act: '' },
    { label: '寄养中', icon: 'home', act: '' },
    { label: '待评价', icon: 'star', act: '' },
  ] }, ['宠物', '订单', '洗护'], 'profile'),
  p('me.order-grid', '租车订单格', { cells: [
    { label: '待取车', icon: 'car', act: '', badge: '1' },
    { label: '用车中', icon: 'map-pin', act: '' },
    { label: '待还车', icon: 'clock', act: '' },
    { label: '已完成', icon: 'circle-check', act: '' },
  ] }, ['租车', '订单', '出行'], 'profile'),
  p('me.order-grid', '电影票订单格', { cells: [
    { label: '待取票', icon: 'ticket', act: '', badge: '2' },
    { label: '待开场', icon: 'clock', act: '' },
    { label: '已观看', icon: 'play', act: '' },
    { label: '退改签', icon: 'receipt-text', act: '' },
  ] }, ['电影', '订单', '购票'], 'profile'),
  p('me.order-grid', '约拍订单格', { cells: [
    { label: '待沟通', icon: 'message-circle', act: '', badge: '1' },
    { label: '待拍摄', icon: 'camera', act: '' },
    { label: '修图中', icon: 'image', act: '' },
    { label: '待交付', icon: 'download', act: '' },
  ] }, ['约拍', '订单', '摄影'], 'profile'),
  p('me.order-grid', '维修订单格', { cells: [
    { label: '待报价', icon: 'receipt-text', act: '', badge: '1' },
    { label: '维修中', icon: 'settings', act: '' },
    { label: '待验收', icon: 'circle-check', act: '' },
    { label: '已完成', icon: 'star', act: '' },
  ] }, ['维修', '订单', '上门'], 'profile'),
  p('me.order-grid', '洗衣订单格', { cells: [
    { label: '待取件', icon: 'package', act: '', badge: '1' },
    { label: '清洗中', icon: 'droplets', act: '' },
    { label: '配送中', icon: 'truck', act: '' },
    { label: '待取衣', icon: 'store', act: '' },
  ] }, ['洗衣', '订单', '生活服务'], 'profile'),
  p('me.order-grid', '搬家订单格', { cells: [
    { label: '待评估', icon: 'map-pin', act: '', badge: '1' },
    { label: '已预约', icon: 'calendar', act: '' },
    { label: '搬运中', icon: 'truck', act: '' },
    { label: '待支付', icon: 'credit-card', act: '' },
  ] }, ['搬家', '订单', '生活服务'], 'profile'),
  p('me.order-grid', '二手交易订单格', { cells: [
    { label: '我卖出的', icon: 'tag', act: '', badge: '1' },
    { label: '我买到的', icon: 'shopping-bag', act: '' },
    { label: '待收货', icon: 'truck', act: '' },
    { label: '待评价', icon: 'star', act: '' },
  ] }, ['二手', '订单', '闲置'], 'profile'),
  p('me.order-grid', '团购核销订单格', { cells: [
    { label: '待核销', icon: 'ticket', act: '', badge: '2' },
    { label: '待消费', icon: 'qr-code', act: '' },
    { label: '已完成', icon: 'circle-check', act: '' },
    { label: '退款售后', icon: 'receipt-text', act: '' },
  ] }, ['团购', '订单', '核销'], 'profile'),

  // —— me.assets-row 资产三栏（6，栏目标签固定为 余额/优惠券/积分，仅数字语义差异化）——
  p('me.assets-row', '我的资产概览', { balance: '2,458.20', coupon: '8', points: '3,260' }, ['资产', '余额', '个人中心'], 'profile'),
  p('me.assets-row', '大促回血资产概览', { balance: '128.00', coupon: '16', points: '9,800' }, ['资产', '大促', '优惠券'], 'profile'),
  p('me.assets-row', '会员资产概览', { balance: '6,880.00', coupon: '22', points: '21,360' }, ['资产', '会员', '积分'], 'profile'),
  p('me.assets-row', '新人资产概览', { balance: '66.60', coupon: '5', points: '600' }, ['资产', '新人', '礼包'], 'profile'),
  p('me.assets-row', '年度账单资产概览', { balance: '32,109.60', coupon: '3', points: '68,900' }, ['资产', '年度账单', '积分'], 'profile'),
  p('me.assets-row', '小店资产概览', { balance: '942.35', coupon: '2', points: '1,250' }, ['资产', '小店', '经营'], 'profile'),

  // —— me.sign-in-card 签到卡（6）——
  p('me.sign-in-card', '每日签到卡', { title: '每日签到', days: 3, signed: false }, ['签到', '积分', '每日'], 'profile'),
  p('me.sign-in-card', '全勤打卡签到卡', { title: '连续打卡', days: 7, signed: true }, ['签到', '全勤', '连续打卡'], 'profile'),
  p('me.sign-in-card', '学习签到卡', { title: '学习打卡', days: 5, signed: false }, ['签到', '学习', '自习'], 'profile'),
  p('me.sign-in-card', '健身签到卡', { title: '健身打卡', days: 6, signed: true }, ['签到', '健身', '打卡'], 'profile'),
  p('me.sign-in-card', '阅读签到卡', { title: '阅读打卡', days: 4, signed: false }, ['签到', '阅读', '打卡'], 'profile'),
  p('me.sign-in-card', '早起签到卡', { title: '早起打卡', days: 2, signed: false }, ['签到', '早起', '自律'], 'profile'),

  // —— me.points-mall 积分卡（8）——
  p('me.points-mall', '积分商城卡', { points: '8,640', btnText: '去兑换', items: '保温杯 500,帆布袋 199' }, ['积分', '商城', '兑换'], 'profile'),
  p('me.points-mall', '金币商城卡', { points: '2,300', btnText: '去兑换', items: '视频会员周卡 1500,外卖红包5元券 300' }, ['金币', '兑换', '会员'], 'profile'),
  p('me.points-mall', '里程商城卡', { points: '12,600', btnText: '去兑换', items: '国内机票代金券 8000,贵宾休息室 5000' }, ['里程', '兑换', '旅行'], 'profile'),
  p('me.points-mall', '能量商城卡', { points: '4,580', btnText: '去兑换', items: '种下一棵梭梭树 1790,能量保护罩 980' }, ['能量', '公益', '种树'], 'profile'),
  p('me.points-mall', '成长值权益卡', { points: '3,860', btnText: '看权益', items: '免邮券 300,专属客服 500' }, ['成长值', '权益', '等级'], 'profile'),
  p('me.points-mall', '钻石商城卡', { points: '1,280', btnText: '去兑换', items: '头像挂件 200,直播间礼物券 800' }, ['钻石', '兑换', '直播'], 'profile'),
  p('me.points-mall', '星星兑换卡', { points: '4,200', btnText: '去兑换', items: '咖啡中杯券 3500,周边徽章 700' }, ['星星', '兑换', '咖啡'], 'profile'),
  p('me.points-mall', '淘金币抵扣卡', { points: '18,640', btnText: '去抵扣', items: '全场购物金 1000,免单抽奖券 500' }, ['淘金币', '抵扣', '购物'], 'profile'),

  // —— me.service-grid 服务宫格（10）——
  p('me.service-grid', '电商常用服务八格', { cells: [
    { label: '收货地址', icon: 'map-pin', act: '' },
    { label: '官方客服', icon: 'headphones', act: '' },
    { label: '我的收藏', icon: 'heart', act: '' },
    { label: '浏览足迹', icon: 'compass', act: '' },
    { label: '优惠券', icon: 'ticket', act: '' },
    { label: '帮助中心', icon: 'circle-help', act: '' },
    { label: '设置', icon: 'settings', act: '' },
    { label: '更多', icon: 'list', act: '' },
  ] }, ['电商', '服务', '个人中心'], 'profile'),
  p('me.service-grid', '创作者服务八格', { cells: [
    { label: '我的作品', icon: 'image', act: '' },
    { label: '数据中心', icon: 'trending-up', act: '' },
    { label: '收益提现', icon: 'wallet', act: '' },
    { label: '评论管理', icon: 'message-circle', act: '' },
    { label: '粉丝画像', icon: 'users', act: '' },
    { label: '素材库', icon: 'folder', act: '' },
    { label: '发布日程', icon: 'calendar', act: '' },
    { label: '帮助中心', icon: 'circle-help', act: '' },
  ] }, ['创作者', '服务', '自媒体'], 'profile'),
  p('me.service-grid', '金融服务八格', { cells: [
    { label: '银行卡', icon: 'credit-card', act: '' },
    { label: '账单明细', icon: 'receipt-text', act: '' },
    { label: '理财', icon: 'trending-up', act: '' },
    { label: '分期', icon: 'tag', act: '' },
    { label: '交易记录', icon: 'receipt', act: '' },
    { label: '帮助中心', icon: 'circle-help', act: '' },
    { label: '设置', icon: 'settings', act: '' },
    { label: '更多', icon: 'list', act: '' },
  ] }, ['金融', '服务', '理财'], 'profile'),
  p('me.service-grid', '学习服务八格', { cells: [
    { label: '我的课程', icon: 'book-open', act: '' },
    { label: '学习报告', icon: 'receipt-text', act: '' },
    { label: '错题本', icon: 'file-text', act: '' },
    { label: '我的证书', icon: 'trophy', act: '' },
    { label: '作业日历', icon: 'calendar', act: '' },
    { label: '在线答疑', icon: 'message-circle', act: '' },
    { label: '设置', icon: 'settings', act: '' },
    { label: '帮助中心', icon: 'circle-help', act: '' },
  ] }, ['学习', '服务', '教育'], 'profile'),
  p('me.service-grid', '生活服务八格', { cells: [
    { label: '水电缴费', icon: 'receipt', act: '' },
    { label: '话费充值', icon: 'wallet', act: '' },
    { label: '快递查询', icon: 'package', act: '' },
    { label: '打车出行', icon: 'car', act: '' },
    { label: '点外卖', icon: 'utensils-crossed', act: '' },
    { label: '电影票', icon: 'ticket', act: '' },
    { label: '旅行机票', icon: 'plane', act: '' },
    { label: '更多服务', icon: 'list', act: '' },
  ] }, ['生活', '服务', '便民'], 'profile'),
  p('me.service-grid', '出行服务八格', { cells: [
    { label: '打车', icon: 'car', act: '' },
    { label: '机票', icon: 'plane', act: '' },
    { label: '火车票', icon: 'ticket', act: '' },
    { label: '酒店', icon: 'home', act: '' },
    { label: '顺风车', icon: 'users', act: '' },
    { label: '我的行程', icon: 'calendar', act: '' },
    { label: '报销凭证', icon: 'receipt-text', act: '' },
    { label: '客服', icon: 'headphones', act: '' },
  ] }, ['出行', '服务', '打车'], 'profile'),
  p('me.service-grid', '医疗健康服务八格', { cells: [
    { label: '在线问诊', icon: 'stethoscope', act: '' },
    { label: '预约挂号', icon: 'calendar', act: '' },
    { label: '送药上门', icon: 'pill', act: '' },
    { label: '查报告', icon: 'file-text', act: '' },
    { label: '疫苗提醒', icon: 'bell', act: '' },
    { label: '健康档案', icon: 'folder', act: '' },
    { label: '家人管理', icon: 'users', act: '' },
    { label: '客服', icon: 'headphones', act: '' },
  ] }, ['医疗', '服务', '健康'], 'profile'),
  p('me.service-grid', '企业版服务八格', { cells: [
    { label: '团队管理', icon: 'users', act: '' },
    { label: '审批', icon: 'file-text', act: '' },
    { label: '报销', icon: 'wallet', act: '' },
    { label: '会议', icon: 'video', act: '' },
    { label: '日程', icon: 'calendar', act: '' },
    { label: '云文档', icon: 'folder', act: '' },
    { label: '管理后台', icon: 'settings', act: '' },
    { label: '专属客服', icon: 'headphones', act: '' },
  ] }, ['企业', '服务', '办公'], 'profile'),
  p('me.service-grid', '开发者服务八格', { cells: [
    { label: '控制台', icon: 'settings', act: '' },
    { label: 'API 文档', icon: 'file-text', act: '' },
    { label: '密钥管理', icon: 'qr-code', act: '' },
    { label: '用量统计', icon: 'receipt-text', act: '' },
    { label: '工单', icon: 'message-circle', act: '' },
    { label: '运行日志', icon: 'list', act: '' },
    { label: '账单', icon: 'credit-card', act: '' },
    { label: '开发者社区', icon: 'users', act: '' },
  ] }, ['开发者', '服务', '技术'], 'profile'),
  p('me.service-grid', '客服帮助八格', { cells: [
    { label: '在线客服', icon: 'headphones', act: '' },
    { label: '常见问题', icon: 'circle-help', act: '' },
    { label: '意见反馈', icon: 'file-text', act: '' },
    { label: '投诉建议', icon: 'message-circle', act: '' },
    { label: '规则中心', icon: 'book-open', act: '' },
    { label: '账号安全', icon: 'settings', act: '' },
    { label: '隐私政策', icon: 'receipt-text', act: '' },
    { label: '版本更新', icon: 'download', act: '' },
  ] }, ['客服', '帮助', '售后'], 'profile'),

  // —— me.theme-row 昼夜切换行（6）——
  p('me.theme-row', '深色模式行', { label: '深色模式', desc: '点击切换夜间场景' }, ['设置', '深色', '夜间'], 'profile'),
  p('me.theme-row', '夜间护眼行', { label: '夜间护眼', desc: '暖色纸感屏，睡前刷更舒服' }, ['设置', '护眼', '夜间'], 'profile'),
  p('me.theme-row', '省电模式行', { label: '省电模式', desc: '降低亮度与动效，延长续航' }, ['设置', '省电', '续航'], 'profile'),
  p('me.theme-row', '青少年模式行', { label: '青少年模式', desc: '内容过滤 + 使用时长保护' }, ['设置', '青少年', '守护'], 'profile'),
  p('me.theme-row', '长辈模式行', { label: '长辈模式', desc: '更大字体、更简单的页面' }, ['设置', '长辈', '大字'], 'profile'),
  p('me.theme-row', '无障碍模式行', { label: '无障碍模式', desc: '语音读屏与高对比度显示' }, ['设置', '无障碍', '读屏'], 'profile'),

  // —— me.about-head 关于页头（6）——
  p('me.about-head', '个人主页头', { appName: '陈小满', version: 'ID: 20250116', slogan: '把日子过成喜欢的样子' }, ['主页', '个人', '简介'], 'profile'),
  p('me.about-head', '创作者主页头', { appName: '山野食记', version: '美食领域创作者', slogan: '用镜头记录山野好味' }, ['创作者', '主页', '认证'], 'profile'),
  p('me.about-head', '企业主页头', { appName: '云帆科技', version: 'v3.1.0', slogan: '让每个团队高效协作' }, ['企业', '主页', '品牌'], 'profile'),
  p('me.about-head', '宠物档案头', { appName: '团子', version: '美短 · 2 岁', slogan: '干饭睡觉踩奶三件套' }, ['宠物', '档案', '萌宠'], 'profile'),
  p('me.about-head', '宝宝主页头', { appName: '小汤圆', version: '出生 218 天', slogan: '每一天都是新发现' }, ['宝宝', '成长', '记录'], 'profile'),
  p('me.about-head', '书房主页头', { appName: '晚风书房', version: '藏书 268 本', slogan: '睡前一小时，只留给书' }, ['书房', '阅读', '藏书'], 'profile'),

  // —— me.version-card 版本信息卡（5）——
  p('me.version-card', '检查更新卡', { version: 'v1.0.0', btnText: '检查更新', hasNew: true }, ['版本', '更新', '关于'], 'profile'),
  p('me.version-card', '已是最新版本卡', { version: 'v2.4.1', btnText: '检查更新', hasNew: false }, ['版本', '更新', '最新'], 'profile'),
  p('me.version-card', '新版本升级卡', { version: 'v2.3.0', btnText: '升级到 2.4.0', hasNew: true }, ['版本', '升级', '新功能'], 'profile'),
  p('me.version-card', '内测版体验卡', { version: 'v0.9.5-beta', btnText: '更新内测版', hasNew: true }, ['版本', '内测', '尝鲜'], 'profile'),
  p('me.version-card', '企业版更新卡', { version: '企业版 v5.2.0', btnText: '检查更新', hasNew: false }, ['版本', '企业版', '更新'], 'profile'),

  // —— me.vip-banner 会员横幅（6）——
  p('me.vip-banner', '开通会员横幅', { title: '开通会员享 8 大权益', sub: '专属折扣 · 免费包邮 · 专属客服', btnText: '立即开通', style: 'gold' }, ['会员', '开通', '权益'], 'profile'),
  p('me.vip-banner', '会员续费横幅', { title: '会员 15 天后到期', sub: '续费立减 20 元，权益不间断', btnText: '立即续费', style: 'primary' }, ['会员', '续费', '到期'], 'profile'),
  p('me.vip-banner', '学生特惠横幅', { title: '学生专享 5 折', sub: '认证学生身份，半价享全部权益', btnText: '立即认证', style: 'gold' }, ['会员', '学生', '特惠'], 'profile'),
  p('me.vip-banner', '家庭会员横幅', { title: '家庭会员一个价', sub: '最多 4 人共享，各自独立空间', btnText: '开家庭版', style: 'primary' }, ['会员', '家庭', '共享'], 'profile'),
  p('me.vip-banner', '年卡五折横幅', { title: '年卡限时 5 折', sub: '仅剩最后 3 天，错过再等一年', btnText: '抢购年卡', style: 'gold' }, ['会员', '年卡', '限时'], 'profile'),
  p('me.vip-banner', '首月一元横幅', { title: '首月仅 1 元', sub: '新用户专享，次月可随时取消', btnText: '1 元尝鲜', style: 'primary' }, ['会员', '首月', '新用户'], 'profile'),

  // —— me.achievement-badge 成就墙（5）——
  p('me.achievement-badge', '运动成就墙', { title: '运动成就', unlocked: 3, items: '首次五公里 2025-03-12,百公里跑者 2025-06-08,全勤30天 2025-09-20,马拉松完赛 待解锁' }, ['成就', '运动', '徽章'], 'profile'),
  p('me.achievement-badge', '学习成就墙', { title: '学习成就', unlocked: 2, items: '七日学习打卡 2025-05-02,连续30天自习 2025-08-11,考证达人 待解锁,全勤学霸 待解锁' }, ['成就', '学习', '徽章'], 'profile'),
  p('me.achievement-badge', '消费成就墙', { title: '消费成就', unlocked: 4, items: '首单达成 2025-01-20,月度省钱王 2025-07-05,百单达人 2025-09-30,黑卡会员 2025-11-01' }, ['成就', '消费', '徽章'], 'profile'),
  p('me.achievement-badge', '创作成就墙', { title: '创作成就', unlocked: 1, items: '首篇爆款 2025-04-18,千粉达成 待解锁,万粉达成 待解锁,年度作者 待解锁' }, ['成就', '创作', '徽章'], 'profile'),
  p('me.achievement-badge', '公益成就墙', { title: '公益成就', unlocked: 3, items: '首次捐赠 2025-02-14,种下梭梭树 2025-05-21,无偿献血 2025-08-30,公益100小时 待解锁' }, ['成就', '公益', '徽章'], 'profile'),

  // —— me.logout-btn 退出按钮（2）——
  p('me.logout-btn', '退出登录按钮', { text: '退出登录' }, ['退出', '账号', '安全'], 'profile'),
  p('me.logout-btn', '切换账号按钮', { text: '切换账号' }, ['账号', '切换', '登录'], 'profile'),
];
