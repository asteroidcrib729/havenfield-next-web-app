import {it,expect} from 'vitest';
import {retainedBundles} from '../src/server/backup-retention';
it('preserves seven daily and four weekly copies while dropping duplicates',()=>{const items=Array.from({length:50},(_,i)=>({name:'backup-'+i,date:new Date(Date.UTC(2026,9,14-i))}));const keep=retainedBundles(items);for(let i=0;i<7;i++)expect(keep.has('backup-'+i)).toBe(true);expect(keep.size).toBeGreaterThan(7);expect(keep.size).toBeLessThanOrEqual(11);expect(keep.has('backup-49')).toBe(false);});
