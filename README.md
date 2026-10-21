# Nikon Z9 · 外观精修版

Z9 + **第一代 NIKKOR Z 24–70mm f/2.8 S**，24mm 收缩状态、未安装遮光罩。沿用黄黑交互页面，重新构建机身外壳和镜头，保留 12 部件展开、结构扫描、标注和产品演绎。

## 本轮外观改动

- 以 0.03 场景单位/mm 为统一比例，采用 Z9 约 149 × 149.5 × 90.5 mm、镜头最大直径约 89mm 和长度约 126mm 作为整体比例参照。凸出附件、曲面和局部小尺寸仍为图片估计，模型没有通过实体量测。
- 一体式竖拍轮廓、弧面握柄、肩部红色饰条、靠握柄侧的 Fn1–Fn3、镜头释放键及同步/遥控端子盖。
- 背面圆形眼罩、矩形目镜、双摇杆、多重选择器、横竖拍 AF-ON、DISP/照片视频切换区、i/Menu/回放/缩放键和下部 WB/QUAL/语音区域。
- 顶部肩屏、快门和电源环、录制/ISO/曝光补偿、四键控制盘及热靴导轨。
- 指定镜头的对焦环、变焦环、控制环、OLED 信息窗、DISP、L-Fn、A/M 开关、焦距刻度和 82mm 前缘文字。
- 新增三分之四、正面、背面、顶部检查视角。拖动旋转、滚轮缩放继续可用。

## 使用

直接打开 `offline/Nikon-Z9.html`；无需网络、API Key 或安装依赖。也可运行 `node server.cjs` 并访问服务器打印的网址。默认端口 4173，可用环境变量 PORT 修改。

源码为 `src/app.js`（交互）与 `src/refined-model.js`（几何和材质）。使用 esbuild 0.25.10 构建：

```
npm install
npm run build
node make-offline.mjs
```

Three.js 0.180.0 和 OrbitControls 随项目保存在 dist/vendor，保留 MIT 许可证。

## 依据与精度边界

资料核对：2026-10-21。

- [Z9 官方部件图](https://onlinemanual.nikonimglib.com/z9/en/parts_of_the_camera_7.html)
- [Z9 官方规格](https://onlinemanual.nikonimglib.com/z9/en/specifications_348.html)
- [Z9 官方多角度产品照片](https://nij.nikon.com/products/lineup/mirrorless/z9/)
- [24–70mm f/2.8 S 官方产品照片](https://nij.nikon.com/products/lineup/nikkor/zmount/nikkor_z_24-70mm_f28_s/)
- [24–70mm f/2.8 S 官方规格](https://nij.nikon.com/products/lineup/nikkor/zmount/nikkor_z_24-70mm_f28_s/spec.html)
- [镜头官方说明书](https://download.nikonimglib.com/archive4/VfX4m00VjeV304ANvHC83seow078/Z24_70_2.8S_JP%2830_DL%2902.pdf)

官方图片只作为观察参考，未打包或再发布。模型是自行编写的程序化几何，未取得原厂 CAD、三维扫描或逐件实测数据；不声称毫米级一比一复刻。小按键轮廓、皮纹、倒角、接口内部和镜片曲率仍为近似。内部骨架、主板、电池与存储组件用于讲解，拆解顺序不是维修步骤。显示屏画面、镜头反光及 20 秒演绎由程序生成。

独立制作，非尼康官方页面。Nikon / NIKKOR / Z9 名称与标识属于相应权利人。

## 在线访问

在线入口：https://mannixsc.github.io/nikon-z9-interactive/dist/ 。GitHub Pages 从 main 分支根目录发布；根页面跳转到 dist/。源码、离线 HTML 与离线压缩包随仓库保留。

