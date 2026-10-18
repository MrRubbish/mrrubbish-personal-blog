import {z} from 'zod';
import {authenticated,cookieToken,digest,hex,sameOrigin,sessionCookie,verifyPassword,type Env} from './security';
import type {Entry,Site,Skill} from '../src/types';
const text=(max:number)=>z.string().trim().max(max);
const external=text(1000).refine(value=>{if(!value)return true;try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}},'请填写有效的 HTTP/HTTPS 地址');
const siteSchema=z.object({profile:z.object({displayName:text(60).min(1),role:text(120),tagline:text(180),bio:text(5000),location:text(80),email:text(180).refine(v=>!v||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),'邮箱格式不正确'),github:external,avatar:z.enum(['orbit','mono','cat'])}),settings:z.object({title:text(100).min(1),subtitle:text(180),accent:z.string().regex(/^#[0-9a-fA-F]{6}$/),footer:text(180)})});
const skillSchema=z.object({name:text(60).min(1),category:text(40).min(1),level:text(60).min(1),sortOrder:z.number().int().min(0).max(999)});
const entrySchema=z.object({title:text(140).min(1),slug:z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/,'标识使用小写字母、数字与连字符'),summary:text(500).min(1),body:text(80000).min(1),tags:z.array(text(30).min(1)).max(8),cover:z.enum(['orbit','waves','grid','leaf']),status:z.enum(['draft','published']),liveUrl:external,repoUrl:external,sortOrder:z.number().int().min(0).max(999)});
class HttpError extends Error{constructor(public status:number,message:string){super(message);}}
function json(data:unknown,status=200,extra:Record<string,string>={}){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});}
async function payload(request:Request){if(!request.headers.get('content-type')?.toLowerCase().includes('application/json'))throw new HttpError(415,'请使用 JSON 格式提交。');const body=await request.text();if(new TextEncoder().encode(body).length>120000)throw new HttpError(413,'提交内容过大。');try{return JSON.parse(body);}catch{throw new HttpError(400,'提交内容格式不正确。');}}
type Row={id:string;slug:string;title:string;summary:string;body:string;tags:string;cover:Entry['cover'];status:Entry['status'];live_url:string;repo_url:string;sort_order:number;created_at:string;updated_at:string;published_at:string|null};
function entry(row:Row,full=true):Entry{return {id:row.id,slug:row.slug,title:row.title,summary:row.summary,body:full?row.body:'',tags:JSON.parse(row.tags),cover:row.cover,status:row.status,liveUrl:row.live_url,repoUrl:row.repo_url,sortOrder:row.sort_order,createdAt:row.created_at,updatedAt:row.updated_at,publishedAt:row.published_at};}
async function getSite(env:Env):Promise<Site>{const row=await env.DB.prepare("SELECT content,updated_at FROM site WHERE id='main'").first<{content:string;updated_at:string}>();if(!row)throw new HttpError(503,'站点内容还在准备中，请稍后再试。');return {...JSON.parse(row.content),updatedAt:row.updated_at};}
async function login(request:Request,env:Env){
  if(!env.ADMIN_PASSWORD_HASH)throw new HttpError(503,'管理员登录尚未配置。');
  const parsed=z.object({username:text(80).min(1),password:z.string().min(1).max(256)}).parse(await payload(request));
  const client=await digest((request.headers.get('CF-Connecting-IP')||'local')+'|'+(env.ADMIN_USERNAME||'admin'));
  const now=Date.now(),windowMs=15*60*1000;
  const attempt=await env.DB.prepare('SELECT failures,window_start FROM login_attempts WHERE client_key=?').bind(client).first<{failures:number;window_start:number}>();
  if(attempt&&now-attempt.window_start<windowMs&&attempt.failures>=5)throw new HttpError(429,'尝试次数较多，请 15 分钟后再试。');
  const valid=await verifyPassword(parsed.password,env.ADMIN_PASSWORD_HASH);
  if(parsed.username!==(env.ADMIN_USERNAME||'admin')||!valid){
    const active=attempt&&now-attempt.window_start<windowMs;
    await env.DB.prepare('INSERT INTO login_attempts(client_key,failures,window_start) VALUES(?,?,?) ON CONFLICT(client_key) DO UPDATE SET failures=excluded.failures,window_start=excluded.window_start').bind(client,active?attempt.failures+1:1,active?attempt.window_start:now).run();
    throw new HttpError(401,'账号或密码不正确。');
  }
  const token=hex(crypto.getRandomValues(new Uint8Array(32))),ttl=8*60*60;
  await env.DB.batch([env.DB.prepare('DELETE FROM login_attempts WHERE client_key=?').bind(client),env.DB.prepare('DELETE FROM sessions WHERE expires_at<?').bind(now),env.DB.prepare('INSERT INTO sessions(token_hash,expires_at) VALUES(?,?)').bind(await digest(token),now+ttl*1000)]);
  return json({authenticated:true,username:env.ADMIN_USERNAME||'admin'},200,{'Set-Cookie':sessionCookie(request,token,ttl)});
}
export async function handleRequest(request:Request,env:Env):Promise<Response>{
  try{
    const url=new URL(request.url),parts=url.pathname.replace(/^\/api\/?/,'').split('/').filter(Boolean).map(decodeURIComponent),method=request.method;
    if(!['GET','POST','PUT','DELETE'].includes(method))throw new HttpError(405,'此接口不支持当前操作。');
    if(method!=='GET'&&!sameOrigin(request))throw new HttpError(403,'请从本站页面提交操作。');
    if(parts[0]==='auth'){
      if(parts[1]==='login'&&method==='POST')return await login(request,env);
      if(parts[1]==='logout'&&method==='POST'){const token=cookieToken(request);if(token)await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await digest(token)).run();return json({ok:true},200,{'Set-Cookie':sessionCookie(request,'',0)});}
      if(parts[1]==='me'&&method==='GET'){const ok=await authenticated(request,env);return json({authenticated:ok,username:ok?(env.ADMIN_USERNAME||'admin'):null});}
      throw new HttpError(404,'没有找到这个接口。');
    }
    const admin=parts[0]==='admin';if(admin&&!await authenticated(request,env))throw new HttpError(401,'请先登录管理后台。');
    const path=admin?parts.slice(1):parts,kind=path[0],id=path[1];
    if(path.length>2)throw new HttpError(404,'没有找到这个接口。');
    if(admin&&['skills','posts','projects'].includes(kind)&&((method==='POST'&&id)||(method==='PUT'&&!id)))throw new HttpError(405,'新建请使用列表地址，编辑请指定内容标识。');
    if(!admin&&method!=='GET')throw new HttpError(405,'此接口只支持读取。');
    if(kind==='site'&&!id){
      if(method==='GET')return json(await getSite(env));
      if(admin&&method==='PUT'){const content=siteSchema.parse(await payload(request)),now=new Date().toISOString();await env.DB.prepare("UPDATE site SET content=?,updated_at=? WHERE id='main'").bind(JSON.stringify(content),now).run();return json({...content,updatedAt:now});}
    }
    if(kind==='skills'){
      if(method==='GET'&&!id){const data=await env.DB.prepare('SELECT id,name,category,level,sort_order FROM skills ORDER BY sort_order,name').all<{id:string;name:string;category:string;level:string;sort_order:number}>();return json(data.results.map(row=>({id:row.id,name:row.name,category:row.category,level:row.level,sortOrder:row.sort_order} satisfies Skill)));}
      if(admin&&(method==='POST'||method==='PUT')){const input=skillSchema.parse(await payload(request)),key=id||crypto.randomUUID();if(id&&!await env.DB.prepare('SELECT id FROM skills WHERE id=?').bind(id).first())throw new HttpError(404,'技能不存在。');if(method==='POST')await env.DB.prepare('INSERT INTO skills(id,name,category,level,sort_order) VALUES(?,?,?,?,?)').bind(key,input.name,input.category,input.level,input.sortOrder).run();else await env.DB.prepare('UPDATE skills SET name=?,category=?,level=?,sort_order=? WHERE id=?').bind(input.name,input.category,input.level,input.sortOrder,key).run();return json({id:key,...input},method==='POST'?201:200);}
      if(admin&&method==='DELETE'&&id){await env.DB.prepare('DELETE FROM skills WHERE id=?').bind(id).run();return json({ok:true});}
    }
    if(kind==='posts'||kind==='projects'){
      if(method==='GET'){
        if(id){const row=admin?await env.DB.prepare(`SELECT * FROM ${kind} WHERE id=?`).bind(id).first<Row>():await env.DB.prepare(`SELECT * FROM ${kind} WHERE slug=? AND status='published'`).bind(id).first<Row>();if(!row)throw new HttpError(404,'内容不存在或尚未发布。');return json(entry(row));}
        const rows=await env.DB.prepare(`SELECT * FROM ${kind}${admin?'':" WHERE status='published'"} ORDER BY ${kind==='posts'?'published_at DESC,created_at DESC':'sort_order,created_at DESC'} LIMIT 200`).all<Row>();return json(rows.results.map(row=>entry(row,admin)));
      }
      if(admin&&(method==='POST'||method==='PUT')){
        const input=entrySchema.parse(await payload(request));const previous=id?await env.DB.prepare(`SELECT * FROM ${kind} WHERE id=?`).bind(id).first<Row>():null;if(id&&!previous)throw new HttpError(404,'待编辑的内容不存在。');
        const duplicate=await env.DB.prepare(`SELECT id FROM ${kind} WHERE slug=?`).bind(input.slug).first<{id:string}>();if(duplicate&&duplicate.id!==id)throw new HttpError(409,'这个链接标识已使用，请换一个。');
        const key=id||crypto.randomUUID(),now=new Date().toISOString(),published=input.status==='published'?(previous?.published_at||now):null;
        const params=[input.slug,input.title,input.summary,input.body,JSON.stringify(input.tags),input.cover,input.status,input.liveUrl,input.repoUrl,input.sortOrder,now,published];
        if(method==='POST')await env.DB.prepare(`INSERT INTO ${kind}(slug,title,summary,body,tags,cover,status,live_url,repo_url,sort_order,updated_at,published_at,id,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(...params,key,now).run();
        else await env.DB.prepare(`UPDATE ${kind} SET slug=?,title=?,summary=?,body=?,tags=?,cover=?,status=?,live_url=?,repo_url=?,sort_order=?,updated_at=?,published_at=? WHERE id=?`).bind(...params,key).run();
        return json({id:key,...input,createdAt:previous?.created_at||now,updatedAt:now,publishedAt:published},method==='POST'?201:200);
      }
      if(admin&&method==='DELETE'&&id){await env.DB.prepare(`DELETE FROM ${kind} WHERE id=?`).bind(id).run();return json({ok:true});}
    }
    throw new HttpError(404,'没有找到这个接口。');
  }catch(error){
    if(error instanceof HttpError)return json({error:error.message},error.status);
    if(error instanceof z.ZodError)return json({error:error.issues[0]?.message||'请检查填写内容。'},400);
    console.error('Blog API error',error instanceof Error?error.name:'Unknown');return json({error:'保存或读取暂时失败，请稍后重试。'},500);
  }
}
