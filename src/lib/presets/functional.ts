import type { PresetDef } from './types';
import { p } from './types';

/**
 * functional（功能通用）类目精选预设：160 个
 * props 字段与 src/components/widgets/functional.tsx 的 defaultProps/fields 严格对齐：
 * - fn.big-button: text / style(primary|outline|ghost) / radius(full|normal)
 * - fn.list-item: label / value
 * - fn.navbar: title / showBack
 * - fn.settings-group: cells（{ label, icon(APP_ICONS name), act(''|theme|toast), on }）
 * - fn.stat-card: items（'值 标签' 逗号分隔，值内禁逗号）
 * - fn.weather-card: city / date / temp / desc（desc 含 夜/晚/月 显示月亮）
 * - fn.progress-card: title / percent / sub
 * - fn.tabbar: items(逗号分隔) / active / channel
 * - fn.empty-state: title / desc / btn
 * - fn.video-card: title / duration / views
 * - fn.fab: icon(plus|edit|camera|message)
 * - fn.avatar-profile: name / uid / vip
 * - fn.faq: items(每行一问) / answer
 * - fn.countdown: title / sub / days / hours / mins
 * - fn.ranking: title / items(每行'名字 值') / unit
 * - fn.qrcode: title / sub / seed
 * - fn.calendar: month('YYYY年M月') / today / start
 * - fn.text-block: title / content
 * - fn.image-block: height / label
 * - fn.input-field: label / placeholder
 * - fn.spacer: height / hint
 */

