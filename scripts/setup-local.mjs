import {pbkdf2Sync,randomBytes} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
const salt=randomBytes(16),hash=pbkdf2Sync('LocalOnly-Change-Me-2026!',salt,100000,32,'sha256');
const varsFile=new URL('../.dev.vars',import.meta.url);
if(!await readFile(varsFile,'utf8').catch(()=>''))await writeFile(varsFile,'ADMIN_USERNAME="admin"\nADMIN_PASSWORD_HASH="pbkdf2-sha256$100000$'+salt.toString('hex')+'$'+hash.toString('hex')+'"\nBLOG_CREDENTIAL_MODE="local-test"\n');
const now=new Date().toISOString();
const profile={displayName:'MrRubbish',role:'AI 编程实践者 · 好奇心长期在线',tagline:'在代码与日常之间，\n慢慢探索。',bio:'你好，我是 MrRubbish。这里记录我的 AI 编程练习、做过的小工具，以及一路上遇到的问题。\n\n从一个想法出发，把它变成可以使用的东西，再把过程认真写下来。这是这个博客正在做的事。个人介绍还会继续完善。',location:'',email:'',github:'https://github.com/MrRubbish',avatar:'orbit'};
const settings={title:'MrRubbish · 漫游日志',subtitle:'记录学习、创作，以及普通日子里的小小发现。',accent:'#a5afff',footer:'保持好奇，慢慢生长。'};
const posts=[
 {id:'post-start',slug:'a-small-start',title:'从一个小想法，开始我的 AI 编程练习',summary:'把模糊的想法写清楚，再让功能一步步落地。这篇笔记，记录个人项目的一个小起点。',tags:['学习笔记','AI 编程'],cover:'orbit',body:'# 从想法开始\n\n一个能落地的小需求，通常比一长串想做的功能更适合作为起点。此前的练习包括旅行行李清单、图片水印工具和拾图扩展。\n\n## 先把使用过程讲清楚\n\n谁会用它？输入什么？希望得到什么？遇到错误时页面应该怎么说？这些问题，比先选一个复杂框架更接近产品本身。\n\n## 把功能分成可以验证的小步\n\n- 先让页面能够打开。\n- 再完成一次完整操作。\n- 检查保存、刷新和异常反馈。\n- 最后整理截图与使用说明。\n\n## 留下可以回看的记录\n\n这个博客也采用同样的过程：先写产品需求、技术设计和开发约定，再实现前台与后台。每次完成一个闭环，都会多一点可以回看的经验。\n\n> 本文由 Codex 根据本次实际项目过程协助整理，可在后台继续修改。'},
 {id:'post-images',slug:'image-format-is-not-a-suffix',title:'图片能预览，却不能下载？一次 WebP 问题排查',summary:'状态码是 200，图片也完好，问题却藏在响应类型里。记录拾图扩展中一次真实的兼容性修复。',tags:['问题排查','Chrome 扩展'],cover:'waves',body:'# 图片能看，为什么不能存？\n\n测试拾图扩展时，JPEG 转换成功，WebP 却提示“来源返回的不是图片”。同一张 WebP 在画廊里能够正常显示。\n\n## 先收集线索\n\n读取测试图片得到 HTTP 200，没有重定向。文件头包含 `RIFF` 与 `WEBP`，说明数据确实是 WebP。\n\n```text\nContent-Type: application/octet-stream\nSignature: RIFF....WEBP\n```\n\n## 类型标签不是最终结论\n\n原来的后台检查只接受 `image/*`。一些有效图片以通用二进制类型返回，因此在解码前就被拦住了。\n\n## 修复后仍要实际解码\n\n兼容二进制响应后，继续通过浏览器解码图片，再用 Canvas 编码成 PNG。保存完再检查文件签名与尺寸，才能确认它是真的 PNG。\n\n## 把问题留在测试里\n\n最小回归测试验证了同一张 WebP 的读取与解码；原始的完整下载流程也通过了。另有受控 403 测试，确认失败不会被显示成成功。\n\n> 这是本地受控环境中的实际排查记录，不代表已覆盖所有真实商城的登录和访问条件。'},
 {id:'post-packing',slug:'a-checklist-that-remembers',title:'一份会记住进度的旅行清单',summary:'让勾选、数量修改和自定义物品在刷新后继续保留，一件小工具才开始变得顺手。',tags:['项目手记','交互设计'],cover:'leaf',body:'# 一份刚刚好的旅行清单\n\n旅行行李清单练习从一个简单流程开始：填目的地、天数、交通方式，生成物品列表，然后一件件打包。\n\n## 数量也要能调整\n\n自动生成的数量只是起点。允许直接修改数量、添加自己的物品和移除不需要的物品，可以让清单更贴近实际行程。\n\n## 刷新之后，还在那里\n\n这个小工具把当前行程和打包状态保存在当前浏览器。与本博客的数据库保存方式不同，它适合单机使用；重要清单可以导出 TXT。\n\n## 确认的时机\n\n重置勾选保留物品和数量；生成新清单会替换旧内容，因此需要把影响说清楚，再让使用者确认。\n\n## 做过的检查\n\n实际检查覆盖过数量校验、刷新恢复、TXT 下载、筛选和手机布局。漂亮的界面之外，这些细节决定了一个工具能不能放心使用。'}
];
const projects=[
 {id:'project-imageharvest',slug:'imageharvest',title:'拾图 · 电商图片助手',summary:'一个 Chrome 扩展：集中提取、预览并选择图片，批量转换为 PNG 下载。',tags:['Chrome 扩展','JavaScript','PNG'],cover:'waves',liveUrl:'https://mrrubbish.github.io/imageharvest-chrome/',repoUrl:'https://github.com/MrRubbish/imageharvest-chrome',body:'# 拾图 · 电商图片助手\n\n使用 Codex 完成的 Manifest V3 扩展，配有已发布的静态官网。\n\n## 核心体验\n\n- 提取图片标签、常见懒加载属性和背景图。\n- 在画廊中筛选、全选、反选与按需下载。\n- 将可读取的 JPEG、WebP 转换为 PNG。\n- 显示真实保存结果，保留失败项以便重试。\n\n## 实际验证\n\n使用独立 Chrome 测试配置验证了提取、过滤、真实 PNG 文件和错误反馈。源码与官网已发布到 GitHub。\n\n受登录、防盗链或页面加载状态影响的图片，仍需按实际使用条件处理。'},
 {id:'project-packing',slug:'packlight',title:'轻装 · 旅行行李清单',summary:'按出行条件准备物品，勾选打包、调整数量、添加自己的物品，再导出随身清单。',tags:['原生网页','本地保存','旅行工具'],cover:'leaf',liveUrl:'',repoUrl:'',body:'# 轻装 · 旅行行李清单\n\n一个可在本地打开的小工具。根据天数、交通方式、旅行场景、预计天气与境外选项生成清单。\n\n## 已实现\n\n- 六类物品和可调整的数量。\n- 自定义物品、删除与确认操作。\n- 打包进度、搜索与状态筛选。\n- 当前浏览器保存、TXT 导出和打印。\n\n## 保存范围\n\n这是本地网页项目，记录保存在当前浏览器。天气由使用者选择，不查询实时天气。'},
 {id:'project-watermark',slug:'image-watermark',title:'图片水印助手',summary:'给图片添加文字水印，在浏览器中调整位置与样式，保存处理后的图片。',tags:['浏览器工具','图片处理'],cover:'grid',liveUrl:'https://image-watermark-y3213-1014.modestlark257.chatgpt.site/',repoUrl:'',body:'# 图片水印助手\n\n此前完成的网页工具练习，主要围绕图片上传、水印样式与导出体验。\n\n## 项目关注点\n\n让图片处理操作在一个页面中完成，并及时显示调整后的结果。与其他练习一起，作为个人作品的一个小积累。'}
];
const quote=value=>"'"+String(value).replaceAll("'","''")+"'";
const lines=['INSERT OR IGNORE INTO site(id,content,updated_at) VALUES('+[quote('main'),quote(JSON.stringify({profile,settings})),quote(now)].join(',')+');'];
for(const [i,skill] of [{name:'AI 编程',category:'探索与实践',level:'持续实践'},{name:'网页交互',category:'前端体验',level:'正在学习'},{name:'Chrome 扩展',category:'工具开发',level:'项目实践'},{name:'Git 与部署',category:'开发流程',level:'正在积累'}].entries())lines.push('INSERT OR IGNORE INTO skills(id,name,category,level,sort_order) VALUES('+[quote('skill-'+i),quote(skill.name),quote(skill.category),quote(skill.level),i].join(',')+');');
for(const [kind,entries] of [['posts',posts],['projects',projects]])for(const [i,item] of entries.entries()){
 const values=[item.id,item.slug,item.title,item.summary,item.body,JSON.stringify(item.tags),item.cover,'published',item.liveUrl||'',item.repoUrl||'',i,now,now,now];
 lines.push('INSERT OR IGNORE INTO '+kind+'(id,slug,title,summary,body,tags,cover,status,live_url,repo_url,sort_order,created_at,updated_at,published_at) VALUES('+values.map(v=>typeof v==='number'?v:quote(v)).join(',')+');');
}
await writeFile(new URL('./seed.sql',import.meta.url),lines.join('\n')+'\n');
console.log('Local test credential hash and initial SQL prepared; production requires owner-set credentials.');
