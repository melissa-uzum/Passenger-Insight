INSERT INTO flow (station_id, count_in, count_out, source, timestamp)
VALUES (1, 62, 41, 'manual', NOW() - INTERVAL 10 MINUTE);

INSERT INTO flow (station_id, count_in, count_out, source, timestamp)
VALUES (2, 380, 260, 'manual', NOW() - INTERVAL 3 MINUTE);

INSERT INTO flow (station_id, count_in, count_out, source, timestamp)
VALUES (3, 18, 25, 'manual', NOW() - INTERVAL 7 MINUTE);

INSERT INTO flow (station_id, count_in, count_out, source, timestamp)
VALUES (4, 48, 22, 'manual', NOW() - INTERVAL 2 HOUR);

UPDATE flow
SET count_in = 450, count_out = 250
WHERE station_id = 2;