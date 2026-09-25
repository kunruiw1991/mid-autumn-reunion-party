# 中秋大团圆 · 月下派对

一款无需安装的中秋浏览器小游戏。[点击开始游戏](https://kunruiw1991.github.io/mid-autumn-reunion-party/)。手机和电脑都可以玩。

## 玩法

1. 移动玉兔，靠近散落在场地里的朋友；朋友会排队跟着你。
2. 带队进入中央月亮宴席。一次带回越多人，得分倍数越高；Mikey 和 JJ 是加分贵宾。
3. 吃月饼得分，躲开移动的乌云。被乌云碰到会少 2 秒，也可能有朋友走散。
4. 每带回 5 位朋友，派对奖励 3 秒。空格或「冲刺」按钮可以穿过乌云。

有 **90 秒团圆夜**、**60 秒闪电局**、**接人续时的不散场** 三种模式。每种模式的最高分存在浏览器本机。

**电脑操作：** 方向键或 WASD 移动，空格冲刺，P 暂停。  
**手机操作：** 按住游戏场地引导玉兔移动，点击「冲刺」按钮。

## 素材来源

- 场景：[`mid-autumn-legend-assets`](https://github.com/kunruiw1991/mid-autumn-legend-assets) 中的 4 幅原创 SVG。
- 12 位角色头像：[`critters-calabash-brothers`](https://github.com/kunruiw1991/critters-calabash-brothers) 的角色图，针对游戏缩小为 WebP。
- Mikey、JJ：[`mikey-jj-assets`](https://github.com/kunruiw1991/mikey-jj-assets) 的角色图，针对游戏缩小为 WebP。

角色和相关形象的权利归各自权利人所有；本仓库不宣称这些角色图为原创，也不为它们另行授予许可证。游戏代码与中秋场景设计由本项目制作。

## 本地运行

在仓库目录运行 `python3 -m http.server 8000`，打开 `http://localhost:8000`。无需构建工具或后端。
