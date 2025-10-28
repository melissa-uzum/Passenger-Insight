INSERT INTO station(code, name) VALUES
  ('ARN-T1', 'Arlanda Terminal 1'),
  ('ARN-T5', 'Arlanda Terminal 5'),
  ('CST', 'Stockholm C'),
  ('KST', 'Kungsholmen Security Transit');

INSERT INTO flow (station_id, count_in, count_out, timestamp)
SELECT s.id, FLOOR(RAND()*100), FLOOR(RAND()*100), NOW() - INTERVAL FLOOR(RAND()*12) HOUR
FROM station s
CROSS JOIN (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t;

INSERT INTO incident(severity, message) VALUES
  ('info','Deploy v0.1.0 completed'),
  ('warning','High inbound at ARN-T5 last hour');

