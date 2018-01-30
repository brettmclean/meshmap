SET client_min_messages TO WARNING;

CREATE TABLE IF NOT EXISTS marker_icons (
	id	integer NOT NULL UNIQUE,
	url	varchar(200)
);

CREATE TABLE IF NOT EXISTS marker_colors (
	id	integer NOT NULL UNIQUE,
	color	varchar(20)
);

CREATE TABLE IF NOT EXISTS users (
	id	serial PRIMARY KEY,
	name	varchar(60) NOT NULL CHECK (length(name) > 0),
	email	varchar(255) NULL,
	secret	char(64) NOT NULL UNIQUE CHECK (length(secret) = 64)
);

CREATE TABLE IF NOT EXISTS sites (
	id			serial PRIMARY KEY,
	site_code		varchar(20) NOT NULL UNIQUE CHECK (length(site_code) > 2),
	owner_id		integer CHECK (owner_id > 0) references users(id),
	name			varchar(100) NOT NULL CHECK (length(name) > 0),
	description		varchar(500) NULL,
	creation_date		timestamp NOT NULL DEFAULT NOW(),
	last_access_date	timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_sites (
	site_id		integer NOT NULL references sites(id),
	user_id		integer NOT NULL references users(id),
	extent		box
);
CREATE UNIQUE INDEX ON user_sites (site_id, user_id);

CREATE TABLE IF NOT EXISTS markers (
	id		serial PRIMARY KEY,
	site_id		integer NOT NULL references sites(id),
	name		varchar(100) NOT NULL CHECK (length(name) > 0),
	description	varchar(500) NOT NULL,
	point		point,
	polyline	path,
	polygon		polygon,
	symbol		text,
	owner_id	integer NOT NULL references users(id),
	creation_date	timestamp NOT NULL DEFAULT NOW(),
	-- Each row must contain exactly one of a point, polyline or polygon geometry
	CONSTRAINT only_one_geom CHECK ((point IS NOT NULL AND polyline IS NULL AND polygon IS NULL) OR (point IS NULL AND polyline IS NOT NULL AND polygon IS NULL) OR (point IS NULL AND polyline IS NULL AND polygon IS NOT NULL))
);
CREATE INDEX ON markers (site_id);

CREATE TABLE IF NOT EXISTS user_settings (
	user_id		integer NOT NULL UNIQUE references users(id),
	confirm_marker_deletion	boolean NOT NULL DEFAULT TRUE
);
CREATE INDEX ON user_settings (user_id);

CREATE TABLE IF NOT EXISTS site_settings (
	site_id		integer NOT NULL UNIQUE references sites(id),
	only_owner_can_edit	boolean NOT NULL,
	initial_extent	box NULL
);
CREATE INDEX ON site_settings (site_id);

CREATE TABLE IF NOT EXISTS user_activity (
	activity_date	timestamp NOT NULL DEFAULT NOW(),
	activity_type	integer NOT NULL,
	user_id		integer,
	site_id		integer,
	marker_id	integer
);

CREATE TABLE IF NOT EXISTS ip_addresses (
	id	serial PRIMARY KEY,
	ip_address	cidr NOT NULL UNIQUE,
	is_banned	boolean
);

CREATE TABLE IF NOT EXISTS user_connections (
	user_id		integer NOT NULL references users(id),
	ip_id	integer NOT NULL references ip_addresses(id),
	connect_date	timestamp NOT NULL DEFAULT NOW()
);

DO $$
BEGIN

IF (SELECT COUNT(*) FROM marker_icons) <= 0 THEN
	INSERT INTO marker_icons (id, url) VALUES
	(1, 'http://maps.google.com/mapfiles/marker.png'), 
	(2, 'http://maps.google.com/mapfiles/marker_black.png'),
	(3, 'http://maps.google.com/mapfiles/marker_grey.png'),
	(4, 'http://maps.google.com/mapfiles/marker_orange.png'),
	(5, 'http://maps.google.com/mapfiles/marker_white.png'),
	(6, 'http://maps.google.com/mapfiles/marker_yellow.png'),
	(7, 'http://maps.google.com/mapfiles/marker_purple.png'),
	(8, 'http://maps.google.com/mapfiles/marker_green.png');
END IF;

IF (SELECT COUNT(*) FROM marker_colors) <= 0 THEN
	INSERT INTO marker_colors (id, color) VALUES
	(1, '#FF0000'),
	(2, '#00FF00'),
	(3, '#0000FF'),
	(4, '#FFFF00'),
	(5, '#FF00FF'),
	(6, '#00FFFF'),
	(7, '#800000'),
	(8, '#008000'),
	(9, '#000080'),
	(10, '#808000'),
	(11, '#800080'),
	(12, '#008080'),
	(13, '#FFFFFF'),
	(14, '#CCCCCC'),
	(15, '#999999'),
	(16, '#666666'),
	(17, '#333333'),
	(18, '#000000');
END IF;

END
$$

