-- MySQL dump 10.13  Distrib 8.0.41, for Linux (x86_64)
--
-- Host: localhost    Database: tristrike
-- ------------------------------------------------------
-- Server version	8.0.41-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bets`
--

DROP TABLE IF EXISTS `bets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `game_id` int DEFAULT NULL,
  `chosen_nums` varchar(20) NOT NULL,
  `amount` int DEFAULT '20',
  `is_winner` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `bets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `bets_ibfk_2` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bets`
--

LOCK TABLES `bets` WRITE;
/*!40000 ALTER TABLE `bets` DISABLE KEYS */;
INSERT INTO `bets` VALUES (1,5,65,'1-2-3',20,0,'2025-02-28 09:21:55'),(2,5,65,'1-2-3',20,0,'2025-02-28 09:22:09'),(3,5,65,'1-2-3',20,0,'2025-02-28 09:22:15'),(4,5,75,'1-2-3',20,0,'2025-02-28 10:24:19'),(5,5,75,'1-2-3',20,0,'2025-02-28 10:24:22'),(7,8,79,'1-2-3',20,0,'2025-02-28 11:21:09'),(8,8,79,'1-2-3',20,0,'2025-02-28 11:21:12'),(9,8,79,'1-2-3',20,0,'2025-02-28 11:21:14'),(10,8,79,'1-2-3',20,0,'2025-02-28 11:21:14'),(13,10,99,'1-2-3',20,0,'2025-02-28 12:51:24'),(14,11,99,'1-2-3',20,0,'2025-02-28 12:52:07'),(17,11,102,'1-2-3',20,0,'2025-02-28 13:32:10'),(23,12,102,'1-2-3',20,0,'2025-02-28 14:35:21'),(24,12,105,'1-2-3',20,0,'2025-02-28 14:36:06'),(25,12,105,'1-2-3',20,0,'2025-02-28 14:36:08'),(27,13,169,'3-3-3',20,0,'2025-03-01 01:28:40'),(28,13,173,'3-3-3',20,0,'2025-03-01 01:33:16'),(29,15,186,'3-3-3',20,0,'2025-03-01 02:04:41'),(30,15,187,'3-3-3',20,0,'2025-03-01 02:05:35'),(31,16,189,'3-3-3',20,0,'2025-03-01 02:16:25'),(32,16,189,'3-3-3',20,0,'2025-03-01 02:16:28'),(33,16,192,'3-3-3',20,0,'2025-03-01 02:19:21'),(34,16,192,'3-3-3',20,0,'2025-03-01 02:19:48'),(41,18,215,'1-2-3',20,0,'2025-03-01 06:48:12'),(42,18,218,'1-2-3',20,0,'2025-03-01 06:51:18'),(43,18,218,'1-2-3',20,0,'2025-03-01 06:51:37'),(44,18,229,'1-2-3',20,0,'2025-03-01 07:02:19'),(47,19,241,'1-2-3',20,0,'2025-03-01 07:49:18'),(49,20,260,'1-2-3',20,0,'2025-03-01 08:30:52'),(50,20,260,'1-2-3',20,0,'2025-03-01 08:31:20'),(52,20,268,'1-2-3',20,0,'2025-03-01 08:40:44'),(54,12,272,'1-2-3',20,0,'2025-03-01 08:50:31'),(58,20,293,'1-2-3',20,0,'2025-03-01 09:11:17');
/*!40000 ALTER TABLE `bets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carryover_prizes`
--

DROP TABLE IF EXISTS `carryover_prizes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carryover_prizes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carryover_prizes`
--

LOCK TABLES `carryover_prizes` WRITE;
/*!40000 ALTER TABLE `carryover_prizes` DISABLE KEYS */;
INSERT INTO `carryover_prizes` VALUES (1,0.00,'2025-03-06 17:23:10'),(2,0.00,'2025-03-06 17:24:08'),(3,0.00,'2025-03-06 17:25:03'),(4,0.00,'2025-03-06 17:25:59'),(5,0.00,'2025-03-06 17:26:55'),(6,0.00,'2025-03-06 17:27:50'),(7,0.00,'2025-03-06 17:28:45'),(8,0.00,'2025-03-06 17:29:41'),(9,0.00,'2025-03-06 17:30:35'),(10,0.00,'2025-03-06 17:47:11'),(11,0.00,'2025-03-06 17:48:05'),(12,0.00,'2025-03-06 17:49:00'),(13,0.00,'2025-03-06 17:52:58'),(14,0.00,'2025-03-06 17:53:54');
/*!40000 ALTER TABLE `carryover_prizes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_logins`
--

DROP TABLE IF EXISTS `daily_logins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_logins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `reward_date` date NOT NULL,
  `reward_amount` int DEFAULT '30',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `daily_logins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_logins`
--

LOCK TABLES `daily_logins` WRITE;
/*!40000 ALTER TABLE `daily_logins` DISABLE KEYS */;
/*!40000 ALTER TABLE `daily_logins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `games`
--

DROP TABLE IF EXISTS `games`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `games` (
  `id` int NOT NULL AUTO_INCREMENT,
  `winning_num` int NOT NULL,
  `prize_pool` int DEFAULT '20',
  `status` enum('ongoing','finished') DEFAULT 'ongoing',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=352 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `games`
--

LOCK TABLES `games` WRITE;
/*!40000 ALTER TABLE `games` DISABLE KEYS */;
INSERT INTO `games` VALUES (1,2,20,'finished','2025-02-26 13:03:28'),(2,8,20,'finished','2025-02-26 13:04:27'),(3,4,20,'finished','2025-02-26 13:58:45'),(4,4,20,'finished','2025-02-26 13:59:44'),(5,2,20,'finished','2025-02-26 14:00:43'),(6,6,20,'finished','2025-02-26 14:01:42'),(7,5,20,'finished','2025-02-26 14:02:42'),(8,5,20,'finished','2025-02-26 14:03:41'),(9,5,20,'finished','2025-02-26 14:04:40'),(10,1,20,'finished','2025-02-26 14:07:04'),(11,7,20,'finished','2025-02-26 14:38:38'),(12,2,20,'finished','2025-02-26 14:40:44'),(13,1,20,'finished','2025-02-26 14:41:43'),(14,7,20,'finished','2025-02-26 14:42:42'),(15,8,20,'finished','2025-02-26 14:47:17'),(16,7,20,'finished','2025-02-26 14:48:16'),(17,7,20,'finished','2025-02-26 14:49:15'),(18,2,20,'finished','2025-02-28 02:36:19'),(19,3,20,'finished','2025-02-28 02:44:34'),(20,7,20,'finished','2025-02-28 02:45:30'),(21,1,20,'finished','2025-02-28 02:46:27'),(22,2,20,'finished','2025-02-28 02:49:12'),(23,7,20,'finished','2025-02-28 02:59:14'),(24,5,20,'finished','2025-02-28 03:07:09'),(25,4,20,'finished','2025-02-28 03:18:54'),(26,1,20,'finished','2025-02-28 03:24:16'),(27,4,20,'finished','2025-02-28 03:25:15'),(28,1,20,'finished','2025-02-28 03:26:12'),(29,1,20,'finished','2025-02-28 03:28:25'),(30,2,20,'finished','2025-02-28 05:50:34'),(31,3,20,'finished','2025-02-28 05:51:29'),(32,7,20,'finished','2025-02-28 05:52:25'),(33,9,20,'finished','2025-02-28 05:53:20'),(34,8,20,'finished','2025-02-28 05:54:16'),(35,3,20,'finished','2025-02-28 06:09:59'),(36,1,20,'finished','2025-02-28 06:21:49'),(37,5,20,'finished','2025-02-28 07:05:12'),(38,6,20,'finished','2025-02-28 07:14:17'),(39,5,20,'finished','2025-02-28 07:15:14'),(40,4,20,'finished','2025-02-28 07:28:03'),(41,6,20,'finished','2025-02-28 07:28:59'),(42,3,20,'finished','2025-02-28 07:30:42'),(43,4,20,'finished','2025-02-28 07:32:04'),(44,7,0,'finished','2025-02-28 07:43:39'),(45,1,0,'finished','2025-02-28 07:45:18'),(46,9,0,'finished','2025-02-28 07:48:44'),(47,6,0,'finished','2025-02-28 07:49:40'),(48,5,0,'finished','2025-02-28 07:57:11'),(49,9,0,'finished','2025-02-28 08:24:31'),(50,1,0,'finished','2025-02-28 08:25:58'),(51,7,0,'finished','2025-02-28 08:26:54'),(52,6,0,'finished','2025-02-28 08:27:50'),(53,5,0,'finished','2025-02-28 08:28:46'),(54,9,0,'finished','2025-02-28 08:29:42'),(55,3,0,'finished','2025-02-28 08:30:39'),(56,8,0,'finished','2025-02-28 08:31:35'),(57,1,0,'finished','2025-02-28 09:04:47'),(58,5,0,'finished','2025-02-28 09:05:46'),(59,4,0,'finished','2025-02-28 09:07:50'),(60,6,0,'finished','2025-02-28 09:08:48'),(61,8,0,'finished','2025-02-28 09:09:43'),(62,7,0,'finished','2025-02-28 09:10:39'),(63,2,0,'finished','2025-02-28 09:18:50'),(64,6,0,'finished','2025-02-28 09:19:46'),(65,8,0,'finished','2025-02-28 09:20:43'),(66,1,0,'finished','2025-02-28 09:27:28'),(67,8,0,'finished','2025-02-28 09:27:29'),(68,2,0,'finished','2025-02-28 09:27:29'),(69,1,0,'finished','2025-02-28 09:28:26'),(70,7,0,'finished','2025-02-28 09:28:26'),(71,7,0,'finished','2025-02-28 09:28:26'),(72,7,0,'finished','2025-02-28 09:32:07'),(73,1,0,'finished','2025-02-28 09:32:07'),(74,5,0,'finished','2025-02-28 09:33:07'),(75,7,40,'finished','2025-02-28 09:34:04'),(76,6,20,'finished','2025-02-28 10:24:58'),(77,8,20,'finished','2025-02-28 10:55:12'),(78,4,20,'finished','2025-02-28 10:59:10'),(79,7,20,'finished','2025-02-28 11:07:12'),(82,1,20,'finished','2025-02-28 11:33:32'),(83,6,20,'finished','2025-02-28 11:35:13'),(84,9,20,'finished','2025-02-28 11:37:05'),(85,1,20,'finished','2025-02-28 11:38:01'),(86,3,20,'finished','2025-02-28 11:38:58'),(87,3,20,'finished','2025-02-28 11:39:54'),(88,2,20,'finished','2025-02-28 11:40:50'),(89,4,20,'finished','2025-02-28 11:41:49'),(90,5,20,'finished','2025-02-28 11:42:37'),(91,6,20,'finished','2025-02-28 11:42:46'),(92,3,20,'finished','2025-02-28 11:43:43'),(93,3,20,'finished','2025-02-28 11:47:07'),(94,1,20,'finished','2025-02-28 11:48:03'),(95,8,20,'finished','2025-02-28 11:50:23'),(97,6,20,'finished','2025-02-28 12:51:17'),(98,7,20,'finished','2025-02-28 12:51:17'),(99,4,20,'finished','2025-02-28 12:51:17'),(100,3,20,'finished','2025-02-28 12:52:12'),(101,2,20,'finished','2025-02-28 12:52:12'),(102,2,20,'finished','2025-02-28 12:52:35'),(105,8,20,'finished','2025-02-28 14:35:55'),(106,9,20,'finished','2025-02-28 14:36:50'),(107,4,20,'finished','2025-02-28 14:37:46'),(108,9,20,'finished','2025-02-28 14:38:41'),(109,9,20,'finished','2025-02-28 14:39:37'),(110,3,20,'finished','2025-02-28 14:40:33'),(111,2,20,'finished','2025-02-28 14:41:31'),(148,6,20,'finished','2025-02-28 16:57:54'),(149,7,20,'finished','2025-02-28 16:58:54'),(150,1,20,'finished','2025-02-28 17:08:47'),(151,1,20,'finished','2025-02-28 17:21:37'),(152,9,20,'finished','2025-02-28 17:24:15'),(153,2,20,'finished','2025-02-28 17:25:15'),(154,5,20,'finished','2025-02-28 17:26:15'),(155,8,20,'finished','2025-02-28 17:27:15'),(156,7,20,'finished','2025-02-28 17:28:15'),(157,9,20,'finished','2025-02-28 17:29:16'),(158,4,20,'finished','2025-02-28 17:30:16'),(159,1,20,'finished','2025-02-28 17:31:29'),(160,3,20,'finished','2025-02-28 17:32:29'),(161,1,20,'finished','2025-02-28 17:33:29'),(162,4,20,'finished','2025-02-28 17:34:29'),(163,1,20,'finished','2025-03-01 01:07:13'),(164,5,20,'finished','2025-03-01 01:08:12'),(165,7,20,'finished','2025-03-01 01:09:10'),(166,3,20,'finished','2025-03-01 01:10:08'),(167,6,20,'finished','2025-03-01 01:11:06'),(168,3,20,'finished','2025-03-01 01:12:39'),(169,7,40,'finished','2025-03-01 01:28:26'),(170,5,20,'finished','2025-03-01 01:29:24'),(171,3,20,'finished','2025-03-01 01:30:22'),(172,6,20,'finished','2025-03-01 01:32:12'),(173,1,60,'finished','2025-03-01 01:33:09'),(174,6,20,'finished','2025-03-01 01:34:07'),(175,3,20,'finished','2025-03-01 01:35:06'),(176,4,20,'finished','2025-03-01 01:36:04'),(177,7,20,'finished','2025-03-01 01:37:01'),(178,5,20,'finished','2025-03-01 01:38:00'),(179,4,20,'finished','2025-03-01 01:38:58'),(180,9,20,'finished','2025-03-01 01:39:56'),(181,5,20,'finished','2025-03-01 01:40:54'),(182,2,20,'finished','2025-03-01 01:41:52'),(183,5,20,'finished','2025-03-01 01:53:04'),(184,5,40,'finished','2025-03-01 01:54:02'),(185,8,20,'finished','2025-03-01 01:55:00'),(186,7,40,'finished','2025-03-01 02:04:24'),(187,3,40,'finished','2025-03-01 02:05:21'),(188,3,40,'finished','2025-03-01 02:06:19'),(189,8,200,'finished','2025-03-01 02:16:21'),(190,4,20,'finished','2025-03-01 02:17:20'),(191,5,40,'finished','2025-03-01 02:18:18'),(192,3,120,'finished','2025-03-01 02:19:18'),(193,1,80,'finished','2025-03-01 02:30:53'),(194,3,40,'finished','2025-03-01 02:31:50'),(195,5,20,'finished','2025-03-01 02:42:02'),(196,7,20,'finished','2025-03-01 03:09:57'),(197,6,20,'finished','2025-03-01 03:21:31'),(198,1,20,'finished','2025-03-01 04:46:37'),(199,4,20,'finished','2025-03-01 04:47:35'),(200,7,20,'finished','2025-03-01 04:48:44'),(201,2,20,'finished','2025-03-01 04:49:43'),(202,4,20,'finished','2025-03-01 04:50:42'),(203,6,20,'finished','2025-03-01 05:23:02'),(204,7,20,'finished','2025-03-01 05:28:12'),(205,1,20,'finished','2025-03-01 05:29:10'),(206,5,20,'finished','2025-03-01 05:30:10'),(207,1,20,'finished','2025-03-01 05:36:42'),(208,3,20,'finished','2025-03-01 05:37:41'),(210,7,20,'finished','2025-03-01 06:40:13'),(211,4,20,'finished','2025-03-01 06:41:11'),(212,1,20,'finished','2025-03-01 06:42:07'),(213,3,20,'finished','2025-03-01 06:43:04'),(214,1,20,'finished','2025-03-01 06:44:01'),(215,8,20,'finished','2025-03-01 06:48:08'),(216,4,20,'finished','2025-03-01 06:49:05'),(217,9,20,'finished','2025-03-01 06:50:03'),(218,1,20,'finished','2025-03-01 06:51:00'),(219,2,20,'finished','2025-03-01 06:51:57'),(220,2,20,'finished','2025-03-01 06:52:53'),(221,8,20,'finished','2025-03-01 06:53:50'),(222,8,20,'finished','2025-03-01 06:54:46'),(223,9,20,'finished','2025-03-01 06:55:44'),(224,5,20,'finished','2025-03-01 06:56:41'),(225,6,20,'finished','2025-03-01 06:57:38'),(226,5,20,'finished','2025-03-01 06:58:34'),(227,5,20,'finished','2025-03-01 06:59:31'),(228,1,20,'finished','2025-03-01 07:00:28'),(229,3,20,'finished','2025-03-01 07:01:24'),(230,4,20,'finished','2025-03-01 07:02:23'),(235,4,20,'finished','2025-03-01 07:25:27'),(236,3,20,'finished','2025-03-01 07:43:52'),(237,4,20,'finished','2025-03-01 07:43:52'),(238,5,20,'finished','2025-03-01 07:44:49'),(239,2,20,'finished','2025-03-01 07:49:02'),(240,3,20,'finished','2025-03-01 07:49:02'),(241,8,20,'finished','2025-03-01 07:49:03'),(242,8,20,'finished','2025-03-01 07:49:59'),(243,7,20,'finished','2025-03-01 07:50:47'),(260,7,20,'finished','2025-03-01 08:23:37'),(261,9,20,'finished','2025-03-01 08:31:28'),(262,4,20,'finished','2025-03-01 08:32:25'),(263,9,20,'finished','2025-03-01 08:33:21'),(266,5,20,'finished','2025-03-01 08:37:23'),(267,8,20,'finished','2025-03-01 08:38:22'),(268,6,20,'finished','2025-03-01 08:39:18'),(269,2,20,'finished','2025-03-01 08:41:05'),(270,4,20,'finished','2025-03-01 08:42:01'),(271,9,20,'finished','2025-03-01 08:42:59'),(272,7,20,'finished','2025-03-01 08:43:56'),(287,6,20,'finished','2025-03-01 09:02:42'),(288,2,20,'finished','2025-03-01 09:03:38'),(289,4,20,'finished','2025-03-01 09:04:35'),(290,2,20,'finished','2025-03-01 09:05:33'),(291,1,20,'finished','2025-03-01 09:06:30'),(292,1,20,'finished','2025-03-01 09:07:26'),(293,3,20,'finished','2025-03-01 09:08:23'),(295,5,20,'finished','2025-03-01 09:11:56'),(296,1,20,'finished','2025-03-01 09:12:53'),(299,2,20,'finished','2025-03-02 15:06:26'),(300,3,20,'finished','2025-03-02 15:07:29'),(301,6,20,'finished','2025-03-02 15:11:54'),(302,7,20,'finished','2025-03-02 15:18:42'),(303,8,20,'finished','2025-03-02 15:19:45'),(304,4,20,'finished','2025-03-02 15:20:48'),(305,3,20,'finished','2025-03-02 15:21:51'),(306,1,20,'finished','2025-03-02 15:23:16'),(307,8,20,'finished','2025-03-04 08:46:48'),(308,4,20,'finished','2025-03-04 08:47:44'),(309,5,20,'finished','2025-03-04 08:48:40'),(310,8,20,'finished','2025-03-04 08:49:39'),(311,1,20,'finished','2025-03-04 08:56:22'),(315,39,20,'finished','2025-03-04 09:24:02'),(316,32,20,'finished','2025-03-04 09:24:57'),(317,9,20,'finished','2025-03-04 09:49:34'),(318,6,20,'finished','2025-03-04 09:50:29'),(319,3,20,'finished','2025-03-04 09:52:26'),(320,2,20,'finished','2025-03-04 09:54:20'),(321,5,20,'finished','2025-03-04 09:55:18'),(322,1,20,'finished','2025-03-04 09:56:13'),(323,7,20,'finished','2025-03-04 09:57:09'),(324,9,20,'finished','2025-03-06 01:48:02'),(325,7,20,'finished','2025-03-06 01:56:48'),(326,4,20,'finished','2025-03-06 16:31:18'),(327,8,20,'finished','2025-03-06 16:36:40'),(328,9,20,'finished','2025-03-06 16:44:06'),(329,1,20,'finished','2025-03-06 16:48:25'),(330,1,20,'finished','2025-03-06 16:52:38'),(331,6,20,'finished','2025-03-06 16:53:33'),(332,1,20,'finished','2025-03-06 16:54:27'),(333,9,20,'finished','2025-03-06 17:11:54'),(334,2,20,'finished','2025-03-06 17:22:16'),(335,6,20,'finished','2025-03-06 17:23:10'),(336,1,20,'finished','2025-03-06 17:24:08'),(337,8,20,'finished','2025-03-06 17:25:03'),(338,1,20,'finished','2025-03-06 17:25:59'),(339,5,20,'finished','2025-03-06 17:26:55'),(340,9,20,'finished','2025-03-06 17:27:50'),(341,6,20,'finished','2025-03-06 17:28:45'),(342,6,20,'finished','2025-03-06 17:29:41'),(343,2,20,'finished','2025-03-06 17:30:35'),(344,5,20,'finished','2025-03-06 17:38:19'),(345,6,20,'finished','2025-03-06 17:46:16'),(346,4,20,'finished','2025-03-06 17:47:11'),(347,4,20,'finished','2025-03-06 17:48:05'),(348,1,20,'finished','2025-03-06 17:49:00'),(349,7,20,'finished','2025-03-06 17:52:04'),(350,8,20,'finished','2025-03-06 17:52:58'),(351,7,20,'ongoing','2025-03-06 17:53:54');
/*!40000 ALTER TABLE `games` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `missions`
--

DROP TABLE IF EXISTS `missions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `missions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `goal` int NOT NULL,
  `reward` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `missions`
--

LOCK TABLES `missions` WRITE;
/*!40000 ALTER TABLE `missions` DISABLE KEYS */;
/*!40000 ALTER TABLE `missions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prize_history`
--

DROP TABLE IF EXISTS `prize_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prize_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `game_id` int DEFAULT NULL,
  `prize_amount` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `prize_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `prize_history_ibfk_2` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prize_history`
--

LOCK TABLES `prize_history` WRITE;
/*!40000 ALTER TABLE `prize_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `prize_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_missions`
--

DROP TABLE IF EXISTS `user_missions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_missions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `mission_id` int DEFAULT NULL,
  `progress` int DEFAULT '0',
  `completed` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `mission_id` (`mission_id`),
  CONSTRAINT `user_missions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `user_missions_ibfk_2` FOREIGN KEY (`mission_id`) REFERENCES `missions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_missions`
--

LOCK TABLES `user_missions` WRITE;
/*!40000 ALTER TABLE `user_missions` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_missions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `pass_hash` varchar(255) NOT NULL,
  `balance` int DEFAULT '100',
  `last_login` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'haha','jab@gmail.com','123',100,'2025-02-28 02:58:36','2025-02-28 02:58:36'),(2,'jab','jab','jab',100,'2025-02-28 03:18:11','2025-02-28 03:18:11'),(3,'wow','wow','wow',100,'2025-02-28 07:31:20','2025-02-28 07:31:20'),(4,'hala','hala','$2b$10$2C7Iyak//0Hx7T1hDsfXJePVs1d8pUq8/a5oAi8o0ztSfstl8fOvq',100,'2025-02-28 08:23:50','2025-02-28 08:23:50'),(5,'jabby','jabby','$2b$10$ieIoL2QkXxOWUz8vxmon6eSEEFgzkjdKLZrR9k5AovRDN5QxFZuRq',0,'2025-02-28 09:04:28','2025-02-28 09:04:28'),(6,'ali','ali','$2b$10$WB2nN0ms5DYQ7fpEYJQXd.m9JJUReR4hqwgXm8XTwYKgkE.jpB6Ta',100,'2025-02-28 09:27:24','2025-02-28 09:27:24'),(7,'ok','ok','$2b$10$Pj3pIqWeEeC63RMAf1fmgO2ukTjWNeFa6cjgNM.V2VCj7v6R2xyh2',100,'2025-02-28 09:28:12','2025-02-28 09:28:12'),(8,'geri','geri','$2b$10$58b.OOsU.8aOXRpIwKih3eVudAQJgQFfYX.NkoIrvNwSMRhVio30u',0,'2025-02-28 11:02:41','2025-02-28 11:02:41'),(9,'yay','yay','$2b$10$ONudcbl8CPQrE4Q735oZzeNYTY1Hiu81QKz4iSXJtnGt/o5.yAT5W',100,'2025-02-28 11:34:37','2025-02-28 11:34:37'),(10,'venti','venti','$2b$10$ZJAZhY6eMGCXSkJpdStvmeA5BKk6jMnZ/drsPoM7mBVevU0ZNkecO',80,'2025-02-28 12:51:12','2025-02-28 12:51:12'),(11,'ei','ei','$2b$10$rdscGj.SSiGno9jdmk.VpO35z4lsQQnnkmeu9DmyjH.8TKP714qzC',60,'2025-02-28 12:51:52','2025-02-28 12:51:52'),(12,'user','user','$2b$10$tzZyo64.mgUsRM/4u2gaNO6ChuNDghexHCUGVreghc.42Rp8D6G/O',20,'2025-02-28 14:35:12','2025-02-28 14:35:12'),(13,'user2','user2','$2b$10$Kp4ivhhmOM8ddzFEPq4nMulDZ/sD06JAb/bk/7wNFskWN1T0iKP7C',0,'2025-02-28 17:08:41','2025-02-28 17:08:41'),(14,'okeydt','okeydt','$2b$10$sO3aXFmvUhTCZA.RzoBBkOszVmYOwR3ZrdM5fOCFXIpqUOPSs9Fmy',100,'2025-03-01 01:07:38','2025-03-01 01:07:38'),(15,'cerci','cerci','$2b$10$8nY0rFKbe06Ye1xDygSLi.sHBKywjPXYg4MOQE/yzU3yB/pWUkiGC',20,'2025-03-01 02:04:07','2025-03-01 02:04:07'),(16,'new','new','$2b$10$qDDtkLgOc87jS1iYM7VzreARJu0tyvQ26PzVXZ7bvGIGKDmb0P9yW',120,'2025-03-01 02:16:09','2025-03-01 02:16:09'),(17,'lol','lol','$2b$10$BizubouPSn.w0mESXDiKYuAUSMk/JA45dgZsQbjnJ148ECSfPxtc.',100,'2025-03-01 06:07:12','2025-03-01 06:07:12'),(18,'kyutie','kyutie','$2b$10$EY5M21NLjPto6Ly8yaijZeJdsynIu5KHa39NM.pahm1sI59oSq21e',20,'2025-03-01 06:47:55','2025-03-01 06:47:55'),(19,'yheca','yheca','$2b$10$BRjaykM9b2h4geZ20Du7MutAhxObZyaiprfAt/RYOajJZwkuS1AoW',80,'2025-03-01 07:49:03','2025-03-01 07:49:03'),(20,'hahatdog','hahatdog','$2b$10$UW.co5GZCAEW5Q4doVZTUOub10VLKn7yzkrXK5hRcni/Tf6iT6gSu',20,'2025-03-01 08:23:15','2025-03-01 08:23:15'),(21,'ody','ody','$2b$10$cTxMkigd9YrBaAmH4y.xN.jysDPLMfE9MYClosvyYXSJbolqpPIsy',100,'2025-03-02 15:05:49','2025-03-02 15:05:49'),(22,'odys','odys','$2b$10$LsIkUYCZ6JUJkiD6ZlEXxu7ROO2R8EVenzWDOWQZfbBZDsaMaovgW',100,'2025-03-02 15:11:07','2025-03-02 15:11:07'),(23,'wutt','wutt','$2b$10$pkJXl2lE8iRvuMTuu1uc6e03bSVUqCTdfDC5VgVLwgKwYxlL4rU6W',100,'2025-03-02 15:11:40','2025-03-02 15:11:40'),(24,'odyss','odyss','$2b$10$O8jGn2yg1nykfvX51G9gTeo0Khn9ls3de6lzQyGzG66TcCadyJ/Nq',100,'2025-03-02 15:18:04','2025-03-02 15:18:04'),(25,'circe','circe','$2b$10$e4yVKhnyX1Dv7a3RP4krZ.RmXC/oQs2xobtIpy831GprAO1mHAi4a',0,'2025-03-06 01:47:38','2025-03-06 01:47:38'),(26,'calypso','calypso','$2b$10$Ah9DUeWeELYFvb.l0n1ZVeGLZoJuBUpVDOlwLVDIuputw0QB40hgS',0,'2025-03-06 16:48:07','2025-03-06 16:48:07'),(27,'dite','dite','$2b$10$AqFEVuxuY6.YXpw23vQDJufBg1d88gN.VcpVTqk2uzObTJxJ8QvUq',30,'2025-03-06 17:11:37','2025-03-06 17:11:37');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-07  2:05:44
