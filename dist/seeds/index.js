"use strict";

var _articleSeeds = require("./article-seeds");

var _userSeeds = require("./user-seeds");

const seedDatabase = async () => {
  const users = await (0, _userSeeds.seedUsers)();
  await (0, _articleSeeds.seedArticles)(users);
};

seedDatabase();