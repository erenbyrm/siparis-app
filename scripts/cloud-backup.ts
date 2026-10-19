import fs from 'node:fs/promises';
import path from 'node:path';
import {getPool} from '../server/db.js';
import {readWorkspace} from '../server/workspaceStorage.js';
import {validateState} from '../src/domain.js';
import {checkedBackup} from '../src/backupIntegrity.js';
// Fresh, consistent read; does not change records or contact any other service.
const pool=getPool();let client;
try{
 client=await pool.connect();await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
 const row=await client.query('SELECT data FROM siparis_private.workspace WHERE id=true');if(!row.rows.length)throw new Error('Çalışma alanı boş.');
 const state=validateState(await readWorkspace(client,row.rows[0].data));await client.query('COMMIT');
 const out=path.resolve(process.argv[2]??'private-backups/siparis-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json');
 await fs.mkdir(path.dirname(out),{recursive:true});await fs.writeFile(out,JSON.stringify(await checkedBackup(state)),{encoding:'utf8',flag:'wx'});console.log('Bütünlük kontrollü yedek oluşturuldu: '+out);
}catch(error){if(client)await client.query('ROLLBACK').catch(()=>{});console.error('Yedek oluşturulamadı. Bağlantıyı ve hedef dosyayı kontrol edin.');process.exitCode=1;}
finally{client?.release();await pool.end();}
