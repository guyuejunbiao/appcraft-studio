import type { PresetDef } from './types';
import { p } from './types';

/**
 * media 类目精选预设（90 个）：覆盖 14 个影音/阅读基础组件。
 * 场景分配：音乐（华语/欧美/粤语/民谣/摇滚/古典/专注/白噪音）· 播客（科技/财经/情感/历史/职场/育儿）
 * · 视频（剧/影/综/纪录/动漫/演唱会）· 阅读（小说/漫画/杂志/教材/童书/传记/职场）。
 */
export const mediaPresets: PresetDef[] = [
  // —— media.player-large 大播放器（10）——
  p('media.player-large', '华语流行播放器', { song: '晴天', artist: '周杰伦', percent: 38, duration: '04:29' }, ['音乐', '华语', '流行']),
  p('media.player-large', '欧美金榜播放器', { song: 'Shape of You', artist: 'Ed Sheeran', percent: 62, duration: '03:53' }, ['音乐', '欧美', '英文歌']),
  p('media.player-large', '粤语经典播放器', { song: '海阔天空', artist: 'Beyond', percent: 45, duration: '05:24' }, ['音乐', '粤语', '经典老歌']),
  p('media.player-large', '民谣电台播放器', { song: '成都', artist: '赵雷', percent: 71, duration: '05:28' }, ['音乐', '民谣', '吉他']),
  p('media.player-large', '摇滚热歌播放器', { song: '追梦赤子心', artist: 'GALA', percent: 28, duration: '05:07' }, ['音乐', '摇滚', '热血']),
  p('media.player-large', '古典钢琴播放器', { song: 'D 大调卡农', artist: '帕赫贝尔', percent: 86, duration: '05:12' }, ['音乐', '古典', '钢琴曲']),
  p('media.player-large', '学习专注播放器', { song: 'Weightless', artist: 'Marconi Union', percent: 33, duration: '08:00' }, ['专注', '学习', '轻音乐']),
  p('media.player-large', '助眠白噪音播放器', { song: '雨声与篝火', artist: '自然声研究所', percent: 55, duration: '45:00' }, ['白噪音', '助眠', '放松']),
  p('media.player-large', '开车歌单播放器', { song: '公路之歌', artist: '痛仰乐队', percent: 47, duration: '04:51' }, ['音乐', '开车', '公路旅行']),
  p('media.player-large', '运动节拍播放器', { song: 'Believer', artist: 'Imagine Dragons', percent: 74, duration: '03:24' }, ['音乐', '运动', '节奏感']),

  // —— media.playlist-item 播放列表行（14：热歌 8 + 播客单集 3 + 有声书 3）——
  p('media.playlist-item', '正在播放：稻香', { index: 1, song: '稻香', artist: '周杰伦', duration: '03:42', playing: true }, ['音乐', '热歌', '正在播放']),
  p('media.playlist-item', '热门单曲：孤勇者', { index: 2, song: '孤勇者', artist: '陈奕迅', duration: '04:26', playing: false }, ['音乐', '热歌', '榜单']),
  p('media.playlist-item', '热门单曲：起风了', { index: 3, song: '起风了', artist: '买辣椒也用券', duration: '05:13', playing: false }, ['音乐', '热歌', '榜单']),
  p('media.playlist-item', '热门单曲：消愁', { index: 4, song: '消愁', artist: '毛不易', duration: '04:18', playing: false }, ['音乐', '热歌', '榜单']),
  p('media.playlist-item', '热门单曲：漠河舞厅', { index: 5, song: '漠河舞厅', artist: '柳爽', duration: '04:05', playing: false }, ['音乐', '热歌', '榜单']),
  p('media.playlist-item', '热门单曲：云烟成雨', { index: 6, song: '云烟成雨', artist: '房东的猫', duration: '03:45', playing: false }, ['音乐', '热歌', '榜单']),
  p('media.playlist-item', '热门单曲：世间美好与你环环相扣', { index: 7, song: '世间美好与你环环相扣', artist: '柏松', duration: '04:12', playing: false }, ['音乐', '热歌', '榜单']),
  p('media.playlist-item', '热门单曲：你的答案', { index: 8, song: '你的答案', artist: '阿冗', duration: '04:03', playing: false }, ['音乐', '热歌', '榜单']),
  p('media.playlist-item', '播客单集：大模型下一站', { index: 9, song: 'Vol.128 大模型应用的下一站', artist: '科技早知道', duration: '46:30', playing: true }, ['播客', '科技', '单集']),
  p('media.playlist-item', '播客单集：降准解读', { index: 10, song: 'E96 降准之后，钱去哪了', artist: '财经晚班车', duration: '24:15', playing: false }, ['播客', '财经', '单集']),
  p('media.playlist-item', '播客单集：异地恋指南', { index: 11, song: '第 52 期 异地恋怎么谈', artist: '深夜情感树洞', duration: '38:40', playing: false }, ['播客', '情感', '单集']),
  p('media.playlist-item', '有声书章节：荒原黎明', { index: 12, song: '第三章 荒原黎明', artist: '三体 · 广播剧', duration: '32:18', playing: false }, ['有声书', '科幻', '章节']),
  p('media.playlist-item', '有声书章节：长安夜宴', { index: 13, song: '第十二章 长安夜宴', artist: '长安十二时辰 · 演播', duration: '28:54', playing: false }, ['有声书', '历史', '章节']),
  p('media.playlist-item', '有声书章节：风雪归人', { index: 14, song: '第七章 风雪归人', artist: '雪中悍刀行 · 演播', duration: '35:06', playing: false }, ['有声书', '武侠', '章节']),

  // —— media.mini-player 迷你播放条（6）——
  p('media.mini-player', '迷你播放条·歌曲', { song: '晴天', artist: '周杰伦', percent: 42 }, ['音乐', '迷你', '收起态']),
  p('media.mini-player', '迷你播放条·播客', { song: 'Vol.96 三十五岁，重新出发', artist: '展开讲讲', percent: 63 }, ['播客', '迷你', '收起态']),
  p('media.mini-player', '迷你播放条·听书', { song: '百年孤独 · 第 5 章', artist: '读客听书', percent: 35 }, ['有声书', '迷你', '收起态']),
  p('media.mini-player', '迷你播放条·电台', { song: '私人雷达 FM', artist: '每日专属推荐', percent: 21 }, ['电台', '迷你', '收起态']),
  p('media.mini-player', '迷你播放条·英语听力', { song: 'Lesson 8 At the Airport', artist: '新概念英语第二册', percent: 58 }, ['英语', '听力', '迷你']),
  p('media.mini-player', '迷你播放条·儿童故事', { song: '小猪唏哩呼噜 · 第 3 夜', artist: '凯叔讲故事', percent: 40 }, ['儿童', '故事', '迷你']),

  // —— media.radio-card 电台卡（7）——
  p('media.radio-card', '私人 FM 电台卡', { name: '私人雷达', episode: '第 365 期', desc: '按口味每日更新的专属歌单' }, ['电台', '私人FM', '推荐']),
  p('media.radio-card', '睡前电台卡', { name: '午夜情绪收容所', episode: '第 128 期', desc: '睡前十分钟，把心事留在今晚' }, ['电台', '睡前', '助眠']),
  p('media.radio-card', '通勤电台卡', { name: '早高峰充电站', episode: '第 76 期', desc: '通勤路上的 30 分钟能量补给' }, ['电台', '通勤', '充电']),
  p('media.radio-card', '学习电台卡', { name: '白噪音自习室', episode: '第 210 期', desc: '雨声陪伴你专注两个番茄钟' }, ['电台', '学习', '白噪音']),
  p('media.radio-card', '情感电台卡', { name: '深夜情感树洞', episode: '第 89 期', desc: '每晚十点，读一封陌生人来信' }, ['电台', '情感', '夜话']),
  p('media.radio-card', '英语听力电台卡', { name: '每日英语听力', episode: '第 312 期', desc: '慢速新闻精讲，通勤磨耳朵' }, ['电台', '英语', '听力']),
  p('media.radio-card', '儿童故事电台卡', { name: '凯叔睡前故事', episode: '第 520 期', desc: '今晚讲大灰狼和小红帽新编' }, ['电台', '儿童', '故事']),

  // —— media.podcast-row 播客行（8）——
  p('media.podcast-row', '科技播客单集', { title: 'Vol.128 大模型落地的最后一公里', intro: '一线创业者聊 AI 应用的真实进展与坑', duration: '46:30' }, ['播客', '科技', 'AI']),
  p('media.podcast-row', '财经播客单集', { title: 'E96 降准之后，钱会变多吗', intro: '十分钟讲透货币政策对钱包的影响', duration: '24:15' }, ['播客', '财经', '投资']),
  p('media.podcast-row', '情感播客单集', { title: '第 52 期 异地恋如何长久', intro: '三对异地五年情侣的真心话', duration: '38:40' }, ['播客', '情感', '恋爱']),
  p('media.podcast-row', '历史播客单集', { title: '第 77 期 长安十二时辰里的真实唐朝', intro: '从坊市制度讲到宵禁下的夜生活', duration: '52:10' }, ['播客', '历史', '唐朝']),
  p('media.podcast-row', '职场播客单集', { title: 'Vol.31 涨薪谈判的正确姿势', intro: '十年 HR 聊离职谈薪的门道与话术', duration: '41:26' }, ['播客', '职场', '涨薪']),
  p('media.podcast-row', '育儿播客单集', { title: '第 18 期 入园焦虑怎么破', intro: '儿童心理师的三步安抚法', duration: '29:44' }, ['播客', '育儿', '幼儿园']),
  p('media.podcast-row', '悬疑故事单集', { title: '第 9 夜 顶楼的脚步声', intro: '本格推理连载，结局反转预警', duration: '27:33' }, ['播客', '悬疑', '故事']),
  p('media.podcast-row', '心理学播客单集', { title: 'Vol.44 为什么越睡越累', intro: '聊聊睡眠周期与情绪修复机制', duration: '35:12' }, ['播客', '心理学', '睡眠']),

  // —— media.episode-chips 选集横排（5）——
  p('media.episode-chips', '综艺选集横排', { title: '选集', count: 8, current: 3, total: '32' }, ['综艺', '选集', '追更']),
  p('media.episode-chips', '短剧选集横排', { title: '正片', count: 8, current: 5, total: '12' }, ['短剧', '选集', '追剧']),
  p('media.episode-chips', '纪录片选集横排', { title: '选集', count: 6, current: 4, total: '6' }, ['纪录片', '选集', '自然']),
  p('media.episode-chips', '网课课时横排', { title: '课时', count: 8, current: 2, total: '24' }, ['课程', '网课', '学习']),
  p('media.episode-chips', '动漫连载选集', { title: '选集', count: 8, current: 1, total: '100' }, ['动漫', '连载', '选集']),

  // —— media.video-hero 视频播放头（6）——
  p('media.video-hero', '热播剧播放头', { title: '庆余年 第二季 · 第 14 集', quality: '1080P' }, ['视频', '剧集', '热播']),
  p('media.video-hero', '电影播放头', { title: '流浪地球 2 · 正片', quality: '4K' }, ['视频', '电影', '科幻']),
  p('media.video-hero', '综艺播放头', { title: '奔跑吧 · 第 8 期抢先看', quality: '1080P' }, ['视频', '综艺', '抢先看']),
  p('media.video-hero', '纪录片播放头', { title: '舌尖上的中国 · 第 3 集', quality: '1080P' }, ['视频', '纪录片', '美食']),
  p('media.video-hero', '动漫播放头', { title: '鬼灭之刃 · 柱训练篇', quality: '1080P' }, ['视频', '动漫', '日番']),
  p('media.video-hero', '演唱会回放头', { title: '嘉年华世界巡回演唱会 · 成都站', quality: '4K' }, ['视频', '演唱会', '回放']),

  // —— media.album-slide 专辑横滑（5）——
  p('media.album-slide', '华语经典专辑横滑', { albums: '范特西,叶惠美,七里香', years: '2001,2003,2004' }, ['音乐', '专辑', '华语经典']),
  p('media.album-slide', '新碟首发横滑', { albums: '午夜快车,夏日漫游指南,城市夜航', years: '2025-09,2025-08,2025-07' }, ['音乐', '新碟', '首发']),
  p('media.album-slide', '欧美专辑横滑', { albums: '25,Divide,Lover', years: '2015,2017,2019' }, ['音乐', '专辑', '欧美']),
  p('media.album-slide', '影视原声带横滑', { albums: '星际穿越 电影原声带,琅琊榜 电视原声带,千与千寻 电影原声带', years: '2014,2015,2001' }, ['音乐', '原声带', 'OST']),
  p('media.album-slide', '年度精选歌单横滑', { albums: '年度热歌 Top50,私人雷达年度报告,民谣年度精选', years: '2024,2024,2023' }, ['音乐', '歌单', '年度精选']),

  // —— media.book-grid 书城网格（7）——
  p('media.book-grid', '豆瓣高分书架', { count: 4, titles: '三体,活着,百年孤独,白夜行', authors: '刘慈欣,余华,加西亚·马尔克斯,东野圭吾' }, ['阅读', '小说', '高分']),
  p('media.book-grid', '热门漫画书架', { count: 4, titles: '海贼王·卷 101,咒术回战·卷 22,间谍过家家·卷 9,排球少年·卷 40', authors: '尾田荣一郎,芥见下下,远藤达哉,古馆春一' }, ['阅读', '漫画', '日漫']),
  p('media.book-grid', '时尚杂志架', { count: 2, titles: '瑞丽服饰美容,三联生活周刊', authors: '瑞丽编辑部,三联编辑部' }, ['阅读', '杂志', '时尚']),
  p('media.book-grid', '考研教材书架', { count: 4, titles: '考研政治冲刺卷,考研英语黄皮书,高等数学·同济版,数据结构·C 语言版', authors: '肖秀荣,世纪高教,同济数学系,严蔚敏' }, ['阅读', '教材', '考研']),
  p('media.book-grid', '童书绘本架', { count: 4, titles: '好饿的毛毛虫,猜猜我有多爱你,爷爷一定有办法,大卫不可以', authors: '艾瑞·卡尔,山姆·麦克布雷尼,菲比·吉尔曼,大卫·香农' }, ['阅读', '童书', '绘本']),
  p('media.book-grid', '人物传记书架', { count: 4, titles: '苏东坡传,曾国藩传,乔布斯传,人生由我', authors: '林语堂,张宏杰,沃尔特·艾萨克森,梅耶·马斯克' }, ['阅读', '传记', '人物']),
  p('media.book-grid', '职场进阶书架', { count: 4, titles: '原则,影响力,非暴力沟通,认知觉醒', authors: '瑞·达利欧,罗伯特·西奥迪尼,马歇尔·卢森堡,周岭' }, ['阅读', '职场', '成长']),

  // —— media.read-progress 阅读进度卡（5）——
  p('media.read-progress', '继续读小说', { title: '三体', author: '刘慈欣', percent: 65, btnText: '继续阅读' }, ['阅读', '小说', '进度']),
  p('media.read-progress', '教材学习进度', { title: '高等数学 · 第七版', author: '同济大学数学系', percent: 42, btnText: '去学习' }, ['阅读', '教材', '学习']),
  p('media.read-progress', '漫画追更进度', { title: '海贼王 · 卷 101', author: '尾田荣一郎', percent: 88, btnText: '继续看' }, ['阅读', '漫画', '追更']),
  p('media.read-progress', '听书播放进度', { title: '活着 · 演播版', author: '余华 · 演播：王明军', percent: 55, btnText: '继续听' }, ['阅读', '听书', '进度']),
  p('media.read-progress', '专栏阅读进度', { title: '财富自由之路', author: '李笑来', percent: 30, btnText: '继续读' }, ['阅读', '专栏', '订阅']),

  // —— media.chapter-list 章节列表（4）——
  p('media.chapter-list', '小说章节目录', { title: '目录', vipCount: 2, chapters: '第一章 大雨滂沱,第二章 陌生来电,第三章 顶楼房间,第四章 逐帧追踪,第五章 真相大白', durations: '11:26,13:08,12:44,14:02,15:37' }, ['阅读', '小说', '目录']),
  p('media.chapter-list', 'VIP 章节抢先读', { title: '抢先读', vipCount: 1, chapters: '第一章 开局一个碗,第二章 皇觉寺出家,第三章 投奔义军,第四章 应天风云,第五章 鄱阳湖之战', durations: '18:20,19:05,17:48,20:12,21:40' }, ['阅读', 'VIP', '章节']),
  p('media.chapter-list', '教材课程目录', { title: '课程目录', vipCount: 5, chapters: '绪论 走进管理学,第一章 管理理论演进,第二章 计划职能,第三章 组织职能,第四章 领导职能', durations: '22:10,25:30,24:18,26:05,23:44' }, ['阅读', '教材', '目录']),
  p('media.chapter-list', '理财课课程大纲', { title: '课程大纲', vipCount: 2, chapters: '01 导学：普通人怎么理财,02 认识基金家族,03 指数基金入门,04 定投策略详解,05 资产配置实战', durations: '15:00,18:30,20:10,22:45,19:20' }, ['阅读', '课程', '理财']),

  // —— media.lyric-card 歌词卡（3）——
  p('media.lyric-card', '主歌轻唱歌词卡', { lyrics: '深夜的便利店亮着灯,热罐装咖啡冒着白汽,你说的梦想我还记得,像星星落进口袋里', current: 1 }, ['音乐', '歌词', '主歌']),
  p('media.lyric-card', '副歌高亮歌词卡', { lyrics: '就让我大胆一次吧,把喜欢大声说出来,趁着晚霞还没落下,趁着晚风还在唱,趁着我们都年轻', current: 3 }, ['音乐', '歌词', '副歌']),
  p('media.lyric-card', '尾声渐弱歌词卡', { lyrics: '车开过隧道就到站了,故事到这里也够了,再见时请你别忘了,那年夏天的歌', current: 4 }, ['音乐', '歌词', '尾声']),

  // —— media.audio-card 有声卡（5）——
  p('media.audio-card', '有声书播放卡', { title: '百年孤独 · 有声剧版', author: '马尔克斯 · 演播：王明军', progress: 35 }, ['有声书', '名著', '播放']),
  p('media.audio-card', '白噪音播放卡', { title: '雨夜篝火 · 深度助眠', author: '自然声研究所 · 8 小时循环', progress: 62 }, ['白噪音', '助眠', '播放']),
  p('media.audio-card', '冥想引导卡', { title: '十分钟睡前放松冥想', author: 'Now 冥想 · 主播：小雅', progress: 48 }, ['冥想', '放松', '助眠']),
  p('media.audio-card', '英语听力播放卡', { title: '新概念英语第二册 · Lesson 8', author: '美音慢速精讲版', progress: 27 }, ['英语', '听力', '学习']),
  p('media.audio-card', '儿童故事播放卡', { title: '凯叔三国演义 · 第 3 集', author: '凯叔讲故事', progress: 71 }, ['儿童', '故事', '播放']),

  // —— media.schedule-row 追剧日历条（5）——
  p('media.schedule-row', '周三追剧日历', { weekday: '三', titles: '漫长的季节,繁花,庆余年第二季,三体' }, ['追剧', '日历', '更新']),
  p('media.schedule-row', '周五综艺日历', { weekday: '五', titles: '奔跑吧,歌手 2025,向往的生活,披荆斩棘' }, ['综艺', '日历', '更新']),
  p('media.schedule-row', '周六直播预告', { weekday: '六', titles: '星夜电台直播,游戏开发者大会直播,职场答疑连麦' }, ['直播', '预告', '日历']),
  p('media.schedule-row', '周一课程表', { weekday: '一', titles: '高数强化一刷,英语真题精讲,数据结构直播课,毕设开题指导' }, ['课程', '课表', '学习']),
  p('media.schedule-row', '周日纪录片日历', { weekday: '日', titles: '舌尖上的中国,河西走廊,我们的国家公园,蓝色星球' }, ['纪录片', '日历', '周末']),
];
