INSERT OR IGNORE INTO site(id,content,updated_at) VALUES('main','{"profile":{"displayName":"MrRubbish","role":"AI 编程实践者 · 好奇心长期在线","tagline":"在代码与日常之间，\n慢慢探索。","bio":"你好，我是 MrRubbish。这里记录我的 AI 编程练习、做过的小工具，以及一路上遇到的问题。\n\n从一个想法出发，把它变成可以使用的东西，再把过程认真写下来。这是这个博客正在做的事。个人介绍还会继续完善。","location":"","email":"","github":"https://github.com/MrRubbish","avatar":"orbit"},"settings":{"title":"MrRubbish · 漫游日志","subtitle":"记录学习、创作，以及普通日子里的小小发现。","accent":"#a5afff","footer":"保持好奇，慢慢生长。"}}','2026-10-18T03:33:04.370Z');
INSERT OR IGNORE INTO skills(id,name,category,level,sort_order) VALUES('skill-0','AI 编程','探索与实践','持续实践',0);
INSERT OR IGNORE INTO skills(id,name,category,level,sort_order) VALUES('skill-1','网页交互','前端体验','正在学习',1);
INSERT OR IGNORE INTO skills(id,name,category,level,sort_order) VALUES('skill-2','Chrome 扩展','工具开发','项目实践',2);
INSERT OR IGNORE INTO skills(id,name,category,level,sort_order) VALUES('skill-3','Git 与部署','开发流程','正在积累',3);
INSERT OR IGNORE INTO posts(id,slug,title,summary,body,tags,cover,status,live_url,repo_url,sort_order,created_at,updated_at,published_at) VALUES('post-start','a-small-start','从一个小想法，开始我的 AI 编程练习','把模糊的想法写清楚，再让功能一步步落地。这篇笔记，记录个人项目的一个小起点。','# 从想法开始

一个能落地的小需求，通常比一长串想做的功能更适合作为起点。此前的练习包括旅行行李清单、图片水印工具和拾图扩展。

## 先把使用过程讲清楚

谁会用它？输入什么？希望得到什么？遇到错误时页面应该怎么说？这些问题，比先选一个复杂框架更接近产品本身。

## 把功能分成可以验证的小步

- 先让页面能够打开。
- 再完成一次完整操作。
- 检查保存、刷新和异常反馈。
- 最后整理截图与使用说明。

## 留下可以回看的记录

这个博客也采用同样的过程：先写产品需求、技术设计和开发约定，再实现前台与后台。每次完成一个闭环，都会多一点可以回看的经验。

> 本文由 Codex 根据本次实际项目过程协助整理，可在后台继续修改。','["学习笔记","AI 编程"]','orbit','published','','',0,'2026-10-18T03:33:04.370Z','2026-10-18T03:33:04.370Z','2026-10-18T03:33:04.370Z');
INSERT OR IGNORE INTO posts(id,slug,title,summary,body,tags,cover,status,live_url,repo_url,sort_order,created_at,updated_at,published_at) VALUES('post-images','image-format-is-not-a-suffix','图片能预览，却不能下载？一次 WebP 问题排查','状态码是 200，图片也完好，问题却藏在响应类型里。记录拾图扩展中一次真实的兼容性修复。','# 图片能看，为什么不能存？

测试拾图扩展时，JPEG 转换成功，WebP 却提示“来源返回的不是图片”。同一张 WebP 在画廊里能够正常显示。

## 先收集线索

读取测试图片得到 HTTP 200，没有重定向。文件头包含 `RIFF` 与 `WEBP`，说明数据确实是 WebP。

```text
Content-Type: application/octet-stream
Signature: RIFF....WEBP
```

## 类型标签不是最终结论

原来的后台检查只接受 `image/*`。一些有效图片以通用二进制类型返回，因此在解码前就被拦住了。

## 修复后仍要实际解码

兼容二进制响应后，继续通过浏览器解码图片，再用 Canvas 编码成 PNG。保存完再检查文件签名与尺寸，才能确认它是真的 PNG。

## 把问题留在测试里

最小回归测试验证了同一张 WebP 的读取与解码；原始的完整下载流程也通过了。另有受控 403 测试，确认失败不会被显示成成功。

> 这是本地受控环境中的实际排查记录，不代表已覆盖所有真实商城的登录和访问条件。','["问题排查","Chrome 扩展"]','waves','published','','',1,'2026-10-18T03:33:04.370Z','2026-10-18T03:33:04.370Z','2026-10-18T03:33:04.370Z');
INSERT OR IGNORE INTO posts(id,slug,title,summary,body,tags,cover,status,live_url,repo_url,sort_order,created_at,updated_at,published_at) VALUES('post-packing','a-checklist-that-remembers','一份会记住进度的旅行清单','让勾选、数量修改和自定义物品在刷新后继续保留，一件小工具才开始变得顺手。','# 一份刚刚好的旅行清单

旅行行李清单练习从一个简单流程开始：填目的地、天数、交通方式，生成物品列表，然后一件件打包。

## 数量也要能调整

自动生成的数量只是起点。允许直接修改数量、添加自己的物品和移除不需要的物品，可以让清单更贴近实际行程。

## 刷新之后，还在那里

这个小工具把当前行程和打包状态保存在当前浏览器。与本博客的数据库保存方式不同，它适合单机使用；重要清单可以导出 TXT。

## 确认的时机

重置勾选保留物品和数量；生成新清单会替换旧内容，因此需要把影响说清楚，再让使用者确认。

## 做过的检查

实际检查覆盖过数量校验、刷新恢复、TXT 下载、筛选和手机布局。漂亮的界面之外，这些细节决定了一个工具能不能放心使用。','["项目手记","交互设计"]','leaf','published','','',2,'2026-10-18T03:33:04.370Z','2026-10-18T03:33:04.370Z','2026-10-18T03:33:04.370Z');
INSERT OR IGNORE INTO projects(id,slug,title,summary,body,tags,cover,status,live_url,repo_url,sort_order,created_at,updated_at,published_at) VALUES('project-imageharvest','imageharvest','拾图 · 电商图片助手','一个 Chrome 扩展：集中提取、预览并选择图片，批量转换为 PNG 下载。','# 拾图 · 电商图片助手

使用 Codex 完成的 Manifest V3 扩展，配有已发布的静态官网。

## 核心体验

- 提取图片标签、常见懒加载属性和背景图。
- 在画廊中筛选、全选、反选与按需下载。
- 将可读取的 JPEG、WebP 转换为 PNG。
- 显示真实保存结果，保留失败项以便重试。

## 实际验证

使用独立 Chrome 测试配置验证了提取、过滤、真实 PNG 文件和错误反馈。源码与官网已发布到 GitHub。

受登录、防盗链或页面加载状态影响的图片，仍需按实际使用条件处理。','["Chrome 扩展","JavaScript","PNG"]','waves','published','https://mrrubbish.github.io/imageharvest-chrome/','https://github.com/MrRubbish/imageharvest-chrome',0,'2026-10-18T03:33:04.370Z','2026-10-18T03:33:04.370Z','2026-10-18T03:33:04.370Z');
INSERT OR IGNORE INTO projects(id,slug,title,summary,body,tags,cover,status,live_url,repo_url,sort_order,created_at,updated_at,published_at) VALUES('project-packing','packlight','轻装 · 旅行行李清单','按出行条件准备物品，勾选打包、调整数量、添加自己的物品，再导出随身清单。','# 轻装 · 旅行行李清单

一个可在本地打开的小工具。根据天数、交通方式、旅行场景、预计天气与境外选项生成清单。

## 已实现

- 六类物品和可调整的数量。
- 自定义物品、删除与确认操作。
- 打包进度、搜索与状态筛选。
- 当前浏览器保存、TXT 导出和打印。

## 保存范围

这是本地网页项目，记录保存在当前浏览器。天气由使用者选择，不查询实时天气。','["原生网页","本地保存","旅行工具"]','leaf','published','','',1,'2026-10-18T03:33:04.370Z','2026-10-18T03:33:04.370Z','2026-10-18T03:33:04.370Z');
INSERT OR IGNORE INTO projects(id,slug,title,summary,body,tags,cover,status,live_url,repo_url,sort_order,created_at,updated_at,published_at) VALUES('project-watermark','image-watermark','图片水印助手','给图片添加文字水印，在浏览器中调整位置与样式，保存处理后的图片。','# 图片水印助手

此前完成的网页工具练习，主要围绕图片上传、水印样式与导出体验。

## 项目关注点

让图片处理操作在一个页面中完成，并及时显示调整后的结果。与其他练习一起，作为个人作品的一个小积累。','["浏览器工具","图片处理"]','grid','published','https://image-watermark-y3213-1014.modestlark257.chatgpt.site/','',2,'2026-10-18T03:33:04.370Z','2026-10-18T03:33:04.370Z','2026-10-18T03:33:04.370Z');
