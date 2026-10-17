ALTER TABLE inquiries
ADD COLUMN stage TEXT NOT NULL DEFAULT 'new' CHECK (
  stage IN ('new', 'contacted', 'viewing-requested', 'closed')
);

ALTER TABLE inquiries
ADD COLUMN notes TEXT NOT NULL DEFAULT '';

ALTER TABLE inquiries
ADD COLUMN version INTEGER NOT NULL DEFAULT 1;

CREATE INDEX inquiries_property_stage_idx ON inquiries (property_id, stage, created_at);
