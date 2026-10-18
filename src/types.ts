export type Cover = 'orbit' | 'waves' | 'grid' | 'leaf';
export interface Profile {displayName:string;role:string;tagline:string;bio:string;location:string;email:string;github:string;avatar:'orbit'|'mono'|'cat'}
export interface Settings {title:string;subtitle:string;accent:string;footer:string}
export interface Site {profile:Profile;settings:Settings;updatedAt:string}
export interface Skill {id:string;name:string;category:string;level:string;sortOrder:number}
export interface Entry {id:string;slug:string;title:string;summary:string;body:string;tags:string[];cover:Cover;status:'draft'|'published';liveUrl:string;repoUrl:string;sortOrder:number;createdAt:string;updatedAt:string;publishedAt:string|null}
export type EntryInput = Omit<Entry,'id'|'createdAt'|'updatedAt'|'publishedAt'>;
