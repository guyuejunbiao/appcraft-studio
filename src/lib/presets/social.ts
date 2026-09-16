import type { PresetDef } from './types';
import { p } from './types';

/**
 * social 类目精选预设（90 个，覆盖 social.tsx 全部 14 个基础组件）
 * props 字段逐字对照 social.tsx 的 defaultProps/fields：
 * feed-card(user/time/text/followed)、action-bar(likes/comments/shares/liked)、
 * comment-item(user/time/text/likes/liked)、profile-head(name/bio/following/followers/likes/followed)、
 * fan-row(name/bio/followBack)、user-suggest(users)、topic-wall(topics)、rank-list(title/items/hots)、
 * topic-card(rank/topic/heat/posts)、story-row(names)、live-card(title/viewers/liveText)、
 * video-grid(count 2|4)、grid-images(count '1'|'4'|'9')、danmaku(items)
 */
export const socialPresets: PresetDef[] = [
  /* ---------------- social.feed-card 动态卡片（20） ---------------- */
  p('social.feed-card', '旅行博主动态卡', { user: '旅行家阿伦', time: '28 分钟前', text: '青海湖的日出值得凌晨四点爬起来！湖面把朝霞映成整片粉色，风一吹全是自由的味道🏔️ 攻略整理好下期发', followed: false }, ['旅行', '社区', '图文动态']),
  p('social.feed-card', '美食探店笔记卡', { user: '干饭少女糖糖', time: '1 小时前', text: '巷子里的老面馆终于吃上了！牛肉面 18 块一大碗，汤头浓到挂勺，老板说这锅汤熬了 12 个小时🍜', followed: false }, ['美食', '探店', '社区']),
  p('social.feed-card', '穿搭日常分享卡', { user: '衣橱里的小鹿', time: '2 小时前', text: '早秋通勤穿搭打卡｜燕麦色针织开衫 + 直筒牛仔裤，温柔又不费力，全套链接放评论区啦🍂', followed: false }, ['穿搭', '时尚', '社区']),
  p('social.feed-card', '健身打卡动态卡', { user: '撸铁的猫教练', time: '昨天 21:40', text: '今日份背腿日打卡✅ 引体向上勉强 8×5，硬拉 90kg 稳住！离目标又近一步，练完的快乐谁懂', followed: true }, ['健身', '打卡', '运动']),
  p('social.feed-card', '母婴育儿记录卡', { user: '汤圆妈妈', time: '昨天 18:05', text: '汤圆今天第一次自己扶着围栏站起来了！老母亲激动得手抖📸 这一年所有的辛苦都值了', followed: false }, ['母婴', '育儿', '记录']),
  p('social.feed-card', '萌宠日常动态卡', { user: '橘座本座', time: '3 小时前', text: '橘猪今天称重：6.8kg。医生说再胖要控制饮食了，它听完当场把猫粮碗扒翻了，大家评评理🐱', followed: false }, ['宠物', '萌宠', '日常']),
  p('social.feed-card', '数码开箱测评卡', { user: '搞机老王', time: '5 小时前', text: '新平板开箱一周体验：屏幕素质真香，写字延迟几乎无感，就是 4599 的价格让我钱包瑟瑟发抖💸', followed: false }, ['数码', '测评', '科技']),
  p('social.feed-card', '读书笔记分享卡', { user: '深夜书桌', time: '昨天 23:12', text: '读完《置身事内》第 3 章，终于看懂了土地财政这盘棋。摘抄了 11 条笔记，越读越上头，推荐给所有人📚', followed: false }, ['读书', '笔记', '书单']),
  p('social.feed-card', '摄影作品动态卡', { user: '快门手老周', time: '4 小时前', text: '傍晚六点半的城市天桥，等到了蓝调时刻。机位和参数都放评论区，想去拍的朋友冲📷', followed: true }, ['摄影', '作品', '约拍']),
  p('social.feed-card', '职场成长日记卡', { user: '北漂产品喵', time: '昨天 20:30', text: '入职 90 天小结：第一次独立跟完一个需求上线，虽然被评审怼哭过两次，但看到数据涨的那一刻全都值了💪', followed: false }, ['职场', '成长', '日记']),
  p('social.feed-card', '家居改造记录卡', { user: '旧屋改造日记', time: '2 天前', text: '出租屋改造第 4 期｜600 块把灰扑扑的阳台改成小花园，记账清单和链接都整理好了，抄作业请自取🌿', followed: false }, ['家居', '改造', '装修']),
  p('social.feed-card', '游戏战绩分享卡', { user: '峡谷小钢炮', time: '6 小时前', text: '凌晨上分实录：辅助也能 carry！这波开团直接团灭对面，段位终于打进星耀了，兄弟们祝贺一下🎮', followed: false }, ['游戏', '战绩', '电竞']),
  p('social.feed-card', '追剧观后感卡', { user: '追剧雷达', time: '昨天 22:48', text: '新出的悬疑剧第 5 集封神！反转反转再反转，导演我错了，之前不该弃坑。无剧透安利，放心食用📺', followed: false }, ['追剧', '影视', '安利']),
  p('social.feed-card', '学习打卡动态卡', { user: '上岸小王', time: '昨天 19:20', text: '考研倒计时 63 天｜今日完成：英语阅读 4 篇 + 专业课第 6 章背完。图书馆闭馆才走，坚持就是胜利✍️', followed: false }, ['学习', '考研', '打卡']),
  p('social.feed-card', '美妆试色动态卡', { user: '口红收集癖', time: '8 小时前', text: '枫叶红棕试色来了🍁 黄皮亲妈色！薄涂温柔厚涂气场全开，双十一这个价太香已经囤了第二支💄', followed: false }, ['美妆', '试色', '种草']),
  p('social.feed-card', '露营户外动态卡', { user: '山系阿凯', time: '昨天 17:55', text: '周末山谷露营归来⛺ 云海就在帐篷门口铺开，晚上烤棉花糖看星星，这才是生活该有的样子', followed: false }, ['露营', '户外', '生活']),
  p('social.feed-card', '音乐分享动态卡', { user: '耳机分你一半', time: '11 小时前', text: '单曲循环一整晚的歌｜副歌一起来鸡皮疙瘩掉一地，livehouse 现场版比录音室还炸，安利给大家🎧', followed: false }, ['音乐', '分享', '歌单']),
  p('social.feed-card', '官方活动公告卡', { user: '跑步俱乐部官方号', time: '10 分钟前', text: '城市 10K 迷你马拉松报名开启！11 月 3 日鸣枪开跑，完赛奖牌限量 3000 枚🏃 名额有限手慢无', followed: true }, ['官方', '活动', '公告']),
  p('social.feed-card', '素人生活碎片卡', { user: '爱睡懒觉的小舟', time: '昨天 09:15', text: '周末的满足感清单：睡到自然醒、楼下豆浆油条、晒了一床被子。简单的一天，快乐也很简单☀️', followed: false }, ['素人', '日常', '碎片']),
  p('social.feed-card', '骑行打卡动态卡', { user: '风火轮小李', time: '昨天 16:40', text: '环湖骑行 68km 完成🚴 逆风段差点把我骑哭，但冲下坡那一刻什么累都忘了，下周继续约！', followed: false }, ['骑行', '运动', '打卡']),

  /* ---------------- social.action-bar 互动栏（7） ---------------- */
  p('social.action-bar', '常规动态互动栏', { likes: '2.4万', comments: '1386', shares: '892', liked: true }, ['互动', '点赞', '常规']),
  p('social.action-bar', '爆款笔记互动栏', { likes: '28.6万', comments: '1.2万', shares: '3.4万', liked: true }, ['爆款', '高热', '互动']),
  p('social.action-bar', '视频动态互动栏', { likes: '5.8万', comments: '2043', shares: '1176', liked: false }, ['视频', '互动', '数据']),
  p('social.action-bar', '种草笔记互动栏', { likes: '8632', comments: '521', shares: '2089', liked: true }, ['种草', '分享', '互动']),
  p('social.action-bar', '求助帖互动栏', { likes: '428', comments: '1326', shares: '96', liked: false }, ['求助', '提问', '高评论']),
  p('social.action-bar', '晒单互动栏', { likes: '1.5万', comments: '864', shares: '312', liked: false }, ['晒单', '好物', '互动']),
  p('social.action-bar', '新人低数据互动栏', { likes: '46', comments: '12', shares: '3', liked: true }, ['新人', '素人', '低数据']),

  /* ---------------- social.comment-item 评论项（9） ---------------- */
  p('social.comment-item', '好评种草评论', { user: '奶茶三分甜', time: '32 分钟前', text: '跟着买了！真的绝绝子，用了一周忍不住来回评，姐妹们冲就完事了', likes: '1024', liked: true }, ['好评', '种草', '评论区']),
  p('social.comment-item', '求链接提问评论', { user: '半夜饿醒的猫', time: '18 分钟前', text: '求店铺链接！最后一张图的锅是哪款？已经收藏准备周末复刻了', likes: '89', liked: false }, ['提问', '求链接', '评论区']),
  p('social.comment-item', '神回复段子评论', { user: '杠精终结者', time: '1 小时前', text: '看完直接把外卖软件卸了，然后打开冰箱煮了包泡面，你看我又骗自己', likes: '5236', liked: true }, ['神回复', '段子', '热评']),
  p('social.comment-item', '专业干货点评', { user: '营养师阿紫', time: '2 小时前', text: '补充一点：这款的蛋白质含量确实高，但钠含量也不低，一天别超过一份更合理哦', likes: '867', liked: false }, ['专业', '点评', '干货']),
  p('social.comment-item', '暖心鼓励评论', { user: '山茶与鹿', time: '昨天 22:10', text: '从第一期追到现在，你的进步肉眼可见！继续加油，陌生人也在为你鼓掌👏', likes: '432', liked: true }, ['暖心', '鼓励', '正反馈']),
  p('social.comment-item', '吐槽差评评论', { user: '退堂鼓十级选手', time: '3 小时前', text: '说好的新手友好呢？我照着做厨房差点没炸了，不过味道确实不错，下次还敢', likes: '2156', liked: false }, ['吐槽', '差评', '真实']),
  p('social.comment-item', '同好共鸣评论', { user: '同款加班人', time: '昨天 19:33', text: '看到凌晨还在改方案的你不孤单，我这边改完第 8 版了，改天一起吃顿好的犒劳自己', likes: '168', liked: true }, ['共鸣', '同好', '评论区']),
  p('social.comment-item', '官方回复评论', { user: '官方小助手', time: '26 分钟前', text: '收到反馈啦！已经记录给产品同学，下周版本会优化这个问题，感谢支持～', likes: '74', liked: false }, ['官方', '回复', '售后']),
  p('social.comment-item', '路人好奇评论', { user: '路过的小透明', time: '12 分钟前', text: '第一次刷到就爱了，翻完主页发现更新太慢啦，蹲一个更新频率加倍的博主！', likes: '56', liked: false }, ['路人', '涨粉', '评论区']),

  /* ---------------- social.profile-head 个人主页头（10） ---------------- */
  p('social.profile-head', '穿搭博主主页头', { name: '衣橱里的小鹿', bio: '每天一套不重样｜165/52 平价通勤穿搭', following: '356', followers: '12.8万', likes: '46.2万', followed: false }, ['穿搭', '博主', '主页']),
  p('social.profile-head', '美食博主主页头', { name: '干饭少女糖糖', bio: '用一口小锅治愈打工人的胃🍜 每周三、周五更新', following: '128', followers: '23.5万', likes: '98.7万', followed: true }, ['美食', '博主', '主页']),
  p('social.profile-head', '健身教练主页头', { name: '撸铁的猫教练', bio: 'NSCA-CPT 认证私教｜科学减脂不挨饿，线上带练招生中', following: '89', followers: '8.6万', likes: '31.4万', followed: false }, ['健身', '教练', '主页']),
  p('social.profile-head', '旅行摄影师主页头', { name: '快门手老周', bio: '用镜头收藏世界的蓝调时刻📷 已走过 27 个国家', following: '203', followers: '31.2万', likes: '127.6万', followed: false }, ['摄影', '旅行', '主页']),
  p('social.profile-head', '萌宠博主主页头', { name: '橘座本座', bio: '一只橘猫和它的铲屎官｜每日营业卖萌，关注围观橘猪减肥', following: '45', followers: '56.3万', likes: '210.8万', followed: true }, ['宠物', '博主', '主页']),
  p('social.profile-head', '读书博主主页头', { name: '深夜书桌', bio: '一年读 100 本书的普通人｜每周书单与笔记更新中', following: '512', followers: '9.8万', likes: '28.3万', followed: false }, ['读书', '博主', '主页']),
  p('social.profile-head', '美妆达人主页头', { name: '口红收集癖', bio: '黄皮亲测 500+ 支口红💄 帮你避开所有雷色', following: '167', followers: '42.6万', likes: '156.9万', followed: false }, ['美妆', '达人', '主页']),
  p('social.profile-head', '游戏主播主页头', { name: '峡谷小钢炮', bio: '每晚 8 点直播上分｜一个辅助玩家的 carry 之路', following: '78', followers: '18.4万', likes: '64.1万', followed: false }, ['游戏', '主播', '主页']),
  p('social.profile-head', '职场博主主页头', { name: '北漂产品喵', bio: '大厂产品经理｜记录打工人的成长与避坑指南', following: '289', followers: '15.7万', likes: '52.6万', followed: true }, ['职场', '博主', '主页']),
  p('social.profile-head', '家居博主主页头', { name: '旧屋改造日记', bio: '600 块爆改出租屋系列持续更新中🏠 低成本高幸福感', following: '134', followers: '27.9万', likes: '88.4万', followed: false }, ['家居', '改造', '主页']),

  /* ---------------- social.fan-row 粉丝行（6） ---------------- */
  p('social.fan-row', '新粉丝待回关行', { name: '柠檬薄荷水', bio: '喜欢旅行和摄影，偶尔记录生活', followBack: false }, ['粉丝', '回关', '新粉']),
  p('social.fan-row', '已互关老友行', { name: '海盐芝士', bio: '认真生活，认真快乐～', followBack: true }, ['粉丝', '互关', '老友']),
  p('social.fan-row', '摄影同好粉丝行', { name: '快门手老周', bio: '用镜头收藏世界的蓝调时刻📷', followBack: false }, ['粉丝', '同好', '摄影']),
  p('social.fan-row', '宝妈粉丝行', { name: '汤圆妈妈', bio: '记录人类幼崽的每一个第一次', followBack: true }, ['粉丝', '宝妈', '母婴']),
  p('social.fan-row', '学生党粉丝行', { name: '上岸小王', bio: '考研倒计时中，图书馆常驻选手', followBack: false }, ['粉丝', '学生', '考研']),
  p('social.fan-row', '同城主理人粉丝行', { name: '城南咖啡馆主理人', bio: '收藏这座城的宝藏咖啡馆☕ 欢迎来店里坐坐', followBack: false }, ['粉丝', '同城', '咖啡']),

  /* ---------------- social.user-suggest 推荐关注（6） ---------------- */
  p('social.user-suggest', '可能认识的人推荐', { users: '林小满,周奕辰,苏一诺' }, ['可能认识', '同城', '推荐']),
  p('social.user-suggest', '旅行同好推荐', { users: '背包客小鹿,环游世界的Momo,自驾去远方' }, ['旅行', '同好', '推荐']),
  p('social.user-suggest', '美食博主推荐', { users: '深夜厨房阿灶,甜品师小蔓,干饭研究院' }, ['美食', '博主', '推荐']),
  p('social.user-suggest', '健身搭子推荐', { users: '铁馆常客老金,晨跑少女葵葵,减脂餐日记' }, ['健身', '搭子', '推荐']),
  p('social.user-suggest', '读书同好推荐', { users: '书虫阿默,独立书店主理人,午夜读诗' }, ['读书', '同好', '推荐']),
  p('social.user-suggest', '宠物圈推荐', { users: '柯基屁屁妈,布偶两兄弟,宠物医生安安' }, ['宠物', '同好', '推荐']),

  /* ---------------- social.topic-wall 话题墙（6） ---------------- */
  p('social.topic-wall', '穿搭话题墙', { topics: '今日穿搭,秋冬叠穿,通勤穿搭公式,平价好物,小个子显高,衣柜断舍离' }, ['穿搭', '话题', '时尚']),
  p('social.topic-wall', '美食话题墙', { topics: '深夜食堂,一人食料理,厨房小白实录,宝藏小馆子,空气炸锅美食,周末逛吃' }, ['美食', '话题', '探店']),
  p('social.topic-wall', '旅行话题墙', { topics: '周末去哪儿,青甘大环线,citywalk路线,治愈系海岛,穷游攻略,旅行摄影' }, ['旅行', '话题', '攻略']),
  p('social.topic-wall', '健身话题墙', { topics: '今日运动打卡,居家燃脂,健身餐分享,跑者日常,体态矫正,马甲线养成' }, ['健身', '话题', '打卡']),
  p('social.topic-wall', '情感话题墙', { topics: '人间清醒语录,异地恋日记,和爸妈的聊天记录,独居日记,治愈瞬间' }, ['情感', '话题', '治愈']),
  p('social.topic-wall', '年终盘点话题墙', { topics: '我的年度10张照片,年度书单,今年最值的消费,年度回头率最高,年终总结,明年小目标' }, ['年终', '盘点', '话题']),

  /* ---------------- social.rank-list 热门榜单（6） ---------------- */
  p('social.rank-list', '社区热搜榜', { title: '社区热搜榜', items: '沉浸式逛吃vlog,通勤穿搭公式,出租屋改造前后,橘猫减肥日记,一人食锅物', hots: '486.2万,402.8万,356.1万,274.9万,213.6万' }, ['热榜', '热搜', '社区']),
  p('social.rank-list', '新人飙升榜', { title: '新人飙升榜', items: '咖啡拉花Day1,阳台种菜指南,手帐入门分享,晨跑5公里记录,旧物改造第一弹', hots: '86.4万,72.1万,58.9万,47.3万,39.8万' }, ['飙升', '新人', '榜单']),
  p('social.rank-list', '种草好物榜', { title: '种草好物榜', items: '平价胶原蛋白面霜,免手洗拖把神器,带饭族玻璃饭盒,静音机械键盘,宿舍折叠晾衣架', hots: '326.5万,289.4万,214.7万,178.2万,132.9万' }, ['种草', '好物', '榜单']),
  p('social.rank-list', '打卡挑战榜', { title: '打卡挑战榜', items: '21天早起挑战,每日一拍挑战,万步打卡,阅读一小时,戒糖7天', hots: '156.8万,134.2万,112.6万,98.4万,76.1万' }, ['打卡', '挑战', '榜单']),
  p('social.rank-list', '穿搭热榜', { title: '今日穿搭热榜', items: '燕麦色开衫,直筒牛仔裤,德训鞋,复古腋下包,围巾系法教程', hots: '268.3万,241.6万,198.7万,154.3万,121.8万' }, ['穿搭', '热榜', '时尚']),
  p('social.rank-list', '探店热榜', { title: '探店热榜', items: '藏在巷子里的牛肉面馆,人均30的东北菜,深夜粥铺,社区日料小馆,菜市场咖啡摊', hots: '198.6万,165.2万,143.8万,117.4万,96.2万' }, ['探店', '美食', '榜单']),

  /* ---------------- social.topic-card 热搜话题卡（4） ---------------- */
  p('social.topic-card', '热搜第一名话题卡', { rank: 1, topic: '秋天第一顿火锅', heat: '512.6万', posts: '2.8万' }, ['热搜', '第一', '话题']),
  p('social.topic-card', '穿搭热门话题卡', { rank: 2, topic: '通勤穿搭公式', heat: '386.4万', posts: '1.9万' }, ['穿搭', '热门', '话题']),
  p('social.topic-card', '城市漫步话题卡', { rank: 3, topic: '老城citywalk路线', heat: '297.1万', posts: '1.4万' }, ['漫步', '路线', '话题']),
  p('social.topic-card', '萌宠话题卡', { rank: 7, topic: '橘猫为什么越来越圆', heat: '88.3万', posts: '6521' }, ['萌宠', '橘猫', '话题']),

  /* ---------------- social.story-row 好友动态条（3） ---------------- */
  p('social.story-row', '好友动态条', { names: '桃桃酱,阿乐不吃香菜,山野君,椰椰,柚子' }, ['好友', '动态', '快拍']),
  p('social.story-row', '关注博主动态条', { names: '快门手老周,深夜书桌,橘座本座,干饭少女糖糖,衣橱里的小鹿' }, ['博主', '关注', '更新']),
  p('social.story-row', '家人群动态条', { names: '老妈,二姨,表哥阿杰,小妹,老爸' }, ['家人', '群聊', '动态']),

  /* ---------------- social.live-card 直播卡片（5） ---------------- */
  p('social.live-card', '带货直播卡', { title: '秋冬新品宠粉节 · 全场低至 5 折', viewers: '3.6万', liveText: '薇薇安ViVi 的直播间' }, ['带货', '直播', '促销']),
  p('social.live-card', '游戏直播卡', { title: '凌晨冲分夜 · 辅助也能上王者', viewers: '8623', liveText: '峡谷小钢炮 直播中' }, ['游戏', '直播', '电竞']),
  p('social.live-card', '知识直播卡', { title: '从 0 到 1 学做播客 · 免费公开课', viewers: '4512', liveText: '深夜书桌 的知识直播间' }, ['知识', '直播', '课程']),
  p('social.live-card', '户外徒步直播卡', { title: '雨后登顶看云海 · 信号来之不易', viewers: '1.8万', liveText: '山系阿凯 户外徒步中' }, ['户外', '徒步', '直播']),
  p('social.live-card', '深夜食堂直播卡', { title: '深夜食堂 · 现煮一碗牛肉面', viewers: '9746', liveText: '深夜厨房阿灶 的深夜食堂' }, ['美食', '直播', '深夜']),

  /* ---------------- social.video-grid 短视频双列（4） ---------------- */
  p('social.video-grid', '短视频推荐流', { count: 4 }, ['短视频', '推荐', '信息流']),
  p('social.video-grid', '美食视频流', { count: 4 }, ['美食', '视频', '下饭']),
  p('social.video-grid', '萌宠视频流', { count: 2 }, ['萌宠', '视频', '治愈']),
  p('social.video-grid', '知识视频流', { count: 4 }, ['知识', '视频', '干货']),

  /* ---------------- social.grid-images 图片墙（2） ---------------- */
  p('social.grid-images', '旅行九宫格照片墙', { count: '9' }, ['九宫格', '照片', '旅行']),
  p('social.grid-images', '四宫格甜品分享墙', { count: '4' }, ['甜品', '照片', '晒图']),

  /* ---------------- social.danmaku 弹幕横条（2） ---------------- */
  p('social.danmaku', '直播弹幕条', { items: '主播皮肤真好,这个价格冲了,已拍两单,求链接' }, ['直播', '弹幕', '带货']),
  p('social.danmaku', '追剧弹幕条', { items: '前方高能,我眼泪掉下来了,这BGM绝了,男主快回头' }, ['追剧', '弹幕', '剧透预警']),
];
