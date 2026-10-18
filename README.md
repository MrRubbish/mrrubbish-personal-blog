# MrRubbish · 漫游日志

个人博客与作品集，带可编辑资料、文章、作品和技能的管理后台。内容保存在 Cloudflare D1，访客刷新页面后可看到已发布的更新。

## 功能

- 前台：首页、文章搜索与标签筛选、Markdown 阅读、目录、阅读进度、分享链接、作品与关于页面。
- 后台：单管理员登录、个人资料编辑、文章和作品的草稿/发布/删除、技能管理、站点标题与配色设置。
- 数据：Pages Functions 提供同源接口，D1 保存内容和会话。草稿只允许登录的管理员读取。

需求与验收见 [PRD.md](PRD.md)，架构与接口见 [TECH_DESIGN.md](TECH_DESIGN.md)，开发约定见 [AGENTS.md](AGENTS.md)。考核截图中的 `TECH_DESIN` 对应本项目的 `TECH_DESIGN.md`。

## 本地运行

安装 Node.js 24 与 npm，然后在项目目录执行：

```powershell
npm ci
npm run setup:local
npm run db:local
npm run seed:local
npm run build
npm run preview
```

打开 <http://127.0.0.1:8792>。本地预览使用真实的 Wrangler D1 模拟器，无需云端账号。

`setup:local` 只在缺少 `.dev.vars` 时准备开发凭据，不覆盖已有设置。首次本地测试账号为 `admin`，测试密码为 `LocalOnly-Change-Me-2026!`；这些公开测试凭据不得用于生产。

若要设置自己的管理员凭据，另开终端执行：

```powershell
npm run admin:setup
```

在 <http://127.0.0.1:8793> 设置账号和密码。这个页面仅监听本机，保存加盐的 PBKDF2 哈希到被 Git 忽略的 `.dev.vars`，不会保存明文密码。设置完成后可结束设置进程。

## 检查

```powershell
npm test
npm run build
```

接口测试使用 Node 的 SQLite 执行实际迁移和生产处理函数，覆盖鉴权、跨来源写入、草稿隔离、持久化与增删改。浏览器验证另检查完整网页操作及手机布局。

## 发布到 Cloudflare Pages

此仓库使用 Wrangler 直接部署；源码另存 GitHub。推送 GitHub 不会自动更新线上网站。

1. 执行 `npx wrangler login`，登录自己的 Cloudflare 账号。
2. 创建专用 Pages 项目和 D1 数据库。若部署到其他账号，使用新数据库的实际 ID 更新 `wrangler.toml`；不要修改原有站点的数据库。
3. 在项目目录执行迁移和初始内容导入：

   ```powershell
   npx wrangler d1 migrations apply DB --remote
   npx wrangler d1 execute DB --remote --file scripts/seed.sql
   ```

4. 先通过本地管理员设置页生成自己的凭据，再分别执行下列命令，在终端提示处输入 `.dev.vars` 中对应的账号及哈希。不要提交秘密文件。

   ```powershell
   npx wrangler pages secret put ADMIN_USERNAME --project-name mrrubbish-blog-1018
   npx wrangler pages secret put ADMIN_PASSWORD_HASH --project-name mrrubbish-blog-1018
   ```

5. 构建并发布。修改 Secret 后也需要重新部署才能应用：

   ```powershell
   npm run build
   npx wrangler pages deploy dist --project-name mrrubbish-blog-1018 --branch main
   ```

6. 检查平台返回的网址，登录 `/admin` 保存资料，并用独立浏览器验证更新。

初始 SQL 使用 `INSERT OR IGNORE`，重复执行不会覆盖已编辑的初始记录。生产数据库中的新内容不受重新上传前端文件影响。更改密码时，应撤销旧会话；可在 Cloudflare 控制台中对本项目数据库执行 `DELETE FROM sessions`。

## 个人内容

显示名沿用 GitHub 昵称 MrRubbish，未提供的学校、任职、所在地和邮箱保持空白。初始介绍可在后台修改。文章基于本次实际项目过程整理，相关说明保留在正文中；作品展示此前完成的拾图、旅行行李清单与图片水印工具。

## 官方参考

- [Pages Functions 的 Wrangler 配置](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
- [Pages Functions 数据库与环境绑定](https://developers.cloudflare.com/pages/functions/bindings/)
- [Wrangler 命令](https://developers.cloudflare.com/workers/wrangler/commands/)
