/**
 * client.js — 壁纸子包的**浏览器半边**入口（P-D 阶段1 / S3a 端到端打样）。
 *
 * ⚠️ 归属（务必先读）：用户口径 **§6.1 = A「代码归属，不是状态归属」**（正本 = ADR-0013 **D20**）。
 *    随包走的是**渲染器与描述符**；上传目录 / 官方资源目录 / 上传列表 / 确认令牌这些
 *    键、默认值、持久化与动作体仍在主包（lib/settings-schema.js 与 src/client.js）
 *    ⇒ 本包**不持键、不持久化、不注册 settings.section**；值一律经主包构造的渲染 ctx
 *    或下面的 host 显式键集拿到。
 *
 * ## 构建期形状（与 packages/fonts/src/client.js 逐条同形）
 *   · 产物 = packages/wallpaper/lib/client.wallpaper.js，id = 子包真实包名
 *     dsh-plugin-wallpaper-engine-wallpaper（与宿主 graph row 逐字相等）；入口 = 本文件，
 *     正文只取**首个块注释之后**的内容。
 *   · 本包的 INLINE_MODULES（client.build.json 的 inline[]）内联在正文之前 ⇒ 兄弟文件与入口落在
 *     **同一个工厂作用域**：互相按裸名引用，不 import、不 require、不许 `...host` 展开、不许动态键。
 *   · 唯一例外 = 产物里由构建循环 outline 在正文与内联件之前发出的那一行
 *     `const host = require('dsh-plugin-wallpaper-engine');`（BUNDLE-SPLIT §5.1 ②）。
 *
 * ## 消费侧契约（唯一跨包通道 = 主 bundle 的显式键集，ADR-0014 S5.1 / S5.4）
 * 下面的 WALLPAPER_UPLOADS_HOST_REQUIRED 与主包 `src/client.js` 的 HOST_BRIDGE_BINDINGS
 * 壁纸段**逐键一致**（缺键大声抛，不许静默 undefined）。键集依据 = 被搬渲染器的**自由标识符**
 * 逐个点名（React / weT / changeUploadDir / changeWeAssetsDir / uploadWallpaperFile /
 * removeUploadWallpaper / renderConfirmRow）+ 贡献面 registerPanelSection。
 */

/**
 * 缺键**大声失败**（ADR-0014 S5.1 / S5.4 显式键集 + ADR-0013 D3③「宁可显示、不可静默消失」）。
 * 主包被关 ⇒ 本 bundle 根本不会被 require（ADR-0014 S7.2 连坐）；能走到这里却缺键 = 键集与申报表脱钩。
 */
const WALLPAPER_UPLOADS_HOST_REQUIRED = [
  // 渲染内核（主 bundle 的共享零件表）
  'React', 'weT',
  // 上传目录 / 官方资源目录 / 上传 / 移除 / 确认行（动作体全留主包）
  'changeUploadDir', 'changeWeAssetsDir', 'uploadWallpaperFile', 'removeUploadWallpaper', 'renderConfirmRow',
  // 贡献面（主 bundle 的收件箱：值 + 回调，写权留主包）
  'registerPanelSection',
];
for (const key of WALLPAPER_UPLOADS_HOST_REQUIRED) {
  if (!(key in host)) {
    throw new Error('[wallpaper-engine-wallpaper] 主 bundle 键集缺少 "' + key
      + '"（ADR-0014 S5.1 / S5.4 显式键集：要么补键，要么改申报表，不许静默 undefined）');
  }
}
const {
  React, weT,
  changeUploadDir, changeWeAssetsDir, uploadWallpaperFile, removeUploadWallpaper, renderConfirmRow,
  registerPanelSection,
} = host;

/* ===== 唯一的跨包登记：「壁纸库」页签第四节「自定义壁纸」===== */

// 主包 src/panel-tabs.js 的 `renderWallpaperTab(ctx)` 画完三个内置节之后，按注册表续接本包登记的节
// （`wePanelSectionsOf('library')`，见 src/extension-registry.js）。三个硬口径：
//   ① `title` 必须是 **getter**：注册发生在 bundle 求值期，那时 i18n 表 / `weT` 都还没到位，
//      注册期读词会把 `weT` 拉到求值期（字体包 / fx / parallax 的 title getter 同款理由）。
//   ② `order: 40`：三个内置节是 current=10 / transition=20 / rotation=30（主包组装点里的调用序），
//      本节点是屏上第四节 ⇒ 写 40 与"追加在末尾"同义，但顺序由 order 决定、不靠求值顺序。
//   ③ 注册表只登记、不持有状态：ctx 由主包在渲染处构造（一个键都不删），本包不缓存、不自订阅。
registerPanelSection('library', 'wallpaper-uploads', {
  id: 'wallpaper-uploads',
  get title() { return weT("自定义壁纸"); },
  order: 40,
  render: renderWallpaperUploadsSection,
});
