INSERT INTO users (name, secret) VALUES
	('Brett', '0123456789012345678901234567890123456789012345678901234567890123'),
	('Joe', '0123456789012345678901234567890123456789012345678901234567890124'),
	('George', '0123456789012345678901234567890123456789012345678901234567890125'),
	('Louise', '0123456789012345678901234567890123456789012345678901234567890126'),
	('Janice', '0123456789012345678901234567890123456789012345678901234567890127');

INSERT INTO user_settings (user_id) VALUES
	(1),
	(2),
	(3),
	(4),
	(5);

INSERT INTO sites (site_code, owner_id, name) VALUES
	('abcdef', 1, 'Food Stands in New York'),
	('ghijkl', 4, 'Road Trip 2014!'),
	('mnopqr', 1, 'Leprechaun Sightings');

INSERT INTO user_sites (site_id, user_id) VALUES
	(1, 1),
	(1, 2),
	(1, 3),
	(2, 2),
	(2, 3),
	(2, 4),
	(2, 5),
	(3, 1);

INSERT INTO site_settings (site_id, only_owner_can_edit, initial_extent) VALUES
	(1, true, '(-73.884, 40.8471), (-74.083, 40.6911)'),
	(2, false, '(-67.02, 47.46), (-126.84, 25.36)'),
	(3, true, '(-5.44, 55.19), (-11.61, 51.24)');

INSERT INTO markers (site_id, name, description, point, symbol, owner_id) VALUES 
	(1, 'Grab ''n'' Go', 'Fast service. Can''t complain.', point(-73.9951, 40.7447), 'ico=1', 1),
	(1, 'CP Ice Cream', 'Great for those hot summer days in the park.', point(-73.98110, 40.77416), 'ico=1', 1),
	(1, 'Harlem Hot Dogs', 'Best dogs in northern Manhattan.', point(-73.94639, 40.81149), 'ico=1', 1),
	(1, 'Wall Meat', 'The owner used to be an investment banker.', point(-74.010797, 40.707177), 'ico=1', 1),
	(3, 'Sighting at 4:34 PM on 2011-03-17', 'Just for a second, but he was there!', point(-7.770148, 52.614635), 'ico=8', 1);
