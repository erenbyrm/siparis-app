import test from 'node:test';import assert from 'node:assert/strict';
import {logoColor,readableAccent,luminance} from '../src/brandPalette';
import {companySchema,defaultCompany} from '../src/company';
test('dominant logo color ignores white background and transparent pixels',()=>{const data=[...Array.from({length:100},()=>[255,255,255,255]).flat(),...Array.from({length:8},()=>[30,90,180,255]).flat(),255,0,0,0];assert.equal(logoColor(data),'#1e5ab4');assert.equal(logoColor([255,255,255,255]),'#176b60');});
test('brand accents always keep white button labels readable',()=>{for(const color of ['#ffff00','#ffffff','#ffaaaa','#111111','#0077ff','#ff6600','#00ff00']){const result=readableAccent(color);assert.ok(1.05/(luminance(result)+.05)>=4.5,result);}});
test('old company profiles remain valid and arbitrary CSS is rejected',()=>{const {brandColor,...old}=defaultCompany();assert.equal(companySchema.parse(old).brandColor,'');assert.throws(()=>companySchema.parse({...old,brandColor:'url(https://bad.example)'}));});
