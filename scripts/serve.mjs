import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
try{await stat(path.join(root,'index.html'));}catch{console.error('缺少 dist 构建产物，请先执行 npm run build。');process.exit(1);}
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');const relative=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'index.html';const target=path.resolve(root,relative);const within=path.relative(root,target);if(within.startsWith('..')||path.isAbsolute(within)){res.writeHead(403).end();return;}const data=await readFile(target);res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404).end('Not found');}});
server.listen(4173,'127.0.0.1',()=>console.log('流星花园：http://127.0.0.1:4173\n在浏览器打开以上地址。按 Ctrl+C 结束。'));
server.on('error',err=>{console.error(err.code==='EADDRINUSE'?'4173 端口已被占用，请关闭已有预览后重试。':err.message);process.exit(1);});
