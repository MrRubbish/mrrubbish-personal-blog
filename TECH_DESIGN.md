# 技术设计

## 架构

前端为 React、TypeScript 与 Vite，使用原生 CSS 维护统一设计。Cloudflare Pages 托管前端，Pages Functions 提供同源 `/api` 接口，D1 保存内容与登录会话。开发与生产执行相同的接口和数据库语义；本地使用 Wrangler 的 D1 模拟器。

## 项目结构

- `src/`：前台页面、后台页面、组件、统一 API 客户端、数据类型与样式。
- `functions/api/[[path]].ts`：API 路由入口。
- `server/`：接口逻辑、参数校验、鉴权与数据库访问。
- `migrations/`：D1 数据库结构迁移。
- `scripts/`：初始内容与本地管理凭据准备。
- `public/`：原创 SVG、站点图标、路由和响应头配置。
- `test/`：服务端关键行为测试。

## 数据模型

| 表 | 用途 |
| --- | --- |
| `site` | 单行 JSON：个人资料、站点设置与最后修改时间 |
| `skills` | 分类、技能名、学习状态与排序 |
| `projects` | 标识、slug、标题、摘要、Markdown、标签、插画、外部链接、发布状态与时间 |
| `posts` | 标识、slug、标题、摘要、Markdown、标签、插画、草稿/发布状态与时间 |
| `sessions` | 随机会话令牌的哈希与到期时间 |
| `login_attempts` | 登录失败窗口、计数与临时限制 |

SQL 使用预编译参数。公开接口只读已发布内容，后台读取与所有修改均要求管理员会话。列表返回必要的摘要字段；正文通过详情接口读取。

## 接口

- `GET /api/site`、`GET /api/skills`：公开资料。
- `GET /api/posts`、`GET /api/posts/:slug`：公开文章。
- `GET /api/projects`、`GET /api/projects/:slug`：公开作品。
- `POST /api/auth/login`、`POST /api/auth/logout`、`GET /api/auth/me`：登录流程。
- `/api/admin/site`、`/api/admin/skills`、`/api/admin/posts`、`/api/admin/projects`：后台资料及 CRUD。

## 认证与内容安全

管理员密码采用 PBKDF2 哈希，存放在服务端环境变量；本地开发凭据写入被 Git 忽略的 `.dev.vars`。密码及会话令牌不写入浏览器 localStorage。随机会话通过 HttpOnly、SameSite Cookie 发送，生产使用 Secure；数据库只保存令牌哈希。登录失败有临时限制，写请求检查同源和 JSON 类型。

前后端均校验字段，接口限制请求体大小。Markdown 采用安全渲染，忽略原始 HTML；外部 URL 校验协议。删除操作在界面中确认。前台请求失败时显示重试入口，后台保存只有在服务端成功后才反馈成功。

## 部署与验证

构建产物为 `dist/`。Pages 绑定名为 `DB` 的专用 D1 数据库，并通过服务端 Secret 配置管理员密码哈希。`wrangler.toml` 使用 Cloudflare 创建数据库后返回的实际标识；移植到其他账号时需要创建自己的数据库并替换标识。

源码保存到 GitHub，使用 Wrangler 直接发布前端及 Functions 到 Cloudflare Pages；推送 GitHub 不会自动部署。执行生产迁移、初始内容导入与登录检查后，再截图并记录真实访问地址。线上验证使用临时随机凭据，结束后切换为所有者设置的密码哈希并撤销测试会话。凭据、数据库本地状态、依赖和浏览器配置均不进入提交包。
