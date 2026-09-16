import type { PresetDef } from './types';
import { p } from './types';

/**
 * shopping 类目精选预设（70 个，覆盖 shopping.tsx 全部 9 个基础组件）
 * props 字段逐字对照 shopping.tsx 的 defaultProps/fields：
 * detail-hero(fav)、price-row(price/original/sales/tags)、sku-select(colors/versions)、
 * qty-stepper(label/value/channel)、service-row(s1/s2/s3)、review-item(user/date/content/reply)、
 * address-bar(name/phone/address)、add-cart-bar(cartText/buyText)、order-summary(goods/freight/coupon/total)
 */
export const shoppingPresets: PresetDef[] = [
  /* ---------------- shop.detail-hero 商品主图（11） ---------------- */
  p('shop.detail-hero', '服装商品大图', { fav: true }, ['服装', '主图', '轮播', '收藏']),
  p('shop.detail-hero', '数码商品大图', { fav: true }, ['数码', '主图', '轮播', '收藏']),
  p('shop.detail-hero', '美妆商品大图', { fav: true }, ['美妆', '主图', '轮播', '收藏']),
  p('shop.detail-hero', '食品商品大图', { fav: true }, ['食品', '主图', '轮播', '收藏']),
  p('shop.detail-hero', '家居商品大图', { fav: true }, ['家居', '主图', '轮播', '收藏']),
  p('shop.detail-hero', '图书商品大图', { fav: true }, ['图书', '主图', '轮播', '收藏']),
  p('shop.detail-hero', '母婴商品大图', { fav: true }, ['母婴', '主图', '轮播', '收藏']),
  p('shop.detail-hero', '生鲜商品大图', { fav: true }, ['生鲜', '主图', '轮播', '收藏']),
  p('shop.detail-hero', '运动商品大图', { fav: true }, ['运动', '主图', '轮播', '收藏']),
  p('shop.detail-hero', '珠宝商品大图', { fav: true }, ['珠宝', '主图', '轮播', '收藏']),
  p('shop.detail-hero', '极简无收藏大图', { fav: false }, ['主图', '极简', '无收藏']),

  /* ---------------- shop.qty-stepper 数量步进器（2） ---------------- */
  p('shop.qty-stepper', '常规购买数量', { label: '购买数量', value: 1, channel: 'qty' }, ['数量', '步进器', '常规']),
  p('shop.qty-stepper', '团购多件数量', { label: '团购份数（3 份起团）', value: 3, channel: 'qty' }, ['数量', '团购', '步进器']),

  /* ---------------- shop.sku-select SKU 选择（10） ---------------- */
  p('shop.sku-select', '连衣裙颜色尺码选择', { colors: '燕麦色,雾蓝色,经典黑', versions: 'S 码,M 码,L 码,XL 码' }, ['颜色', '尺码', '服装', '规格']),
  p('shop.sku-select', '手机颜色版本选择', { colors: '曜石黑,月光白,远峰蓝', versions: '128G,256G,512G' }, ['颜色', '版本', '数码', '规格']),
  p('shop.sku-select', '火锅底料口味选择', { colors: '牛油原味,番茄,菌汤', versions: '单人份,双人份,全家福' }, ['口味', '食品', '规格']),
  p('shop.sku-select', '纸巾规格选择', { colors: '三层加厚,四层柔韧', versions: '6 包,12 包,24 包' }, ['规格', '家居', '日用']),
  p('shop.sku-select', '乳液质地容量选择', { colors: '清爽型,滋润型', versions: '50ml,100ml,150ml' }, ['容量', '美妆', '规格']),
  p('shop.sku-select', '洗衣液香型选择', { colors: '薰衣草,风清白兰,桉树', versions: '1kg,2kg,3kg 补充装' }, ['香型', '容量', '日用']),
  p('shop.sku-select', '汉堡套餐选择', { colors: '牛肉堡,鸡腿堡,双层至尊', versions: '单堡,套餐 A（小食+可乐）,套餐 B（升级大薯）' }, ['套餐', '快餐', '规格']),
  p('shop.sku-select', '笔记本配置选择', { colors: '星空灰,银色', versions: 'i5+16G+512G,i7+16G+1T,i9+32G+2T' }, ['配置', '数码', '规格']),
  p('shop.sku-select', '行李箱尺寸选择', { colors: '雾霾蓝,磨砂黑,樱花粉', versions: '20 寸登机箱,24 寸,28 寸托运' }, ['尺寸', '旅行', '规格']),
  p('shop.sku-select', '四件套材质选择', { colors: '云朵棉,天丝,磨毛', versions: '1.5m 床,1.8m 床,2.0m 床' }, ['材质', '家居', '规格']),

  /* ---------------- shop.review-item 评价卡片（10） ---------------- */
  p('shop.review-item', '好评带图评价卡', { user: '糖*果', date: '2025-09-12', content: '收到就迫不及待试了，质地清爽不黏腻，第三天就能看到毛孔细腻了，已经安利全宿舍！附图全是原图～', reply: '感谢喜爱！回购暗号「水润加倍」找客服还有惊喜哦～' }, ['好评', '带图', '评价']),
  p('shop.review-item', '两周追评卡片', { user: '早*睡', date: '2025-10-02', content: '用了两周来追评：头皮出油明显变少了，发尾也不干，香味是淡淡的木质调很好闻。', reply: '感谢追评！坚持用满一个月效果更稳定哦～' }, ['追评', '复购', '评价']),
  p('shop.review-item', '差评安抚回复卡', { user: '路人*甲', date: '2025-09-28', content: '物流太慢了，等了整整五天才到，外盒还有点压痕，心情复杂。', reply: '非常抱歉给您添堵了！已安排补发赠品并申请运费赔付，客服 24h 在线随时找我们～' }, ['差评', '回复', '售后']),
  p('shop.review-item', '中肯中评卡片', { user: '阿*树', date: '2025-10-15', content: '整体还行，性价比可以，但和想象中的颜色有点色差，纠结党建议先看直播回放再决定。', reply: '感谢中肯反馈！已反馈工厂调整色差，不满意 7 天内可无理由退换～' }, ['中评', '色差', '评价']),
  p('shop.review-item', '精选回购评价卡', { user: '桃*酱', date: '2025-08-20', content: '第 5 次回购了！全家老小都在用，润而不油，冬天当身体乳也不心疼，无限回购系列。', reply: '被精选啦～送您 50 元无门槛券，注意查收！' }, ['精选', '回购', '评价']),
  p('shop.review-item', '视频测评评价卡', { user: '开*箱', date: '2025-09-05', content: '视频测评已上传：音质、降噪、续航实拍实测，300 元内真的能打，细节都在视频里。', reply: '感谢专业测评！已置顶到商品详情页啦～' }, ['视频', '测评', '评价']),
  p('shop.review-item', '晒单礼盒评价卡', { user: '米*粒', date: '2025-10-01', content: '晒单走一波！包装太精致了，送人自留都拿得出手，刻字服务还免费，好评！', reply: '谢谢喜欢～晒单奖励 20 积分已到账！' }, ['晒单', '礼盒', '评价']),
  p('shop.review-item', '默认好评卡片', { user: '用*户', date: '2025-09-22', content: '系统默认好评，东西没问题，物流也快。', reply: '感谢支持！新人再下单可领 10 元券哦～' }, ['默认好评', '常规', '评价']),
  p('shop.review-item', '实验室专业点评卡', { user: '检*测君', date: '2025-08-30', content: '实验室实测：成分表干净无添加，pH 5.5 温和，敏感肌友好，各项数据均在优秀区间。', reply: '感谢专业背书！检测报告已获授权展示在详情页～' }, ['专业', '测评', '成分']),
  p('shop.review-item', '买家秀九宫格卡', { user: '橙*子', date: '2025-10-08', content: '买家秀九宫格来了！上身效果绝了，175/65 穿 L 正好，姐妹们按身高体重抄作业。', reply: '感谢美丽买家秀！尺码表已按反馈优化～' }, ['买家秀', '穿搭', '评价']),

  /* ---------------- shop.price-row 价格行（8） ---------------- */
  p('shop.price-row', '限时直降价', { price: '899', original: '1299', sales: '2.1万', tags: '限时直降,仅剩 3 小时' }, ['限时', '直降', '价格']),
  p('shop.price-row', '会员专享价', { price: '129', original: '169', sales: '8632', tags: '会员专享,可叠加券' }, ['会员', '专享', '价格']),
  p('shop.price-row', '两人拼团价', { price: '59', original: '99', sales: '5.6万', tags: '拼团省 40,2 人成团' }, ['拼团', '优惠', '价格']),
  p('shop.price-row', '直播间专属价', { price: '199', original: '299', sales: '1.3万', tags: '直播间专属,赠小样' }, ['直播', '专属', '价格']),
  p('shop.price-row', '新人首单价', { price: '9.9', original: '39', sales: '8.9万', tags: '新人首单,每人限 1 件' }, ['新人', '首单', '价格']),
  p('shop.price-row', '学生认证价', { price: '149', original: '219', sales: '4277', tags: '学生认证享 7 折,赠笔袋' }, ['学生', '教育', '价格']),
  p('shop.price-row', '整点秒杀价', { price: '29', original: '99', sales: '9.9万', tags: '整点秒杀,手慢无' }, ['秒杀', '促销', '价格']),
  p('shop.price-row', '预售到手价', { price: '4999', original: '5699', sales: '1024', tags: '预售定金 100 抵 300,送延保' }, ['预售', '定金', '价格']),

  /* ---------------- shop.add-cart-bar 底部操作条（8） ---------------- */
  p('shop.add-cart-bar', '常规加购操作条', { cartText: '加入购物车', buyText: '立即购买' }, ['加购', '结算', '常规']),
  p('shop.add-cart-bar', '秒杀抢购操作条', { cartText: '加入购物车', buyText: '立即抢购' }, ['秒杀', '抢购', '促销']),
  p('shop.add-cart-bar', '预售定金操作条', { cartText: '付定金', buyText: '付尾款' }, ['预售', '定金', '促销']),
  p('shop.add-cart-bar', '拼团开团操作条', { cartText: '单独购买', buyText: '发起拼团' }, ['拼团', '开团', '促销']),
  p('shop.add-cart-bar', '到货预约操作条', { cartText: '到货通知', buyText: '立即预约' }, ['预约', '到货', '新品']),
  p('shop.add-cart-bar', '积分兑换操作条', { cartText: '加入购物车', buyText: '积分兑换' }, ['积分', '兑换', '会员']),
  p('shop.add-cart-bar', '立即选购操作条', { cartText: '收藏商品', buyText: '立即选购' }, ['选购', '收藏', '常规']),
  p('shop.add-cart-bar', '年货囤货操作条', { cartText: '加入购物车', buyText: '囤货下单' }, ['年货', '囤货', '春节']),

  /* ---------------- shop.address-bar 收货地址条（6） ---------------- */
  p('shop.address-bar', '家庭收货地址条', { name: '林晓', phone: '138****6688', address: '浙江省杭州市西湖区文三路 138 号 西溪世纪广场 3 幢 802 室' }, ['地址', '家庭', '默认']),
  p('shop.address-bar', '公司收货地址条', { name: '林晓', phone: '138****6688', address: '浙江省杭州市余杭区文一西路 969 号 淘宝城 5 号楼 2F 前台代收' }, ['地址', '公司', '上班']),
  p('shop.address-bar', '学校宿舍地址条', { name: '王小舟', phone: '159****2233', address: '湖北省武汉市洪山区珞喻路 152 号 华中科技大学韵苑 12 栋 431 宿舍' }, ['地址', '学校', '学生']),
  p('shop.address-bar', '驿站自提地址条', { name: '陈晨', phone: '186****9087', address: '上海市徐汇区漕溪北路 88 号 菜鸟驿站（地铁 1 号线 4 口）凭取件码取件' }, ['地址', '自提', '驿站']),
  p('shop.address-bar', '暂无地址引导条', { name: '暂无收货地址', phone: '去添加', address: '新用户添加地址立享首单包邮，支持一键粘贴微信收货信息' }, ['地址', '新增', '引导']),
  p('shop.address-bar', '备注上门地址条', { name: '李建国', phone: '137****5566', address: '四川省成都市锦江区春熙路 99 号 时代广场 A 座 1806（放门口奶箱上，请勿放驿站）' }, ['地址', '备注', '上门']),

  /* ---------------- shop.service-row 服务保障行（6） ---------------- */
  p('shop.service-row', '正品保障承诺行', { s1: '正品保障', s2: '假一赔十', s3: '七天无理由' }, ['正品', '保障', '承诺']),
  p('shop.service-row', '顺丰包邮服务行', { s1: '顺丰包邮', s2: '送货上门', s3: '极速退款' }, ['物流', '包邮', '服务']),
  p('shop.service-row', '售后退换承诺行', { s1: '七天无理由', s2: '运费险', s3: '破损包赔' }, ['售后', '退换', '服务']),
  p('shop.service-row', '全国联保服务行', { s1: '全国联保', s2: '两年质保', s3: '以旧换新' }, ['联保', '质保', '家电']),
  p('shop.service-row', '生鲜坏果包赔行', { s1: '产地直发', s2: '冷链配送', s3: '坏果包赔' }, ['生鲜', '冷链', '保障']),
  p('shop.service-row', '跨境正品保障行', { s1: '保税仓直发', s2: '正品溯源', s3: '关税补贴' }, ['跨境', '海淘', '保障']),

  /* ---------------- shop.order-summary 订单汇总（9） ---------------- */
  p('shop.order-summary', '普通订单结算卡', { goods: '1299.00', freight: '免运费', coupon: '0', total: '1299.00' }, ['结算', '订单', '常规']),
  p('shop.order-summary', '含运费订单卡', { goods: '159.00', freight: '12', coupon: '15', total: '156.00' }, ['运费', '订单', '结算']),
  p('shop.order-summary', '优惠券抵扣订单卡', { goods: '329.00', freight: '免运费', coupon: '50', total: '279.00' }, ['优惠券', '抵扣', '结算']),
  p('shop.order-summary', '积分抵扣订单卡', { goods: '89.00', freight: '免运费', coupon: '8.9', total: '80.10' }, ['积分', '抵扣', '结算']),
  p('shop.order-summary', '预售定金订单卡', { goods: '4599.00', freight: '免运费', coupon: '300', total: '4299.00' }, ['预售', '定金', '结算']),
  p('shop.order-summary', '拼团立减订单卡', { goods: '118.00', freight: '免运费', coupon: '30', total: '88.00' }, ['拼团', '立减', '结算']),
  p('shop.order-summary', '礼品卡支付订单卡', { goods: '268.00', freight: '免运费', coupon: '100', total: '168.00' }, ['礼品卡', '支付', '结算']),
  p('shop.order-summary', '分期付款订单卡', { goods: '8999.00', freight: '免运费', coupon: '0', total: '2999.66/期' }, ['分期', '免息', '结算']),
  p('shop.order-summary', '跨境含税订单卡', { goods: '699.00', freight: '含跨境税 69.90', coupon: '50', total: '718.90' }, ['跨境', '税费', '海淘']),
];
