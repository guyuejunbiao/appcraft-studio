import type { PresetDef } from './types';
import { p } from './types';

/**
 * mall 类目精选预设（90 个，覆盖 mall.tsx 全部 11 个基础组件）
 * props 字段逐字对照 mall.tsx 的 defaultProps/fields：
 * search(placeholder/btnText)、banner(title/subtitle/height 120-220)、notice-bar(text)、
 * category-grid(cells 逐格数组：label + icon 图标名，最多 8 格)、section-header(title/more)、
 * product-card(name/price/original/sales)、product-grid(count 2-6)、
 * flash-sale(title/hours/minutes 两位数字)、coupon-card(amount/condition/desc/date/btnText)、
 * coupon-row(amount/threshold 逗号分隔取前 3)、brand-row(brands 逗号分隔最多 3)
 */
export const mallPresets: PresetDef[] = [
  /* ---------------- mall.category-grid 金刚区（16） ---------------- */
  p('mall.category-grid', '美妆护肤金刚区', {
    cells: [
      { label: '护肤', icon: 'tag' },
      { label: '彩妆', icon: 'heart' },
      { label: '香水', icon: 'gift' },
      { label: '面膜', icon: 'image' },
      { label: '个护', icon: 'droplets' },
      { label: '美容仪', icon: 'zap' },
      { label: '男士专区', icon: 'user-round' },
      { label: '会员礼盒', icon: 'star', act: 'toast' },
    ],
  }, ['美妆', '护肤', '金刚区', '分类导航']),
  p('mall.category-grid', '数码家电金刚区', {
    cells: [
      { label: '手机', icon: 'zap' },
      { label: '笔记本', icon: 'briefcase' },
      { label: '耳机', icon: 'headphones' },
      { label: '智能穿戴', icon: 'clock' },
      { label: '相机', icon: 'camera' },
      { label: '游戏设备', icon: 'gamepad-2' },
      { label: '影音娱乐', icon: 'video' },
      { label: '智能家居', icon: 'home' },
    ],
  }, ['数码', '家电', '金刚区', '分类导航']),
  p('mall.category-grid', '零食饮料金刚区', {
    cells: [
      { label: '坚果炒货', icon: 'package' },
      { label: '膨化零食', icon: 'cake' },
      { label: '糖果巧克力', icon: 'gift' },
      { label: '饮料冲调', icon: 'coffee' },
      { label: '方便速食', icon: 'utensils-crossed' },
      { label: '进口食品', icon: 'plane' },
      { label: '肉干卤味', icon: 'beer' },
      { label: '零食礼盒', icon: 'star', act: 'toast' },
    ],
  }, ['食品', '零食', '金刚区', '分类导航']),
  p('mall.category-grid', '家居家装金刚区', {
    cells: [
      { label: '家具', icon: 'home' },
      { label: '家纺', icon: 'moon' },
      { label: '灯饰', icon: 'sun' },
      { label: '厨具', icon: 'utensils' },
      { label: '收纳整理', icon: 'package' },
      { label: '清洁洗护', icon: 'droplets' },
      { label: '五金工具', icon: 'settings' },
      { label: '软装饰品', icon: 'heart' },
    ],
  }, ['家居', '家装', '金刚区', '分类导航']),
  p('mall.category-grid', '母婴亲子金刚区', {
    cells: [
      { label: '奶粉喂养', icon: 'droplets' },
      { label: '纸尿裤', icon: 'package' },
      { label: '玩具', icon: 'gamepad-2' },
      { label: '童装', icon: 'shopping-bag' },
      { label: '婴儿辅食', icon: 'cake' },
      { label: '儿童图书', icon: 'book-open' },
      { label: '宝宝洗护', icon: 'sun' },
      { label: '婴儿车床', icon: 'car' },
    ],
  }, ['母婴', '亲子', '金刚区', '分类导航']),
  p('mall.category-grid', '运动健身金刚区', {
    cells: [
      { label: '跑步鞋', icon: 'flame' },
      { label: '运动服饰', icon: 'shopping-bag' },
      { label: '健身器材', icon: 'dumbbell' },
      { label: '瑜伽', icon: 'heart' },
      { label: '球类', icon: 'trophy' },
      { label: '骑行', icon: 'car' },
      { label: '户外露营', icon: 'compass' },
      { label: '运动营养', icon: 'pill' },
    ],
  }, ['健身', '运动', '金刚区', '分类导航']),
  p('mall.category-grid', '宠物生活金刚区', {
    cells: [
      { label: '主粮', icon: 'utensils' },
      { label: '零食罐头', icon: 'cake' },
      { label: '宠物玩具', icon: 'gamepad-2' },
      { label: '医疗保健', icon: 'pill' },
      { label: '清洁除味', icon: 'droplets' },
      { label: '宠物服饰', icon: 'shopping-bag' },
      { label: '出行用品', icon: 'car' },
      { label: '萌宠摄影', icon: 'camera' },
    ],
  }, ['宠物', '萌宠', '金刚区', '分类导航']),
  p('mall.category-grid', '图书文娱金刚区', {
    cells: [
      { label: '小说文学', icon: 'book-open' },
      { label: '教辅教材', icon: 'graduation-cap' },
      { label: '童书绘本', icon: 'star' },
      { label: '漫画', icon: 'clapperboard' },
      { label: '考试认证', icon: 'file-text' },
      { label: '听书', icon: 'headphones' },
      { label: '文创手账', icon: 'gift' },
      { label: '文具', icon: 'list' },
    ],
  }, ['图书', '文具', '金刚区', '分类导航']),
  p('mall.category-grid', '旅行出行金刚区', {
    cells: [
      { label: '机票', icon: 'plane' },
      { label: '酒店', icon: 'home' },
      { label: '景点门票', icon: 'ticket' },
      { label: '租车', icon: 'car' },
      { label: '当地攻略', icon: 'map-pin' },
      { label: '签证', icon: 'file-text' },
      { label: '境外流量', icon: 'qr-code' },
      { label: '行李箱', icon: 'package' },
    ],
  }, ['旅行', '出行', '金刚区', '分类导航']),
  p('mall.category-grid', '鲜花绿植金刚区', {
    cells: [
      { label: '鲜花速递', icon: 'heart' },
      { label: '永生花', icon: 'gift' },
      { label: '绿植', icon: 'sun' },
      { label: '多肉', icon: 'droplets' },
      { label: '花瓶器皿', icon: 'image' },
      { label: '种子花肥', icon: 'package' },
      { label: '园艺工具', icon: 'settings' },
      { label: '花艺课程', icon: 'graduation-cap', act: 'toast' },
    ],
  }, ['鲜花', '绿植', '金刚区', '分类导航']),
  p('mall.category-grid', '茶饮咖啡金刚区', {
    cells: [
      { label: '奶茶', icon: 'cake' },
      { label: '咖啡', icon: 'coffee' },
      { label: '花草茶', icon: 'sun' },
      { label: '水果茶', icon: 'droplets' },
      { label: '茶叶', icon: 'package' },
      { label: '茶具', icon: 'store' },
      { label: '冲调饮品', icon: 'beer' },
      { label: '新品尝鲜', icon: 'flame', act: 'toast' },
    ],
  }, ['茶饮', '咖啡', '金刚区', '分类导航']),
  p('mall.category-grid', '医药健康金刚区', {
    cells: [
      { label: '常备药品', icon: 'pill' },
      { label: '维生素', icon: 'sun' },
      { label: '医疗器械', icon: 'stethoscope' },
      { label: '隐形眼镜', icon: 'scan-line' },
      { label: '在线问诊', icon: 'message-circle' },
      { label: '体检套餐', icon: 'file-text' },
      { label: '中医养生', icon: 'heart' },
      { label: '保健品', icon: 'gift' },
    ],
  }, ['医药', '健康', '金刚区', '分类导航']),
  p('mall.category-grid', '教育培训金刚区', {
    cells: [
      { label: '直播课', icon: 'video' },
      { label: '录播课', icon: 'play' },
      { label: '题库练习', icon: 'list' },
      { label: '一对一辅导', icon: 'users' },
      { label: '留学申请', icon: 'plane' },
      { label: '考证考级', icon: 'file-text' },
      { label: '兴趣素养', icon: 'music' },
      { label: '教辅教材', icon: 'book-open' },
    ],
  }, ['教育', '培训', '金刚区', '分类导航']),
  p('mall.category-grid', '家政服务金刚区', {
    cells: [
      { label: '日常保洁', icon: 'droplets' },
      { label: '搬家', icon: 'truck' },
      { label: '家电维修', icon: 'settings' },
      { label: '灯具安装', icon: 'zap' },
      { label: '月嫂育儿', icon: 'users' },
      { label: '保姆', icon: 'user-round' },
      { label: '衣物洗护', icon: 'cloud' },
      { label: '旧物回收', icon: 'share-2' },
    ],
  }, ['家政', '服务', '金刚区', '分类导航']),
  p('mall.category-grid', '汽摩配件金刚区', {
    cells: [
      { label: '汽车保养', icon: 'settings' },
      { label: '洗车', icon: 'droplets' },
      { label: '轮胎', icon: 'package' },
      { label: '车品内饰', icon: 'car' },
      { label: '行车记录仪', icon: 'camera' },
      { label: '加油充值', icon: 'credit-card' },
      { label: '违章代缴', icon: 'file-text' },
      { label: '二手车', icon: 'truck' },
    ],
  }, ['汽配', '用车', '金刚区', '分类导航']),
  p('mall.category-grid', '珠宝饰品金刚区', {
    cells: [
      { label: '黄金', icon: 'trophy' },
      { label: '钻石', icon: 'star' },
      { label: '翡翠', icon: 'heart' },
      { label: '银饰', icon: 'moon' },
      { label: '珍珠', icon: 'droplets' },
      { label: '腕表', icon: 'clock' },
      { label: '眼镜', icon: 'search' },
      { label: '潮配饰', icon: 'gift' },
    ],
  }, ['珠宝', '饰品', '金刚区', '分类导航']),

  /* ---------------- mall.product-card 单列商品卡（16） ---------------- */
  p('mall.product-card', '法式连衣裙商品卡', { name: '法式碎花雪纺连衣裙 2025 秋季新款收腰显瘦中长裙', price: '159', original: '299', sales: '1.8万' }, ['服装', '女装', '商品卡']),
  p('mall.product-card', '降噪耳机商品卡', { name: '无线蓝牙降噪耳机 半入耳式超长续航 40 小时播放', price: '299', original: '399', sales: '4.6万' }, ['数码', '耳机', '商品卡']),
  p('mall.product-card', '修护精华商品卡', { name: '多效修护精华液 30ml 烟酰胺提亮肤色补水保湿', price: '219', original: '299', sales: '9523' }, ['美妆', '护肤', '商品卡']),
  p('mall.product-card', '每日坚果商品卡', { name: '每日坚果混合装 30 包礼盒 办公室下午茶零食大礼包', price: '79', original: '109', sales: '8.7万' }, ['食品', '零食', '商品卡']),
  p('mall.product-card', '北欧香薰机商品卡', { name: '北欧简约香薰机 卧室静音加湿 无水断电保护', price: '129', original: '199', sales: '6302' }, ['家居', '香薰', '商品卡']),
  p('mall.product-card', '科幻套装书商品卡', { name: '三体全集（全三册）刘慈欣科幻小说典藏版', price: '93', original: '135', sales: '2.4万' }, ['图书', '小说', '商品卡']),
  p('mall.product-card', '纸尿裤商品卡', { name: '婴儿超薄透气纸尿裤 L 码 76 片 男女宝宝通用', price: '109', original: '159', sales: '3.1万' }, ['母婴', '纸尿裤', '商品卡']),
  p('mall.product-card', '进口车厘子商品卡', { name: '智利进口车厘子 JJ 级 2kg 礼盒装 顺丰空运直达', price: '139', original: '199', sales: '1.2万' }, ['生鲜', '水果', '商品卡']),
  p('mall.product-card', '缓震跑鞋商品卡', { name: '轻量化缓震跑步鞋 男女同款透气网面运动鞋', price: '269', original: '399', sales: '6841' }, ['运动', '跑鞋', '商品卡']),
  p('mall.product-card', '纯银手链商品卡', { name: 'S925 纯银四叶草手链 女士简约日系礼盒装', price: '199', original: '299', sales: '3215' }, ['珠宝', '饰品', '商品卡']),
  p('mall.product-card', '成猫猫粮商品卡', { name: '全价成猫粮 鸡肉三文鱼配方 10kg 添加深海鱼油', price: '158', original: '209', sales: '7759' }, ['宠物', '猫粮', '商品卡']),
  p('mall.product-card', '明前龙井商品卡', { name: '明前特级西湖龙井茶叶 250g 罐装春茶礼盒', price: '168', original: '238', sales: '4208' }, ['茶饮', '茶叶', '商品卡']),
  p('mall.product-card', '维生素C商品卡', { name: '维生素 C 咀嚼片 100 片 橘子味酸甜可口', price: '39', original: '59', sales: '9.3万' }, ['医药', '保健品', '商品卡']),
  p('mall.product-card', '永生花礼盒商品卡', { name: '永生花玻璃罩礼盒 生日情人节礼物送女友', price: '189', original: '269', sales: '5312' }, ['鲜花', '礼盒', '商品卡']),
  p('mall.product-card', '手账套装商品卡', { name: '少女心手账本套装 含胶带贴纸中性笔 初学者全套', price: '46', original: '68', sales: '2.9万' }, ['文具', '手账', '商品卡']),
  p('mall.product-card', '空气炸锅商品卡', { name: '大容量空气炸锅 5.5L 一屏触控 低脂无油免翻面', price: '239', original: '359', sales: '4.1万' }, ['家电', '厨房电器', '商品卡']),

  /* ---------------- mall.banner 首页轮播（12） ---------------- */
  p('mall.banner', '618 年中大促 Banner', { title: '618 年中狂欢', subtitle: '跨店每满 300 减 60 · 上不封顶', height: 200 }, ['618', '大促', '促销', '轮播']),
  p('mall.banner', '双 11 预售 Banner', { title: '双 11 预售开启', subtitle: '付定金立减 100 · 尾款再享 88 折', height: 220 }, ['双11', '预售', '促销', '轮播']),
  p('mall.banner', '年货节 Banner', { title: '年货节开抢', subtitle: '坚果酒水礼盒 5 折起 · 顺丰包邮到家', height: 180 }, ['年货节', '春节', '促销', '轮播']),
  p('mall.banner', '新品首发 Banner', { title: '秋季新品首发', subtitle: '首发限定礼盒 · 前 1000 名送小样', height: 160 }, ['新品', '首发', '上新', '轮播']),
  p('mall.banner', '直播专场 Banner', { title: '大牌直播专场', subtitle: '整点抽免单 · 直播间专属价更低', height: 160 }, ['直播', '专场', '促销', '轮播']),
  p('mall.banner', '会员日 Banner', { title: '88VIP 会员日', subtitle: '会员专享 95 折 · 积分当钱花', height: 160 }, ['会员日', '会员', '权益', '轮播']),
  p('mall.banner', '清仓特卖 Banner', { title: '夏装清仓特卖', subtitle: '低至 1 折 · 错过再等一年', height: 180 }, ['清仓', '特卖', '折扣', '轮播']),
  p('mall.banner', '环球美食节 Banner', { title: '环球美食节', subtitle: '进口零食 39 选 6 · 满百减 30', height: 160 }, ['美食节', '食品', '促销', '轮播']),
  p('mall.banner', '出游焕新季 Banner', { title: '出游焕新季', subtitle: '行李箱帐篷 7 折起 · 旅行好物一站购齐', height: 160 }, ['旅游季', '出行', '促销', '轮播']),
  p('mall.banner', '开学装备季 Banner', { title: '开学装备季', subtitle: '数码文具 5 折起 · 学生认证再减 50', height: 180 }, ['开学季', '学生', '促销', '轮播']),
  p('mall.banner', '美妆狂欢节 Banner', { title: '美妆狂欢节', subtitle: '大牌小样免费领 · 满 299 减 80', height: 160 }, ['美妆节', '美妆', '促销', '轮播']),
  p('mall.banner', '数码焕新季 Banner', { title: '数码焕新季', subtitle: '以旧换新最高补 800 · 12 期免息', height: 200 }, ['数码', '以旧换新', '促销', '轮播']),

  /* ---------------- mall.search 搜索栏（8） ---------------- */
  p('mall.search', '商城通用搜索栏', { placeholder: '搜索商品 / 品牌 / 好物', btnText: '搜索' }, ['搜索', '通用', '首页']),
  p('mall.search', '找商品搜索栏', { placeholder: '搜索心仪的商品，如：连衣裙', btnText: '找商品' }, ['搜索', '商品', '关键词']),
  p('mall.search', '找店铺搜索栏', { placeholder: '搜索店铺 / 品牌旗舰店', btnText: '找店铺' }, ['搜索', '店铺', '品牌']),
  p('mall.search', '笔记内容搜索栏', { placeholder: '搜索穿搭 / 测评 / 好物笔记', btnText: '搜笔记' }, ['搜索', '内容', '社区']),
  p('mall.search', '附近好店搜索栏', { placeholder: '搜索附近美食 / 优惠团购', btnText: '找附近' }, ['搜索', '本地生活', '附近']),
  p('mall.search', '药品健康搜索栏', { placeholder: '搜索药品 / 医疗器械 / 保健品', btnText: '搜一下' }, ['搜索', '药品', '医疗']),
  p('mall.search', '课程搜索栏', { placeholder: '搜索课程 / 讲师 / 题库', btnText: '找课程' }, ['搜索', '课程', '教育']),
  p('mall.search', '二手淘货搜索栏', { placeholder: '搜索想要的二手好物，如：Kindle', btnText: '淘一淘' }, ['搜索', '二手', '闲置']),

  /* ---------------- mall.flash-sale 限时秒杀（10） ---------------- */
  p('mall.flash-sale', '零点秒杀场', { title: '0 点秒杀场', hours: '00', minutes: '59' }, ['秒杀', '零点场', '促销']),
  p('mall.flash-sale', '十点抢购场', { title: '10 点抢购场', hours: '00', minutes: '37' }, ['秒杀', '十点场', '促销']),
  p('mall.flash-sale', '晚八黄金场', { title: '晚 8 点黄金场', hours: '03', minutes: '20' }, ['秒杀', '晚8场', '促销']),
  p('mall.flash-sale', '美妆爆款秒杀', { title: '美妆爆款秒杀', hours: '01', minutes: '45' }, ['秒杀', '美妆', '促销']),
  p('mall.flash-sale', '数码神券秒杀', { title: '数码神券秒杀', hours: '02', minutes: '10' }, ['秒杀', '数码', '促销']),
  p('mall.flash-sale', '零食底价秒杀', { title: '零食白菜价秒杀', hours: '00', minutes: '52' }, ['秒杀', '食品', '促销']),
  p('mall.flash-sale', '家居焕新秒杀', { title: '家居焕新秒杀', hours: '04', minutes: '05' }, ['秒杀', '家居', '促销']),
  p('mall.flash-sale', '图书五折秒杀', { title: '图书 5 折秒杀', hours: '07', minutes: '30' }, ['秒杀', '图书', '促销']),
  p('mall.flash-sale', '母婴守护秒杀', { title: '母婴守护秒杀', hours: '01', minutes: '18' }, ['秒杀', '母婴', '促销']),
  p('mall.flash-sale', '生鲜日日鲜秒杀', { title: '生鲜日日鲜秒杀', hours: '00', minutes: '45' }, ['秒杀', '生鲜', '促销']),

  /* ---------------- mall.coupon-card 优惠券（8） ---------------- */
  p('mall.coupon-card', '全场满减券', { amount: '50', condition: '299', desc: '全场通用 · 可叠加会员折扣', date: '有效期至 2025-12-31', btnText: '立即领取' }, ['满减', '优惠券', '通用']),
  p('mall.coupon-card', '美妆专享券', { amount: '30', condition: '199', desc: '美妆护肤专享 · 折上再减', date: '有效期至 2025-11-11', btnText: '立即领取' }, ['折扣', '美妆', '优惠券']),
  p('mall.coupon-card', '新人立减券', { amount: '18', condition: '0', desc: '新人首单专享 · 无门槛使用', date: '领取后 7 天内有效', btnText: '新人领取' }, ['新人', '无门槛', '优惠券']),
  p('mall.coupon-card', '包邮抵扣券', { amount: '10', condition: '39', desc: '运费抵扣券 · 全国可用', date: '有效期至 2025-10-31', btnText: '马上去领' }, ['包邮', '运费', '优惠券']),
  p('mall.coupon-card', '会员专享券', { amount: '100', condition: '999', desc: 'PLUS 会员专享 · 每月限领 1 张', date: '每月 1 日刷新', btnText: '会员领取' }, ['会员', '大额', '优惠券']),
  p('mall.coupon-card', '生日关怀券', { amount: '66', condition: '199', desc: '生日月专属 · 全品类可用', date: '有效期至生日当月月底', btnText: '领取祝福' }, ['生日', '专属', '优惠券']),
  p('mall.coupon-card', '家电品类券', { amount: '120', condition: '599', desc: '家电品类券 · 大小家电均可用', date: '有效期至 2025-12-15', btnText: '立即领取' }, ['品类券', '家电', '优惠券']),
  p('mall.coupon-card', '签到无门槛券', { amount: '5', condition: '0', desc: '连续签到 7 天奖励 · 无门槛立减', date: '领取后 3 天内有效', btnText: '签到领取' }, ['签到', '无门槛', '优惠券']),

  /* ---------------- mall.coupon-row 优惠券横条（6） ---------------- */
  p('mall.coupon-row', '新人三连券', { amount: '18,8,5', threshold: '0,59,99' }, ['新人', '券包', '优惠券']),
  p('mall.coupon-row', '美妆券组', { amount: '60,30,15', threshold: '399,199,99' }, ['美妆', '券包', '优惠券']),
  p('mall.coupon-row', '食品券组', { amount: '20,10,5', threshold: '99,59,29' }, ['食品', '券包', '优惠券']),
  p('mall.coupon-row', '通用券组', { amount: '50,30,20', threshold: '199,99,59' }, ['通用', '券包', '优惠券']),
  p('mall.coupon-row', '大额神券组', { amount: '300,150,80', threshold: '1999,999,499' }, ['大额', '神券', '优惠券']),
  p('mall.coupon-row', '日签小额券组', { amount: '5,3,2', threshold: '29,19,9' }, ['签到', '日签', '优惠券']),

  /* ---------------- mall.notice-bar 公告栏（6） ---------------- */
  p('mall.notice-bar', '物流延迟公告', { text: '受台风影响，华东地区快递可能延迟 1-2 天，请耐心等待' }, ['物流', '公告', '延迟']),
  p('mall.notice-bar', '预售活动公告', { text: '双 11 预售定金翻倍膨胀中，付定金最高抵 200 元' }, ['活动', '预售', '公告']),
  p('mall.notice-bar', '上新公告', { text: '本周上新：秋季新品已上架，前 500 名下单送定制周边' }, ['上新', '公告', '新品']),
  p('mall.notice-bar', '客服时间公告', { text: '客服服务时间调整为 9:00-22:00，留言会在 10 分钟内回复' }, ['客服', '营业时间', '公告']),
  p('mall.notice-bar', '系统维护公告', { text: '系统将于今晚 02:00-04:00 升级维护，期间下单可能短暂受影响' }, ['维护', '公告', '系统']),
  p('mall.notice-bar', '消毒安心公告', { text: '仓库已完成全面消杀，包裹出库前均经过严格消毒，放心收货' }, ['防疫', '消毒', '公告']),

  /* ---------------- mall.section-header 标题行（4） ---------------- */
  p('mall.section-header', '猜你喜欢标题行', { title: '猜你喜欢', more: '查看全部' }, ['推荐', '标题', '分区']),
  p('mall.section-header', '热卖推荐标题行', { title: '热卖推荐', more: '更多爆款' }, ['热卖', '标题', '分区']),
  p('mall.section-header', '新品首发标题行', { title: '新品首发', more: '全部新品' }, ['新品', '标题', '分区']),
  p('mall.section-header', '限时特惠标题行', { title: '限时特惠', more: '抢购中' }, ['特惠', '标题', '分区']),

  /* ---------------- mall.brand-row 品牌馆（3） ---------------- */
  p('mall.brand-row', '大牌馆品牌墙', { brands: '兰蔻,SK-II,戴森' }, ['大牌', '品牌馆', '旗舰']),
  p('mall.brand-row', '国货之光品牌墙', { brands: '华为,花西子,安踏' }, ['国货', '品牌馆', '旗舰']),
  p('mall.brand-row', '买手精选品牌墙', { brands: '山系户外,日式器物,轻奢配饰' }, ['买手', '精选', '品牌馆']),

  /* ---------------- mall.product-grid 双列商品网格（1） ---------------- */
  p('mall.product-grid', '爆款双列商品墙', {
    items: [
      { name: '云朵软糯牛奶卫衣', price: '128', original: '199', sales: '1.2万' },
      { name: '极简无线蓝牙耳机', price: '59', original: '99', sales: '8632' },
      { name: '轻氧玻尿酸保湿面膜', price: '199', original: '299', sales: '2.3万' },
      { name: '每日坚果混合装 30 包', price: '89', original: '139', sales: '4581' },
    ],
  }, ['商品墙', '双列', '瀑布流', '逐商品跳转']),
];
