import React from 'react';
export function Field({label,children,hint}:{label:string,children:React.ReactNode,hint?:string}){return <label className="field"><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label>;}
export function Empty({children}:{children:React.ReactNode}){return <div className="empty">{children}</div>;}
export function Section({title,description,actions,children}:{title:string,description?:string,actions?:React.ReactNode,children:React.ReactNode}){return <section><div className="section-head"><div><h1>{title}</h1>{description&&<p className="muted">{description}</p>}</div><div className="actions">{actions}</div></div>{children}</section>;}
export function StatusBadge({status}:{status:string}){return <span className={'status '+(status==='Tamamlandı'?'done':status==='İptal'?'cancelled':status.includes('Bekleniyor')?'waiting':'working')}>{status}</span>;}
