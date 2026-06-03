-- ---------------------------------------------------------------------------
-- Raw PostgreSQL schema (equivalent to prisma/schema.prisma).
-- Provided for teams that prefer plain SQL migrations over Prisma Migrate.
-- ---------------------------------------------------------------------------

CREATE TYPE submission_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE videos (
  id            TEXT PRIMARY KEY,
  tiktok_id     TEXT NOT NULL UNIQUE,
  caption       TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  thumbnail_url TEXT NOT NULL,
  video_url     TEXT NOT NULL,
  embed_url     TEXT,
  duration_sec  INTEGER NOT NULL DEFAULT 0,
  uploaded_at   TIMESTAMPTZ NOT NULL,
  keywords      TEXT[] NOT NULL DEFAULT '{}',
  featured      BOOLEAN NOT NULL DEFAULT FALSE,
  funny         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_videos_uploaded_at ON videos (uploaded_at DESC);
CREATE INDEX idx_videos_funny ON videos (funny);
CREATE INDEX idx_videos_featured ON videos (featured);

CREATE TABLE categories (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  emoji      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE category_on_video (
  video_id    TEXT NOT NULL REFERENCES videos (id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (video_id, category_id)
);

CREATE TABLE statistics (
  id          TEXT PRIMARY KEY,
  video_id    TEXT NOT NULL UNIQUE REFERENCES videos (id) ON DELETE CASCADE,
  views       INTEGER NOT NULL DEFAULT 0,
  likes       INTEGER NOT NULL DEFAULT 0,
  comments    INTEGER NOT NULL DEFAULT 0,
  shares      INTEGER NOT NULL DEFAULT 0,
  funny_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  fetched_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE featured_clips (
  id         TEXT PRIMARY KEY,
  video_id   TEXT NOT NULL UNIQUE REFERENCES videos (id) ON DELETE CASCADE,
  position   INTEGER NOT NULL DEFAULT 0,
  reason     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_featured_position ON featured_clips (position);

CREATE TABLE community_votes (
  id          TEXT PRIMARY KEY,
  video_id    TEXT NOT NULL REFERENCES videos (id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (video_id, fingerprint)
);
CREATE INDEX idx_votes_video ON community_votes (video_id);

CREATE TABLE submissions (
  id          TEXT PRIMARY KEY,
  tiktok_url  TEXT NOT NULL,
  note        TEXT,
  author_name TEXT,
  status      submission_status NOT NULL DEFAULT 'PENDING',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
