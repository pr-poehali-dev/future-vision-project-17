CREATE TABLE race_records (
  id SERIAL PRIMARY KEY,
  player_name VARCHAR(32) NOT NULL,
  finish_time_ms INTEGER NOT NULL,
  laps INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_race_records_time ON race_records(finish_time_ms ASC);
