import type { PresetDef } from './types';
import { p } from './types';

/**
 * fitness 类目精选预设（80 个）：覆盖 12 个健康运动基础组件。
 * 场景分配：运动圆环（步数/燃脂/时长/喝水/睡眠/课表/减脂/里程/课程）· 步数卡（打卡/万步/晨跑/夜跑/通勤/徒步/逛街）
 * · 训练动作（HIIT/瑜伽/卧推/拉伸/拳击/尊巴/普拉提/单车/跳绳/深蹲）· 计划卡（减脂/增肌/马甲线/体态/产后/跑者/工间）
 * · 热量平衡（三餐/全天/剩余额度）· 喝水打卡（标准/健身/孕期/减脂/防暑）· 睡眠图（深睡/浅睡/午睡/作息/质量）
 * · 体重记录（减脂/增肌/孕期/成长/术后/体脂/腰围）· 社区动态（晨跑/减脂餐/撸铁/瑜伽/登山/骑行/首马）
 * · 教练名片（私教/瑜伽/游泳/拳击/营养师/康复/舞蹈）· 赛事条目（全马/半马/欢乐跑/越野/铁三/骑行/徒步）
 * · 周统计（运动/饮食/睡眠/减脂周报）。
 * 已知渲染约束（数据已适配）：ring-progress 三环图例固定为「步数/消耗/时长」；stats-weekly 四格标签固定；
 * weight-log 单位固定 kg；sleep-chart 目标线后缀固定「h」——预设语义以标题/中心文案补足。
 */
