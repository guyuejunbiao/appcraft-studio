import type { PresetDef } from './types';
import { p } from './types';

/**
 * login（登录 / 注册）类目精选预设：40 个
 * props 字段与 src/components/widgets/login.tsx 的 defaultProps/fields 严格对齐：
 * - login.logo: brand / shape(square|circle) / size(44-96)
 * - login.app-title: title / subtitle
 * - login.phone-input: placeholder / prefix
 * - login.password-input: placeholder / eye
 * - login.sms-input: placeholder / btnText
 * - login.primary-btn: text / sub / successText
 * - login.register-btn: text
 * - login.forgot-link: text / tip
 * - login.social-row: appName / showWechat / showApple / showWeb / showMail / showPhone
 * - login.divider: text
 * - login.login-tabs: left / right / active(left|right) / channel
 */

/** login 类目精选预设 */
export const loginPresets: PresetDef[] = [
  /* ---------------- login.primary-btn 登录按钮（10） ---------------- */
  p('login.primary-btn', '账号登录按钮', { text: '登录', successText: '登录成功，欢迎回来' }, ['登录', '账号', '密码']),
  p('login.primary-btn', '注册并登录按钮', { text: '注册并登录', successText: '注册成功' }, ['注册', '登录', '新用户']),
  p('login.primary-btn', '短信验证码登录按钮', { text: '短信验证码登录', successText: '登录成功' }, ['短信', '验证码', '免密']),
  p('login.primary-btn', '本机一键登录按钮', { text: '本机号码一键登录', sub: '免输密码', successText: '登录成功' }, ['一键登录', '本机号码', '免密']),
  p('login.primary-btn', '绑定手机号按钮', { text: '绑定手机号', successText: '绑定成功' }, ['绑定', '手机号', '账号']),
  p('login.primary-btn', '提交验证按钮', { text: '提交验证', successText: '验证通过' }, ['验证', '实名', '安全']),
  p('login.primary-btn', '重置密码按钮', { text: '重置密码', successText: '密码重置成功，请重新登录' }, ['重置密码', '找回', '账号']),
  p('login.primary-btn', '微信一键登录按钮', { text: '微信一键登录', successText: '微信登录成功' }, ['微信', '第三方', '授权']),
  p('login.primary-btn', '游客模式进入按钮', { text: '游客模式进入', sub: '部分功能受限' }, ['游客', '试用', '跳过']),
  p('login.primary-btn', '退出登录按钮', { text: '退出登录', successText: '已退出登录' }, ['退出', '注销', '账号']),

  /* ---------------- login.phone-input 手机号输入（5） ---------------- */
  p('login.phone-input', '手机号输入框', { placeholder: '请输入手机号', prefix: '+86' }, ['手机号', '登录', '注册']),
  p('login.phone-input', '换绑新手机输入框', { placeholder: '请输入新手机号', prefix: '+86' }, ['换绑', '手机号', '账号']),
  p('login.phone-input', '家长手机号输入框', { placeholder: '请输入家长手机号', prefix: '+86' }, ['家长', '青少年', '守护']),
  p('login.phone-input', '港澳手机号输入框', { placeholder: '请输入手机号', prefix: '+852' }, ['海外', '区号', '手机号']),
  p('login.phone-input', '店主联系电话输入框', { placeholder: '请输入店主手机号', prefix: '+86' }, ['店主', '商家', '入驻']),

  /* ---------------- login.password-input 密码输入（5） ---------------- */
  p('login.password-input', '登录密码输入框', { placeholder: '请输入密码', eye: true }, ['密码', '登录', '账号']),
  p('login.password-input', '设置新密码输入框', { placeholder: '8-20 位，需包含字母和数字', eye: true }, ['设置密码', '注册', '安全']),
  p('login.password-input', '确认新密码输入框', { placeholder: '请再次输入新密码', eye: true }, ['确认密码', '重置', '安全']),
  p('login.password-input', '原密码验证输入框', { placeholder: '请输入原密码验证身份', eye: true }, ['原密码', '验证', '安全']),
  p('login.password-input', '支付密码输入框', { placeholder: '请输入 6 位支付密码', eye: false }, ['支付密码', '交易', '安全']),

  /* ---------------- login.sms-input 验证码输入（5） ---------------- */
  p('login.sms-input', '登录验证码输入框', { placeholder: '请输入验证码', btnText: '获取验证码' }, ['验证码', '短信', '登录']),
  p('login.sms-input', '注册验证码输入框', { placeholder: '请输入短信验证码', btnText: '发送验证码' }, ['验证码', '注册', '短信']),
  p('login.sms-input', '支付验证码输入框', { placeholder: '请输入 6 位验证码', btnText: '重新发送' }, ['支付', '验证码', '交易']),
  p('login.sms-input', '语音验证码输入框', { placeholder: '请输入语音验证码', btnText: '语音获取' }, ['语音', '验证码', '免提']),
  p('login.sms-input', '找回密码验证码输入框', { placeholder: '请输入邮箱验证码', btnText: '获取验证码' }, ['找回密码', '验证码', '邮箱']),

  /* ---------------- login.register-btn 注册入口（4） ---------------- */
  p('login.register-btn', '注册新账号入口', { text: '注册新账号' }, ['注册', '新账号', '入口']),
  p('login.register-btn', '手机号快速注册入口', { text: '手机号快速注册' }, ['注册', '手机号', '快捷']),
  p('login.register-btn', '邮箱注册入口', { text: '使用邮箱注册' }, ['注册', '邮箱', '账号']),
  p('login.register-btn', '微信授权注册入口', { text: '使用微信注册' }, ['注册', '微信', '第三方']),

  /* ---------------- login.forgot-link 找回链接（3） ---------------- */
  p('login.forgot-link', '忘记密码链接', { text: '忘记密码？', tip: '登录遇到问题' }, ['忘记密码', '找回', '链接']),
  p('login.forgot-link', '找回账号链接', { text: '找回账号', tip: '换手机号也能登录' }, ['找回账号', '换绑', '链接']),
  p('login.forgot-link', '账号解锁链接', { text: '账号被锁定？', tip: '联系管理员解锁' }, ['锁定', '解锁', '企业账号']),

  /* ---------------- login.logo 品牌 Logo（3） ---------------- */
  p('login.logo', '星云方形Logo', { brand: '星云 App', shape: 'square', size: 64 }, ['品牌', '标志', '方形']),
  p('login.logo', '轻奢圆形Logo', { brand: '轻奢严选', shape: 'circle', size: 72 }, ['品牌', '标志', '圆形', '电商']),
  p('login.logo', '简约小尺寸Logo', { brand: '拾光', shape: 'square', size: 48 }, ['品牌', '标志', '简约', '社区']),

  /* ---------------- login.app-title 标题副标题（1） ---------------- */
  p('login.app-title', '注册页标题组', { title: '创建你的账号', subtitle: '注册即领 30 积分新人礼包' }, ['标题', '注册', '福利']),

  /* ---------------- login.agreement-check 协议勾选（1） ---------------- */
  p('login.agreement-check', '注册协议勾选行', { text: '我已阅读并同意', link1: '《用户服务协议》', link2: '《个人信息保护指引》' }, ['协议', '勾选', '隐私', '注册']),

  /* ---------------- login.social-row 第三方登录（1） ---------------- */
  p('login.social-row', '微信Apple双登录行', {
    appName: '轻奢严选',
    showWechat: true, showApple: true, showWeb: false, showMail: false, showPhone: false,
  }, ['第三方', '微信', 'Apple', '授权']),

  /* ---------------- login.divider 分割线（1） ---------------- */
  p('login.divider', '其他登录方式分割线', { text: '其他登录方式' }, ['分割线', '第三方', '登录页']),

  /* ---------------- login.login-tabs 登录方式切换（1） ---------------- */
  p('login.login-tabs', '密码短信登录切换', { left: '密码登录', right: '短信登录', active: 'left', channel: 'loginMode' }, ['切换', '登录方式', '分段器']),
];
