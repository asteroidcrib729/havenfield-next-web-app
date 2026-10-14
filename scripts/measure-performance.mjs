import {spawn,execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdir,mkdtemp,rm,writeFile,access} from 'node:fs/promises';
import {resolve,relative,isAbsolute} from 'node:path';
import lighthouse from 'lighthouse';
import {launch} from 'chrome-launcher';
const runFile=promisify(execFile);await mkdir('.data',{recursive:true});const directory=await mkdtemp(resolve('.data/performance-test-'));
const environment={...process.env,APP_ENV:'development',VERCEL:'',VERCEL_ENV:'',VERCEL_URL:'',DATABASE_URL:'',DIRECT_DATABASE_URL:'',SQLITE_PATH:resolve(directory,'test.sqlite'),NEXT_PUBLIC_SITE_URL:'http://localhost:3200',SITE_URL:'http://localhost:3200',BLOB_READ_WRITE_TOKEN:'',NEXT_TELEMETRY_DISABLED:'1'};
let server,chrome;
try{
  await runFile(process.execPath,['--import','tsx','scripts/database-seed.ts'],{env:environment});
  if(process.argv.includes('--build'))await runFile(process.execPath,['node_modules/next/dist/bin/next','build'],{env:environment,maxBuffer:8*1024*1024});
  server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','localhost','--port','3200'],{env:environment,stdio:'ignore',windowsHide:true});
  for(let attempt=0;attempt<80;attempt++){if(server.exitCode!==null)throw Error('Performance test server exited');try{if((await fetch('http://localhost:3200/api/health')).ok)break;}catch{/* The owned server may still be starting. */}if(attempt===79)throw Error('Performance server timed out');await new Promise(done=>setTimeout(done,250));}
  let chromePath=process.env.CHROME_PATH;if(!chromePath&&process.platform==='win32'){const candidate='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';await access(candidate);chromePath=candidate;}
  chrome=await launch({chromePath,chromeFlags:['--headless','--disable-gpu','--no-first-run'],logLevel:'silent'});
  const stories=await(await fetch('http://localhost:3200/api/posts')).json();const routes=['/','/properties',`/journal/${stories.posts[0].slug}`];const results=[];
  for(let iteration=1;iteration<=3;iteration++)for(const route of routes){const result=await lighthouse(`http://localhost:3200${route}`,{port:chrome.port,output:'json',logLevel:'error',onlyCategories:['performance','accessibility','seo'],formFactor:'mobile'});const lhr=result.lhr;const scores=Object.fromEntries(Object.entries(lhr.categories).map(([name,value])=>[name,Math.round(value.score*100)]));const metrics={lcpMs:lhr.audits['largest-contentful-paint'].numericValue,cls:lhr.audits['cumulative-layout-shift'].numericValue,tbtMs:lhr.audits['total-blocking-time'].numericValue,transferBytes:lhr.audits['total-byte-weight'].numericValue};const concerns=Object.values(lhr.audits).filter(a=>a.score!==null&&a.score<1&&a.scoreDisplayMode!=='informative').map(a=>({id:a.id,title:a.title,score:a.score,value:a.displayValue,...(["color-contrast","label-content-name-mismatch"].includes(a.id)?{details:a.details}:{})}));results.push({iteration,route,scores,metrics,concerns,lcpDetails:lhr.audits["lcp-breakdown-insight"]?.details});console.log(JSON.stringify({iteration,route,scores,metrics}));}
  const median=values=>[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];const medians=routes.map(route=>{const runs=results.filter(item=>item.route===route);return {route,scores:Object.fromEntries(["performance","accessibility","seo"].map(key=>[key,median(runs.map(item=>item.scores[key]))])),metrics:Object.fromEntries(["lcpMs","cls","tbtMs","transferBytes"].map(key=>[key,median(runs.map(item=>item.metrics[key]))]))};});
  const record={medians,measuredAt:new Date().toISOString(),lighthouseVersion:(await import('lighthouse/package.json',{with:{type:'json'}})).default.version,environment:'Local Next.js production build, disposable seeded SQLite, headless Chromium/Edge, Lighthouse mobile simulated throttling; no hosted or field data',results};await writeFile('development-plans/performance-evidence.json',JSON.stringify(record,null,2)+'\n');
}finally{
  await chrome?.kill();if(server&&server.exitCode===null){if(process.platform==='win32')await runFile('taskkill',['/PID',String(server.pid),'/T','/F']).catch(()=>undefined);else server.kill('SIGTERM');await new Promise(done=>{if(server.exitCode!==null)return done();server.once('exit',done);setTimeout(done,5000);});}
  await cleanupDirectory();
}

async function cleanupDirectory(){const bounded=relative(resolve('.data'),directory);if(isAbsolute(bounded)||!bounded.startsWith('performance-test-'))throw Error('Unsafe performance cleanup');await rm(directory,{recursive:true,force:true,maxRetries:10,retryDelay:100});}
