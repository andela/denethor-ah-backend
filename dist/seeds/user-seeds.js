"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.seedUsers = void 0;

var _models = require("../models");

// Seed Users
const seedUsers = async () => {
  const usersData = [{
    firstname: 'John',
    lastname: 'Doe',
    username: 'johndoe',
    email: 'johndoe@example.test',
    password: 'secretpass',
    isVerified: true
  }, {
    firstname: 'John',
    lastname: 'James',
    username: 'johnjames',
    email: 'johnjames@example.test',
    password: 'secretpass',
    isVerified: true
  }, {
    firstname: 'Janeth',
    lastname: 'Jack',
    username: 'janethjack',
    email: 'janethjack@example.test',
    password: 'secretpass',
    isVerified: true
  }];
  let usersCreated = usersData.map(async userData => {
    const user = await _models.User.create(userData);
    return user;
  });
  usersCreated = await Promise.all(usersCreated);
  return usersCreated;
};

exports.seedUsers = seedUsers;