export const fitnessPresets: PresetDef[] = [
  // —— fitness.ring-progress 运动圆环（9）——
  p('fitness.ring-progress', '今日目标圆环', { steps: 86, burn: 64, duration: 42, centerValue: '78%', centerLabel: '今日目标' }, ['步数', '活动圆环', '日常', '健康']),
  p('fitness.ring-progress', '燃脂卡路里圆环', { steps: 72, burn: 88, duration: 56, centerValue: '76%', centerLabel: '燃脂目标' }, ['卡路里', '燃脂', '消耗', '减脂']),
  p('fitness.ring-progress', '运动时长圆环', { steps: 58, burn: 46, duration: 90, centerValue: '68%', centerLabel: '时长目标' }, ['时长', '训练', '自律', '打卡']),
  p('fitness.ring-progress', '喝水进度圆环', { steps: 75, burn: 50, duration: 60, centerValue: '62%', centerLabel: '喝水打卡' }, ['喝水', '补水', '提醒', '养生']),
  p('fitness.ring-progress', '睡眠达成圆环', { steps: 82, burn: 46, duration: 90, centerValue: '73%', centerLabel: '睡眠目标' }, ['睡眠', '作息', '早睡', '恢复']),
  p('fitness.ring-progress', '本周课表完成度', { steps: 80, burn: 70, duration: 60, centerValue: '70%', centerLabel: '训练完成率' }, ['课表', '完成率', '周计划', '自律']),
  p('fitness.ring-progress', '减脂进度圆环', { steps: 55, burn: 78, duration: 62, centerValue: '65%', centerLabel: '减脂 4.2kg' }, ['减脂', '进度', '体重管理', '瘦身']),
  p('fitness.ring-progress', '骑行里程圆环', { steps: 92, burn: 84, duration: 70, centerValue: '82%', centerLabel: '82km 目标' }, ['骑行', '里程', '目标', '户外']),
  p('fitness.ring-progress', '21 天课程进度', { steps: 68, burn: 54, duration: 76, centerValue: '66%', centerLabel: '课程进度' }, ['课程', '训练营', '坚持', '打卡']),

  // —— fitness.steps-card 今日步数卡（7）——
  p('fitness.steps-card', '今日步数打卡', { today: '8,426', goal: '10,000', values: '6120,7480,5230,8920,7660,9540,8426', labels: '一,二,三,四,五,六,日' }, ['步数', '日常', '健康', '周趋势']),
  p('fitness.steps-card', '万步挑战冲刺', { today: '12,380', goal: '12,000', values: '10240,9860,12380,8760,11420,11680,12380', labels: '一,二,三,四,五,六,日' }, ['万步', '挑战', '超额', '激励']),
  p('fitness.steps-card', '晨跑五公里', { today: '7,560', goal: '8,000', values: '6200,5480,7560,6890,7120,5960,7560', labels: '一,二,三,四,五,六,日' }, ['晨跑', '跑步', '清晨', '习惯']),
  p('fitness.steps-card', '夜跑放松跑', { today: '9,240', goal: '10,000', values: '7800,8460,9240,8120,7640,8980,9240', labels: '一,二,三,四,五,六,日' }, ['夜跑', '跑步', '晚间', '解压']),
  p('fitness.steps-card', '通勤步行周', { today: '6,480', goal: '7,000', values: '6820,6480,5960,6240,6480,3120,6480', labels: '一,二,三,四,五,六,日' }, ['通勤', '步行', '上班', '碎片运动']),
  p('fitness.steps-card', '周末徒步记', { today: '18,660', goal: '15,000', values: '5860,6240,5420,6100,5640,9840,18660', labels: '一,二,三,四,五,六,日' }, ['徒步', '周末', '户外', '远足']),
  p('fitness.steps-card', '逛街遛弯日常', { today: '13,120', goal: '10,000', values: '7240,6890,8420,7650,9120,11480,13120', labels: '一,二,三,四,五,六,日' }, ['逛街', '散步', '遛弯', '轻松']),

  // —— fitness.workout-item 训练动作条目（10）——
  p('fitness.workout-item', '全身燃脂 HIIT', { index: 1, name: '全身燃脂 HIIT', sets: '4 组 × 45 秒', rest: '组间休息 30 秒', video: true }, ['HIIT', '燃脂', '高强度', '居家']),
  p('fitness.workout-item', '晨间流瑜伽', { index: 2, name: '晨间流瑜伽', sets: '12 个体式', rest: '单次约 40 分钟 · 消耗 150 千卡', video: true }, ['瑜伽', '晨间', '柔韧', '唤醒']),
  p('fitness.workout-item', '哑铃卧推', { index: 3, name: '哑铃卧推', sets: '4 组 × 10 次', rest: '组间休息 90 秒', video: true }, ['力量', '卧推', '上肢', '增肌']),
  p('fitness.workout-item', '睡前全身拉伸', { index: 4, name: '睡前全身拉伸', sets: '8 个动作', rest: '每个动作保持 30 秒', video: false }, ['拉伸', '睡前', '放松', '舒缓']),
  p('fitness.workout-item', '拳击空击训练', { index: 5, name: '拳击空击训练', sets: '3 回合 × 3 分钟', rest: '回合间休息 60 秒', video: true }, ['拳击', '搏击', '心肺', '解压']),
  p('fitness.workout-item', '燃脂尊巴舞', { index: 6, name: '燃脂尊巴舞', sets: '6 支曲目', rest: '连续跟跳 30 分钟 · 消耗 260 千卡', video: true }, ['尊巴', '舞蹈', '有氧', '趣味']),
  p('fitness.workout-item', '核心普拉提', { index: 7, name: '核心普拉提', sets: '10 个动作', rest: '单次约 35 分钟 · 消耗 180 千卡', video: false }, ['普拉提', '核心', '体态', '塑形']),
  p('fitness.workout-item', '动感单车冲刺', { index: 8, name: '动感单车冲刺', sets: '5 段变速', rest: '全程 40 分钟 · 消耗 420 千卡', video: true }, ['动感单车', '有氧', '心肺', '刷脂']),
  p('fitness.workout-item', '跳绳间歇训练', { index: 9, name: '跳绳间歇训练', sets: '5 组 × 200 个', rest: '组间休息 45 秒', video: true }, ['跳绳', '间歇', '燃脂', '轻便']),
  p('fitness.workout-item', '杠铃深蹲', { index: 10, name: '杠铃深蹲', sets: '5 组 × 8 次', rest: '组间休息 120 秒', video: true }, ['深蹲', '腿部', '力量', '翘臀']),

  // —— fitness.plan-card 训练计划卡（7）——
  p('fitness.plan-card', '14 天减脂入门计划', { title: '14 天减脂入门', level: '入门', weeks: '2 周', duration: '15 分钟/次', freq: '4 次/周' }, ['减脂', '新手', '入门', '居家']),
  p('fitness.plan-card', '8 周增肌力量计划', { title: '8 周增肌力量计划', level: '挑战', weeks: '8 周', duration: '50 分钟/次', freq: '5 次/周' }, ['增肌', '力量', '撸铁', '进阶']),
  p('fitness.plan-card', '马甲线 21 天养成', { title: '马甲线 21 天养成', level: '进阶', weeks: '3 周', duration: '20 分钟/次', freq: '5 次/周' }, ['马甲线', '腹肌', '核心', '塑形']),
  p('fitness.plan-card', '圆肩驼背体态矫正', { title: '圆肩驼背体态矫正', level: '入门', weeks: '6 周', duration: '12 分钟/次', freq: '6 次/周' }, ['体态', '圆肩', '驼背', '矫正']),
  p('fitness.plan-card', '产后温和恢复', { title: '产后温和恢复计划', level: '入门', weeks: '8 周', duration: '20 分钟/次', freq: '3 次/周' }, ['产后', '恢复', '妈妈', '温和']),
  p('fitness.plan-card', '半马跑者进阶训练', { title: '半马跑者进阶训练', level: '挑战', weeks: '12 周', duration: '60 分钟/次', freq: '5 次/周' }, ['半马', '跑步', '进阶', '备赛']),
  p('fitness.plan-card', '办公室工间拉伸', { title: '办公室工间拉伸', level: '入门', weeks: '长期坚持', duration: '8 分钟/次', freq: '每天 2 次' }, ['办公室', '拉伸', '工间', '久坐']),

  // —— fitness.calories-ring 热量平衡卡（5）——
  p('fitness.calories-ring', '早餐热量记录', { intake: 520, burn: 180, note: '早餐 520 千卡 · 晨跑消耗 180 千卡' }, ['早餐', '热量', '记录', '饮食']),
  p('fitness.calories-ring', '午餐热量记录', { intake: 780, burn: 240, note: '饭后步行 40 分钟消耗 240 千卡' }, ['午餐', '热量', '步行', '饮食']),
  p('fitness.calories-ring', '晚餐热量记录', { intake: 620, burn: 320, note: '晚间瑜伽课消耗 320 千卡' }, ['晚餐', '热量', '瑜伽', '轻食']),
  p('fitness.calories-ring', '全天摄入统计', { intake: 2180, burn: 830, note: '距离 2,400 千卡上限还剩 220 千卡' }, ['全天', '摄入', '统计', '控卡']),
  p('fitness.calories-ring', '今日还能吃多少', { intake: 1420, burn: 2050, note: '还可摄入 630 千卡达成平衡' }, ['额度', '缺口', '余额', '控卡']),

  // —— fitness.water-tracker 喝水打卡（5）——
  p('fitness.water-tracker', '标准八杯水打卡', { count: 8, done: 5, cupSize: '250 ml' }, ['喝水', '八杯水', '打卡', '日常']),
  p('fitness.water-tracker', '健身强化补水', { count: 12, done: 9, cupSize: '300 ml' }, ['健身', '补水', '大容量', '训练日']),
  p('fitness.water-tracker', '孕期喝水计划', { count: 10, done: 6, cupSize: '200 ml' }, ['孕期', '妈妈', '少量多次', '健康']),
  p('fitness.water-tracker', '减脂期多喝水', { count: 10, done: 8, cupSize: '350 ml' }, ['减脂', '代谢', '饱腹', '控卡']),
  p('fitness.water-tracker', '夏季防暑补水', { count: 12, done: 11, cupSize: '250 ml' }, ['夏季', '防暑', '高温', '及时补水']),

  // —— fitness.sleep-chart 睡眠时长图（5）——
  p('fitness.sleep-chart', '深睡时长分析', { values: '1.2,1.5,1.1,1.6,1.4,1.8,1.5', labels: '一,二,三,四,五,六,日', goal: 1.5 }, ['深睡', '分析', '质量', '恢复']),
  p('fitness.sleep-chart', '浅睡时长追踪', { values: '3.6,4.2,3.1,4.5,3.8,4.8,4.1', labels: '一,二,三,四,五,六,日', goal: 4 }, ['浅睡', '追踪', '易醒', '作息']),
  p('fitness.sleep-chart', '午睡打卡记录', { values: '0.5,0.8,0.4,1,0.6,1.2,0.9', labels: '一,二,三,四,五,六,日', goal: 0.5 }, ['午睡', '小憩', '办公室', '充电']),
  p('fitness.sleep-chart', '早睡打卡第一周', { values: '6.1,5.8,6.5,7,7.4,8.2,7.8', labels: '一,二,三,四,五,六,日', goal: 7 }, ['早睡', '作息调整', '自律', '挑战']),
  p('fitness.sleep-chart', '睡眠质量提升周', { values: '7.8,8.5,7.2,9,8.8,9.4,8.2', labels: '一,二,三,四,五,六,日', goal: 8 }, ['睡眠质量', '达标', '提升', '满分']),

  // —— fitness.weight-log 体重记录（7）——
  p('fitness.weight-log', '减脂体重记录', { current: '62.5', delta: '0.8', down: true, values: '64.2,63.8,63.5,63.1,62.9,62.7,62.5' }, ['减脂', '掉秤', '记录', '变化']),
  p('fitness.weight-log', '增肌体重记录', { current: '68.4', delta: '1.2', down: false, values: '66.8,67.2,67,67.6,68,68.2,68.4' }, ['增肌', '涨重', '力量', '围度']),
  p('fitness.weight-log', '孕期体重管理', { current: '68.2', delta: '0.6', down: false, values: '65.4,65.9,66.3,66.8,67.2,67.7,68.2' }, ['孕期', '妈妈', '产检', '管理']),
  p('fitness.weight-log', '宝宝成长曲线', { current: '23.6', delta: '0.4', down: false, values: '22.4,22.6,22.8,23,23.2,23.4,23.6' }, ['儿童', '成长', '曲线', '家长']),
  p('fitness.weight-log', '术后恢复体重', { current: '54.2', delta: '1.5', down: false, values: '51.2,51.8,52.4,53,53.5,53.9,54.2' }, ['术后', '恢复', '营养', '回升']),
  p('fitness.weight-log', '体脂率追踪', { current: '22.8', delta: '0.6', down: true, values: '24.2,24,23.8,23.5,23.2,23,22.8' }, ['体脂率', '塑形', '追踪', '变化']),
  p('fitness.weight-log', '腰围管理记录', { current: '78.5', delta: '1.5', down: true, values: '81,80.5,80.2,79.8,79.5,79,78.5' }, ['腰围', '围度', '瘦腰', '管理']),

  // —— fitness.community-post 社区动态卡（7）——
  p('fitness.community-post', '晨跑打卡动态', { nickname: '晨光跑者', time: '12 分钟前', tag: '跑步打卡', content: '连着第 30 天晨跑啦！今天 5.2 公里配速 6 分 02 秒，清晨的公园真的会治愈人，坚持的感觉太好了。', likes: '326', comments: '48' }, ['晨跑', '打卡', '社区', '励志']),
  p('fitness.community-post', '减脂餐晒图', { nickname: '轻食日记本', time: '1 小时前', tag: '减脂餐', content: '鸡胸肉沙拉配紫薯，低油低盐第 21 天，体重掉了 2.4 斤，关键是完全不饿！', likes: '512', comments: '86' }, ['减脂餐', '轻食', '晒图', '食谱']),
  p('fitness.community-post', '撸铁里程碑', { nickname: '铁馆老张', time: '3 小时前', tag: '力量训练', content: '深蹲个人纪录刷新：100 公斤 5 组 5 个！从空杆到三位数用了 11 个月，感谢没放弃的自己。', likes: '743', comments: '129' }, ['撸铁', '深蹲', '纪录', '力量']),
  p('fitness.community-post', '瑜伽头倒立解锁', { nickname: '一颗圆滚滚', time: '昨天 21:36', tag: '瑜伽日常', content: '今天终于解锁头倒立！摔了十几次膝盖都青了，但稳住的那三秒真的值。', likes: '388', comments: '64' }, ['瑜伽', '倒立', '解锁', '日常']),
  p('fitness.community-post', '登山看日出', { nickname: '山野拾光', time: '昨天 08:20', tag: '周末登山', content: '凌晨四点半出发，在山顶等到了今年第一场日出。爬升 1200 米，腿已经不是自己的了。', likes: '629', comments: '77' }, ['登山', '日出', '户外', '周末']),
  p('fitness.community-post', '环湖骑行打卡', { nickname: '追风少年阿凯', time: '2 天前', tag: '骑行打卡', content: '环湖 68 公里完成！均速 23.5，最后 10 公里逆风差点崩，还好带了能量胶。', likes: '415', comments: '52' }, ['骑行', '环湖', '耐力', '风']),
  p('fitness.community-post', '人生首马完赛', { nickname: '42.195 的风', time: '3 天前', tag: '马拉松完赛', content: '人生首马安全完赛！4 小时 52 分，撞墙期咬牙挺过来了，奖牌挂上的那一刻哭了。', likes: '1286', comments: '236' }, ['马拉松', '首马', '完赛', '感动']),

  // —— fitness.coach-card 教练名片卡（7）——
  p('fitness.coach-card', '明星私教推荐', { name: '李思远', title: '国家级健身教练 · 8 年经验', rating: '4.9', students: '已指导 1,200+ 学员', action: '立即预约' }, ['私教', '一对一定制', '健身', '预约']),
  p('fitness.coach-card', '瑜伽馆主理人', { name: '林晚晴', title: '全美瑜伽联盟 RYT500 认证老师', rating: '5.0', students: '累计带课 3,600+ 节', action: '预约体验课' }, ['瑜伽', '老师', '认证', '体验课']),
  p('fitness.coach-card', '零基础游泳教练', { name: '赵海洋', title: '前省队游泳运动员 · 救生员双证', rating: '4.8', students: '教会 900+ 成人零基础游泳', action: '立即预约' }, ['游泳', '零基础', '成人', '教学']),
  p('fitness.coach-card', '搏击教练名片', { name: '韩铁林', title: '职业拳击手 · 业余战绩 12 战 9 胜', rating: '4.9', students: '带出 60+ 业余参赛学员', action: '约一节体验课' }, ['拳击', '搏击', '职业', '体验课']),
  p('fitness.coach-card', '减脂营养师', { name: '苏念安', title: '注册营养师 · 减脂餐单定制', rating: '4.9', students: '累计服务 2,000+ 客户', action: '咨询方案' }, ['营养师', '餐单', '饮食', '咨询']),
  p('fitness.coach-card', '运动康复师', { name: '周砚青', title: '运动康复师 · 体态矫正方向', rating: '4.8', students: '改善 800+ 例腰颈不适', action: '预约评估' }, ['康复', '体态', '腰颈', '评估']),
  p('fitness.coach-card', '爵士舞老师', { name: '米娅', title: '十年爵士舞教龄 · 编舞师', rating: '4.9', students: '学员 1,500+ · 零基础友好', action: '约体验课' }, ['舞蹈', '爵士舞', '编舞', '零基础']),

  // —— fitness.marathon-item 赛事条目（7）——
  p('fitness.marathon-item', '全程马拉松报名', { month: '10月', day: '26', title: '滨江城市马拉松（全程）', location: '滨江公园起点广场', status: '报名中' }, ['马拉松', '全马', '报名', '城市']),
  p('fitness.marathon-item', '半程马拉松开跑', { month: '11月', day: '9', title: '环湖半程马拉松', location: '镜湖湿地公园东门', status: '即将开跑' }, ['半马', '环湖', '开跑', '倒计时']),
  p('fitness.marathon-item', '五公里欢乐跑', { month: '9月', day: '20', title: '城市欢乐跑 5 公里', location: '中央公园大草坪', status: '报名中' }, ['欢乐跑', '五公里', '亲子', '入门']),
  p('fitness.marathon-item', '山地越野赛', { month: '11月', day: '15', title: '青云山 30 公里越野赛', location: '青云山景区北门', status: '已满员' }, ['越野', '山地', '满员', '挑战']),
  p('fitness.marathon-item', '铁人三项赛', { month: '8月', day: '23', title: '东海铁人三项邀请赛', location: '东海浴场试航中心', status: '已结束' }, ['铁三', '游泳骑行跑步', '完赛', '回顾']),
  p('fitness.marathon-item', '公路骑行赛', { month: '10月', day: '18', title: '环岛公路骑行赛 120 公里', location: '环岛路一号观景台', status: '即将开跑' }, ['骑行赛', '公路', '环岛', '竞技']),
  p('fitness.marathon-item', '徒步大会', { month: '9月', day: '6', title: '西山徒步大会 20 公里', location: '西山国家森林公园', status: '报名中' }, ['徒步', '大会', '森林公园', '休闲']),

  // —— fitness.stats-weekly 周运动统计（4）——
  p('fitness.stats-weekly', '本周运动周报', { title: '本周运动概览', sessions: '5 次', duration: '320 分钟', calories: '2,860 千卡', distance: '42.5 公里' }, ['周报', '运动统计', '概览', '复盘']),
  p('fitness.stats-weekly', '本周饮食盘点', { title: '本周饮食周报', sessions: '21 餐记录', duration: '备餐 6 小时', calories: '13,580 千卡', distance: '日均 1,940 千卡' }, ['饮食', '周报', '摄入', '控卡']),
  p('fitness.stats-weekly', '本周睡眠小结', { title: '本周睡眠周报', sessions: '7 晚打卡', duration: '52.4 小时', calories: '深睡 11.2 小时', distance: '平均 7.5 小时' }, ['睡眠', '周报', '作息', '小结']),
  p('fitness.stats-weekly', '本周减脂战报', { title: '本周减脂周报', sessions: '4 次训练', duration: '280 分钟', calories: '3,120 千卡', distance: '晨跑 21 公里' }, ['减脂', '周报', '战报', '激励']),
];
