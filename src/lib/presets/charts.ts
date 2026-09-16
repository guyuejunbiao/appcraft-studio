import type { PresetDef } from './types';
import { p } from './types';

/**
 * charts 类目精选预设（60 个）：覆盖 10 个数据图表基础组件。
 * 场景分配：柱状图（月度销量/季度营收/渠道/部门/流量/增长/品类）· 横条（城市/门店/品类/预算/应用/渠道）
 * · 折线面积（营收/日活/气温/血糖/耗电/学习/粉丝）· 饼图（成交/品类/预算/时间/人群/支付）
 * · 环形进度（年目标/存储/会员/课程/预算）· 指标卡（销售额/新增/转化/客单/复购/好评/响应/在线/退货）
 * · 排行榜（销售/门店/主播/商品/城市/笔记/学员）· 热力格（活跃/流量/打卡/货架）
 * · 仪表盘（目标达成/库容/信用/满意度）· 对比双柱（环比/新老客/A-B/课前课后/减脂前后）。
 * 注意：baseType 前缀 'chart' 无法自动推导为合法 CategoryId，统一显式传 'charts'。
 */
export const chartsPresets: PresetDef[] = [
  // —— chart.bar-group 柱状图（7）——
  p('chart.bar-group', '月度销量对比看板', { title: '近 7 个月销量（台）', values: '120,156,132,178,164,205,182', labels: '1月,2月,3月,4月,5月,6月,7月', highlightIndex: 5 }, ['销量', '月度', '走势', '电商'], 'charts'),
  p('chart.bar-group', '季度营收柱状图', { title: '近 7 个季度营收（万元）', values: '86,94,88,102,116,124,138', labels: '23Q1,23Q2,23Q3,23Q4,24Q1,24Q2,24Q3', highlightIndex: 6 }, ['营收', '季度', '财务', '经营'], 'charts'),
  p('chart.bar-group', '渠道销量对比', { title: '各渠道本周销量（单）', values: '286,342,198,410,265,320,180', labels: '天猫,京东,抖音,拼多多,小程序,门店,批发', highlightIndex: 3 }, ['渠道', '电商', '销量', '对比'], 'charts'),
  p('chart.bar-group', '部门业绩看板', { title: '各部门本月业绩（万元）', values: '86,72,95,68,88,79,64', labels: '销售,市场,电商,门店,渠道,大客,加盟', highlightIndex: 2 }, ['部门', '业绩', '团队', '管理'], 'charts'),
  p('chart.bar-group', '流量来源分析', { title: '本周流量来源（千次）', values: '46,32,58,24,38,18,12', labels: '搜索,直访,社媒,广告,外链,邮件,其他', highlightIndex: 2 }, ['流量', '运营', '来源', '网站'], 'charts'),
  p('chart.bar-group', '用户增长趋势柱图', { title: '近 7 周新增用户（人）', values: '320,385,342,460,512,478,586', labels: 'W1,W2,W3,W4,W5,W6,W7', highlightIndex: 6 }, ['用户增长', '拉新', '周报', '运营'], 'charts'),
  p('chart.bar-group', '品类销售看板', { title: '各品类本周销量（件）', values: '486,352,268,410,196,158,120', labels: '上衣,裤装,裙装,鞋靴,包袋,配饰,帽子', highlightIndex: 0 }, ['品类', '服装', '销售', '零售'], 'charts'),

  // —— chart.h-bar 横向条形图（6）——
  p('chart.h-bar', '城市销量排行', { title: '重点城市月销量', items: '上海 286,北京 254,广州 231,深圳 218,成都 186', unit: '台' }, ['城市', '排行', '销量', '区域'], 'charts'),
  p('chart.h-bar', '门店业绩排行', { title: '直营店月度业绩', items: '旗舰店 168,高新店 142,滨江店 128,大学城店 96', unit: '万元' }, ['门店', '业绩', '线下', '连锁'], 'charts'),
  p('chart.h-bar', '品类销售占比条图', { title: '各品类销售占比', items: '上衣 32,裤装 26,鞋靴 22,配饰 12', unit: '%' }, ['品类', '占比', '销售', '服装'], 'charts'),
  p('chart.h-bar', '部门预算对比', { title: '各部门季度预算', items: '市场部 86,研发部 120,运营部 64,人事部 38,财务部 26', unit: '万元' }, ['预算', '部门', '财务', '报销'], 'charts'),
  p('chart.h-bar', '应用下载排行', { title: '本周应用下载榜', items: '记账 86,番茄钟 72,天气 58,日历 44', unit: '万次' }, ['应用', '下载', '排行', '工具'], 'charts'),
  p('chart.h-bar', '渠道获客成本', { title: '各渠道获客成本', items: '信息流 46,搜索广告 38,社媒种草 32,线下地推 28', unit: '元/人' }, ['获客', '投放', '成本', '营销'], 'charts'),

  // —— chart.line-area 折线面积图（7）——
  p('chart.line-area', '年度营收走势', { title: '2024 年度营收（万元）', values: '86,92,88,104,118,126,134,142,156,168,182,196', unit: '万' }, ['营收', '年度', '走势', '经营'], 'charts'),
  p('chart.line-area', '日活趋势看板', { title: '近 14 天日活（人）', values: '8600,9200,8800,9600,10400,9800,11200,11800,12600,12100,13400,14200,13800,15200', unit: '人' }, ['日活', '趋势', '运营', '增长'], 'charts'),
  p('chart.line-area', '一周气温变化', { title: '本周气温变化（℃）', values: '12,14,13,16,18,17,20', unit: '℃' }, ['天气', '气温', '一周', '生活'], 'charts'),
  p('chart.line-area', '空腹血糖监测', { title: '一周空腹血糖（mmol/L）', values: '6.2,5.8,6.5,5.6,5.4,5.9,5.2', unit: 'mmol/L' }, ['血糖', '健康', '监测', '慢病'], 'charts'),
  p('chart.line-area', '家庭耗电统计', { title: '近 7 天耗电量（度）', values: '12.6,11.8,13.2,10.4,9.8,14.6,11.2', unit: '度' }, ['耗电', '用电', '智能家居', '节能'], 'charts'),
  p('chart.line-area', '每日学习时长', { title: '本周每日学习（小时）', values: '2.5,3,1.5,3.5,2,4.5,3', unit: '小时' }, ['学习', '时长', '自律', '打卡'], 'charts'),
  p('chart.line-area', '粉丝增长曲线', { title: '近 7 天新增粉丝（人）', values: '120,156,142,210,186,268,312', unit: '人' }, ['粉丝', '涨粉', '自媒体', '内容'], 'charts'),

  // —— chart.pie 饼图（6）——
  p('chart.pie', '渠道成交占比', { items: '直播带货 46,搜索商城 32,线下门店 22', total: '3.2万' }, ['渠道', '成交', '占比', '电商'], 'charts'),
  p('chart.pie', '品类销售构成', { items: '女装 42,男装 35,童装 23', total: '86万' }, ['品类', '销售', '构成', '零售'], 'charts'),
  p('chart.pie', '年度预算分配', { items: '研发 45,市场 30,运营 25', total: '500万' }, ['预算', '分配', '财务', '经营'], 'charts'),
  p('chart.pie', '一天时间分配', { items: '深度工作 40,会议协作 30,学习成长 30', total: '10h' }, ['时间管理', '效率', '复盘', '日程'], 'charts'),
  p('chart.pie', '用户人群画像', { items: '女性用户 58,男性用户 36,未知 6', total: '12.8万' }, ['人群', '画像', '用户', '调研'], 'charts'),
  p('chart.pie', '支付方式占比', { items: '移动支付 68,银行卡 22,其他 10', total: '5.6万' }, ['支付', '收银', '占比', '门店'], 'charts'),

  // —— chart.donut-progress 环形进度（5）——
  p('chart.donut-progress', '年度目标完成度', { title: '年度营收目标完成率', percent: 78, note: '已完成 3,900 万 / 全年 5,000 万' }, ['目标', 'OKR', '完成率', '经营'], 'charts'),
  p('chart.donut-progress', '云盘存储空间', { title: '云盘存储空间', percent: 86, note: '已用 172 GB / 共 200 GB' }, ['存储', '云盘', '空间', '工具'], 'charts'),
  p('chart.donut-progress', '会员成长进度', { title: '会员成长值进度', percent: 62, note: '还差 760 成长值升级黄金会员' }, ['会员', '成长值', '权益', '等级'], 'charts'),
  p('chart.donut-progress', '课程学习进度', { title: 'Python 入门课学习进度', percent: 45, note: '已学 18 讲 / 共 40 讲' }, ['课程', '学习', '进度', '教育'], 'charts'),
  p('chart.donut-progress', '市场预算使用', { title: '市场部预算使用', percent: 68, note: '已使用 34 万 / 总预算 50 万' }, ['预算', '使用', '费用', '管理'], 'charts'),

  // —— chart.kpi-card 指标卡（9）——
  p('chart.kpi-card', '今日销售额指标', { title: '今日销售额（元）', value: '128,560', delta: '+12.4%', up: true, yoy: '同比上周同期增长 8.6%' }, ['销售额', '电商', '看板', '经营'], 'charts'),
  p('chart.kpi-card', '今日新增用户', { title: '今日新增用户（人）', value: '1,286', delta: '+18.2%', up: true, yoy: '环比昨日多拉新 198 人' }, ['新增用户', '拉新', '增长', '运营'], 'charts'),
  p('chart.kpi-card', '下单转化率', { title: '下单转化率', value: '3.86%', delta: '+0.4%', up: true, yoy: '较上周提升 0.4 个百分点' }, ['转化率', '成交', '漏斗', '电商'], 'charts'),
  p('chart.kpi-card', '平均客单价', { title: '平均客单价（元）', value: '186', delta: '+6.5%', up: true, yoy: '搭配套餐上线带动客单上行' }, ['客单价', '连带率', '销售', '零售'], 'charts'),
  p('chart.kpi-card', '30 天复购率', { title: '30 天复购率', value: '42.6%', delta: '+2.1%', up: true, yoy: '会员日常购贡献最大增幅' }, ['复购率', '会员', '留存', '私域'], 'charts'),
  p('chart.kpi-card', '近 30 天好评率', { title: '近 30 天好评率', value: '98.2%', delta: '+0.6%', up: true, yoy: '售后提速带动口碑稳步提升' }, ['好评率', '口碑', '服务', '评价'], 'charts'),
  p('chart.kpi-card', '客服响应时长', { title: '平均响应时长（秒）', value: '26', delta: '-8', up: false, yoy: '排班优化后接单更快了' }, ['响应时长', '客服', '效率', '服务'], 'charts'),
  p('chart.kpi-card', '直播间在线人数', { title: '直播间在线人数（人）', value: '4,362', delta: '+22.8%', up: true, yoy: '晚间黄金档流量高峰中' }, ['在线人数', '直播', '流量', '实时'], 'charts'),
  p('chart.kpi-card', '本周退货率', { title: '本周退货率', value: '2.4%', delta: '-0.8%', up: false, yoy: '质检新规上线后持续回落' }, ['退货率', '售后', '质检', '电商'], 'charts'),

  // —— chart.rank-top 排行榜 TOP3（7）——
  p('chart.rank-top', '本周销售之星', { title: '本周销售 TOP3', items: '王小雅 985,李承泽 872,陈默 764' }, ['销售', '排行榜', '激励', '团队'], 'charts'),
  p('chart.rank-top', '月度门店前三', { title: '月度门店业绩 TOP3', items: '旗舰店 168,高新店 142,滨江店 128' }, ['门店', '业绩', '排行', '连锁'], 'charts'),
  p('chart.rank-top', '带货主播榜', { title: '本周带货主播 TOP3', items: '小鹿姐 520,大力哥 468,安娜 392' }, ['主播', '直播', '带货', '榜单'], 'charts'),
  p('chart.rank-top', '热销商品榜', { title: '热销商品 TOP3', items: '轻氧气泡水 3260,燕麦拿铁 2840,鸡胸肉肠 2180' }, ['商品', '热销', '爆款', '零售'], 'charts'),
  p('chart.rank-top', '骑行热度城市', { title: '骑行热度城市 TOP3', items: '成都 486,杭州 452,广州 388' }, ['城市', '骑行', '热度', '运动'], 'charts'),
  p('chart.rank-top', '爆款笔记榜', { title: '本周爆款笔记 TOP3', items: '露营咖啡攻略 1200,通勤穿搭 986,厨房改造 842' }, ['笔记', '内容', '种草', '社区'], 'charts'),
  p('chart.rank-top', '打卡学员榜', { title: '本月打卡学员 TOP3', items: '林小满 28,赵一鸣 26,何以宁 25' }, ['学员', '打卡', '教育', '激励'], 'charts'),

  // —— chart.heatmap 日历热力格（4）——
  p('chart.heatmap', '团队活跃热力', { title: '团队近 5 周活跃度', level: 3 }, ['活跃度', '团队', '协作', '考勤'], 'charts'),
  p('chart.heatmap', '晚高峰流量热力', { title: '晚高峰时段流量', level: 4 }, ['流量', '时段', '高峰', '运营'], 'charts'),
  p('chart.heatmap', '晨跑打卡热力', { title: '近 5 周晨跑打卡', level: 2 }, ['打卡', '晨跑', '坚持', '运动'], 'charts'),
  p('chart.heatmap', '货架点击热力', { title: '黄金货架点击热度', level: 1 }, ['货架', '陈列', '点击', '零售'], 'charts'),

  // —— chart.gauge 仪表盘（4）——
  p('chart.gauge', '年度目标达成率', { title: '年度目标达成率', percent: 78, unit: '%' }, ['目标', '达成率', '复盘', '经营'], 'charts'),
  p('chart.gauge', '仓库库容占用', { title: '仓库库容占用', percent: 86, unit: '%' }, ['库存', '库容', '仓储', '告警'], 'charts'),
  p('chart.gauge', '个人信用健康度', { title: '个人信用健康度', percent: 88, unit: '分' }, ['信用', '评分', '金融', '征信'], 'charts'),
  p('chart.gauge', '客户服务满意度', { title: '客户服务满意度', percent: 96, unit: '%' }, ['满意度', '服务', '售后', 'NPS'], 'charts'),

  // —— chart.compare 对比双柱（5）——
  p('chart.compare', '月度营收环比', { title: '月度营收对比（万元）', categories: '第 1 周,第 2 周,第 3 周,第 4 周', current: '92,78,105,88', previous: '76,82,90,74' }, ['环比', '营收', '对比', '财务'], 'charts'),
  p('chart.compare', '新老客成交对比', { title: '新老客月度成交对比', categories: '新客下单,老客下单,新客复购,老客复购', current: '386,512,98,215', previous: '310,480,76,198' }, ['新老客', '成交', '复购', '运营'], 'charts'),
  p('chart.compare', '落地页 A/B 复盘', { title: '落地页改版 A/B 复盘', categories: '注册转化,首单转化,分享率,复访率', current: '42,28,19,35', previous: '31,22,12,27' }, ['A/B 实验', '改版', '转化', '增长'], 'charts'),
  p('chart.compare', '体能训练营前后对比', { title: '体能训练营前后对比', categories: '握力,核心耐力,柔韧性,心肺耐力', current: '82,75,68,79', previous: '55,48,60,57' }, ['体测', '训练营', '课前课后', '进步'], 'charts'),
  p('chart.compare', '减脂前后对比', { title: '减脂 8 周前后对比', categories: '体重,体脂率,腰围,臀围', current: '62,24,76,95', previous: '68,27,82,98' }, ['减脂', '围度', '体测', '变化'], 'charts'),
];
