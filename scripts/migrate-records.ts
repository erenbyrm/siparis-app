import fs from 'node:fs/promises';
import {getPool} from '../server/db.js';
const pool=getPool();try{await pool.query(await fs.readFile(new URL('../database/002_record_storage.sql',import.meta.url),'utf8'));console.log('Kayıt bazında depolama etkin.');}catch{console.error('Geçiş tamamlanamadı. Bağlantıyı ve veritabanı kurulumunu kontrol edin.');process.exitCode=1;}finally{await pool.end();}
