import type {Entry,EntryInput,Site,Skill} from './types';
export class ApiError extends Error{constructor(message:string,public status:number){super(message);}}
export async function request<T>(path:string,options:RequestInit={}):Promise<T>{
  const response=await fetch('/api'+path,{...options,credentials:'same-origin',headers:{'Content-Type':'application/json',...options.headers}});
  const data:unknown=await response.json().catch(()=>({error:'服务暂时不可用。'}));
  if(!response.ok){const error=data&&typeof data==='object'&&'error' in data&&typeof data.error==='string'?data.error:'操作失败，请重试。';throw new ApiError(error,response.status);}return data as T;
}
export const api={
  site:()=>request<Site>('/site'),skills:()=>request<Skill[]>('/skills'),
  list:(kind:'posts'|'projects',admin=false)=>request<Entry[]>((admin?'/admin':'')+'/'+kind),
  entry:(kind:'posts'|'projects',id:string,admin=false)=>request<Entry>((admin?'/admin':'')+'/'+kind+'/'+encodeURIComponent(id)),
  saveSite:(data:Pick<Site,'profile'|'settings'>)=>request<Site>('/admin/site',{method:'PUT',body:JSON.stringify(data)}),
  saveEntry:(kind:'posts'|'projects',data:EntryInput,id?:string)=>request<Entry>('/admin/'+kind+(id?'/'+id:''),{method:id?'PUT':'POST',body:JSON.stringify(data)}),
  deleteEntry:(kind:'posts'|'projects',id:string)=>request('/admin/'+kind+'/'+id,{method:'DELETE'}),
  saveSkill:(data:Omit<Skill,'id'>,id?:string)=>request<Skill>('/admin/skills'+(id?'/'+id:''),{method:id?'PUT':'POST',body:JSON.stringify(data)}),
  deleteSkill:(id:string)=>request('/admin/skills/'+id,{method:'DELETE'}),
  me:()=>request<{authenticated:boolean;username:string|null}>('/auth/me'),
  login:(username:string,password:string)=>request('/auth/login',{method:'POST',body:JSON.stringify({username,password})}),
  logout:()=>request('/auth/logout',{method:'POST',body:'{}'})
};
