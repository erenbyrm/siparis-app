import test from 'node:test';
import assert from 'node:assert/strict';
import {createDemo} from '../src/demo';
import {execute,totals,stateForUser,validateState,type Discount} from '../src/domain';
function order(first:Discount,second:Discount,general:Discount={type:'percent',value:0}){
 const s=createDemo();s.products[0].price=100;s.products[1].price=200;s.products[1].kdvRate=10;
 return execute(s,'demo-sales',{type:'order.create',customerId:'demo-c1',items:[{id:'demo-p1',quantity:2,lineDiscount:first},{id:'demo-p2',quantity:1,lineDiscount:second}],discount:general,vatMode:'product'});
}
test('different product discounts apply before product VAT',()=>{
 const s=order({type:'percent',value:10},{type:'amount',value:50}),t=totals(s.orders[0]);
 assert.equal(t.base,400);assert.equal(t.lineDiscount,70);assert.equal(t.orderDiscount,0);assert.equal(t.net,330);assert.equal(t.vat,51);assert.equal(t.total,381);validateState(s);
});
test('line amount discount applies to the complete line, not each unit',()=>{
 const t=totals(order({type:'amount',value:25},{type:'percent',value:0}).orders[0]);
 assert.equal(t.lines[0].base,200);assert.equal(t.lines[0].lineDiscount,25);assert.equal(t.lines[0].net,175);
});
test('existing order-wide discount is calculated after product discounts',()=>{
 const t=totals(order({type:'percent',value:10},{type:'amount',value:50},{type:'percent',value:10}).orders[0]);
 assert.equal(t.lineDiscount,70);assert.equal(t.orderDiscount,33);assert.equal(t.discount,103);assert.equal(t.total,342.9);
});
test('product amount over line value is rejected',()=>{assert.throws(()=>order({type:'amount',value:200.01},{type:'percent',value:0}),/satır tutarını/);});
test('negative and over-100-percent product discounts are rejected',()=>{
 assert.throws(()=>order({type:'percent',value:101},{type:'percent',value:0}));assert.throws(()=>order({type:'amount',value:-1},{type:'percent',value:0}));
});
test('order-wide fixed amount cannot exceed the remaining net base',()=>{assert.throws(()=>order({type:'percent',value:100},{type:'amount',value:100},{type:'amount',value:100.01}),/ürün iskontolarından/);});
test('full product discount has no VAT and safe zero-base allocation',()=>{
 const t=totals(order({type:'percent',value:100},{type:'percent',value:100},{type:'percent',value:10}).orders[0]);assert.equal(t.total,0);assert.equal(t.vat,0);assert.equal(t.orderDiscount,0);
});
test('old orders without product discount preserve original totals',()=>{
 const s=createDemo();const next=execute(s,'demo-sales',{type:'order.create',customerId:'demo-c1',items:[{id:'demo-p1',quantity:2}],discount:{type:'percent',value:10},vatMode:'product'});
 assert.equal(totals(next.orders[0]).total,2937.6);assert.equal(totals(next.orders[0]).lineDiscount,0);
});
test('production does not receive product discount amounts',()=>{
 let s=order({type:'amount',value:50},{type:'percent',value:10});s=execute(s,'demo-sales',{type:'order.customerApprove',id:s.orders[0].id});s=execute(s,'demo-admin',{type:'order.approve',id:s.orders[0].id,deliveryDate:'2099-12-31',acceptPlanRisk:true});
 const v=stateForUser(s,s.users[2]);assert.equal(v.orders[0].items[0].lineDiscount?.value,0);assert.equal(totals(v.orders[0]).total,0);
});
