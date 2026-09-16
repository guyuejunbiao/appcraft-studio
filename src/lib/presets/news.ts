import type { PresetDef } from './types';
import { p } from './types';

/**
 * news 类目精选预设（60 个，覆盖 news.tsx 全部 10 个基础组件）
 * props 字段逐字对照 news.tsx 的 defaultProps/fields：
 * headline(title/source/time/views/height)、list-item(title/source/comments/pinned)、
 * channel-tabs(channels/activeIndex)、flash-bar(title/count)、hot-board(title/items)、
 * subscribe-card(name/desc/subscribed)、special-topic(name/count)、date-header(date/weekday/slogan/weather)、
 * pic-news(title/source/count)、video-news(title/source/views/duration)
 */
export const newsPresets: PresetDef[] = [
  /* ---------------- news.channel-tabs 频道 Tab（6） ---------------- */
  p('news.channel-tabs', '综合新闻频道栏', { channels: '关注,推荐,热榜,本地,生活,音频', activeIndex: 1 }, ['综合', '频道', '新闻']),
  p('news.channel-tabs', '科技频道栏', { channels: '头条,手机,数码,AI,互联网,硬件', activeIndex: 3 }, ['科技', '频道', '数码']),
  p('news.channel-tabs', '财经频道栏', { channels: '头条,股市,基金,外汇,黄金,房市', activeIndex: 2 }, ['财经', '频道', '投资']),
  p('news.channel-tabs', '体育频道栏', { channels: '头条,足球,NBA,乒乓球,羽毛球,电竞', activeIndex: 1 }, ['体育', '频道', '赛事']),
  p('news.channel-tabs', '娱乐频道栏', { channels: '头条,影视,综艺,明星,音乐,演出', activeIndex: 0 }, ['娱乐', '频道', '影视']),
  p('news.channel-tabs', '本地生活频道栏', { channels: '推荐,民生,交通,美食,天气,活动', activeIndex: 0 }, ['本地', '民生', '频道']),

  /* ---------------- news.headline 头条大图（10） ---------------- */
  p('news.headline', 'AI大事件头条', { title: '国内首个全模态大模型发布：能听会看还会推理，手机端实时运行', source: '科技新知', time: '12 分钟前', views: '486万', height: 200 }, ['科技', 'AI', '头条']),
  p('news.headline', '新能源头条', { title: '全国充电桩突破 1200 万个，高速服务区实现基本全覆盖', source: '能源观察', time: '1 小时前', views: '212万', height: 200 }, ['新能源', '充电', '头条']),
  p('news.headline', '航天头条', { title: '神舟二十一号乘组确定：三名航天员将在轨驻留 6 个月', source: '新华社', time: '刚刚', views: '638万', height: 220 }, ['航天', '神舟', '头条']),
  p('news.headline', '体育夺冠头条', { title: '绝杀！中国女足 3:2 逆转夺冠，时隔 16 年再登亚洲之巅', source: '体育周报', time: '28 分钟前', views: '1024万', height: 220 }, ['体育', '夺冠', '头条']),
  p('news.headline', '经济政策头条', { title: '多家银行下调存款利率，专家：利于降低实体经济融资成本', source: '经济日报', time: '2 小时前', views: '324万', height: 200 }, ['财经', '政策', '头条']),
  p('news.headline', '教育改革头条', { title: '多地推行中小学课间 15 分钟，让孩子走出教室动起来', source: '教育导报', time: '3 小时前', views: '189万', height: 180 }, ['教育', '课间', '头条']),
  p('news.headline', '医疗突破头条', { title: '国产阿尔茨海默新药三期临床成功，延缓认知下降达 42%', source: '健康时报', time: '5 小时前', views: '457万', height: 200 }, ['医疗', '新药', '头条']),
  p('news.headline', '影视热点头条', { title: '国产科幻大片定档春节档，首支预告 24 小时播放破亿', source: '电影频道', time: '6 小时前', views: '756万', height: 220 }, ['影视', '定档', '头条']),
  p('news.headline', '汽车发布头条', { title: '续航 1500 公里的固态电池车型亮相，明年上半年量产交付', source: '汽车之家', time: '昨天', views: '289万', height: 200 }, ['汽车', '固态电池', '头条']),
  p('news.headline', '本地新闻头条', { title: '本周六晚 8 点滨江焰火秀回归，周边道路将临时管制', source: '本地早知道', time: '42 分钟前', views: '96万', height: 180 }, ['本地', '活动', '头条']),

  /* ---------------- news.list-item 新闻列表项（14） ---------------- */
  p('news.list-item', '科技置顶快讯行', { title: '谷歌发布新一代量子芯片，运算速度提升 10 倍', source: '36氪', comments: '1024', pinned: true }, ['科技', '快讯', '置顶']),
  p('news.list-item', '财经动态行', { title: 'A股三大指数集体收涨，新能源板块领涨逾 4%', source: '证券时报', comments: '876', pinned: false }, ['财经', '股市', '动态']),
  p('news.list-item', '体育战报行', { title: '国乒包揽世界杯男单女单冠军，樊振东实现三连冠', source: '央视体育', comments: '2314', pinned: false }, ['体育', '战报', '乒乓球']),
  p('news.list-item', '娱乐资讯行', { title: '音乐节官宣阵容：多位顶流歌手同台，下周一开票', source: '娱乐风向标', comments: '1568', pinned: false }, ['娱乐', '音乐节', '资讯']),
  p('news.list-item', '社会热点行', { title: '独居老人智能水表项目落地，12 小时用水异常自动预警', source: '民生周刊', comments: '643', pinned: false }, ['社会', '民生', '养老']),
  p('news.list-item', '汽车新品行', { title: '问界新 M7 六座版上市，起售价直降 2 万', source: '汽车公社', comments: '921', pinned: false }, ['汽车', '新车', '上市']),
  p('news.list-item', '健康科普行', { title: '睡眠不足 6 小时，身体会发生什么？医生一次性说清', source: '丁香医生', comments: '4372', pinned: false }, ['健康', '睡眠', '科普']),
  p('news.list-item', '教育资讯行', { title: '考研报名人数九年来首次下降，竞争格局悄然生变', source: '中国教育报', comments: '1876', pinned: false }, ['教育', '考研', '资讯']),
  p('news.list-item', '房产政策行', { title: '多城取消二手房限售，改善置换需求加速释放', source: '每日经济新闻', comments: '486', pinned: true }, ['房产', '政策', '限售']),
  p('news.list-item', '旅游推荐行', { title: '错峰游正当时：11 月这 8 个目的地人少景美还便宜', source: '背包旅行', comments: '732', pinned: false }, ['旅游', '攻略', '错峰']),
  p('news.list-item', '美食探店行', { title: '老字号青团上新：咸蛋黄肉松口味回归，排队长达 50 米', source: '吃货研究所', comments: '568', pinned: false }, ['美食', '老字号', '排队']),
  p('news.list-item', '游戏发布行', { title: '国产单机大作全球销量破 300 万份，Steam 好评率 96%', source: '游戏葡萄', comments: '3245', pinned: false }, ['游戏', '单机', '销量']),
  p('news.list-item', '数码评测行', { title: '六款热门折叠屏横评：耐折测试 20 万次后差距惊人', source: '极客公园', comments: '1154', pinned: false }, ['数码', '评测', '折叠屏']),
  p('news.list-item', '母婴知识行', { title: '儿科医生提醒：流感高发季，孩子出现这 3 种情况立即就医', source: '科学育儿', comments: '2893', pinned: false }, ['母婴', '儿科', '知识']),

  /* ---------------- news.hot-board 热点榜（6） ---------------- */
  p('news.hot-board', '全网热搜榜', { title: '全网热搜榜', items: '神舟二十一号乘组公布 486.3万,全国降温预警发布 312.5万,女子马拉松世界纪录被破 287.9万,双11首波优惠开抢 198.6万,流感防护指南 165.2万,城市马拉松周日开跑 121.8万' }, ['热搜', '榜单', '综合']),
  p('news.hot-board', '热议话题榜', { title: '热议话题榜', items: '年轻人为什么爱上CityWalk 246.8万,月薪2万却不敢消费？ 198.3万,AI会取代哪些职业 156.7万,要不要裸辞去旅行 132.4万,同居前必须聊清楚的事 98.6万,一人住是种什么体验 76.2万' }, ['话题', '热议', '榜单']),
  p('news.hot-board', '视频热播榜', { title: '视频热播榜', items: '李子柒回归首更：手工蜀绣 892.4万,航天员太空跨年花絮 467.2万,山村小木匠新作 388.5万,山顶日出延时摄影 265.1万,流浪猫救助日记 198.7万,无人机灯光秀 154.3万' }, ['视频', '热播', '榜单']),
  p('news.hot-board', '音乐飙升榜', { title: '音乐飙升榜', items: '晚风信 286.4万,城市的夜 212.7万,山海皆过客 178.3万,冬眠 145.6万,向上的光 121.9万,南方姑娘 98.4万' }, ['音乐', '飙升', '榜单']),
  p('news.hot-board', '影视热度榜', { title: '影视热度榜', items: '漫长季节2 856.3万,三体Ⅱ·黑暗森林 432.6万,星际穿越重映 386.4万,怒海争锋 297.1万,犯罪图鉴 245.8万,厨房爱情故事 187.3万' }, ['影视', '热度', '榜单']),
  p('news.hot-board', '搜索热词榜', { title: '搜索热词榜', items: '双十一攻略 342.6万,流感疫苗预约 286.9万,养老金新政策 234.5万,秋招补录 178.2万,暖气费补贴 156.8万,马拉松报名 134.1万' }, ['搜索', '热词', '榜单']),

  /* ---------------- news.flash-bar 快讯条（5） ---------------- */
  p('news.flash-bar', '财经快讯条', { title: '央行开展 5000 亿元 MLF 操作，中标利率维持 2.0% 不变', count: 5 }, ['财经', '快讯', '央行']),
  p('news.flash-bar', '科技快讯条', { title: '国产大模型集体下调 API 价格，最低降至每百万 tokens 0.8 元', count: 12 }, ['科技', '快讯', '大模型']),
  p('news.flash-bar', '体育快讯条', { title: '中国金花闯进年终总决赛四强，创个人最佳战绩', count: 3 }, ['体育', '快讯', '网球']),
  p('news.flash-bar', '突发快讯条', { title: '台湾花莲县附近发生 4.9 级地震，震源深度 10 千米', count: 1 }, ['突发', '地震', '快讯']),
  p('news.flash-bar', '直播中快讯条', { title: '直播中：世界人工智能大会开幕，多款人形机器人首发亮相', count: 8 }, ['直播', 'AI大会', '快讯']),

  /* ---------------- news.subscribe-card 订阅源卡（7） ---------------- */
  p('news.subscribe-card', '科技媒体订阅卡', { name: '科技每日推送', desc: '硬核科技资讯 · 每天 8 点更新', subscribed: false }, ['科技', '媒体', '订阅']),
  p('news.subscribe-card', '财经早报订阅卡', { name: '财经早班车', desc: '看懂财经大事 · 通勤 5 分钟速读', subscribed: true }, ['财经', '早报', '订阅']),
  p('news.subscribe-card', '健身号订阅卡', { name: '暴汗研究所', desc: '科学健身干货 · 每周三、五、日更新', subscribed: false }, ['健身', '干货', '订阅']),
  p('news.subscribe-card', '美食号订阅卡', { name: '吃货雷达', desc: '本地宝藏小店测评 · 周五晚 6 点探店直播', subscribed: false }, ['美食', '探店', '订阅']),
  p('news.subscribe-card', '母婴号订阅卡', { name: '科学育儿指南', desc: '儿科医生审核的育儿知识 · 新手爸妈必备', subscribed: true }, ['母婴', '育儿', '订阅']),
  p('news.subscribe-card', '汽车号订阅卡', { name: '老司机说车', desc: '新车试驾与避坑指南 · 每天一条短视频', subscribed: false }, ['汽车', '试驾', '订阅']),
  p('news.subscribe-card', '读书号订阅卡', { name: '周一读书会', desc: '每周拆解一本好书 · 陪你把书读完', subscribed: false }, ['读书', '书评', '订阅']),

  /* ---------------- news.special-topic 专题卡（5） ---------------- */
  p('news.special-topic', '两会专题卡', { name: '聚焦全国两会 · 民生新政策', count: '共 86 篇 · 1264万 次阅读' }, ['两会', '政策', '专题']),
  p('news.special-topic', '世界杯专题卡', { name: '2026 世界杯亚洲区预选赛', count: '共 42 篇 · 862.4万 次阅读' }, ['世界杯', '足球', '专题']),
  p('news.special-topic', '双十一专题卡', { name: '双十一全民攻略', count: '共 35 篇 · 543.8万 次阅读' }, ['双十一', '购物', '专题']),
  p('news.special-topic', '高考专题卡', { name: '2025 高考全攻略', count: '共 68 篇 · 986.2万 次阅读' }, ['高考', '教育', '专题']),
  p('news.special-topic', 'AI浪潮专题卡', { name: 'AI 浪潮：改变正在发生', count: '共 120 篇 · 1568万 次阅读' }, ['AI', '科技', '专题']),

  /* ---------------- news.pic-news 图集新闻（5） ---------------- */
  p('news.pic-news', '秋日风光图集', { title: '秋日喀纳斯：层林尽染的童话世界，随手一拍都是壁纸', source: '中国国家地理', count: 9 }, ['风光', '秋色', '图集']),
  p('news.pic-news', '马拉松赛事图集', { title: '城市马拉松精彩瞬间：3 万名跑者穿越晨雾中的老城', source: '体育画报', count: 12 }, ['赛事', '马拉松', '图集']),
  p('news.pic-news', '新品开箱图集', { title: '新旗舰手机实拍图集：钛金属机身与三摄模组细节一览', source: '爱范儿', count: 6 }, ['新品', '手机', '图集']),
  p('news.pic-news', '车展现场图集', { title: '广州车展现场直击：12 款新能源首发车实拍', source: '汽车之家', count: 15 }, ['车展', '新能源', '图集']),
  p('news.pic-news', '艺术展览图集', { title: '敦煌数字艺术展落地上海：千年壁画在光影中复活', source: '艺术新闻', count: 8 }, ['艺术', '展览', '图集']),

  /* ---------------- news.date-header 报纸日期头（1） ---------------- */
  p('news.date-header', '早报日期头', { date: '11月11日', weekday: '星期二 · 农历九月廿六', slogan: '早知天下事，出门不吃亏', weather: '多云 16° · 空气 良' }, ['早报', '日期', '日报']),

  /* ---------------- news.video-news 视频新闻行（1） ---------------- */
  p('news.video-news', '现场视频新闻行', { title: '无人机航拍：46 小时完成立交桥拆旧建新全过程', source: '新华社客户端', views: '328.5万次播放', duration: '02:18' }, ['视频', '航拍', '现场']),
];
