import type {PoolClient} from 'pg';
import type {VercelRequest,VercelResponse} from '@vercel/node';
import {createClient} from '@supabase/supabase-js';
import {z} from 'zod';
import {getPool} from '../server/db';
import {authorizeIdentity} from '../server/identity';
import {emptyState,execute,stateForUser,DomainError,type State} from '../src/domain';
const requestSchema=z.object({requestId:z.uuid(),revision:z.number().int().min(0),command:z.unknown()});
export default async function handler(req:VercelRequest,res:VercelResponse){
 res.setHeader('Cache-Control','no-store, private');res.setHeader('Vary','Authorization');
 if(!['GET','POST'].includes(req.method??'')){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Desteklenmeyen işlem.'});}
 if(!process.env.DATABASE_URL||!process.env.VITE_SUPABASE_URL||!process.env.VITE_SUPABASE_PUBLISHABLE_KEY)return res.status(503).json({error:'Merkezi sistem kurulumu tamamlanmamış. Yönetici kurulum rehberini uygulamalı.'});
 const token=req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];if(!token)return res.status(401).json({error:'Oturum açın.'});
 if(req.method==='POST'&&(!req.headers['content-type']?.includes('application/json')||Number(req.headers['content-length']??0)>4_000_000))return res.status(413).json({error:'JSON isteği gerekli. En fazla 4 MB kabul edilir.'});
 let client:PoolClient|undefined;
 try{
  const auth=createClient(process.env.VITE_SUPABASE_URL,process.env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await auth.auth.getUser(token);
  if(error||!data.user)return res.status(401).json({error:'Oturum süresi doldu. Tekrar giriş yapın.'});
  const payload=req.method==='POST'?requestSchema.parse(req.body):null;
  client=await getPool().connect();await client.query('BEGIN');
  await client.query('SET LOCAL statement_timeout = 10000');
  await client.query('INSERT INTO siparis_private.workspace (id,data) VALUES (true,$1) ON CONFLICT (id) DO NOTHING',[JSON.stringify(emptyState())]);
  const row=await client.query('SELECT data FROM siparis_private.workspace WHERE id=true FOR UPDATE');
  let state=row.rows[0].data as State;const revisionBefore=state.revision;
  let actor=authorizeIdentity(state,{email:data.user.email,emailConfirmed:!!data.user.email_confirmed_at},process.env.BOOTSTRAP_ADMIN_EMAIL);
  if(payload){
   const previous=await client.query('SELECT actor_id FROM siparis_private.requests WHERE id=$1',[payload.requestId]);
   if(previous.rowCount){if(previous.rows[0].actor_id!==actor.id)throw new DomainError('İstek kimliği başka kullanıcıya ait.',409);}
   else{
    if(payload.revision!==state.revision)throw new DomainError('Başka bir kullanıcı kayıtları güncelledi. Liste yenilendi; işleminizi kontrol edip tekrar deneyin.',409);
    state=execute(state,actor.id,payload.command);
    await client.query('INSERT INTO siparis_private.requests (id,actor_id) VALUES ($1,$2)',[payload.requestId,actor.id]);
   }
  }
  if(state.revision!==revisionBefore)await client.query('UPDATE siparis_private.workspace SET data=$1,updated_at=now() WHERE id=true',[JSON.stringify(state)]);
  actor=state.users.find(u=>u.id===actor.id)!;
  await client.query('COMMIT');return res.status(200).json({state:stateForUser(state,actor),user:actor});
 }catch(error){
  if(client)await client.query('ROLLBACK').catch(()=>{});
  if(error instanceof DomainError)return res.status(error.status).json({error:error.message});
  if(error instanceof z.ZodError)return res.status(400).json({error:'Geçersiz veri: '+error.issues[0].message});
  console.error('Workspace request failed',{name:error instanceof Error?error.name:'UnknownError'});
  return res.status(500).json({error:'İşlem sonucu doğrulanamadı. Aynı işlemi aynı bilgilerle tekrar deneyin; istek kimliği çift kaydı önler. Sorun sürerse yönetici veritabanı bağlantısını kontrol etmeli.'});
 }finally{client?.release();}
}

