import type { PresetDef } from './types';
import { p } from './types';

/**
 * food 类目精选预设（70 个，覆盖 food.tsx 全部 9 个基础组件）
 * props 字段逐字对照 food.tsx 的 defaultProps/fields：
 * banner(name/sales/fee/time/notice)、coupon-row(coupons)、category-sidebar(cats/active 0-8)、
 * dish-card(name/desc/price/sales)、dish-row(items/prices)、cart-bar(total/fee/count)、
 * order-status(status 仅「商家接单中/配送中/已送达」三值/rider)、table-head(no/queue)、rate-tags(total)
 */
export const foodPresets: PresetDef[] = [
  /* ---------------- food.category-sidebar 点餐分类侧栏（14） ---------------- */
  p('food.category-sidebar', '奶茶店点餐侧栏', { cats: '人气爆款,当季限定,奶茶,果茶,咖啡,小料加购', active: 0 }, ['奶茶', '点餐', '菜单', '分类']),
  p('food.category-sidebar', '火锅店点餐侧栏', { cats: '锅底,招牌肉类,海鲜河鲜,丸滑,素菜,蘸料饮品', active: 0 }, ['火锅', '点餐', '菜单', '分类']),
  p('food.category-sidebar', '快餐店点餐侧栏', { cats: '超值套餐,汉堡,炸鸡小食,米饭套餐,饮品,甜点', active: 0 }, ['快餐', '汉堡', '点餐', '分类']),
  p('food.category-sidebar', '日料店点餐侧栏', { cats: '刺身寿司,寿喜锅,丼饭,烤物,小食,清酒', active: 0 }, ['日料', '寿司', '点餐', '分类']),
  p('food.category-sidebar', '烘焙店点餐侧栏', { cats: '今日现烤,吐司,蛋糕,可颂,饼干礼盒,咖啡搭子', active: 1 }, ['烘焙', '面包', '点餐', '分类']),
  p('food.category-sidebar', '麻辣烫点餐侧栏', { cats: '荤菜,素菜,主食,丸类,蘸料,饮品', active: 0 }, ['麻辣烫', '点餐', '菜单', '分类']),
  p('food.category-sidebar', '烧烤店点餐侧栏', { cats: '招牌烤串,烤肉,烤蔬菜,烤海鲜,主食,酒水', active: 0 }, ['烧烤', '夜宵', '点餐', '分类']),
  p('food.category-sidebar', '粤菜馆点餐侧栏', { cats: '招牌烧腊,靓汤,海鲜,小炒,点心,糖水', active: 0 }, ['粤菜', '烧腊', '点餐', '分类']),
  p('food.category-sidebar', '川菜馆点餐侧栏', { cats: '招牌硬菜,江湖菜,凉菜,下饭菜,汤羹,饮品', active: 0 }, ['川菜', '点餐', '菜单', '分类']),
  p('food.category-sidebar', '西餐厅点餐侧栏', { cats: '前菜,主菜,意面披萨,汤品,甜品,葡萄酒', active: 0 }, ['西餐', '牛排', '点餐', '分类']),
  p('food.category-sidebar', '轻食沙拉侧栏', { cats: '低卡轻食,能量碗,沙拉,三明治,鲜榨果蔬汁,代餐', active: 0 }, ['轻食', '沙拉', '健身餐', '分类']),
  p('food.category-sidebar', '粥粉面店侧栏', { cats: '招牌粥品,汤粉,拌面,浇头小菜,油条点心,饮品', active: 0 }, ['粥粉面', '早餐', '点餐', '分类']),
  p('food.category-sidebar', '水果店侧栏', { cats: '当季鲜果,进口水果,果切拼盘,鲜榨果汁,果篮礼盒,囤货装', active: 0 }, ['水果', '鲜果', '点餐', '分类']),
  p('food.category-sidebar', '生鲜超市侧栏', { cats: '蔬菜蛋品,肉禽,海鲜水产,乳品烘焙,粮油调味,酒水饮料', active: 2 }, ['生鲜', '超市', '囤货', '分类']),

  /* ---------------- food.dish-card 菜品卡（15） ---------------- */
  p('food.dish-card', '宫保鸡丁菜品卡', { name: '宫保鸡丁', desc: '鸡丁滑嫩花生香脆，微微辣很下饭', price: 23.9, sales: '356' }, ['川菜', '下饭菜', '菜品']),
  p('food.dish-card', '黑糖珍珠奶茶卡', { name: '黑糖珍珠奶茶', desc: '波霸 Q 弹挂壁，黑糖香浓不齁甜', price: 13, sales: '2861' }, ['奶茶', '饮品', '菜品']),
  p('food.dish-card', '巴斯克芝士蛋糕卡', { name: '巴斯克芝士蛋糕', desc: '重芝士绵密拉丝，焦香外壳超治愈', price: 32, sales: '886' }, ['烘焙', '甜品', '菜品']),
  p('food.dish-card', '三文鱼刺身卡', { name: '厚切三文鱼刺身', desc: '空运直达纹理漂亮，配现磨山葵', price: 68, sales: '412' }, ['日料', '刺身', '菜品']),
  p('food.dish-card', '麻辣牛肉香锅卡', { name: '香锅旺辣牛肉', desc: '牛肉量足配菜丰富，微辣中辣可选', price: 52, sales: '703' }, ['川菜', '香锅', '菜品']),
  p('food.dish-card', '杨枝甘露饮品卡', { name: '杨枝甘露', desc: '芒果泥加上西柚粒，一口爆汁清爽', price: 16, sales: '1954' }, ['饮品', '甜品', '菜品']),
  p('food.dish-card', '黄金炸鸡桶卡', { name: '黄金脆皮炸鸡桶', desc: '现炸 40 分钟，外壳咔嚓爆汁', price: 89, sales: '1327' }, ['快餐', '炸鸡', '菜品']),
  p('food.dish-card', '满杯水果茶卡', { name: '满杯鲜橙水果茶', desc: '半斤水果一整杯，维 C 直接拉满', price: 19, sales: '1676' }, ['果茶', '饮品', '菜品']),
  p('food.dish-card', '红烧牛肉面卡', { name: '红烧牛肉面', desc: '牛腱子炖足 4 小时，汤头浓到挂勺', price: 22, sales: '1208' }, ['面食', '简餐', '菜品']),
  p('food.dish-card', '缤纷寿司拼盘卡', { name: '缤纷寿司拼盘', desc: '12 粒 6 种口味，聚会颜值担当', price: 78, sales: '529' }, ['日料', '寿司', '菜品']),
  p('food.dish-card', '提拉米苏甜品卡', { name: '意式提拉米苏', desc: '马斯卡彭叠加手指饼干，微苦不腻', price: 28, sales: '643' }, ['西餐', '甜品', '菜品']),
  p('food.dish-card', '蒜蓉小龙虾卡', { name: '蒜蓉小龙虾', desc: '中个 4-6 钱，蒜香浓郁虾肉弹牙', price: 128, sales: '908' }, ['夜宵', '海鲜', '菜品']),
  p('food.dish-card', '榴莲披萨卡', { name: '榴莲忘返披萨', desc: '金枕榴莲铺满饼底，拉丝能拉一米', price: 59, sales: '1024' }, ['披萨', '西餐', '菜品']),
  p('food.dish-card', '牛油果沙拉卡', { name: '牛油果鸡胸沙拉', desc: '高蛋白低负担，油醋汁清爽解腻', price: 26, sales: '577' }, ['轻食', '健身餐', '菜品']),
  p('food.dish-card', '豆浆油条早餐卡', { name: '现磨豆浆+大油条', desc: '豆浆现磨浓香，油条现炸酥脆', price: 9, sales: '2305' }, ['早餐', '粥粉面', '菜品']),

  /* ---------------- food.dish-row 推荐横滑（9） ---------------- */
  p('food.dish-row', '招牌人气推荐横滑', { items: '招牌烤鸭,糖醋里脊,干煸四季豆', prices: '58,38,26' }, ['推荐', '人气', '横滑']),
  p('food.dish-row', '店长拿手菜横滑', { items: '秘制醉蟹,油爆虾,酱鸭', prices: '88,56,42' }, ['店长推荐', '拿手菜', '横滑']),
  p('food.dish-row', '新品上市横滑', { items: '桂花酒酿奶冻,抹茶千层,生椰拿铁', prices: '22,29,15' }, ['新品', '上市', '横滑']),
  p('food.dish-row', '素食专区横滑', { items: '地三鲜,干锅花菜,麻婆豆腐', prices: '18,22,16' }, ['素食', '清爽', '横滑']),
  p('food.dish-row', '粤式必点横滑', { items: '脆皮烧鹅,白灼虾,豉汁排骨', prices: '68,48,32' }, ['粤菜', '招牌', '横滑']),
  p('food.dish-row', '下午茶甜点横滑', { items: '草莓千层,巴斯克蛋糕,手冲咖啡', prices: '32,28,22' }, ['下午茶', '甜点', '横滑']),
  p('food.dish-row', '深夜夜宵横滑', { items: '蒜蓉烤生蚝,烤五花,炒粉', prices: '36,28,15' }, ['夜宵', '烧烤', '横滑']),
  p('food.dish-row', '儿童餐横滑', { items: '迷你牛肉汉堡,笑笑脸薯饼,鲜榨橙汁', prices: '18,8,12' }, ['儿童餐', '亲子', '横滑']),
  p('food.dish-row', '低卡专区横滑', { items: '香煎鸡胸藜麦碗,凉拌木耳,无糖酸奶', prices: '26,12,9' }, ['低卡', '健身餐', '横滑']),

  /* ---------------- food.cart-bar 购物车条（8） ---------------- */
  p('food.cart-bar', '奶茶店购物车条', { total: 36, fee: 2, count: 2 }, ['奶茶', '购物车', '结算']),
  p('food.cart-bar', '快餐店购物车条', { total: 42, fee: 0, count: 3 }, ['快餐', '购物车', '免配送']),
  p('food.cart-bar', '火锅外送购物车条', { total: 268, fee: 8, count: 6 }, ['火锅', '购物车', '外送']),
  p('food.cart-bar', '深夜夜宵购物车条', { total: 96, fee: 4, count: 5 }, ['夜宵', '购物车', '烧烤']),
  p('food.cart-bar', '家宴正餐购物车条', { total: 158, fee: 3, count: 4 }, ['正餐', '购物车', '家宴']),
  p('food.cart-bar', '轻食沙拉购物车条', { total: 58, fee: 5, count: 2 }, ['轻食', '购物车', '沙拉']),
  p('food.cart-bar', '烘焙到店购物车条', { total: 76, fee: 0, count: 4 }, ['烘焙', '购物车', '面包']),
  p('food.cart-bar', '生鲜囤货购物车条', { total: 128, fee: 6, count: 9 }, ['生鲜', '购物车', '囤货']),

  /* ---------------- food.coupon-row 领券行（7） ---------------- */
  p('food.coupon-row', '新客立减券行', { coupons: '新客立减 8 元,满 30 减 8,满 50 减 15' }, ['新客', '立减', '优惠券']),
  p('food.coupon-row', '阶梯满减券行', { coupons: '满 50 减 12,满 100 减 30,满 200 减 68' }, ['满减', '阶梯', '优惠券']),
  p('food.coupon-row', '免配送费券行', { coupons: '配送费立免,满 39 免配送,全城免运费' }, ['免配送', '运费', '优惠券']),
  p('food.coupon-row', '第二份半价券行', { coupons: '第二杯半价,第二份 0 元,买一送一' }, ['第二份半价', '买一送一', '优惠券']),
  p('food.coupon-row', '周末特惠券行', { coupons: '周末满 40 减 10,周末甜品半价,周五领券翻倍' }, ['周末', '特惠', '优惠券']),
  p('food.coupon-row', '生日专属券行', { coupons: '生日 7 折券,生日赠长寿面,生日免配送' }, ['生日', '专属', '优惠券']),
  p('food.coupon-row', '打包费减免券行', { coupons: '打包费立减,满 2 份免打包,环保餐盒 0 元' }, ['打包费', '环保', '优惠券']),

  /* ---------------- food.rate-tags 评分标签行（5） ---------------- */
  p('food.rate-tags', '人气餐厅评分标签', { total: 23000 }, ['评价', '餐厅', '评分']),
  p('food.rate-tags', '奶茶店评分标签', { total: 45800 }, ['评价', '奶茶', '评分']),
  p('food.rate-tags', '快餐店评分标签', { total: 9860 }, ['评价', '快餐', '评分']),
  p('food.rate-tags', '酒楼正餐评分标签', { total: 152000 }, ['评价', '正餐', '酒楼']),
  p('food.rate-tags', '水果店评分标签', { total: 3200 }, ['评价', '水果', '评分']),

  /* ---------------- food.order-status 订单状态（6） ---------------- */
  p('food.order-status', '商家接单中状态卡', { status: '商家接单中', rider: '骑手待接单' }, ['接单', '订单', '状态']),
  p('food.order-status', '出餐备餐中状态卡', { status: '商家接单中', rider: '骑手·刘师傅' }, ['备餐', '出餐', '订单']),
  p('food.order-status', '骑手配送中状态卡', { status: '配送中', rider: '骑手·王师傅' }, ['配送', '骑手', '订单']),
  p('food.order-status', '夜宵配送中状态卡', { status: '配送中', rider: '骑手·李姐' }, ['夜宵', '配送', '订单']),
  p('food.order-status', '已送达待取餐卡', { status: '已送达', rider: '骑手·赵师傅' }, ['送达', '取餐', '订单']),
  p('food.order-status', '订单完成状态卡', { status: '已送达', rider: '骑手·小周' }, ['完成', '评价', '订单']),

  /* ---------------- food.banner 店铺头部卡（4） ---------------- */
  p('food.banner', '新店开业店铺头', { name: '巷子口·老王川菜馆', sales: '2000+', fee: 3, time: '35分钟', notice: '新客立减 8 元，满 30 再减 8' }, ['新店', '开业', '店铺头']),
  p('food.banner', '周年庆店铺头', { name: '湘遇·小炒黄牛肉（旗舰店）', sales: '1.2万', fee: 2, time: '30分钟', notice: '5 周年庆：全场 8.8 折，进店领 15 元券' }, ['周年庆', '旗舰店', '店铺头']),
  p('food.banner', '深夜食堂店铺头', { name: '深夜食堂·烧烤粥铺', sales: '800+', fee: 4, time: '40分钟', notice: '22:00-02:00 夜宵专场，烤串买 10 送 2' }, ['夜宵', '烧烤', '店铺头']),
  p('food.banner', '下午茶烘焙店铺头', { name: '甜野·手作烘焙', sales: '3000+', fee: 0, time: '25分钟', notice: '下午茶时段：蛋糕买二送一，免配送费' }, ['下午茶', '烘焙', '店铺头']),

  /* ---------------- food.table-head 取餐卡（2） ---------------- */
  p('food.table-head', '快餐店取餐号卡', { no: 68, queue: 3 }, ['取餐', '叫号', '快餐']),
  p('food.table-head', '奶茶店叫号卡', { no: 152, queue: 7 }, ['取餐', '叫号', '奶茶']),
];
