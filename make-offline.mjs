import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
let html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'dist/style.css'),'utf8');
const js=fs.readFileSync(path.join(root,'dist/bundle.js'),'utf8').replace(/<\/script/gi,'<\\/script');
html=html.replace('<link rel="stylesheet" href="./style.css">',()=>'<style>'+css+'</style>').replace('<script src="./bundle.js"></script>',()=>'<script>'+js+'</script>');
fs.mkdirSync(path.join(root,'offline'),{recursive:true});
fs.writeFileSync(path.join(root,'offline/Nikon-Z9.html'),html);
fs.copyFileSync(path.join(root,'dist/vendor/LICENSE.txt'),path.join(root,'offline/Three-LICENSE.txt'));
fs.writeFileSync(path.join(root,'offline/使用说明.txt'),'尼康 Z9 · UNSTOPPABLE 黄黑旗舰概念\n双击 Nikon-Z9.html，用 Chrome 或 Edge 打开。无需安装、联网或 API Key。\n拖动旋转，滚轮缩放，点击部件展开；E 全部拆解，R 复位，A 自动旋转，L 标注，X 结构扫描。\n点击播放产品演绎可观看 20 秒本地 3D 序列，Esc 可停止。不是原厂视频。\n右上角可切换实体视图和结构扫描，半透明外壳与线框由模型实时渲染。\n模型由代码生成，外观与内部排列为示意，不是官方精确模型或维修资料。镜头外观对应第一代 NIKKOR Z 24–70mm f/2.8 S；未取得原厂 CAD 或实体扫描，曲面和小零件为近似。\n产品规格来源：https://onlinemanual.nikonimglib.com/z9/en/specifications_348.html\nThree.js 0.180.0 使用 MIT 许可证，随包保留。\n');
console.log(`Offline HTML: ${Buffer.byteLength(html)} bytes`);

