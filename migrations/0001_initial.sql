CREATE TABLE IF NOT EXISTS site (id TEXT PRIMARY KEY CHECK(id='main'), content TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS skills (id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, level TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS posts (
 id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, summary TEXT NOT NULL, body TEXT NOT NULL,
 tags TEXT NOT NULL DEFAULT '[]', cover TEXT NOT NULL DEFAULT 'orbit', status TEXT NOT NULL CHECK(status IN ('draft','published')),
 live_url TEXT NOT NULL DEFAULT '', repo_url TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL, updated_at TEXT NOT NULL, published_at TEXT
);
CREATE TABLE IF NOT EXISTS projects (
 id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, summary TEXT NOT NULL, body TEXT NOT NULL,
 tags TEXT NOT NULL DEFAULT '[]', cover TEXT NOT NULL DEFAULT 'orbit', status TEXT NOT NULL CHECK(status IN ('draft','published')),
 live_url TEXT NOT NULL DEFAULT '', repo_url TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL, updated_at TEXT NOT NULL, published_at TEXT
);
CREATE INDEX IF NOT EXISTS posts_public ON posts(status,published_at DESC);
CREATE INDEX IF NOT EXISTS projects_public ON projects(status,sort_order);
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS login_attempts (client_key TEXT PRIMARY KEY, failures INTEGER NOT NULL, window_start INTEGER NOT NULL);
