CREATE TABLE catalog_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  initialized INTEGER NOT NULL CHECK (initialized IN (0, 1))
);

CREATE TABLE properties (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  version INTEGER NOT NULL CHECK (version > 0),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX properties_visibility_idx ON properties (status, created_at, id);

CREATE TABLE property_revisions (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
  version INTEGER NOT NULL CHECK (version > 0),
  snapshot TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (property_id, version)
);

CREATE TABLE property_media_references (
  media_id TEXT NOT NULL REFERENCES media (id) ON DELETE RESTRICT,
  property_id TEXT NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('gallery', 'revision')),
  PRIMARY KEY (media_id, property_id, kind)
);

ALTER TABLE media
ADD COLUMN collection TEXT NOT NULL DEFAULT '';

ALTER TABLE media
ADD COLUMN focal_x INTEGER NOT NULL DEFAULT 50 CHECK (focal_x BETWEEN 0 AND 100);

ALTER TABLE media
ADD COLUMN focal_y INTEGER NOT NULL DEFAULT 50 CHECK (focal_y BETWEEN 0 AND 100);

ALTER TABLE media
ADD COLUMN version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0);