/** functional 类目精选预设 */
export const functionalPresets: PresetDef[] = [
  /* ---------------- fn.big-button 主按钮（17） ---------------- */
  p('fn.big-button', '立即购买大按钮', { text: '立即购买', style: 'primary', radius: 'full' }, ['电商', '购买', '下单', '结算']),
  p('fn.big-button', '预约到店按钮', { text: '预约到店', style: 'primary', radius: 'full' }, ['餐饮', '预约', '到店', '门店']),
  p('fn.big-button', '每日签到领积分按钮', { text: '签到领积分', style: 'primary', radius: 'full' }, ['签到', '积分', '每日', '会员']),
  p('fn.big-button', '秒杀抢购按钮', { text: '立即抢购', style: 'primary', radius: 'full' }, ['秒杀', '抢购', '促销', '限时']),
  p('fn.big-button', '分享好友按钮', { text: '分享给好友', style: 'outline', radius: 'full' }, ['分享', '邀请', '裂变', '社交']),
  p('fn.big-button', '余额充值按钮', { text: '立即充值', style: 'primary', radius: 'full' }, ['充值', '余额', '钱包', '金融']),
  p('fn.big-button', '提交订单按钮', { text: '提交订单', style: 'primary', radius: 'normal' }, ['提交', '订单', '确认', '生鲜']),
  p('fn.big-button', '搜索一下按钮', { text: '搜索一下', style: 'outline', radius: 'full' }, ['搜索', '查找', '工具']),
  p('fn.big-button', '确认支付按钮', { text: '确认支付 ¥58.00', style: 'primary', radius: 'full' }, ['支付', '收银台', '金额']),
  p('fn.big-button', '呼叫商家按钮', { text: '呼叫商家', style: 'outline', radius: 'full' }, ['电话', '联系', '客服', '本地服务']),
  p('fn.big-button', '收藏宝贝按钮', { text: '收藏宝贝', style: 'ghost', radius: 'full' }, ['收藏', '喜欢', '电商']),
  p('fn.big-button', '关注TA按钮', { text: '+ 关注', style: 'outline', radius: 'full' }, ['关注', '粉丝', '社交', '社区']),
  p('fn.big-button', '下载安装按钮', { text: '立即下载', style: 'primary', radius: 'full' }, ['下载', '安装', '应用', '工具']),
  p('fn.big-button', '发布求购按钮', { text: '发布求购', style: 'primary', radius: 'normal' }, ['求购', '发布', '二手', '闲置']),
  p('fn.big-button', '会员续费按钮', { text: '立即续费', style: 'primary', radius: 'full' }, ['续费', '会员', '订阅']),
  p('fn.big-button', '课程报名按钮', { text: '立即报名', style: 'primary', radius: 'full' }, ['报名', '课程', '教育', '培训']),
  p('fn.big-button', '领取优惠券按钮', { text: '领取优惠券', style: 'outline', radius: 'full' }, ['领券', '优惠券', '促销']),

  /* ---------------- fn.list-item 单行列表项（19） ---------------- */
  p('fn.list-item', '订单状态行', { label: '待发货订单', value: '3 笔' }, ['订单', '物流', '电商']),
  p('fn.list-item', '消息通知行', { label: '消息通知', value: '已开启' }, ['通知', '设置', '消息']),
  p('fn.list-item', '收货地址行', { label: '收货地址', value: '上海市浦东新区' }, ['地址', '收货', '电商']),
  p('fn.list-item', '本月账单行', { label: '本月账单', value: '¥1,286.00' }, ['账单', '记账', '金融']),
  p('fn.list-item', '银行卡行', { label: '工商银行储蓄卡', value: '尾号 6688' }, ['银行卡', '钱包', '金融']),
  p('fn.list-item', '会员中心行', { label: '黑金会员中心', value: '查看特权' }, ['会员', '特权', 'VIP']),
  p('fn.list-item', '退款售后行', { label: '退款/售后', value: '2 笔待处理' }, ['退款', '售后', '电商']),
  p('fn.list-item', '联系客服行', { label: '联系客服', value: '9:00-22:00' }, ['客服', '帮助', '售后']),
  p('fn.list-item', '系统公告行', { label: '系统公告', value: '3 条新消息' }, ['公告', '消息', '运营']),
  p('fn.list-item', '优惠券入口行', { label: '我的优惠券', value: '5 张可用' }, ['优惠券', '领券', '促销']),
  p('fn.list-item', '通用设置行', { label: '通用设置', value: '' }, ['设置', '通用', '工具']),
  p('fn.list-item', '课程进度行', { label: 'Python 入门课', value: '已学 60%' }, ['课程', '学习', '教育']),
  p('fn.list-item', '私教课预约行', { label: '私教课预约', value: '周四 19:00' }, ['健身', '私教', '预约']),
  p('fn.list-item', '疫苗提醒行', { label: '疫苗提醒', value: '7 天后' }, ['疫苗', '宠物', '医疗', '提醒']),
  p('fn.list-item', '账户余额行', { label: '账户余额', value: '¥328.50' }, ['余额', '钱包', '金融']),
  p('fn.list-item', '退出登录行', { label: '退出登录', value: '' }, ['退出', '注销', '账号']),
  p('fn.list-item', '浏览历史行', { label: '浏览历史', value: '128 条' }, ['历史', '足迹', '内容']),
  p('fn.list-item', '本周排班行', { label: '本周排班', value: '早班 6 天' }, ['排班', '考勤', '工具', '职场']),
  p('fn.list-item', '就诊记录行', { label: '就诊记录', value: '2024-03-12' }, ['就诊', '医疗', '健康']),

  /* ---------------- fn.navbar 页面导航（10） ---------------- */
  p('fn.navbar', '首页标题栏', { title: '星云首页', showBack: false }, ['导航', '首页', '顶部']),
  p('fn.navbar', '商品详情返回栏', { title: '商品详情', showBack: true }, ['详情', '返回', '电商']),
  p('fn.navbar', '订单列表导航栏', { title: '我的订单', showBack: true }, ['订单', '列表', '电商']),
  p('fn.navbar', '搜索页导航栏', { title: '搜索商品', showBack: true }, ['搜索', '查找', '电商']),
  p('fn.navbar', '聊天顶栏', { title: '客服小云', showBack: true }, ['聊天', '客服', '会话']),
  p('fn.navbar', '个人中心导航栏', { title: '个人中心', showBack: false }, ['个人', '我的', '中心']),
  p('fn.navbar', '表单页导航栏', { title: '填写收货地址', showBack: true }, ['表单', '地址', '填写']),
  p('fn.navbar', '设置页导航栏', { title: '设置', showBack: true }, ['设置', '偏好', '工具']),
  p('fn.navbar', '购物车导航栏', { title: '购物车 (3)', showBack: false }, ['购物车', '结算', '电商']),
  p('fn.navbar', '关于我们导航栏', { title: '关于我们', showBack: false }, ['关于', '介绍', '品牌']),

  /* ---------------- fn.settings-group 设置分组（11） ---------------- */
  p('fn.settings-group', '通用设置组', {
    cells: [
      { label: '消息通知', icon: 'bell', on: true },
      { label: '深色模式', icon: 'moon', act: 'theme', on: true },
      { label: '自动播放视频', icon: 'play', on: true },
      { label: '多语言', icon: 'languages', on: false },
      { label: '清除缓存', icon: 'settings', on: false },
    ],
  }, ['设置', '通用', '开关', '偏好']),
  p('fn.settings-group', '隐私设置组', {
    cells: [
      { label: '陌生人私信', icon: 'messages-square', on: true },
      { label: '个性化推荐', icon: 'flame', on: true },
      { label: '位置权限', icon: 'map-pin', on: false },
      { label: '黑名单管理', icon: 'user-round', on: false },
    ],
  }, ['隐私', '权限', '安全', '设置']),
  p('fn.settings-group', '通知设置组', {
    cells: [
      { label: '推送通知', icon: 'bell', on: true },
      { label: '营销短信', icon: 'message-circle', on: false },
      { label: '声音提醒', icon: 'music', on: true },
      { label: '免打扰模式', icon: 'moon', on: false },
    ],
  }, ['通知', '推送', '免打扰', '设置']),
  p('fn.settings-group', '播放设置组', {
    cells: [
      { label: '自动播放下一集', icon: 'play', on: true },
      { label: '默认静音播放', icon: 'headphones', on: false },
      { label: '高清优先', icon: 'clapperboard', on: true },
      { label: '省流模式', icon: 'zap', on: false },
    ],
  }, ['播放', '视频', '清晰度', '设置']),
  p('fn.settings-group', '账号安全设置组', {
    cells: [
      { label: '登录密码', icon: 'settings', on: true },
      { label: '人脸识别', icon: 'camera', on: true },
      { label: '设备管理', icon: 'contact', on: true },
      { label: '支付二次验证', icon: 'zap', on: true },
    ],
  }, ['账号', '安全', '密码', '验证']),
  p('fn.settings-group', '深色模式设置组', {
    cells: [
      { label: '夜间模式', icon: 'moon', act: 'theme', on: true },
      { label: '跟随系统切换', icon: 'settings', on: true },
      { label: '日间模式', icon: 'sun', on: false },
    ],
  }, ['深色', '夜间', '主题', '昼夜切换']),
  p('fn.settings-group', '省流设置组', {
    cells: [
      { label: '图片懒加载', icon: 'image', on: true },
      { label: '视频自动播放', icon: 'play', on: false },
      { label: '仅 Wi-Fi 下载', icon: 'download', on: true },
      { label: '后台刷新', icon: 'settings', on: false },
    ],
  }, ['省流', '流量', '下载', '设置']),
  p('fn.settings-group', '餐饮商家设置组', {
    cells: [
      { label: '今日营业中', icon: 'store', on: true },
      { label: '新订单提醒', icon: 'bell', on: true },
      { label: '堂食点单', icon: 'utensils', on: true },
      { label: '外卖接单', icon: 'utensils-crossed', on: true },
      { label: '自动打印小票', icon: 'settings', on: false },
    ],
  }, ['餐饮', '商家', '接单', '营业']),
  p('fn.settings-group', '直播设置组', {
    cells: [
      { label: '开播提醒', icon: 'video', on: true },
      { label: '弹幕显示', icon: 'message-circle', on: true },
      { label: '礼物特效', icon: 'star', on: true },
      { label: '静音进场', icon: 'headphones', on: false },
    ],
  }, ['直播', '弹幕', '开播', '设置']),
  p('fn.settings-group', '学习提醒设置组', {
    cells: [
      { label: '每日打卡提醒', icon: 'calendar', on: true },
      { label: '课程更新通知', icon: 'book-open', on: true },
      { label: '完成音效', icon: 'music', on: false },
      { label: '护眼模式', icon: 'sun', on: false },
    ],
  }, ['学习', '打卡', '提醒', '教育']),
  p('fn.settings-group', '健康监测设置组', {
    cells: [
      { label: '心率预警', icon: 'stethoscope', on: true },
      { label: '步数统计', icon: 'dumbbell', on: true },
      { label: '睡眠监测', icon: 'moon', on: true },
      { label: '喝水提醒', icon: 'droplets', on: true },
    ],
  }, ['健康', '监测', '心率', '运动']),

  /* ---------------- fn.stat-card 数据统计卡（11） ---------------- */
  p('fn.stat-card', '店铺月度经营卡', { items: '¥86520 月销售额,1284 订单数,368 复购用户,98.2% 好评率' }, ['经营', '销售额', '电商', '数据']),
  p('fn.stat-card', '今日运动数据卡', { items: '6820 今日步数,320 千卡消耗,42 分钟运动,5 天连续打卡' }, ['运动', '步数', '卡路里', '健身']),
  p('fn.stat-card', '在售商品概览卡', { items: '236 在售商品,48 今日上新,12 库存预警,9 条待评价' }, ['商品', '库存', '电商', '盘点']),
  p('fn.stat-card', '粉丝增长数据卡', { items: '3.2万 粉丝总数,856 今日新增,1.8万 获赞,96 关注中' }, ['粉丝', '增长', '自媒体', '社交']),
  p('fn.stat-card', '借款额度卡', { items: '¥50000 总额度,¥32800 可用额度,12 期可借,0.03% 日利率' }, ['额度', '借款', '金融', '分期']),
  p('fn.stat-card', '学习周报数据卡', { items: '26 学习小时,8 完成课程,342 掌握单词,92 道错题订正' }, ['学习', '周报', '教育', '时长']),
  p('fn.stat-card', '宠物健康数据卡', { items: '4.2kg 当前体重,2 次/日喂食,3 针疫苗已种,15 天驱虫倒计时' }, ['宠物', '健康', '体重', '疫苗']),
  p('fn.stat-card', '外卖月度流水卡', { items: '¥12680 月流水,486 完成订单,4.8 店铺评分,32 单准时率98%' }, ['外卖', '流水', '餐饮', '评分']),
  p('fn.stat-card', '家庭收支数据卡', { items: '¥15600 本月收入,¥9200 本月支出,¥6400 本月结余,6 笔待记账' }, ['收支', '记账', '家庭', '金融']),
  p('fn.stat-card', '直播数据卡', { items: '1.2万 场观峰值,320 新增关注,¥8600 礼物收益,48 场本月直播' }, ['直播', '场观', '礼物', '主播']),
  p('fn.stat-card', '库存预警数据卡', { items: '12 库存预警,5 个缺货商品,86 库存充足,3 笔待补货' }, ['库存', '预警', '进销存', '仓库']),

  /* ---------------- fn.weather-card 天气卡（6） ---------------- */
  p('fn.weather-card', '多云转晴天气卡', { city: '上海市', date: '10月24日 周五', temp: '23°', desc: '多云转晴' }, ['天气', '多云', '上海', '出行']),
  p('fn.weather-card', '雨天出行天气卡', { city: '广州市', date: '6月18日 周三', temp: '27°', desc: '中雨转阵雨' }, ['天气', '下雨', '广州', '带伞']),
  p('fn.weather-card', '海边晴天天气卡', { city: '三亚市', date: '2月10日 周六', temp: '29°', desc: '晴' }, ['天气', '晴天', '三亚', '度假']),
  p('fn.weather-card', '雪天天气卡', { city: '哈尔滨市', date: '12月22日 周日', temp: '-12°', desc: '小雪' }, ['天气', '下雪', '哈尔滨', '保暖']),
  p('fn.weather-card', '夜间天气卡', { city: '杭州市', date: '10月24日 22:40', temp: '18°', desc: '晴朗夜空' }, ['天气', '夜间', '杭州', '晚安']),
  p('fn.weather-card', '高温预警天气卡', { city: '重庆市', date: '8月3日 周六', temp: '39°', desc: '晴热高温' }, ['天气', '高温', '重庆', '防暑']),

  /* ---------------- fn.progress-card 目标进度卡（9） ---------------- */
  p('fn.progress-card', '月度阅读目标卡', { title: '本月阅读目标', percent: 68, sub: '已完成 17 本 / 总目标 25 本' }, ['阅读', '目标', '打卡', '学习']),
  p('fn.progress-card', '安装包下载进度卡', { title: '安装包下载中', percent: 82, sub: '已下载 82.4MB / 共 100MB' }, ['下载', '安装', '进度', '工具']),
  p('fn.progress-card', '项目里程碑进度卡', { title: '商城小程序开发', percent: 45, sub: '原型已确认，进入开发阶段' }, ['项目', '里程碑', '协作', '办公']),
  p('fn.progress-card', '秋季减脂计划卡', { title: '秋季减脂计划', percent: 60, sub: '已减 3.6kg / 目标 6kg' }, ['减脂', '减肥', '健身', '目标']),
  p('fn.progress-card', '云盘存储空间卡', { title: '云盘存储空间', percent: 87, sub: '已用 174GB / 共 200GB，建议清理' }, ['存储', '云盘', '空间', '工具']),
  p('fn.progress-card', '会员成长值卡', { title: '黑金会员成长值', percent: 76, sub: '距离升级还差 240 成长点' }, ['会员', '成长值', '等级', 'VIP']),
  p('fn.progress-card', '公益众筹进度卡', { title: '山区图书角众筹', percent: 92, sub: '已筹 ¥18400 / 目标 ¥20000' }, ['众筹', '公益', '捐赠', '进度']),
  p('fn.progress-card', '课程学习进度卡', { title: 'Python 入门课', percent: 35, sub: '已学 7 讲 / 共 20 讲' }, ['课程', '学习', '教育', '进度']),
  p('fn.progress-card', '婚宴备货进度卡', { title: '婚宴酒席备货中', percent: 78, sub: '酒水已到齐，喜糖制作中' }, ['备货', '婚宴', '酒席', '餐饮']),

  /* ---------------- fn.empty-state 空状态（9） ---------------- */
  p('fn.empty-state', '无订单空状态', { title: '暂无相关订单', desc: '下单后可以在这里跟踪物流', btn: '去逛逛' }, ['订单', '空页面', '电商']),
  p('fn.empty-state', '无收藏空状态', { title: '还没有收藏的内容', desc: '看到喜欢的点击小心心收藏吧', btn: '随便看看' }, ['收藏', '空页面', '内容']),
  p('fn.empty-state', '无网络空状态', { title: '网络开小差了', desc: '请检查网络连接后重新加载', btn: '重新加载' }, ['网络', '异常', '重试', '工具']),
  p('fn.empty-state', '搜索无结果空状态', { title: '没有找到相关商品', desc: '试试更换关键词，或让客服帮你找', btn: '清除筛选条件' }, ['搜索', '无结果', '电商']),
  p('fn.empty-state', '无消息空状态', { title: '暂无新消息', desc: '和好友聊两句，消息会出现在这里', btn: '去发消息' }, ['消息', '聊天', '社交']),
  p('fn.empty-state', '无优惠券空状态', { title: '券包空空如也', desc: '领几张优惠券再下单更划算', btn: '去领券中心' }, ['优惠券', '领券', '促销']),
  p('fn.empty-state', '购物车空状态', { title: '购物车还是空的', desc: '快去挑选心仪的宝贝吧', btn: '去逛逛' }, ['购物车', '空页面', '电商']),
  p('fn.empty-state', '无动态空状态', { title: '这里还没有动态', desc: '关注几个感兴趣的人，首页更精彩', btn: '去发现' }, ['动态', '社区', '关注']),
  p('fn.empty-state', '无预约空状态', { title: '暂无预约记录', desc: '预约成功后会在这里提醒你', btn: '立即预约' }, ['预约', '空页面', '到店']),

  /* ---------------- fn.faq 折叠面板（6） ---------------- */
  p('fn.faq', '售后服务FAQ', {
    items: '商品多久发货？\n如何申请退换货？\n运费怎么计算？\n发票如何开具？',
    answer: '在订单详情点击「申请售后」，选择退货退款，客服将在 24 小时内审核处理。',
  }, ['售后', '退换货', '电商', '常见问题']),
  p('fn.faq', '账号安全FAQ', {
    items: '如何修改绑定手机号？\n忘记密码怎么办？\n如何开启二次验证？\n如何注销账号？',
    answer: '请在「账号与安全」中选择更换手机号，验证原手机号后即可完成换绑。',
  }, ['账号', '安全', '换绑', '常见问题']),
  p('fn.faq', '支付问题FAQ', {
    items: '支持哪些付款方式？\n支付失败怎么办？\n如何申请退款？\n退款多久到账？',
    answer: '退款将原路退回，支付宝/微信支付一般 1-3 个工作日到账，银行卡需 3-7 个工作日。',
  }, ['支付', '退款', '到账', '金融']),
  p('fn.faq', '配送相关FAQ', {
    items: '同城多久送达？\n可以指定配送时间吗？\n配送费如何计算？\n偏远地区能送吗？',
    answer: '下单时可选「预约配送」，支持按 30 分钟时段指定送达时间。',
  }, ['配送', '物流', '送达', '外卖']),
  p('fn.faq', '会员权益FAQ', {
    items: '会员有哪些特权？\n如何取消自动续费？\n成长值怎么获得？\n会员到期会提醒吗？',
    answer: '在「会员中心-自动续费管理」中即可一键关闭，关闭后权益保留至本期结束。',
  }, ['会员', '续费', '特权', '常见问题']),
  p('fn.faq', '新手入门FAQ', {
    items: '如何发布第一条动态？\n怎样关注感兴趣的人？\n积分怎么赚取？\n如何联系在线客服？',
    answer: '点击底部「+」发布按钮，选择图片或文字即可发布，发布成功可获得 10 积分。',
  }, ['新手', '入门', '引导', '社区']),

  /* ---------------- fn.video-card 视频卡（7） ---------------- */
  p('fn.video-card', '运营教学视频卡', { title: '三分钟看懂小红书运营', duration: '08:12', views: '2.4万次播放' }, ['教学', '运营', '自媒体', '干货']),
  p('fn.video-card', '开箱评测视频卡', { title: '千元降噪耳机开箱实测', duration: '15:40', views: '8.7万次播放' }, ['评测', '数码', '开箱', '耳机']),
  p('fn.video-card', '直播回放卡', { title: '周五宠粉节直播回放', duration: '1:28:06', views: '3.6万次观看' }, ['直播', '回放', '带货', '促销']),
  p('fn.video-card', '健身跟练视频卡', { title: '十分钟睡前拉伸跟练', duration: '10:05', views: '5.1万次跟练' }, ['健身', '拉伸', '跟练', '睡前']),
  p('fn.video-card', '菜谱视频卡', { title: '家常红烧肉保姆级教程', duration: '06:32', views: '12.8万次播放' }, ['菜谱', '美食', '教程', '红烧肉']),
  p('fn.video-card', '旅行Vlog视频卡', { title: '大理四日慢旅行 Vlog', duration: '18:24', views: '9602次播放' }, ['旅行', 'Vlog', '大理', '攻略']),
  p('fn.video-card', '课程试看视频卡', { title: '高数极限入门试听', duration: '12:36', views: '5320次学习' }, ['课程', '试听', '教育', '高数']),

  /* ---------------- fn.countdown 倒计时卡片（6） ---------------- */
  p('fn.countdown', '双十一秒杀倒计时', { title: '距离双 11 秒杀开场', sub: '定好闹钟准时开抢', days: 12, hours: 8, mins: 36 }, ['秒杀', '双十一', '促销', '倒计时']),
  p('fn.countdown', '直播开播倒计时', { title: '距离「宠粉之夜」开播', sub: '整点抽奖送好礼', days: 0, hours: 2, mins: 15 }, ['直播', '开播', '抽奖', '倒计时']),
  p('fn.countdown', '新品首发倒计时', { title: '距离新品首发开售', sub: '前 100 名立减一半', days: 3, hours: 10, mins: 0 }, ['新品', '首发', '电商', '倒计时']),
  p('fn.countdown', '考试倒计时', { title: '距离研究生考试', sub: '建议每日刷题保持手感', days: 45, hours: 0, mins: 0 }, ['考试', '考研', '教育', '倒计时']),
  p('fn.countdown', '暑期班开课倒计时', { title: '距离暑期班开课', sub: '报名立减 ¥300', days: 6, hours: 20, mins: 30 }, ['开课', '暑假', '教育', '报名']),
  p('fn.countdown', '门票开售倒计时', { title: '距离演唱会门票开售', sub: '每人限购 2 张', days: 1, hours: 18, mins: 0 }, ['门票', '演唱会', '开售', '倒计时']),

  /* ---------------- fn.ranking 排行榜（7） ---------------- */
  p('fn.ranking', '本周步数排行榜', { title: '本周步数榜', unit: '步', items: '星云旅人 28616\n阿岚 25410\n小张 23188\n产品君 19802' }, ['步数', '排行', '运动', '健身']),
  p('fn.ranking', '热销商品排行榜', { title: '热销商品榜', unit: '件', items: '无线蓝牙耳机 1284\n保温杯 968\n帆布鞋 845\n手机壳 792' }, ['热销', '销量', '电商', '榜单']),
  p('fn.ranking', '人气餐厅排行榜', { title: '人气餐厅榜', unit: '人气值', items: '老王烧烤 3286\n川味小馆 2954\n粤海茶楼 2431\n巷子面馆 2108' }, ['餐厅', '人气', '餐饮', '榜单']),
  p('fn.ranking', '学习时长排行榜', { title: '本周学习时长榜', unit: '小时', items: '林小满 12.5\n陈北 11.2\n苏叶子 10.8\n阿澈 9.6' }, ['学习', '时长', '教育', '榜单']),
  p('fn.ranking', '记账省钱排行榜', { title: '本月省钱榜', unit: '元', items: '抠门大师 5200\n省钱小能手 4860\n攒钱青年 4320\n月光逆行者 3980' }, ['省钱', '记账', '金融', '榜单']),
  p('fn.ranking', '好评门店排行榜', { title: '好评门店榜', unit: '分', items: '向阳花艺 4.9\n沐晨咖啡 4.8\n拾光书店 4.8\n青云健身房 4.7' }, ['好评', '口碑', '门店', '榜单']),
  p('fn.ranking', '社区遛狗排行榜', { title: '本月遛狗榜', unit: '次', items: '豆豆家 96\n旺财家 88\n球球家 76\n布丁家 71' }, ['遛狗', '宠物', '社区', '榜单']),

  /* ---------------- fn.calendar 日历卡片（5） ---------------- */
  p('fn.calendar', '签到日历', { month: '2026年6月', today: 15, start: 0 }, ['签到', '打卡', '日历', '每日']),
  p('fn.calendar', '员工排班日历', { month: '2026年3月', today: 12, start: 0 }, ['排班', '考勤', '职场', '日历']),
  p('fn.calendar', '到店预约日历', { month: '2026年5月', today: 20, start: 4 }, ['预约', '到店', '美业', '日历']),
  p('fn.calendar', '旅行行程日历', { month: '2026年10月', today: 8, start: 3 }, ['旅行', '行程', '假期', '日历']),
  p('fn.calendar', '考试月历', { month: '2026年6月', today: 7, start: 1 }, ['考试', '考期', '教育', '日历']),

  /* ---------------- fn.qrcode 二维码卡片（5） ---------------- */
  p('fn.qrcode', '邀请好友二维码卡', { title: '邀请好友赚奖励', sub: '扫码加入星云，双方各得 30 积分', seed: 7 }, ['邀请', '裂变', '积分', '二维码']),
  p('fn.qrcode', '业主微信群二维码卡', { title: '加入业主交流群', sub: '扫码进群，物业通知第一时间知晓', seed: 21 }, ['微信群', '业主', '社区', '二维码']),
  p('fn.qrcode', '个人名片二维码卡', { title: '我的名片码', sub: '扫码保存联系方式，交换名片更方便', seed: 35 }, ['名片', '联系方式', '职场', '二维码']),
  p('fn.qrcode', '门店WiFi二维码卡', { title: '门店 Wi-Fi', sub: '扫码自动连接，无需输入密码', seed: 48 }, ['WiFi', '门店', '连网', '二维码']),
  p('fn.qrcode', '公众号关注二维码卡', { title: '关注官方公众号', sub: '每周精选好文与专属优惠推送', seed: 62 }, ['公众号', '关注', '涨粉', '二维码']),

  /* ---------------- fn.fab 悬浮按钮（5） ---------------- */
  p('fn.fab', '发布内容悬浮按钮', { icon: 'plus' }, ['发布', '新建', '社区']),
  p('fn.fab', '在线客服悬浮按钮', { icon: 'message' }, ['客服', '咨询', '售后']),
  p('fn.fab', '拍照打卡悬浮按钮', { icon: 'camera' }, ['拍照', '打卡', '相机']),
  p('fn.fab', '记一笔悬浮按钮', { icon: 'edit' }, ['记账', '记一笔', '金融']),
  p('fn.fab', '新增地址悬浮按钮', { icon: 'plus' }, ['新增', '地址', '电商']),

  /* ---------------- fn.avatar-profile 个人中心头部（5） ---------------- */
  p('fn.avatar-profile', '会员个人头部', { name: '云间漫步者', uid: 'ID: 88239012', vip: true }, ['个人中心', '会员', '头部']),
  p('fn.avatar-profile', '普通用户头部', { name: '爱吃火锅的猫', uid: 'ID: 20661108', vip: false }, ['个人中心', '用户', '头部']),
  p('fn.avatar-profile', '商家店铺头部', { name: '山城老火锅（解放碑店）', uid: '店铺 ID: CY0912', vip: true }, ['商家', '店铺', '餐饮']),
  p('fn.avatar-profile', '创作者头部', { name: '阿岚的旅行日记', uid: '创作者 ID: TR2088', vip: true }, ['创作者', '自媒体', '旅行']),
  p('fn.avatar-profile', '学生版头部', { name: '早八人小王', uid: '学号 20221034', vip: false }, ['学生', '校园', '教育']),

  /* ---------------- fn.tabbar 底部导航（6） ---------------- */
  p('fn.tabbar', '电商四标签底栏', { items: '首页,分类,购物车,我的', active: 0 }, ['电商', '底部导航', '购物车', '标签栏']),
  p('fn.tabbar', '社交四标签底栏', { items: '消息,通讯录,发现,我', active: 0 }, ['社交', '底部导航', '通讯录', '标签栏']),
  p('fn.tabbar', '学习三标签底栏', { items: '学习,题库,我的', active: 0 }, ['学习', '教育', '底部导航', '题库']),
  p('fn.tabbar', '视频五标签底栏', { items: '首页,视频,发布,消息,我的', active: 2 }, ['视频', '发布', '底部导航', '内容']),
  p('fn.tabbar', '美食三标签底栏', { items: '点餐,订单,我的', active: 1 }, ['餐饮', '点餐', '底部导航', '订单']),
  p('fn.tabbar', '健身四标签底栏', { items: '训练,计划,社区,我的', active: 0 }, ['健身', '训练', '底部导航', '计划']),

  /* ---------------- fn.text-block 富文本段落（5） ---------------- */
  p('fn.text-block', '欢迎语段落', {
    title: '欢迎来到星云',
    content: '在这里记录生活、结识同好、发现好物。\n每天 5 分钟，看看感兴趣的人在玩什么。',
  }, ['欢迎', '引导', '介绍', '新手']),
  p('fn.text-block', '门店公告段落', {
    title: '门店公告',
    content: '本周日起营业时间调整为 9:00-21:00。\n会员日（每周三）全场饮品第二杯半价。',
  }, ['公告', '门店', '营业时间', '餐饮']),
  p('fn.text-block', '使用说明段落', {
    title: '如何使用优惠券',
    content: '下单前在「我的优惠券」中选择要使用的券。\n每笔订单限用一张，不与门店活动叠加。',
  }, ['说明', '优惠券', '规则', '电商']),
  p('fn.text-block', '用户协议段落', {
    title: '用户协议摘要',
    content: '使用本服务前请阅读并同意《用户协议》与《隐私政策》。\n我们仅收集为提供服务所必需的信息，不会向第三方出售你的数据。',
  }, ['协议', '隐私', '条款', '合规']),
  p('fn.text-block', '安全提示段落', {
    title: '温馨提示',
    content: '为保障账户安全，请勿将验证码透露给任何人。\n官方客服不会以任何理由索要密码或验证码。',
  }, ['提示', '安全', '防诈骗', '公告']),

  /* ---------------- fn.image-block 图片块（5） ---------------- */
  p('fn.image-block', '首页横幅图', { height: 160, label: '首页头图' }, ['横幅', '头图', '首页', 'banner']),
  p('fn.image-block', '商品宽幅大图', { height: 200, label: '商品大图' }, ['商品图', '大图', '详情', '电商']),
  p('fn.image-block', '视频封面图', { height: 130, label: '视频封面' }, ['封面', '视频', '内容']),
  p('fn.image-block', '活动海报竖图', { height: 260, label: '活动海报' }, ['海报', '活动', '竖图', '促销']),
  p('fn.image-block', '店招窄横幅', { height: 128, label: '店招横幅' }, ['店招', '横幅', '门店', '餐饮']),

  /* ---------------- fn.input-field 表单输入（4） ---------------- */
  p('fn.input-field', '订单通知邮箱输入框', { label: '邮箱地址', placeholder: '用于接收订单通知' }, ['邮箱', '订阅', '表单']),
  p('fn.input-field', '昵称输入框', { label: '昵称', placeholder: '2-12 个字，支持中英文' }, ['昵称', '资料', '表单']),
  p('fn.input-field', '详细地址输入框', { label: '详细地址', placeholder: '街道、门牌号、楼层房间号' }, ['地址', '收货', '表单']),
  p('fn.input-field', '邀请码输入框', { label: '邀请码', placeholder: '选填，填写好友邀请码' }, ['邀请码', '注册', '表单']),

  /* ---------------- fn.spacer 间距占位（2） ---------------- */
  p('fn.spacer', '紧凑间距占位', { height: 24, hint: false }, ['间距', '留白', '布局']),
  p('fn.spacer', '标准分区间距', { height: 40, hint: true }, ['间距', '分区', '布局']),
];
