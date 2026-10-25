import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('dist');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.ico':'image/x-icon'};
const server=http.createServer(async(req,res)=>{
 try { let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname); let file=path.resolve(root,'.'+name); if(!file.startsWith(root+path.sep)&&file!==root) throw Error(); const stat=await fs.stat(file); if(stat.isDirectory()) file=path.join(file,'index.html'); const bytes=await fs.readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(bytes); }
 catch {res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Сторінку не знайдено');}
});
const port=Number(process.env.PORT || 4173);
server.listen(port,process.env.HOST || '0.0.0.0',()=>console.log(`Preview: http://0.0.0.0:${port}`));
