ALTER TABLE flow
  ADD COLUMN IF NOT EXISTS source ENUM('sensor','manual','import')
  NOT NULL DEFAULT 'sensor'
  AFTER count_out;
