/**
 * styles-shell.js —— 样式域模块 **SHELL**（原 src/styles.js 第 593–1134 行，共 542 行）。
 *
 * 内容：宿主外壳 —— iOS liquid glass · 思考触发条 · 输入座位 · composer card · 轨迹霜 · 吸顶条 · 正文原生挡 · 原生左栏底 · 外壳画布底。
 *
 * 拼装契约（样式族 9 个模块共享，组装点见 src/styles.js）：
 *   · 构建期按 INLINE_MODULES 顺序把族内文件**原样内联进同一工厂作用域**，模块之间不 import，靠扁平符号协作
 *     （见 docs/CODE-STRUCTURE.md §3）；
 *   · 本段模板的开引号紧跟本段首行（不另起一行）；段间那一个换行由上一段的收尾换行提供；
 *     本段自身以换行收尾（下一段接着写）；
 *   · 组装点按 BASE → SHELL → SIDEBAR → CHROME → SETTINGS → PANEL → QUICK → EXT 相加 ⇒ 拼出的 CSS 与原单模板
 *     **逐字节相同**（分割前 sha256 前缀 3b6c41dc7dcab44bf5c57f4 · 262306 B）。
 *
 * ⚠️ 本文件（注释与正文）不得出现裸反引号，也不得复述任何样式表声明语句的字面量：守卫按行首的域模板
 *    声明从**产物**里抽取模板，散文里出现同样的字面量或反引号会把锚点带偏。
 *
 * 契约：需要的外界**无**；对外提供本域的样式表常量。不变量：浏览器安全（无 import / require / Node API）、
 * 不得有顶层可执行语句去读宿主状态（内联位置早于 client.js 正文）、整体是**纯数据**。
 */
const CSS_SHELL = `

  /* ── 原生左栏在 extended/advanced 窗口模式下的不透明底 ─────────────────────
     harness 的壳层样式表带一条模式门控规则：mode 为 extended/advanced 且
     material=off 时，ASIDE.dshDesktopSidebarSurface（原生左栏 surface）被刷成
     不透明的 var(--dsw-alias-bg-layer-1)，并经继承的 --dsw-specific-sidebar-fill
     变量传给内层（兼容模式无此规则，左栏直接透出壁纸）。壁纸激活时恢复透明，
     让两种模式观感一致；壳层关闭壁纸时原生不透明底照旧。
     门控到 [data-we-adapter^="desktop-"]：壳层属性 + 适配目标两腿都成立才画，
     浏览器形态即使页面带着同名属性也不吃这条。 */
  /* ADR-0016 第四刀勘误：这条让位也改挂 data-we-glass-page——停玻璃行时左栏回原生实色
     （否则原生左栏被清成透明洞）。 */
  body[data-we-adapter^="desktop-"][data-we-wallpaper][data-we-glass-page][data-dsh-desktop-mode="extended"] .dshDesktopSidebarSurface,
  body[data-we-adapter^="desktop-"][data-we-wallpaper][data-we-glass-page][data-dsh-desktop-mode="advanced"] .dshDesktopSidebarSurface {
    /* !important 必需：宿主的模式门控规则在层叠里赢过本表的非 important 声明
       （实测 var 被压回 #232324），important 才能让 fill 变量真正翻转。 */
    --dsw-specific-sidebar-fill: transparent !important;
    background: transparent !important;
  }

  /* ── 外壳画布底 ───────────────────────────────────────────────────────────
     壳层有一条**模式门控**规则把 .dshDesktopFrame（整窗 grid 容器）刷成
     var(--dsh-desktop-frame-fill)：Windows 上 material 只能是 off ⇒ 该变量 =
     var(--dsw-alias-bg-layer-1)（不透明）⇒ 挂在 body 上的 z-index:-1 壁纸层被整片盖住
     （用户看到「壁纸没生效 / 像没选壁纸」；.dshDesktopFrame 位于 #root 的自成层叠上下文内）。
     ⚠️ **不加模式门控**：兼容模式的基线样式是 transparent（这条规则因此是无操作），而模式名
     与门控集合由壳层自己演进 —— 只认 "extended" 的那一版会在壳层给别的模式也加底色后整片盖住
     壁纸。壁纸激活时一律清底，是对模式名漂移免疫的写法。
     ⚠️ 这条选择器里的 .dshDesktopFrame 与 --dsh-desktop-frame-fill 在**当前 DSH Desktop
     里都不存在**（对 app.asar 全量字面扫描命中 0 次）—— 规则保留为无害的兼容项：万一某个
     形态仍有这个类名，它要的正是"清画布"。Windows 形态真正要让开的是
     --dsw-specific-sidebar-fill（已由上面那条在壁纸激活时置 transparent，顶栏伪元素读的正是它）。
     主内容区读 --dsw-alias-bg-base，本表已在 body[data-we-wallpaper] 上置 transparent，无需再写。
     同样门控到 [data-we-adapter^="desktop-"]（理由见上一条规则）。 */
  body[data-we-adapter^="desktop-"][data-we-wallpaper] .dshDesktopFrame {
    background: transparent !important;
  }

`;

export { CSS_SHELL };
