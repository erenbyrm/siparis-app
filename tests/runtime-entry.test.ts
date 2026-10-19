import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
test('compiled API starts under native Node ESM without a development loader',()=>{
 const root=process.cwd(),out=fs.mkdtempSync(path.join(root,'tmp-runtime-'));
 try{
  const config=path.join(out,'tsconfig.json');
  fs.writeFileSync(config,JSON.stringify({extends:path.join(root,'tsconfig.json'),compilerOptions:{noEmit:false,outDir:out,rootDir:root},include:[path.join(root,'api/workspace.ts')],exclude:[]}));
  const build=spawnSync(process.execPath,[path.join(root,'node_modules/typescript/bin/tsc'),'-p',config],{encoding:'utf8',timeout:20000});
  assert.equal(build.status,0,build.stdout+build.stderr);
  fs.writeFileSync(path.join(out,'probe.mjs'),"import handler from './api/workspace.js';let status;const response={setHeader(){},status(code){status=code;return this},json(){}};await handler({method:'OPTIONS',headers:{}},response);if(status!==405)throw new Error('Unexpected HTTP response');");
  const probe=spawnSync(process.execPath,[path.join(out,'probe.mjs')],{encoding:'utf8',timeout:15000});
  assert.equal(probe.status,0,probe.stderr);
 }finally{fs.rmSync(out,{recursive:true,force:true});}
});
