import {handleRequest} from '../../server/app';
import type {Env} from '../../server/security';
export const onRequest=({request,env}:{request:Request;env:Env})=>handleRequest(request,env);
