# 中秋大团圆 · 月饼大乱斗

[立即在线玩](https://kunruiw1991.github.io/mid-autumn-reunion-party/) · 无需安装，手机和电脑都可以玩。

## 玩法

抢月饼，和其他朋友比积分。连续拾取会把得分倍数叠到 **×5**，金月饼价值 **4 倍**；冲刺撞到对手可以夺走积分。每隔十几秒就会触发流星月饼雨、全场双倍分、灯笼加速、金月饼大爆发等随机事件。倒计时结束按积分排名，最高分保存在本机。

- **派对乱斗**：75 秒，和 3 位电脑朋友抢第一。
- **双人同屏**：75 秒，两名玩家与 2 位电脑朋友同场对决。
- **闪电狂欢**：50 秒，派对事件触发得更频繁。

**单人电脑：** WASD 或方向键移动，空格冲刺，P 暂停。  
**双人电脑：** 1P 用 WASD + 空格；2P 用方向键 + 右 Shift。  
**手机：** 点按场地让玉兔前往目标，按住并拖动可持续引导；点击「冲刺夺分」。

## 素材来源

- 场景：[`mid-autumn-legend-assets`](https://github.com/kunruiw1991/mid-autumn-legend-assets) 的中秋 SVG。
- 12 位角色头像：[`critters-calabash-brothers`](https://github.com/kunruiw1991/critters-calabash-brothers) 的角色图，在游戏里缩小为 WebP。
- Mikey、JJ：[`mikey-jj-assets`](https://github.com/kunruiw1991/mikey-jj-assets) 的角色图，在游戏里缩小为 WebP。

角色与相关形象的权利归各自权利人所有；本仓库不宣称这些角色图为原创，也不为它们另行授予许可证。游戏代码与中秋场景设计由本项目制作。

## 本地运行

在仓库目录运行 `python3 -m http.server 8000`，打开 `http://localhost:8000`。无需构建工具或后端。

## iPad 与音乐

在 iPad 上用手指点月饼或拖动手指引导玉兔，场地右下角的 ⚡ 按钮可加速。派对模式为 60 秒，闪电模式为 40 秒；玉兔不会被电脑对手夺分。

页面可打开《KPop Demon Hunters》官方原声专辑，也可由家长在设备上选择自己持有的音频文件供浏览器本机播放。仓库不包含电影原声录音，选取的文件不会上传。外部流媒体能否与 Safari 游戏同时播放，取决于设备和应用的播放策略。
