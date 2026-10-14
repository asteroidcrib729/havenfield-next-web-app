import {it,expect} from 'vitest';
import {mkdir,mkdtemp,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {createDatabase} from '../src/server/database';
import {exportDatabase,restoreDatabase} from '../src/server/backup';
import {legacyUpgrade} from './migration-contract';
it('restores the historical format-1 schema export into version 2',async()=>{await mkdir('.data',{recursive:true});const root=await mkdtemp(resolve('.data/legacy-backup-test-'));const source=await createDatabase({url:'',sqlitePath:resolve(root,'source.sqlite'),autoMigrate:false}),target=await createDatabase({url:'',sqlitePath:resolve(root,'target.sqlite'),autoMigrate:false});try{await legacyUpgrade(source);const current=await exportDatabase(source);const payload={format:1,exportedAt:current.payload.exportedAt,migrations:current.payload.migrations.slice(0,1),tables:{posts:current.payload.tables.posts,post_revisions:current.payload.tables.post_revisions,slug_redirects:current.payload.tables.slug_redirects,inquiries:[]}};const backup={payload,checksum:createHash('sha256').update(JSON.stringify(payload)).digest('hex')};await restoreDatabase(target,backup);expect((await target.query('SELECT title FROM posts'))[0].title).toBe('Preserved article');expect(await target.query('SELECT version FROM schema_migrations')).toHaveLength(2);}finally{await source.close();await target.close();if(root.startsWith(resolve('.data/legacy-backup-test-')))await rm(root,{recursive:true,force:true,maxRetries:5});}});
