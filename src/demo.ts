import {emptyState, type State} from './domain';
export function createDemo():State{
 const state=emptyState();
 state.users=[{id:'demo-admin',name:'Demo Yönetici',email:'admin@example.test',role:'admin',active:true},{id:'demo-sales',name:'Demo Satış',email:'sales@example.test',role:'pazarlamaci',active:true},{id:'demo-production',name:'Demo Üretim',email:'production@example.test',role:'uretim',active:true},{id:'demo-shipping',name:'Demo Sevkiyat',email:'shipping@example.test',role:'sevkiyat',active:true}];
 state.products=[{id:'demo-p1',orderNo:1,code:'SCC22',name:'2 + 2 Çift Çıkışlı Alüminyum Merdiven',price:1360,kdvRate:20,active:true},{id:'demo-p2',orderNo:2,code:'SCC33',name:'3 + 3 Çift Çıkışlı Alüminyum Merdiven',price:1755,kdvRate:20,active:true},{id:'demo-p3',orderNo:3,code:'SCC44',name:'4 + 4 Çift Çıkışlı Alüminyum Merdiven',price:2310,kdvRate:20,active:true}];
 state.customers=[{id:'demo-c1',name:'Örnek Müşteri',company:'Örnek Hırdavat',phone:'',address:'',note:'Deneme kaydı',active:true}];return state;
}
