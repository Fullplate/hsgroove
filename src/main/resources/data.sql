-- insert test and admin users
INSERT INTO account(id, username, password, security_role)
VALUES (1, 'test', 'qwe', 'USER');
INSERT INTO account(id, username, password, security_role)
VALUES (2, 'admin', 'supersecret', 'ADMIN');

-- insert all seasons to-date
INSERT INTO season(chrono_id, display_name) VALUES (0, 'Test Season 1');
INSERT INTO season(chrono_id, display_name) VALUES (1, 'Test Season 2');
INSERT INTO season(chrono_id, display_name) VALUES (2, 'Test Season 3');
INSERT INTO season(chrono_id, display_name) VALUES (3, 'Test Season 4');
INSERT INTO season(chrono_id, display_name) VALUES (4, 'Season 1 - April 2014');
INSERT INTO season(chrono_id, display_name) VALUES (5, 'Season 2 - May 2014');
INSERT INTO season(chrono_id, display_name) VALUES (6, 'Season 3 - June 2014');
INSERT INTO season(chrono_id, display_name) VALUES (7, 'Season 4 - July 2014');
INSERT INTO season(chrono_id, display_name) VALUES (8, 'Season 5 - August 2014');
INSERT INTO season(chrono_id, display_name) VALUES (9, 'Season 6 - September 2014');
INSERT INTO season(chrono_id, display_name) VALUES (10, 'Season 7 - October 2014');
INSERT INTO season(chrono_id, display_name) VALUES (11, 'Season 8 - November 2014');
INSERT INTO season(chrono_id, display_name) VALUES (12, 'Season 9 - December 2014');
INSERT INTO season(chrono_id, display_name) VALUES (13, 'Season 10 - January 2014');
INSERT INTO season(chrono_id, display_name) VALUES (14, 'Season 11 - February 2014');
INSERT INTO season(chrono_id, display_name) VALUES (15, 'Season 12 - March 2014');