import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { products, testimonials, contacts } from './dist/products.js';
const assets=JSON.parse(await fs.readFile('dist/asset-map.json','utf8'));
const revisions=JSON.parse(await fs.readFile('dist/revision-assets.json','utf8'));
const code=await fs.readFile('dist/app.js','utf8');
const css=await fs.readFile('dist/styles.css','utf8');
const renderCode=code.slice(code.indexOf('\n')+1,code.indexOf('const menuButton='));
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const render=new AsyncFunction('products','testimonials','contacts','fetch','document','location',renderCode);
const paths=['',...products.map(p=>p.slug)];
assert.deepEqual(paths,['','dwx52di','dwx43w','dwx53d','dwx53dc']);
const rendered=new Map();
for(const route of paths){
 const shell=await fs.readFile(route?`dist/${route}/index.html`:'dist/index.html','utf8');
 assert.match(shell,/<html lang="uk">/);
 assert.match(shell,/noindex,nofollow/);
 const app={innerHTML:''};
 await render(products,testimonials,contacts,async url=>({ok:true,json:async()=>url==='/asset-map.json'?assets:revisions}),{querySelector:()=>app},{pathname:'/'+route});
 const html=app.innerHTML;rendered.set(route,html);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size,`Duplicate IDs on ${route||'home'}`);
 for(const match of html.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*alt="([^"]*)"/g)){
  assert.ok(match[2].length,`Missing alt on ${route}`);
  const stat=await fs.stat('dist'+match[1]);assert.ok(stat.size>50,match[1]);
 }
 for(const match of html.matchAll(/href="(#[^"]+)"/g)) assert.ok(ids.includes(match[1].slice(1)),`Broken anchor ${match[1]} on ${route}`);
 const product=products.find(p=>p.slug===route);
 if(product){
  assert.match(html,/id="vartist"/);assert.match(html,/class="price-amount"/);
  assert.ok(html.includes(new Intl.NumberFormat('uk-UA').format(product.price.amount)));
  assert.equal((html.match(/class="illustrated-feature reveal/g)||[]).length,product.expandedFeatures.length);
  assert.equal((html.match(/class="installment-card"/g)||[]).length,product.installment?1:0);
  assert.equal((html.match(/class="restoration-option /g)||[]).length,revisions.products[route].restorations.length);
 }else{
  assert.equal((html.match(/class="hero-slide /g)||[]).length,4);
  assert.equal((html.match(/class="product-card reveal/g)||[]).length,4);
  assert.equal((html.match(/class="comparison-block"/g)||[]).length,1);
  assert.equal((html.match(/class="review-slide"/g)||[]).length,testimonials.length+2);
  assert.ok(!html.includes('trust-band'));
 }
}
let count=0;
const refs=new Set();
function collect(v){if(typeof v==='string'&&v.startsWith('/assets/'))refs.add(v);else if(v&&typeof v==='object')Object.values(v).forEach(collect);}
collect(assets);collect(revisions);
for(const item of refs){assert.ok(!item.includes('..'));const stat=await fs.stat(path.join('dist',item));assert.ok(stat.size>50,item);count++;}
for(const p of products){
 assert.equal(revisions.products[p.slug].features.length,p.expandedFeatures.length);
 for(let i=0;i<p.expandedFeatures.length;i++) assert.equal(revisions.products[p.slug].features[i].title,p.expandedFeatures[i].title);
 if(p.installment){assert.equal(p.installment.downPayment+p.installment.financed,p.installment.retail);assert.equal(p.installment.monthly*p.installment.months,p.installment.financed);}
}
for(const r of testimonials)assert.ok(revisions.portraits[r.author]?.src);
for(const m of css.matchAll(/font-size:(\d+(?:\.\d+)?)px/g))assert.ok(Number(m[1])>=13,`Text below 13px: ${m[0]}`);
assert.doesNotMatch(code,/method:\s*['"]POST|sendBeacon|localStorage|sessionStorage/);
assert.match(code,/preventDefault/);
assert.doesNotMatch(code,/(static\.tildacdn|tilda\.cc|widgets\.binotel|google-analytics)/);
console.log(`PASS: ${paths.length} rendered routes, ${count} local assets, anchors, unique IDs, feature-image matching, prices and installment arithmetic; no form transmission.`);
