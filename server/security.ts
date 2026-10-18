export interface Env {DB:D1Database;ADMIN_PASSWORD_HASH?:string;ADMIN_USERNAME?:string}
const encoder=new TextEncoder();
export const hex=(bytes:ArrayBuffer|Uint8Array)=>Array.from(bytes instanceof Uint8Array?bytes:new Uint8Array(bytes),v=>v.toString(16).padStart(2,'0')).join('');
export async function digest(value:string){return hex(await crypto.subtle.digest('SHA-256',encoder.encode(value)));}
export async function verifyPassword(password:string,encoded:string){
  const [algorithm,rounds,salt,expected]=encoded.split('$');
  if(algorithm!=='pbkdf2-sha256'||Number(rounds)!==100000||!/^[a-f0-9]{32}$/.test(salt||'')||!/^[a-f0-9]{64}$/.test(expected||''))return false;
  const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
  const actual=hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:Uint8Array.from(salt.match(/../g)!.map(v=>parseInt(v,16))),iterations:100000},key,256));
  let mismatch=0;for(let i=0;i<actual.length;i++)mismatch|=actual.charCodeAt(i)^expected.charCodeAt(i);return mismatch===0;
}
export function sessionCookie(request:Request,value:string,maxAge:number){return 'blog_session='+value+'; Path=/; HttpOnly; SameSite=Lax; Max-Age='+maxAge+(new URL(request.url).protocol==='https:'?'; Secure':'');}
export function cookieToken(request:Request){return request.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith('blog_session='))?.slice(13)||'';}
export async function authenticated(request:Request,env:Env){
  const token=cookieToken(request);if(!/^[a-f0-9]{64}$/.test(token))return false;
  const row=await env.DB.prepare('SELECT expires_at FROM sessions WHERE token_hash=?').bind(await digest(token)).first<{expires_at:number}>();
  return !!row&&row.expires_at>Date.now();
}
export function sameOrigin(request:Request){return request.headers.get('origin')===new URL(request.url).origin;}
