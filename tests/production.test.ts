import test from 'node:test';
import assert from 'node:assert/strict';
import {createDemo} from '../src/demo';
import {execute,validateState,type State} from '../src/domain';
import {addWorkingDays,productionDeadline,defaultProductionConfig,buildProductionPlan} from '../src/production';
const now='2026-10-09T07:00:00.000Z'; // Friday
function waiting(quantity=150,state=createDemo()){
 let s=execute(state,'demo-sales',{type:'order.create',customerId:'demo-c1',items:[{id:'demo-p1',quantity}],discount:{type:'percent',value:0},vatMode:'product'},now);
 return execute(s,'demo-sales',{type:'order.customerApprove',id:s.orders[0].id},now);
}
function approve(s:State,date='2026-10-12',risk=false){return execute(s,'demo-admin',{type:'order.approve',id:s.orders[0].id,deliveryDate:date,acceptPlanRisk:risk},now);}
test('Friday shipping delivers Monday; Monday delivery requires Friday production',()=>{
 const c=defaultProductionConfig();assert.equal(addWorkingDays('2026-10-09',1,c),'2026-10-12');assert.equal(productionDeadline('2026-10-12',c),'2026-10-09');
 c.closedDates=['2026-10-12'];assert.equal(addWorkingDays('2026-10-09',1,c),'2026-10-13');
});
test('225 SCC22 uses Friday 100% and Monday 50%, arrives Tuesday',()=>{
 const p=buildProductionPlan(approve(waiting(225),'2026-10-13'),'2026-10-09');
 assert.deepEqual(p.allocations.map(a=>[a.date,a.quantity,a.load]),[['2026-10-09',150,1],['2026-10-12',75,0.5]]);assert.equal(p.orders[0].expectedDeliveryDate,'2026-10-13');assert.equal(p.orders[0].late,false);
});
test('mixed product rates share one line rather than independent capacities',()=>{
 let s=waiting(75);s.products[1].dailyCapacity=100;s.products[1].productionResourceId='main-line';
 s.orders[0].items.push({...s.products[1],quantity:50,pendingQuantity:50,readyForShipmentQuantity:0,sentQuantity:0});
 const p=buildProductionPlan(approve(s),'2026-10-09');assert.equal(p.allocations.length,2);assert.equal(p.allocations.reduce((n,a)=>n+a.load,0),1);assert.ok(p.allocations.every(a=>a.date==='2026-10-09'));
});
test('approval requires selected working date and explicit acknowledgement of overload',()=>{
 const s=waiting(225),id=s.orders[0].id;
 assert.throws(()=>execute(s,'demo-admin',{type:'order.approve',id},now));
 assert.throws(()=>approve(s,'2026-10-08'),/geçmişte/);assert.throws(()=>approve(s,'2026-10-10'),/çalışma günü/);assert.throws(()=>approve(s),/riskli/);
 const accepted=approve(s,'2026-10-12',true);assert.equal(buildProductionPlan(accepted,'2026-10-09').orders[0].late,true);assert.equal(s.orders[0].deliveryDate,undefined);
});
test('unknown capacity produces warning and cannot silently approve',()=>{
 const s=waiting();delete s.products[0].dailyCapacity;
 assert.throws(()=>approve(s),/eksik/);const p=buildProductionPlan(approve(s,'2026-10-12',true),'2026-10-09');assert.equal(p.allocations.length,0);assert.equal(p.orders[0].incomplete,true);
});
test('today actual production consumes capacity even after cancellation',()=>{
 let s=approve(waiting());s=execute(s,'demo-production',{type:'order.ready',id:s.orders[0].id,items:[{id:'demo-p1',quantity:75}]},now);
 let p=buildProductionPlan(s,'2026-10-09');assert.equal(p.allocations.reduce((n,a)=>n+a.load,0),1);assert.equal(p.allocations.filter(a=>a.completed)[0].quantity,75);
 s=execute(s,'demo-admin',{type:'order.cancel',id:s.orders[0].id,reason:'Test'},now);s.products[0].dailyCapacity=300;
 p=buildProductionPlan(s,'2026-10-09');assert.equal(p.allocations.length,1);assert.equal(p.allocations[0].load,0.5);assert.equal(buildProductionPlan(s,'2026-10-12').allocations.length,0);
});
test('a new urgent order must acknowledge delaying an existing promise',()=>{
 let s=approve(waiting(150),'2026-10-13');s=waiting(300,s);
 assert.throws(()=>approve(s,'2026-10-13'),/riskli/);
});
test('draft orders reserve nothing, holidays skipped, horizon bounded',()=>{
 const s=waiting(1000000);assert.equal(buildProductionPlan(s,'2026-10-09').allocations.length,0);
 s.productionConfig={...defaultProductionConfig(),closedDates:['2026-10-09']};
 const p=buildProductionPlan(approve(s,'2026-10-13',true),'2026-10-09');assert.equal(p.allocations[0].date,'2026-10-12');assert.equal(p.dates.length,120);assert.ok(p.issues.some(i=>i.reason.includes('120')));
});
test('ready quantities reserve no future production; delivered quantities reserve none',()=>{
 let s=approve(waiting());s=execute(s,'demo-production',{type:'order.ready',id:s.orders[0].id,items:[{id:'demo-p1',quantity:150}]},now);
 assert.equal(buildProductionPlan(s,'2026-10-12').allocations.length,0);
 s=execute(s,'demo-shipping',{type:'order.ship',id:s.orders[0].id,items:[{id:'demo-p1',quantity:150}]},now);
 assert.equal(buildProductionPlan(s,'2026-10-09').orders.length,0);assert.equal(buildProductionPlan(s,'2026-10-09').allocations[0].load,1);
});
test('only administrators reschedule open orders',()=>{
 const s=approve(waiting()),id=s.orders[0].id;
 assert.throws(()=>execute(s,'demo-sales',{type:'order.reschedule',id,deliveryDate:'2026-10-13'},now),/yetkiniz/);
 assert.equal(execute(s,'demo-admin',{type:'order.reschedule',id,deliveryDate:'2026-10-13'},now).orders[0].deliveryDate,'2026-10-13');
});
test('CSV price refresh preserves capacity and backups preserve custom calendar',()=>{
 let s=createDemo();const {id,dailyCapacity,productionResourceId,...p}=s.products[0];s=execute(s,'demo-admin',{type:'product.import',products:[{...p,price:1400}]},now);assert.equal(s.products[0].dailyCapacity,150);
 s.productionConfig={...defaultProductionConfig(),closedDates:['2026-10-29']};const empty=createDemo();empty.products=[];empty.customers=[];
 const restored=execute(empty,'demo-admin',{type:'backup.import',data:s,ownerId:'demo-admin'},now);assert.deepEqual(restored.productionConfig,s.productionConfig);validateState(restored);
});
test('fractional day shares preserve integer quantities and do not exceed capacity',()=>{
 const s=waiting(151);s.products[0].dailyCapacity=7;const p=buildProductionPlan(approve(s,'2026-12-31'),'2026-10-09');
 assert.equal(p.allocations.reduce((n,a)=>n+a.quantity,0),151);assert.ok(p.allocations.every(a=>Number.isInteger(a.quantity)&&a.load<=1));
});
