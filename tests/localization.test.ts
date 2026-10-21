import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {directionFor,localeFor,translate,translatedKeys} from '../src/localization';
import {emptyState,execute,stateForUser,validateState,type AppUser} from '../src/domain';
import {message} from '../src/errors';

test('four interface languages translate core workflow labels',()=>{
 assert.equal(translate('Siparişler','en'),'Orders');
 assert.equal(translate('Üretim programı','de'),'Produktionsplan');
 assert.equal(translate('Depo ve stok','ar'),'المستودع والمخزون');
 assert.equal(translate('Ayarlar','tr'),'Ayarlar');
 assert.equal(directionFor('ar'),'rtl');
 assert.equal(directionFor('de'),'ltr');
 assert.equal(localeFor('ar'),'ar-SY');
});

test('every static translated interface phrase has all three translations',()=>{
 const used=new Set<string>();
 for(const file of fs.readdirSync('src').filter(name=>name.endsWith('.tsx'))){
  const source=fs.readFileSync(path.join('src',file),'utf8');
  for(const match of source.matchAll(/\bt\((['"])(.*?)\1\)/gs)){
   const phrase=match[2].replace(/\\"/g,'"').trim();
   if(phrase&&!phrase.includes('\\t')&&!/^Sürüm\s/.test(phrase))used.add(phrase);
  }
 }
 for(const language of ['en','de','ar'] as const){
  const keys=translatedKeys(language);
  const missing=[...used].filter(phrase=>!keys.has(phrase));
  assert.deepEqual(missing,[],`${language}: ${missing.join(' | ')}`);
 }
});

test('language preference is optional for old data and saved on the signed-in user',()=>{
 const state=emptyState();
 const user:AppUser={id:'u1',name:'Yönetici',email:'yonetici@example.com',role:'admin',active:true};
 state.users=[user];
 assert.equal(validateState(state).users[0].language,undefined);
 const next=execute(state,user.id,{type:'user.language',language:'ar'},'2026-10-21T09:00:00.000Z');
 assert.equal(next.users[0].language,'ar');
 assert.equal(stateForUser(next,next.users[0]).users[0].language,'ar');
 assert.equal(next.revision,1);
 const edited=execute(next,user.id,{type:'user.save',user:{id:user.id,name:'Yeni Yönetici',email:user.email,role:'admin',active:true}},'2026-10-21T09:01:00.000Z');
 assert.equal(edited.users[0].language,'ar','older clients must not clear a saved language preference');
});

test('common authentication errors are shown as translatable Turkish source messages',()=>{
 assert.equal(message(new Error('Invalid login credentials')),'E-posta veya şifre hatalı.');
 assert.equal(message(new Error('For security purposes, you can only request this after 47 seconds.')),'Güvenlik için kısa bir süre sonra tekrar deneyin.');
 assert.equal(translate(message(new Error('Email not confirmed')),'ar'),'لم يتم تأكيد البريد الإلكتروني بعد.');
});
