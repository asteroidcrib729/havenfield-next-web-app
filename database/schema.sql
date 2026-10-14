CREATE TABLE IF NOT EXISTS posts (
 id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, excerpt TEXT NOT NULL,
 body TEXT NOT NULL, author TEXT NOT NULL, category TEXT NOT NULL, tags TEXT NOT NULL,
 cover_image TEXT NOT NULL, cover_alt TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('draft','published','scheduled')),
 published_at TEXT, seo_title TEXT NOT NULL, seo_description TEXT NOT NULL, canonical_url TEXT NOT NULL,
 noindex INTEGER NOT NULL DEFAULT 0, version INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS posts_publication_idx ON posts(status,published_at);
CREATE INDEX IF NOT EXISTS posts_category_idx ON posts(category);
CREATE TABLE IF NOT EXISTS post_revisions (
 id TEXT PRIMARY KEY, post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
 version INTEGER NOT NULL, snapshot TEXT NOT NULL, created_at TEXT NOT NULL,
 UNIQUE(post_id, version)
);
CREATE TABLE IF NOT EXISTS slug_redirects (
 slug TEXT PRIMARY KEY, post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS rate_limits (
 key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS inquiries (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL,
 message TEXT NOT NULL, property_id TEXT NOT NULL, consent_at TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
