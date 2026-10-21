import fs from 'node:fs/promises';
import {getPool} from '../server/db';
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL gerekli. .env.local dosyasını Node --env-file ile yükleyin.');
const sql=await fs.readFile(new URL('../database/001_workspace.sql',import.meta.url),'utf8');
await getPool().query(sql);await getPool().end();console.log('Veritabanı şeması hazır.');
