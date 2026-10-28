# Upgrading

> **中文**: [`../UPGRADING.md`](../UPGRADING.md)（与本文同源：改一处请同步另一处）


### Current Test Branch Requirements

The suite requires **Node.js >=22.12.0 and DSH 0.2 (including 0.2.0-rc.1/rc.2)** and no longer contains a bundled pet or Electron. DSH 0.1 is outside the supported range. **Version floors are governed by `engines` in `package.json`** (`engines.node` / `engines.dsh`).

Close the host, update the entire checkout, and rerun the [source installer](../../README.md#安装). Registry package-name commands cannot fetch unpublished changes. The npm channel only applies after all eight release packages have been published.

Disable the old built-in pet bundle before upgrading. The installer does not delete old profile dependencies or data. Remove `dsh-we-pet-builtin` explicitly through the target host's package manager. Install an official pet build with `petApi7340` and the public control APIs separately; restore old file patches from backups or reinstall the official package. Wallpaper remains usable without a pet.

Older upgrade steps are in [`CHANGELOG.md`](./CHANGELOG.md); installation and upgrade of the current version follow only the requirements above.

### The correct update order

1. **Bring the DSH kernel to the `engines.dsh` floor in `package.json` first** (currently the DSH 0.2 kernel, including 0.2.0-rc.1/rc.2): on the official desktop (DeepSeek Harness) check for updates via the top-bar version info, or grab the installer from [GitHub Releases](https://github.com/anywhere-labs/dsh-desktop/releases);
2. **Then update this plugin**: `dsh plugin --profile web add dsh-plugin-wallpaper-engine` (or click update in the plugin market);
3. **dsh-better-sidebar has no version requirement**: if installed, bringing it to the latest (`dsh plugin --profile web add dsh-better-sidebar@latest`) is still a good idea.

> 💡 Also update your **other DSH plugins at the same time**: older plugins may fail to load outright on
> the new kernel (an old dsh-better-sidebar was observed misbehaving due to API changes).

### If anything breaks after updating

Bringing the kernel to the `engines.dsh` floor and dsh-better-sidebar to the latest restores everything —
**no plugin rollback needed**.

### Update notice

The plugin shows a one-time in-app notice per release; missing it is harmless.

### What changes after the upgrade (frame cache / live rendering)

- **The frame cache is invalidated once**: cache keys are prefixed with a pipeline version (currently
  `LIVE_FRAME_KEY_VERSION = 'lf2'`; source of truth: `lib/media/frame-store.js`), and any change to the
  capture / live-render logic bumps it — after a bump nothing under `~/.dsh-wallpaper-engine/cache/frames/`
  hits any more, and each scene wallpaper is captured afresh. **This is expected, not a regression**; old
  files are not deleted automatically (clear `cache/frames/` by hand to reclaim the space). The same
  directory also holds the scene's embedded video (`sv1_*.mp4`) and packaged audio (`sa1_*`), each with its
  own prefix.
- **Live rendering needs WebGL2**: after upgrading, scene / web wallpapers render live through WebWallGL by
  default (「场景实时渲染」/「网页实时渲染」, on by default). Without WebGL2, or with a broken GPU driver, once
  the renderer page's first-frame budget runs out it **degrades silently** to the
  「embedded MP4 → live capture → custom frame → empty state」 chain (before the first frame the
  **author's preview** stands in and only a missing preview leaves it honestly blank — no black screen).
  (A **loose `scene.json` directory also renders live**: the renderer judges the form from
  `project.json`'s `file` suffix, so a whole-package `scene.pkg` is no longer required.)
- **Live rendering is on by default** (`sceneLive`) — nothing to do after upgrading.

### Compatibility verification

- The live-rendering chain has offline verification (`test/verify-scene-live.mjs` and more,
  `npm run verify`).
- **Which steps the guard chain contains is governed by `MANIFEST` in `test/run-guards.mjs`** (the
  `verify` / `verify:docs` / `smoke` entries in `package.json` are only sleeves pointing at that runner;
  `package.json`'s `scripts` are not the list). This file does not enumerate them.
- **The current version is whatever `package.json`'s `version` says (published versions: see the npm
  package page / GitHub Releases).**

### Settings persistence: moved to a host-side file (v0.4.0)

**Since v0.4.0 every setting (selected wallpaper, accent, transparency, layout, rotation, hidden list,
playback speed/flip, …) lives in a host-side file instead of browser localStorage.**

- **Where**: `~/.dsh-wallpaper-engine/config.json` (the same file that stores your upload directory).
- **Why**: localStorage is isolated per "origin + port", and **DSH Desktop picks a random port on every
  start** — so each launch looked like a brand-new store and every setting reverted to default. A host-side
  file is port-independent.
- **Benefits**: restarts, port changes, cleared browser data, a different browser or a private window no
  longer lose your settings.
- **Migration**: settings previously kept in localStorage are **migrated automatically on first start**.
- **Behaviour change**: several browsers on the same machine now **share one config** (they used to be
  separate); rolling back to an older version still reads the localStorage copy, so nothing is lost.
- **Writes**: debounced automatically; a corrupt file falls back to defaults and is **never overwritten**.

---

### The frame-rate cap tiers are now "unlimited / 60 / 30" (unreleased)

**If you had the *fps cap* in **Playback → Effects** set to 48 or 24 fps, it will read "unlimited" after upgrading.**
Those tiers were retired (48 has no natural audience and saves only ~20% of the decode load; 24 makes most
wallpapers visibly choppy for little extra saving over 30), and stored values are **collapsed to the default 0
(unlimited)** by the setting's enum domain — there is no migration step and nothing for you to change.

- **To keep saving GPU**: pick **60** (halves 120 fps sources) or **30** (halves 60/50 fps sources). While a cap is
  active, a wallpaper whose source frame rate is above it is transcoded **once** to the capped rate (the timeline
  is not re-encoded, playback stays at normal speed; cached by "path + mtime + cap", so each wallpaper pays once;
  the original plays first and the app swaps when it is ready, falling back to the original on failure).
- **Unlimited is the default**: with no cap set, not a single transcode ever runs.

---

### Glass configuration collapses into one "independent configuration" switch per surface (unreleased)

**What you will see** (all under Settings → Wallpaper Engine → Appearance; **nothing for you to change** — existing settings migrate once):

- **Two switch layers retired**: the「设置窗口液态玻璃」(settings-window glass) and「子 UI 玻璃」(child-UI glass) switches are **gone** — they used to turn a surface's glass off, but that "off" measurably **did not** restore the native solid look (those surfaces carry a batch of tint rewrites that no switch controls), and doing it properly costs several times the complexity. The behaviour now equals **always on** (i.e. the way it looked with the switch on).
- **One「独立配置」(independent configuration) switch per surface**: on = this surface's own glass parameters **fully override** the global ones; off = it follows the global values. Each brings its own parameters (colour / transparency / blur; the conversation surface also has fidelity).
- **The「窗口与侧栏」(window & sidebar) section was removed** and merged into「玻璃 UI」— on machines without `better-sidebar` it used to be **an empty section with nothing but a heading**.
- **「独立配置」lives in the sidebar's collapsible block**. The classification is ADR-0008's D4: **simple configuration** (both variants) = glass colour / transparency / blur / fidelity plus the thinking-glass, left-sidebar glass, sidebar glass, sidebar full-clear and sidebar follow-global switches; **advanced configuration** (**sidebar only, collapsed by default**) = each surface's「独立配置」and its parameters, and the capsule blur / capsule colour rows shown when the thinking-glass switch is on — they live in the「详细玻璃调节」(advanced glass tuning) collapsible block at the end of the sidebar's「玻璃 UI」section (the settings dialog covers the page, so tuning there gives no live preview — the reason advanced configuration lives in the sidebar); **presets**, conversely, are **settings-page only** (a whole-snapshot overwrite, an action with no undo, does not belong in a narrow panel that is easy to hit by accident).
- **The sidebar and content-surface sliders now have an entry point**: they previously had no「独立配置」switch, so those sliders **did nothing when dragged**; turning the matching「独立配置」on makes them appear and take effect (still following the global values by default).
- **One scale**: the sidebar and content-surface sliders now share the global scale (**no visual change** — stored values were converted once by *normalised position*). The one exception: if you had pushed **sidebar blur** very deep, it is clamped to the new ceiling.
- **The thinking trigger bar (the entry row of a "thinking" block) also takes glass now, with its own independent configuration**: it used to be the host's opaque code-block background. It now runs the same recipe as the other conversation surfaces, keeps its hover feedback, and falls back to an opaque panel colour under software rendering (no blur). 「思考触发条玻璃·独立配置」on = override the global **blur / transparency** for this surface, off = follow the global values (same rule as the other surfaces).

⚠️ These changes live on both the host side and the browser side ⇒ **restart DSH** (or reload the plugin) for them to take effect.


