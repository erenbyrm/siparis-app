import test from 'node:test';
import assert from 'node:assert/strict';
import {createDemo} from '../src/demo';
import {execute,stateForUser,validateState} from '../src/domain';
import {companySchema,defaultCompany} from '../src/company';
import {makeBackup,readBackup} from '../src/imports';
import {printHtml} from '../src/outputs';
const company={...defaultCompany(),name:'Örnek Şirket',legalName:'Örnek Ticaret',email:'info@example.test',phone:'0212 000 00 00',address:'Örnek adres',logo:'data:image/png;base64,iVBORw0KGgo='};
test('company changes require administrator permission and leave audit',()=>{
 const source=createDemo();for(const user of source.users.filter(u=>u.role!=='admin'))assert.throws(()=>execute(source,user.id,{type:'company.save',company}),/yetkiniz/);
 const saved=execute(source,'demo-admin',{type:'company.save',company});assert.equal(saved.company?.name,company.name);assert.equal(source.company,undefined);assert.equal(saved.audit.at(-1)?.action,'company.save');
});
test('every role gets company branding without another sellers orders',()=>{
 let s=execute(createDemo(),'demo-admin',{type:'company.save',company});s=execute(s,'demo-admin',{type:'order.create',customerId:'demo-c1',items:[{id:'demo-p1',quantity:1}],discount:{type:'percent',value:0},vatMode:'product'});
 for(const user of s.users)assert.deepEqual(stateForUser(s,user).company,company);
 assert.equal(stateForUser(s,s.users[1]).orders.length,0);
});
test('company including images survives backup and blank workspace restore',()=>{
 const s=execute(createDemo(),'demo-admin',{type:'company.save',company});const data=readBackup(JSON.stringify(makeBackup(s)));assert.deepEqual(data.company,company);
 const blank=createDemo();blank.products=[];blank.customers=[];assert.deepEqual(execute(blank,'demo-admin',{type:'backup.import',data,ownerId:'demo-admin'}).company,company);
});
test('legacy states remain valid without company profile',()=>{const s=createDemo();assert.equal(validateState(s).company,undefined);});
test('reject script URLs, SVG and oversized uploads at domain boundary',()=>{
 for(const logo of ['javascript:alert(1)','https://example.test/a.png','data:image/svg+xml;base64,PHN2Zz4=','data:image/png;base64,'+'A'.repeat(90001)])assert.equal(companySchema.safeParse({...company,logo}).success,false);
 assert.equal(companySchema.safeParse({...company,name:' '}).success,false);assert.equal(companySchema.safeParse({...company,website:'javascript:alert(1)'}).success,false);
});
test('company contact and logo printed safely on quote and shipment',()=>{
 const s=execute(createDemo(),'demo-admin',{type:'order.create',customerId:'demo-c1',items:[{id:'demo-p1',quantity:1}],discount:{type:'percent',value:0},vatMode:'product'});
 const brand={...company,legalName:'<script>alert(1)</script>'};const html=printHtml(s.orders[0],undefined,brand);
 assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));assert.ok(html.includes(company.logo));assert.ok(html.includes(company.phone));
 const shipment={id:'s1',createdAt:new Date().toISOString(),createdBy:'Depo',items:[{itemId:'demo-p1',code:'SCC22',name:'Merdiven',quantity:1}]};
 assert.ok(printHtml(s.orders[0],shipment,company).includes(company.legalName));assert.ok(!printHtml(s.orders[0],shipment,company).includes('Birim fiyat'));
});
