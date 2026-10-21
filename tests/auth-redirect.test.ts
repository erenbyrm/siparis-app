import test from 'node:test';
import assert from 'node:assert/strict';
import {authRedirectOrigin,authRedirectUrl,publicAppOrigin} from '../src/authRedirect';

test('authentication links leave protected Vercel previews for the public production app',()=>{
 assert.equal(authRedirectOrigin('https://siparis-app-cf14-git-feature.example.vercel.app'),publicAppOrigin);
 assert.equal(authRedirectUrl('/','https://siparis-app-cf14-git-feature.example.vercel.app',''),publicAppOrigin+'/');
 assert.equal(authRedirectUrl('/?reset=1','https://siparis-app-cf14-git-feature.example.vercel.app',''),publicAppOrigin+'/?reset=1');
});

test('local development and an explicitly configured public origin remain usable',()=>{
 assert.equal(authRedirectOrigin('http://localhost:5173'), 'http://localhost:5173');
 assert.equal(authRedirectUrl('/?reset=1','http://localhost:5173',''), 'http://localhost:5173/?reset=1');
 assert.equal(authRedirectOrigin('https://preview.example','https://siparis.sozbirmerdiven.com/app'), 'https://siparis.sozbirmerdiven.com');
});
