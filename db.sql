-- Новые доки
CREATE TABLE `document_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `doc_type_name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `doc_type_name_UNIQUE` (`doc_type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;


-- Новые доки
CREATE TABLE `document` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `document_title` varchar(511) NOT NULL,
  `document_type_id` int(11) NOT NULL,
  `document_file_name` varchar(255) NOT NULL,
  `document_binary` blob NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `documentcol_UNIQUE` (`document_title`),
  KEY `document_type_id_idx` (`document_type_id`),
  CONSTRAINT `document_type_id` FOREIGN KEY (`document_type_id`) REFERENCES `document_type` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8;