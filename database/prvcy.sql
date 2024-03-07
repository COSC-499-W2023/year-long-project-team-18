CREATE DATABASE prvcy;

USE prvcy;

CREATE TABLE Users (
	Email varchar(255),
    Username varchar(255),
    Password varchar(255),
    FirstName varchar(255),
    LastName varchar(255),
    Birthdate date,
    PersonalAccount boolean,
    BusinessAccount boolean,
    OrganizationCode varchar(255)
);
CREATE TABLE video_share_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  video_key INT NOT NULL,
  status ENUM('pending', 'accepted', 'denied') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM video_share_requests;
SELECT * FROM Users;