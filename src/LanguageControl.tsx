import React,{createContext,useContext,useEffect,useState} from 'react';
import {Languages} from 'lucide-react';
import type {Language} from './domain';
import {directionFor,isLanguage,LANGUAGE_STORAGE_KEY,languageOptions,readStoredLanguage,setRuntimeLanguage,t} from './localization';
import {useStore} from './store';

type LanguageContextValue={language:Language;changeLanguage:(language:Language)=>Promise<boolean>;saving:boolean};
const LanguageContext=createContext<LanguageContextValue|null>(null);

function applyLanguage(language:Language){
 setRuntimeLanguage(language);
 try{localStorage.setItem(LANGUAGE_STORAGE_KEY,language);}catch{/* Device storage is optional. */}
 document.documentElement.lang=language;
 document.documentElement.dir=directionFor(language);
 document.body.dir=directionFor(language);
 window.dispatchEvent(new CustomEvent('siparis-language',{detail:language}));
}

export function LanguageProvider({children}:{children:React.ReactNode}){
 const {user,run}=useStore();
 const [language,setLanguage]=useState<Language>(()=>readStoredLanguage());
 const [saving,setSaving]=useState(false);
 setRuntimeLanguage(language);
 useEffect(()=>{applyLanguage(language);},[language]);
 useEffect(()=>{const sync=(event:StorageEvent)=>{if(event.key===LANGUAGE_STORAGE_KEY&&isLanguage(event.newValue))setLanguage(event.newValue);};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[]);
 useEffect(()=>{if(user?.language&&user.language!==language)setLanguage(user.language);},[user?.id,user?.language,language]);
 const changeLanguage=async(next:Language)=>{
  if(next===language)return true;
  if(user&&user.language!==next){setSaving(true);const saved=await run({type:'user.language',language:next});setSaving(false);if(!saved)return false;}
  applyLanguage(next);setLanguage(next);return true;
 };
 return <LanguageContext.Provider value={{language,changeLanguage,saving}}>{children}</LanguageContext.Provider>;
}

export function useLanguage(){const value=useContext(LanguageContext);if(!value)throw new Error('LanguageProvider required');return value;}

export function LanguageControl({compact=false}:{compact?:boolean}){
 const {language,changeLanguage,saving}=useLanguage();
 return <label className={'language-control'+(compact?' compact':'')}><Languages size={18} aria-hidden="true"/><span>{t('Uygulama dili')}</span><select aria-label={t('Uygulama dili')} value={language} disabled={saving} onChange={event=>void changeLanguage(event.target.value as Language)}>{languageOptions.map(option=><option key={option.code} value={option.code}>{option.label}</option>)}</select>{saving&&<small aria-live="polite">{t('Dil kaydediliyor…')}</small>}</label>;
}
