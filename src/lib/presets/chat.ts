import type { PresetDef } from './types';
import { p } from './types';

/**
 * chat 类目精选预设（70 个，覆盖 chat.tsx 全部 9 个基础组件）
 * props 字段逐字对照 chat.tsx 的 defaultProps/fields：
 * header(name/online)、contact-item(name/lastMsg/time/unread/color)、
 * msg-left(name/text)、msg-right(name/text)、msg-image(caption/width/duration)、
 * msg-voice(seconds/side)、system-tip(text)、input-bar(placeholder)、tabbar(active/channel)
 */
export const chatPresets: PresetDef[] = [
  /* ---------------- chat.contact-item 会话列表项（20） ---------------- */
  p('chat.contact-item', '电商客服会话行', { name: '优品严选客服', lastMsg: '您反馈的尺码问题已加急处理，补发的新尺码今天发出～', time: '14:32', unread: 3, color: 'cycle' }, ['电商', '客服', '会话']),
  p('chat.contact-item', '快递通知会话行', { name: '顺丰快递员老张', lastMsg: '您的包裹已放至驿站 3 号架，凭取件码 8-2207 领取', time: '13:05', unread: 1, color: 'cycle' }, ['快递', '取件', '通知']),
  p('chat.contact-item', '银行账单会话行', { name: '招行信用卡中心', lastMsg: '本月账单已出：应还 ¥2,386.50，还款日 10 月 25 日', time: '09:20', unread: 2, color: 'primary' }, ['银行', '账单', '还款']),
  p('chat.contact-item', '课程顾问会话行', { name: '课程顾问Amy', lastMsg: '今晚 8 点免费试听课开讲，我帮你留了前排名额哦', time: '11:47', unread: 5, color: 'cycle' }, ['教育', '课程', '顾问']),
  p('chat.contact-item', '医生问诊会话行', { name: '王医生（皮肤科）', lastMsg: '药膏早晚各涂一次，一周后复诊看恢复情况', time: '昨天', unread: 0, color: 'cycle' }, ['医疗', '问诊', '复诊']),
  p('chat.contact-item', '房东会话行', { name: '房东陈阿姨', lastMsg: '房租 25 号之前转我就行，热水器修好了记得试试', time: '昨天', unread: 1, color: 'cycle' }, ['租房', '房东', '房租']),
  p('chat.contact-item', 'HR招聘会话行', { name: 'HR林女士', lastMsg: '简历初筛已通过，周四下午 3 点方便视频面试吗？', time: '16:44', unread: 4, color: 'primary' }, ['招聘', '面试', '求职']),
  p('chat.contact-item', '物业管家会话行', { name: '物业管家小刘', lastMsg: '本周六上午 9 点楼道消防检查，家中请留人', time: '周五', unread: 0, color: 'cycle' }, ['物业', '通知', '社区']),
  p('chat.contact-item', '闺蜜会话行', { name: '小鹿乱撞', lastMsg: '新开的泰式火锅走不走！我看到折扣券了！', time: '14:12', unread: 12, color: 'cycle' }, ['闺蜜', '好友', '聚餐']),
  p('chat.contact-item', '家人会话行', { name: '老妈', lastMsg: '天冷了把秋裤穿上，别老是不听', time: '12:30', unread: 2, color: 'cycle' }, ['家人', '叮嘱', '亲情']),
  p('chat.contact-item', '同事会话行', { name: '同事大熊', lastMsg: '下午的需求评审改到 4 点了，会议室 B302', time: '13:58', unread: 1, color: 'primary' }, ['同事', '工作', '评审']),
  p('chat.contact-item', '同学会话行', { name: '大学室友阿凯', lastMsg: '毕业五年聚会定在 11 月 16 号，老地方集合！', time: '周二', unread: 6, color: 'cycle' }, ['同学', '聚会', '老友']),
  p('chat.contact-item', '家庭群会话行', { name: '相亲相爱一家人', lastMsg: '二姨：周末都来家里吃饭，我包饺子🥟', time: '11:02', unread: 23, color: 'cycle' }, ['家庭', '群聊', '亲戚']),
  p('chat.contact-item', '系统通知会话行', { name: '系统通知', lastMsg: '你的账号已在新设备登录，如非本人操作请及时改密码', time: '08:15', unread: 0, color: 'primary' }, ['系统', '通知', '安全']),
  p('chat.contact-item', '品牌会员会话行', { name: '星野咖啡会员号', lastMsg: '您有一张「第二杯半价券」即将于明天过期', time: '周一', unread: 1, color: 'primary' }, ['品牌', '会员', '优惠券']),
  p('chat.contact-item', '外卖商家会话行', { name: '巷口猪脚饭老板', lastMsg: '加蛋已经给你多打了一勺，慢用兄弟', time: '12:08', unread: 0, color: 'cycle' }, ['外卖', '商家', '取餐']),
  p('chat.contact-item', '网约车司机会话行', { name: '网约车司机周师傅', lastMsg: '我在路边等你，黑色轿车尾号 858', time: '09:42', unread: 2, color: 'cycle' }, ['网约车', '出行', '接驾']),
  p('chat.contact-item', '健身房顾问会话行', { name: '健身顾问大力', lastMsg: '您预约的私教课明晚 7 点，记得带换洗衣物', time: '昨天', unread: 1, color: 'primary' }, ['健身', '私教', '预约']),
  p('chat.contact-item', '宠物店会话行', { name: '宠物店店员小婉', lastMsg: '橘座的驱虫药到货了，周末过来洗澡顺便拿', time: '周四', unread: 0, color: 'cycle' }, ['宠物', '洗护', '到货']),
  p('chat.contact-item', '旅行拼车群会话行', { name: '青甘大环线拼车群', lastMsg: '领队：明早 6 点半酒店门口集合，别迟到！', time: '22:15', unread: 9, color: 'cycle' }, ['旅行', '群聊', '拼车']),

  /* ---------------- chat.header 聊天导航（8） ---------------- */
  p('chat.header', '电商客服会话头', { name: '优品严选客服', online: true }, ['客服', '电商', '导航']),
  p('chat.header', '好友会话头', { name: '林小满', online: true }, ['好友', '聊天', '在线']),
  p('chat.header', '兴趣群会话头', { name: '周末爬山小分队', online: true }, ['群聊', '兴趣', '导航']),
  p('chat.header', '店铺客服会话头', { name: '小满家居旗舰店', online: true }, ['店铺', '客服', '售后']),
  p('chat.header', '家人会话头', { name: '老妈', online: false }, ['家人', '亲情', '离线']),
  p('chat.header', '官方通知会话头', { name: '平台官方通知', online: false }, ['官方', '通知', '公告']),
  p('chat.header', '陌生人会话头', { name: '二手书交易 · 陌生人', online: false }, ['陌生人', '交易', '谨慎']),
  p('chat.header', '医生会话头', { name: '王医生（皮肤科）', online: true }, ['医生', '问诊', '在线']),

  /* ---------------- chat.msg-left 对方消息（10） ---------------- */
  p('chat.msg-left', '客服欢迎语', { name: '优品严选客服', text: '您好，欢迎光临～我是您的专属客服小优，请问有什么可以帮您？😊' }, ['客服', '欢迎语', '开场']),
  p('chat.msg-left', '发货通知消息', { name: '顺丰快递员老张', text: '您的快递已从杭州仓发出，预计明天下午 3 点前送达，请保持电话畅通～' }, ['快递', '物流', '通知']),
  p('chat.msg-left', '问诊回复消息', { name: '王医生（皮肤科）', text: '从照片看是轻度湿疹，先涂这个药膏早晚各一次，别用热水烫洗，一周后复诊' }, ['问诊', '医嘱', '医疗']),
  p('chat.msg-left', '房源推荐消息', { name: '中介小哥阿泽', text: '这套两居室刚降价 300，朝南带阳台，地铁口 500 米，下午带您实地看看？' }, ['租房', '房源', '看房']),
  p('chat.msg-left', '面试邀约消息', { name: 'HR林女士', text: '您好，您的简历已通过初筛，想约您本周四下午 3 点视频面试，方便吗？' }, ['招聘', '面试', '邀约']),
  p('chat.msg-left', '课程提醒消息', { name: '课程顾问Amy', text: '今晚 8 点的写作试听课就要开始啦，直播间链接已发送，记得提前 10 分钟进群哦' }, ['课程', '提醒', '教育']),
  p('chat.msg-left', '同事方案反馈', { name: '同事大熊', text: '这版方案我看了，整体没问题，就第三页的数据图建议换个更直观的样式' }, ['同事', '协作', '反馈']),
  p('chat.msg-left', '老妈叮嘱消息', { name: '老妈', text: '冰箱里给你包了饺子，周末回来拿，记得别老点外卖' }, ['家人', '叮嘱', '暖心']),
  p('chat.msg-left', '设计稿交接消息', { name: '设计师小柒', text: 'Banner 的三版初稿发你邮箱了，主视觉用的是莫兰迪色系，有空看看选哪版' }, ['工作', '交接', '设计']),
  p('chat.msg-left', '驿站取件通知', { name: '菜鸟驿站', text: '您的 3 个包裹已到站，取件码分别是 8-2207、3-1109、5-3342，营业至 21:00' }, ['驿站', '取件码', '通知']),

  /* ---------------- chat.msg-right 我方消息（8） ---------------- */
  p('chat.msg-right', '咨询商品消息', { name: '我', text: '你好，这款冲锋衣有黑色 L 码现货吗？周六爬山想穿' }, ['咨询', '购物', '库存']),
  p('chat.msg-right', '确认下单消息', { name: '我', text: '好的，尺寸确认了，下单地址还是公司，麻烦尽快发货～' }, ['下单', '确认', '购物']),
  p('chat.msg-right', '预约确认消息', { name: '我', text: '可以的，那周四下午 3 点见，我会提前 10 分钟调试好设备' }, ['预约', '确认', '安排']),
  p('chat.msg-right', '咨询课程消息', { name: '我', text: '请问零基础可以直接报进阶班吗？我怕跟不上进度' }, ['课程', '咨询', '教育']),
  p('chat.msg-right', '约看房消息', { name: '我', text: '房子还在吗？明天下午 2 点我可以过去看看' }, ['租房', '看房', '约时间']),
  p('chat.msg-right', '回复面试邀约', { name: '我', text: '没问题！周四下午 3 点视频面试，我会准时上线，谢谢您' }, ['面试', '回复', '求职']),
  p('chat.msg-right', '群接龙回复', { name: '我', text: '收到，+1 明天早上 7 点半地铁站 B 口集合，我带相机' }, ['群聊', '接龙', '活动']),
  p('chat.msg-right', '请假申请消息', { name: '我', text: '领导好，我明天上午需要去医院复诊，想请半天假，工作已交接给大熊' }, ['请假', '职场', '沟通']),

  /* ---------------- chat.msg-image 图片消息（4） ---------------- */
  p('chat.msg-image', '商品图分享消息', { caption: '就这款奶白色，链接发你', width: 168, duration: '' }, ['商品', '分享', '购物']),
  p('chat.msg-image', '表情包消息', { caption: '', width: 140, duration: '' }, ['表情包', '斗图', '日常']),
  p('chat.msg-image', '订单截图消息', { caption: '这是我的订单截图，麻烦帮我看下物流', width: 200, duration: '' }, ['截图', '订单', '售后']),
  p('chat.msg-image', '视频截图消息', { caption: '我拍的云海视频！30 秒带你看山顶', width: 180, duration: '00:30' }, ['视频', '截图', '分享']),

  /* ---------------- chat.msg-voice 语音消息（6） ---------------- */
  p('chat.msg-voice', '我方简短语音', { seconds: 3, side: 'right' }, ['语音', '我方', '简短']),
  p('chat.msg-voice', '对方短语音', { seconds: 12, side: 'left' }, ['语音', '对方', '日常']),
  p('chat.msg-voice', '对方中语音', { seconds: 25, side: 'left' }, ['语音', '对方', '详聊']),
  p('chat.msg-voice', '对方长语音', { seconds: 60, side: 'left' }, ['语音', '对方', '长语音']),
  p('chat.msg-voice', '我方日常语音', { seconds: 8, side: 'right' }, ['语音', '我方', '日常']),
  p('chat.msg-voice', '我方长语音', { seconds: 47, side: 'right' }, ['语音', '我方', '长语音']),

  /* ---------------- chat.system-tip 系统提示条（6） ---------------- */
  p('chat.system-tip', '时间分隔提示', { text: '今天 14:32' }, ['时间', '分隔', '会话']),
  p('chat.system-tip', '撤回提示', { text: '小鹿乱撞 撤回了一条消息' }, ['撤回', '提示', '会话']),
  p('chat.system-tip', '红包领取提示', { text: '你领取了 老妈 发的红包 ¥88.88 🧧' }, ['红包', '家庭', '提示']),
  p('chat.system-tip', '入群提示', { text: '"同事大熊" 邀请 "设计师小柒" 加入了群聊' }, ['入群', '群聊', '提示']),
  p('chat.system-tip', '订单状态提示', { text: '您的订单已发货，预计明天送达' }, ['订单', '物流', '提示']),
  p('chat.system-tip', '会话结束提示', { text: '本次会话已结束，感谢您的咨询，欢迎评价 ⭐⭐⭐⭐⭐' }, ['客服', '结束', '评价']),

  /* ---------------- chat.input-bar 聊天输入栏（7） ---------------- */
  p('chat.input-bar', '客服咨询输入栏', { placeholder: '想问什么都行，客服在线秒回…' }, ['客服', '咨询', '输入']),
  p('chat.input-bar', '好友聊天输入栏', { placeholder: '发消息…' }, ['好友', '聊天', '输入']),
  p('chat.input-bar', '群聊输入栏', { placeholder: '和大家聊点什么…' }, ['群聊', '聊天', '输入']),
  p('chat.input-bar', '评论留言输入栏', { placeholder: '友善评论，温暖你我…' }, ['评论', '留言', '社区']),
  p('chat.input-bar', '闺蜜聊天输入栏', { placeholder: '和闺蜜吐槽点啥…' }, ['闺蜜', '吐槽', '输入']),
  p('chat.input-bar', '家人群输入栏', { placeholder: '对家人说点暖心话…' }, ['家人', '亲情', '输入']),
  p('chat.input-bar', '求助帖留言输入栏', { placeholder: '说出你的问题，热心网友在线…' }, ['求助', '提问', '留言']),

  /* ---------------- chat.tabbar 聊天底部导航（1） ---------------- */
  p('chat.tabbar', '聊天App底部导航', { active: 'msg', channel: 'chatTab' }, ['底部导航', '消息', '聊天App']),
];
