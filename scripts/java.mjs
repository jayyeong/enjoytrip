import {spawnSync} from 'node:child_process';
import {mkdirSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');process.chdir(root);
const run=(cmd,args)=>{const r=spawnSync(cmd,args,{stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status??1);};
mkdirSync('backend/build',{recursive:true});
const files=readdirSync('backend/src/enjoytrip').filter(f=>f.endsWith('.java')).map(f=>'backend/src/enjoytrip/'+f);
run('javac',['-encoding','UTF-8','-d','backend/build',...files]);
const mode=process.argv[2]??'test';
if(mode==='serve'){run(process.execPath,['scripts/build.mjs']);run('java',['-cp','backend/build','enjoytrip.Server','dist',process.argv[3]??'8001']);}
else if(mode==='benchmark')run('java',['-Xms256m','-Xmx256m','-cp','backend/build','enjoytrip.Benchmark']);
else run('java',['-ea','-cp','backend/build','enjoytrip.AlgorithmsTest']);
