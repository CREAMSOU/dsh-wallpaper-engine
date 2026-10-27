/**
 * packages/glass/lib/index.js —— 「液态玻璃」子包的**宿主半边**（ADR-0016 第一刀：骨架先行）。
 *
 * 本包分三刀出户（每刀独立可验收）：
 *   第一刀（本提交）：host-only 空壳 —— 行已登记、键表已通、宿主自检可解析，浏览器半边仍在
 *     主包 `src/glass-panel.js` 内联，用户观感零变化；
 *   第二刀：设置面板节（glass-panel.js）随包走（`exports['./client']` + `client.build.json`）；
 *   第三刀：玻璃运行时（glass.js / glass-surfaces.js / glass-extra.js）与玻璃 CSS 随包走，
 *     停用本行 = 摘掉全部 `data-we-glass-*` 门控与 `--dsw-*` 门控改写，宿主回到原生外观
 *     （ADR-0010 D2 一直「未实现」的 wallpaper-only 状态由此转正为行级开关）。
 *
 * 第一刀的宿主半边与 fx 同形（ADR-0014 S1.2 / S6.1）：纯浏览器族的宿主半边就是一个满足
 * 导出形状的空壳 —— 零路由、零服务、零副作用。它在 cordis.patch.yml 里是一条**独立插件行**
 * （id=wallpaper-engine-glass / name=本包真实包名）。
 *
 * 「空壳」不等于「不接线」（与 fx 同款两条）：
 *   ① apply 先经 Cordis Service（`export const inject = ['wallpaperEngineHost']`，ADR-0014 S5.1）向
 *      主包要一份本包的**显式键集**（host.keys('glass', ctx)）—— 缺 id 会抛、不静默 undefined。
 *      主包停用 ⇒ 服务随其 fiber 撤销 ⇒ 本子包因 inject 级联 park（ADR-0014 S7.2「关主包 = 关整族」）。
 *   ② 拆除账照交：ADR-0013 D15 / ADR-0014 S6.2「teardown 必须交 ctx.effect」⇒ host.handOff(ctx, dispose)。
 *
 * 纪律（与 fx 逐字同款）：不注册额外 ctx.effect、不读 config、不 acquireKernelLease、
 * 模块顶层只有声明（无求值期副作用）。第二刀落地前**不声明** dsh.client / exports["./client"]：
 * 声明了却没有产物，客户端会按 id 去取那个 lazy factory 然后抛错（ADR-0014 S3.4）。
 */

export const name = 'dsh-plugin-wallpaper-engine-glass';

/** 宿主侧只依赖主包供给的跨包服务面（ADR-0014 S5.1）：'wallpaperEngineHost' 是子包半边**唯一**的注入项。 */
export const inject = ['wallpaperEngineHost'];

export function apply(ctx) {
  const host = ctx.wallpaperEngineHost;
  // ① 显式键集：服务契约是"缺 id 抛错（不静默 undefined）"，这里再兜一层形状判据。
  //    （主包 SUBPACKAGE_KEY_TABLE.glass = base / log（不消费的键不进表）；传 ctx 让 log 同时落平台通道。）
  const keys = host.keys('glass', ctx);
  if (keys === null || typeof keys !== 'object' || Array.isArray(keys)) {
    throw new Error('[wallpaper-engine-glass] host.keys("glass") 没有返回键集对象（ADR-0014 S5.1 / S5.4 服务面显式键集契约）');
  }
  // 第一刀刻意**不用** keys 做任何事（玻璃的行为仍在主包浏览器半边；第三刀才随包走）。
  // 读一次 = 键表真的存在，失败即大声抛：这就是启动自检里属于宿主半边的那一半。
  void keys;
  // ② 拆除账照交（ADR-0013 D15 / ADR-0014 S6.2）：空壳 = 空操作，但 teardown 必须走 ctx.effect。
  return host.handOff(ctx, () => {});
}

export default { name, inject, apply };
