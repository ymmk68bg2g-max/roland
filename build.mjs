import fs from 'node:fs/promises';
const products = (await import('./dist/products.js')).products;
const pages = [{slug:'',name:'CAD/CAM-фрезери DGSHAPE',description:'Точність, що формує результат. Чотири фрезери DGSHAPE для зуботехнічних лабораторій та клінік. Yamamoto Dental Group.'}, ...products];
for (const p of pages) {
 const title = p.slug ? `${p.name} — DGSHAPE | Yamamoto Dental Group` : 'DGSHAPE — Точність, що формує результат';
 const dir = p.slug ? `dist/${p.slug}` : 'dist';
 await fs.mkdir(dir,{recursive:true});
 await fs.writeFile(`${dir}/index.html`, `<!doctype html><html lang="uk"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#071d3e"><meta name="description" content="${p.description}"><meta name="robots" content="noindex,nofollow"><title>${title}</title><link rel="icon" type="image/x-icon" href="/favicon.ico"><link rel="stylesheet" href="/styles.css"><script type="module" src="/app.js"></script></head><body><a class="skip" href="#main">До основного вмісту</a><div id="app"></div><noscript>Для інтерактивного прототипу увімкніть JavaScript.</noscript></body></html>`);
}
console.log('Built exactly five pages.');
