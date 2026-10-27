/**
 * wallpaper-rotation-section.js — 「壁纸库」页签第三节「自动轮播」的渲染器。
 *
 * 归属 / 构建期形状 / 消费侧契约见本包 `src/client.js` 文件头（同一份 P-D 口径）。
 * 本文件是 `packages/media-bridge/client.build.json` 的 inline 模块：与入口同工厂作用域，
 * 不收 import / require；自由标识符（React / weT / ctlText / Toggle / renderConfirmRow /
 * groupWallpapers / startCreateGroup / startEditGroup / saveEditingGroup / cancelEditGroup /
 * importPlaylistIntoDraft / rotationIntervalDefault）由入口从 host 显式键集解构。
 *
 * 搬移记录（P-D S3b，2026-10-18）：原 `src/panel-tabs-wallpaper.js:169-316` 的
 * `renderWallpaperRotationSection` **逐字搬来**（函数体 / 注释 / 类名 / 文案 / 顺序零改动）。
 * 全文只有一处**同义替换**：默认轮播间隔的 `DEFAULTS.rotationInterval`（两处）→ 窄键
 * `rotationIntervalDefault`（同一格默认值的显式 host 绑定，行为逐字相同；见主包
 * src/client.js 的 ROTATION_INTERVAL_DEFAULT 与 verify-client 的同源判据）。
 *
 * ctx 键（INTERVALS / armedConfirm / editing / group / groups / 十个 on* 回调 /
 * playableCount / sel）照旧由主包 renderWallpaperTab 构造 ⇒ 本函数与搬前逐字同行为。
 */

  function renderWallpaperRotationSection(ctx) {
    const { INTERVALS, armedConfirm, editing, group, groups, onArmDeleteGroup, onDeleteGroup, onDisarmConfirm, onEditInterval, onEditName, onEditOrder, onEditTrigger, onGroupChange, onGroupInterval, onGroupTrigger, onOpenPickerDraft, onToggleRotation, playableCount, sel } = ctx;
    const groupToken = group ? "group:" + group.id : "";
    return React.createElement(React.Fragment, null,
    // ── 自动轮播: user-defined carousel lists, each with its own
    //    wallpaper set, interval and order. Persisted as `rotationGroups` (host config.json). ──
    React.createElement("div", { className: "we-picker__section" },
      React.createElement("div", { className: "we-picker__section-head" },
        React.createElement("span", { className: "we-picker__section-label" }, weT("自动轮播")),
      ),
      React.createElement("div", { className: "we-picker__row we-picker__playlist-row" },
      React.createElement("select", {
        className: "we-picker__playlist-select",
        value: sel.rotationGroupId,
        onChange: onGroupChange,
        disabled: groups.length === 0,
        "aria-label": weT("轮播列表"),
      },
      React.createElement("option", { value: "" }, groups.length ? weT("— 选择轮播列表 —") : weT("— 暂无轮播列表 —")),
      ...groups.map((g) => React.createElement("option", {
        key: g.id, value: g.id,
      }, weT("{name}（{count} 可播放 · {interval} 分钟）", { name: g.name, count: groupWallpapers(g).length, interval: g.interval }))),
      ),
      React.createElement("button", {
        className: "we-picker__btn", type: "button",
        onClick: startCreateGroup,
      }, weT("新建")),
      React.createElement("button", {
        className: "we-picker__btn", type: "button",
        onClick: () => startEditGroup(sel.rotationGroupId),
        disabled: !sel.rotationGroupId,
      }, weT("编辑")),
      React.createElement("button", {
        className: "we-picker__btn", type: "button",
        // 第一下只置令牌（`onArmDeleteGroup`）；落地在下面那行问句的「确认」里。
        // 待确认时**置灰**（不隐藏、不换位置）：按钮仍占着那一格，宽度就完全不变，
        // 而且它指路到问句行 —— 留着可点会让"再点一下是不是就删了"变成猜测。
        onClick: onArmDeleteGroup,
        disabled: !sel.rotationGroupId || armedConfirm === groupToken,
        title: armedConfirm === groupToken
          ? weT("已经问过你了 —— 在下面那一行选「确认」或「取消」")
          : weT("删除这个轮播列表（会再问一次）"),
      }, weT("删除")),
    ),
    renderConfirmRow(armedConfirm, groupToken,
      weT("删除轮播列表「{name}」？此操作不可恢复。", { name: (group && group.name) || "" }),
      onDeleteGroup, onDisarmConfirm),
    editing && React.createElement("div", { className: "we-picker__editor" },
      React.createElement("div", { className: "we-picker__row" },
        React.createElement("span", { className: "we-picker__hint we-picker__label" }, weT("名称")),
        React.createElement("input", {
          className: "we-picker__text", type: "text",
          value: editing.name,
          "aria-label": weT("轮播列表名称"),
          onInput: onEditName,
        }),
      ),
      React.createElement("div", { className: "we-picker__row" },
        React.createElement("span", { className: "we-picker__hint we-picker__label" }, weT("间隔")),
        React.createElement("select", {
          className: "we-picker__rotation-interval",
          value: String(editing.interval),
          onChange: onEditInterval,
          // 推进方式选了「视频播完」时，间隔不参与推进 —— 置灰但保留可见（用户切回来时还在）
          disabled: editing.trigger === "videoEnd",
          "aria-label": weT("轮播间隔"),
        },
        ...INTERVALS.map((minutes) =>
          React.createElement("option", { key: minutes, value: String(minutes) }, weT("{min} 分钟", { min: minutes })),
        )),
        React.createElement("span", { className: "we-picker__hint we-picker__label" }, weT("推进")),
        React.createElement("select", {
          className: "we-picker__playlist-select",
          value: editing.trigger === "videoEnd" ? "videoEnd" : "interval",
          onChange: onEditTrigger,
          "aria-label": weT("轮播推进方式"),
        },
        React.createElement("option", { value: "interval" }, weT("按间隔")),
        React.createElement("option", { value: "videoEnd" }, weT("视频播完就换")),
        ),
        React.createElement("span", { className: "we-picker__hint we-picker__label" }, weT("顺序")),
        React.createElement("select", {
          className: "we-picker__playlist-select",
          value: editing.order,
          onChange: onEditOrder,
          "aria-label": weT("轮播顺序"),
        },
        React.createElement("option", { value: "sequence" }, weT("顺序", null, "seq")),
        React.createElement("option", { value: "random" }, weT("随机")),
        ),
      ),
      // 选片走**页内下钻**（与「选择壁纸」同一套库视图）：点按钮进库浏览，
      // 卡片点击 = 加入/移出草稿（pickerDraft），顶部提示已选数；「返回」回编辑器。
      // 这里**只有一行入口按钮、没有内联网格**：大库在 24px 缩略图里翻页选片不可用，
      // 全尺寸浏览 + 搜索/过滤才是选片的正确形态。
      React.createElement("div", { className: "we-picker__row" },
        React.createElement("button", {
          className: "we-picker__btn we-picker__btn--primary", type: "button",
          onClick: onOpenPickerDraft,
        }, weT("选择壁纸")),
        React.createElement("span", { className: "we-picker__hint" },
          weT("下钻进库挑选 · 点卡片加入 / 移出")),
      ),
      React.createElement("div", { className: "we-picker__row" },
        React.createElement("span", { className: "we-picker__hint" }, weT("已选 {count} 个", { count: editing.wallpaperIds.length })),
        sel.inventory.playlists.length > 0 && React.createElement("select", {
          className: "we-picker__playlist-select",
          value: "",
          onChange: (e) => {
            const p = sel.inventory.playlists.find((pl) => pl.id === e.target.value);
            if (p) importPlaylistIntoDraft(p);
          },
        },
        React.createElement("option", { value: "" }, weT("从 WE 播放列表导入…")),
        ...sel.inventory.playlists.map((p) => React.createElement("option", {
          key: p.id, value: p.id,
        }, weT("{name}（{count} 可播放）", { name: p.name, count: p.portableCount || 0 }))),
        ),
      ),
      React.createElement("div", { className: "we-picker__row" },
        React.createElement("button", {
          className: "we-picker__btn", type: "button",
          onClick: saveEditingGroup,
        }, weT("保存")),
        React.createElement("button", {
          className: "we-picker__btn", type: "button",
          onClick: cancelEditGroup,
        }, weT("取消")),
      ),
    ),
    React.createElement("div", { className: "we-picker__ctl" },
      ctlText(weT("自动轮转"),
        !sel.rotationGroupId
          ? weT("请先选择或新建一个轮播列表")
          : playableCount < 2
            ? weT("当前列表至少需要 2 个可播放壁纸")
            : (group && group.trigger === "videoEnd")
              ? weT("当前视频播完就换下一张（不看间隔）")
              : weT("每 {min} 分钟切换一次", { min: group ? group.interval : rotationIntervalDefault })),
      React.createElement("div", { className: "we-picker__ctl-side" },
        React.createElement("select", {
          className: "we-picker__rotation-interval",
          value: String(group ? group.interval : rotationIntervalDefault),
          onChange: onGroupInterval,
          disabled: !sel.rotationEnabled || !sel.rotationGroupId || playableCount < 2
            || (group && group.trigger === "videoEnd"),
          "aria-label": weT("轮转间隔"),
        },
        ...INTERVALS.map((minutes) =>
          React.createElement("option", { key: minutes, value: String(minutes) }, weT("{min} 分钟", { min: minutes })),
        )),
        Toggle({
          checked: sel.rotationEnabled,
          onChange: onToggleRotation,
          label: weT("自动轮转"),
          disabled: !sel.rotationGroupId || playableCount < 2,
          title: weT("按列表顺序/随机自动切换壁纸"),
        }),
      ),
    ),
    ),
    );
  }

export { renderWallpaperRotationSection };
