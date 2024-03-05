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

SELECT * FROM Users;