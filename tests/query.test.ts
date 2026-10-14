import { describe, expect, it } from 'vitest';
import { parsePostListQuery } from '../src/server/post-query';
describe('editor list query filters',()=>{
  it('accepts the dashboard All statuses option without dropping its search',()=>{
    const result=parsePostListQuery(new Request('https://havenfield.test/api/admin/posts?query=courtyard&status=&page=1&limit=10'),true);
    expect(result).toMatchObject({query:'courtyard',page:1,limit:10});expect(result.status).toBeUndefined();
  });
  it('defaults blank pagination fields and never exposes drafts through public filter options',()=>{
    const result=parsePostListQuery(new Request('https://havenfield.test/api/posts?page=&limit=&status=draft'));
    expect(result).toMatchObject({page:1,limit:12});expect(result.status).toBeUndefined();
  });
});
