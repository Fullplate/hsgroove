CREATE TABLE `account` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `password` varchar(255) NOT NULL,
  `security_role` varchar(255) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

CREATE TABLE `season` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `chrono_id` int(11) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `archetype` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `display_name` varchar(255) NOT NULL,
  `hero_class` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

CREATE TABLE `deck` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `hero_class` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `account_id` bigint(20) DEFAULT NULL,
  `archetype_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_42w1k9ow10gch6e4voeq990uq` (`account_id`),
  KEY `FK_j01jy2y1lmxpqs9g77nbwg1ph` (`archetype_id`),
  CONSTRAINT `FK_42w1k9ow10gch6e4voeq990uq` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`),
  CONSTRAINT `FK_j01jy2y1lmxpqs9g77nbwg1ph` FOREIGN KEY (`archetype_id`) REFERENCES `archetype` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

CREATE TABLE `game` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `notes` varchar(255) DEFAULT NULL,
  `on_coin` tinyint(1) NOT NULL,
  `opp_hero_class` int(11) NOT NULL,
  `rank` int(11) NOT NULL,
  `timestamp` bigint(20) NOT NULL,
  `victory` tinyint(1) NOT NULL,
  `account_id` bigint(20) DEFAULT NULL,
  `deck_id` bigint(20) DEFAULT NULL,
  `opp_archetype_id` bigint(20) DEFAULT NULL,
  `season_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_neg3gfo29bpvdbxa0kldeu7mg` (`account_id`),
  KEY `FK_pabh45sygdcsctxk42t8ueejs` (`deck_id`),
  KEY `FK_1aymh6r5k9wmryiv2eucu003p` (`opp_archetype_id`),
  KEY `FK_ln6qta91ksnchnlri5muxeo7r` (`season_id`),
  CONSTRAINT `FK_1aymh6r5k9wmryiv2eucu003p` FOREIGN KEY (`opp_archetype_id`) REFERENCES `archetype` (`id`),
  CONSTRAINT `FK_ln6qta91ksnchnlri5muxeo7r` FOREIGN KEY (`season_id`) REFERENCES `season` (`id`),
  CONSTRAINT `FK_neg3gfo29bpvdbxa0kldeu7mg` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`),
  CONSTRAINT `FK_pabh45sygdcsctxk42t8ueejs` FOREIGN KEY (`deck_id`) REFERENCES `deck` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;