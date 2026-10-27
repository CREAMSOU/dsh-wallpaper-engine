/**
 * client.js —— 玻璃子包的**浏览器半边**入口（ADR-0016 第二刀：设置面板节随包走）。
 *
 * ⚠️ 归属（与 packages/fonts/src/client.js 同一条，正本 = ADR-0013 D20 / ADR-0016 D3）：
 *    随包走的是**渲染器与描述符**；玻璃的**键、默认值、kind、消毒、迁移、持久化**仍在主包
 *    `lib/settings-schema.js`（GLASS_CHILDREN 登记表 + childGlassKey + RESET_MODULES.glass）⇒
 *    本包**不持键、不持久化**；值与意图回调一律经主包构造的渲染 ctx 或下面的 host 显式键集拿到。
 *    预设是整机快照（ADR-0011）：路由族与 preset-store 留主包，本包只画 `glassPresets` ctx 交给的卡片。
 *
 * ## 构建期形状（与 packages/fonts/src/client.js 逐条同形）
 *   · 产物 = packages/glass/lib/client.glass.js，id = 子包真实包名 dsh-plugin-wallpaper-engine-glass
 *     （与宿主 graph row 逐字相等）；入口 = 本文件，正文只取**首个块注释之后**的内容。
 *   · 本包的 INLINE_MODULES（client.build.json 的 inline[]）内联在正文之前 ⇒ 兄弟文件与入口落在
 *     **同一个工厂作用域**：互相按裸名引用，不 import、不 require、不许 `...host` 展开、不许动态键。
 *   · 唯一例外 = 产物里由构建循环 outline 发出的那一行 `const host = require('<主包名>');`（S5.2）。
 *
 * ## 消费侧契约（唯一跨包通道 = 主 bundle 的显式键集，ADR-0014 S5.1 / S5.4）
 * GLASS_HOST_REQUIRED 与主包 `src/client.js` 的 HOST_BRIDGE_BINDINGS 玻璃段**逐键一致**（缺键大声抛，
 * 不许静默 undefined）。键集依据 = 被搬文件（packages/glass/src/glass-panel.js，整文件逐字搬来）
 * 的**自由标识符**逐个点名（fonts 同款 acorn 取证）：
 *   React×65 · weT×176 · SliderRow×14 · switchRow×15 · swatchRow×6 · ctlText×5 · sectionHead×2
 *   · moduleResetButtonNode×1 · renderConfirmRow×1 · GLASS_CHILDREN×2 · childGlassKey×1
 *   · GLASS_COLOR_PRESETS×6 · ROPE_FORMS×2 · ROPE_FORM_VALUES×1 · panelGlassPair×1
 *   （panelGlassPair 原是 glass-panel 的本地副本；第二刀发现主包写路径也要它 ⇒ 归位
 *   lib/settings-schema.js 的显示口径，与 readGlassColors 同族，经桥接取同一份防漂移。）
 *   ⇒ 其中 React / weT / switchRow / SliderRow / swatchRow / ctlText / sectionHead / registerPanelSection
 *   是 fx / fonts 那半已要过的键，**复用、不重复登记**；本包新增 8 键（moduleResetButtonNode /
 *   renderConfirmRow / GLASS_CHILDREN / childGlassKey / GLASS_COLOR_PRESETS / ROPE_FORMS /
 *   ROPE_FORM_VALUES / panelGlassPair）。
 *   ⚠️ 每多一个键就是多一条没人维护的隐式契约（ADR-0014 S5.2）⇒ 清单之外一个都**不**解构。
 *
 * ## 每渲染才存在的值走 ctx，不走键集（契约 §2.1）
 * sel / glassPresets / surfaceStatus / childIndependentOn / detailOpen / glassUiOpen / glassDetailOpen /
 * presetSectionOpen 与全部 on* 处理器仍由主包在**渲染处**构造 ctx 传进来（设置页 renderActiveTab
 * 与侧栏 quick-panel 两处，经 renderAppearanceTab 同一条路）；本包不缓存、不自建订阅（ADR-0014 S6.3）。
 */

/**
 * 缺键**大声失败**（ADR-0014 S5.1 / S5.4 显式键集 + ADR-0013 D3③「宁可显示、不可静默消失」）。
 * 主包被关 ⇒ 本 bundle 根本不会被 require（ADR-0014 S7.2 连坐）；能走到这里却缺键 = 键集与申报表脱钩。
 */
const GLASS_HOST_REQUIRED = [
  // 内核与渲染助手（主 bundle 的共享零件表；后四个与 fx / fonts 复用）
  'React', 'weT', 'SliderRow', 'switchRow', 'swatchRow', 'ctlText', 'sectionHead',
  // 玻璃域的产地数据 / 构件（留在主包的文件里；panelGlassPair 的家 = lib/settings-schema.js）
  'moduleResetButtonNode', 'renderConfirmRow',
  'GLASS_CHILDREN', 'childGlassKey', 'GLASS_COLOR_PRESETS', 'panelGlassPair',
  'ROPE_FORMS', 'ROPE_FORM_VALUES',
  // 贡献面（主 bundle 的收件箱）
  'registerPanelSection',
];
for (const key of GLASS_HOST_REQUIRED) {
  if (!(key in host)) {
    throw new Error('[wallpaper-engine-glass] 主 bundle 键集缺少 "' + key
      + '"（ADR-0014 S5.1 / S5.4 显式键集：要么补键，要么改申报表，不许静默 undefined）');
  }
}
const {
  React, weT, SliderRow, switchRow, swatchRow, ctlText, sectionHead,
  moduleResetButtonNode, renderConfirmRow,
  GLASS_CHILDREN, childGlassKey, GLASS_COLOR_PRESETS, panelGlassPair,
  ROPE_FORMS, ROPE_FORM_VALUES,
  registerPanelSection,
} = host;

/* ===== 唯一的跨包登记：外观页签第三节「玻璃 UI」＋ 首节「主题预设」 ===== */

// 主包 src/panel-tabs.js 的 renderAppearanceTab 在「细节」之后调 renderAppearanceGlassSection ——
// 第二刀起那个名字在主包侧是一枚**注册表占位桩**（按 id 从 wePanelSectionsOf('appearance') 取
// 本描述符的 render），所以屏上位置（主题 → 细节 → 玻璃 UI → 侧栏圆角 → 全局 UI 配色 → 全局字体）
// **不变**；主包尾部的 registered 续接列表会排除自有内置位的本节（不双重渲染）。
// 两个硬口径（与 fonts 同款）：
//   ① `title` 必须是 **getter**：注册发生在 bundle 求值期，那时 i18n 表/`weT` 都还没到位；
//   ② 不写 `order`：本节的位置由主包的内置桩锚定，不参与注册表排序（fonts 落默认位 100 是
//      因为它在尾部；本节不同 —— 排序值没人读，写了反而误导）。
// 注册表为空（本行未装 / 被关）⇒ 主包占位桩返回 null ⇒ 缺的是这一节，不是这一页（D3①/D3③）。
registerPanelSection('appearance', 'glass', {
  id: 'glass',
  get title() { return weT("玻璃 UI"); },
  render: (ctx) => renderAppearanceGlassSection(ctx),
});
