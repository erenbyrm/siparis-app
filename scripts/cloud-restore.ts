import fs from 'node:fs/promises';
import {getPool} from '../server/db.js';
import {readWorkspace,writeWorkspace,isRecordWorkspace} from '../server/workspaceStorage.js';
import {execute,DomainError} from '../src/domain.js';
import {readBackup} from '../src/imports.js';
import {verifyBackup} from '../src/backupIntegrity.js';
const [file,email,confirmation]=process.argv.slice(2);
if(!file||!email||confirmation!=='--confirm-empty-target')throw new Error('Kullanım: cloud-restore.ts yedek.json yonetici-eposta --confirm-empty-target. Hedefte mevcut iş verisi bulunmamalı.');
const pool=getPool();let client;
try{
 const raw=await fs.readFile(file,'utf8');if(!await verifyBackup(raw))throw new DomainError('Bu büyük yedekte SHA-256 bütünlük bilgisi gerekli.');const backup=readBackup(raw);
 client=await pool.connect();await client.query('BEGIN');const row=await client.query('SELECT data FROM siparis_private.workspace WHERE id=true FOR UPDATE');if(!row.rows.length)throw new DomainError('Önce uygulamada ilk yönetici hesabıyla giriş yapın.');
 const stored=row.rows[0].data;if(!isRecordWorkspace(stored))throw new DomainError('Önce 002 veri geçişini tamamlayın.');const current=await readWorkspace(client,stored);
 if((current.stockRequests?.length??0)||Object.values(current.inventory??{}).some(rows=>rows.length))throw new DomainError('Hedefte depo kaydı veya stok talebi var. Üzerine yazılmaz.');
 const admin=current.users.find(u=>u.active&&u.role==='admin'&&u.email.toLowerCase()===email.toLowerCase());if(!admin)throw new DomainError('Hedefte bu e-posta ile aktif yönetici bulunamadı.');
 const next=execute(current,admin.id,{type:'backup.import',data:backup,ownerId:admin.id},undefined,undefined,{maxBytes:32_000_000});await writeWorkspace(client,current,next,true);await client.query('COMMIT');console.log('Yedek boş hedefe aktarıldı. Eski hesapların yetkileri aktarılmadı.');
}catch(error){if(client)await client.query('ROLLBACK').catch(()=>{});console.error(error instanceof DomainError?error.message:'Aktarım tamamlanamadı. Bağlantıyı, dosyayı ve hedefi kontrol edin.');process.exitCode=1;}
finally{client?.release();await pool.end();}
