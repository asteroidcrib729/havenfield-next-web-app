CREATE TABLE app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE media (
 id TEXT PRIMARY KEY, object_key TEXT NOT NULL UNIQUE, url TEXT NOT NULL UNIQUE,
 storage TEXT NOT NULL CHECK(storage IN ('local','blob')), width INTEGER NOT NULL, height INTEGER NOT NULL,
 bytes INTEGER NOT NULL, content_type TEXT NOT NULL, alt TEXT NOT NULL, owner TEXT NOT NULL,
 created_at TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'active' CHECK(state IN ('uploading','active','deleting','deleted'))
);
CREATE TABLE media_references (
 media_id TEXT NOT NULL REFERENCES media(id) ON DELETE RESTRICT,
 post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
 kind TEXT NOT NULL CHECK(kind IN ('cover','inline','revision')),
 PRIMARY KEY(media_id,post_id,kind)
);
CREATE TABLE publisher_actions (
 id TEXT PRIMARY KEY, actor TEXT NOT NULL, action TEXT NOT NULL, target TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX publisher_actions_time_idx ON publisher_actions(created_at);
ALTER TABLE inquiries ADD COLUMN status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','reviewed','archived'));
ALTER TABLE inquiries ADD COLUMN updated_at TEXT;
ALTER TABLE inquiries ADD COLUMN expires_at TEXT;
UPDATE inquiries SET updated_at=created_at;
CREATE INDEX inquiries_status_time_idx ON inquiries(status,created_at);
CREATE TABLE inquiry_receipts (
 key TEXT PRIMARY KEY, fingerprint TEXT NOT NULL, inquiry_id TEXT NOT NULL, expires_at BIGINT NOT NULL
);
CREATE TABLE article_autosaves (
 key TEXT PRIMARY KEY, post_id TEXT, actor TEXT NOT NULL, base_version INTEGER NOT NULL,
 snapshot TEXT NOT NULL, generation INTEGER NOT NULL, updated_at TEXT NOT NULL
);
