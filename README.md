# 月兔派对 · iPad 图形版

在线游戏：https://kunruiw1991.github.io/mid-autumn-reunion-party/

面向不识字的小朋友：一个 ▶ 开始按钮，点按或拖动场地收集月饼，⚡ 加速，⏸ 暂停，🔊 静音，⏭ 换歌。可见界面只使用图形和数字；按钮保留辅助技术可读的名称。

## 游戏内音乐

点击开始后，页面内的 HTML audio 播放已有公开仓库 `kunruiw1991/lumipop-kids-tv` 中的资源，不跳转应用：

- `videos/dh_02_golden_lyrics.mp4` — Golden
- `videos/dh_01_soda_pop.mp4` — Soda Pop

播放器使用视频文件内的 AAC 音轨；音乐与游戏暂停同步。iPad 需要首次点击开始来允许有声播放。资源版权归各权利人所有。本项目没有给音轨另行授权；素材沿用用户指定的现有仓库。

## 角色素材

角色来自已有 `critters-calabash-brothers` 和 `mikey-jj-assets` 仓库。

## 开发

无构建步骤。使用静态 HTTP 服务打开 `index.html`；`node --check game.js` 检查脚本语法。GitHub Pages 从 main 根目录发布。

## 幼儿友好平衡

电脑角色开局等待 5 秒，以较慢速度收集远离玉兔和触摸目标的月饼，捡到后停 1.8 秒；不使用加速或连击加成。玉兔附近有起步月饼，触摸会吸附到邻近月饼，近身月饼自动吸入，连击间隔延长至 5 秒。分数来自实际收集，不修改最终排名。
