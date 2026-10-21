// Only reads are retried. Mutations keep their existing request-id protection.
export function createWorkspaceLoader<T>(options:{read:()=>Promise<T>,success:(value:T)=>void,failure:(error:unknown)=>void,loading:(value:boolean)=>void,retryable:(error:unknown)=>boolean,wait?:()=>Promise<void>}){
 let generation=0,flight:{generation:number,promise:Promise<void>}|undefined;
 const wait=options.wait??(()=>new Promise<void>(resolve=>setTimeout(resolve,800)));
 return {
  invalidate(){generation++;flight=undefined;options.loading(false);},
  refresh(){
   if(flight?.generation===generation)return flight.promise;
   const current=generation;options.loading(true);
   const promise=(async()=>{
    try{
     let value:T;
     try{value=await options.read();}catch(error){if(current!==generation)return;if(!options.retryable(error))throw error;await wait();if(current!==generation)return;value=await options.read();}
     if(current===generation)options.success(value);
    }catch(error){if(current===generation)options.failure(error);}
    finally{if(current===generation){flight=undefined;options.loading(false);}}
   })();
   flight={generation:current,promise};return promise;
  }
 };
}
