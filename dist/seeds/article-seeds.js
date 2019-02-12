"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.seedArticles = void 0;

var _models = require("../models");

// Seed Articles
// Seed Categories
// Seed Ratings
// Seed Tags
const seedArticles = async users => {
  const user = users[0];
  const user1 = users[1];
  const user2 = users[2];
  const category = await _models.Category.create({
    categoryName: 'Tech'
  });
  const tag1 = await _models.Tag.create({
    tagText: 'andela'
  });
  const tag2 = await _models.Tag.create({
    tagText: 'bootcamp'
  });
  const tag3 = await _models.Tag.create({
    tagText: 'epic values'
  });
  const dummyArticles = [{
    slug: 'introduction-to-writing',
    body: `Our original read time calculation was geared toward “slow” images, like comics, where you would really want to sit down and invest in the image. This resulted in articles with crazy big read times. For instance, this article containing 140 images was clocking in at a whopping 87 minute read. So we amended our read time calculation to count 12 seconds for the first image, 11 for the second, and minus an additional second for each subsequent image. Any images after the tenth image are counted at three seconds.
    You might see this change reflected across the site. 
    <img src='dummty.jpg' />
    <img src='dummty.jpg' />
    <img src='dummty.jpg' />
    <img src='dummty.jpg' />
    Keep in mind that our estimated read time is just that: an estimation. You might finish a story faster or slower depending on various factors such as how many children or cats you have, your caffeine/alcohol intake, or if you’re a time-traveler from the future and already read that story. We just want to give you a ballpark figure so you can decide whether you have time to read one more story before the bus comes, or if you should bookmark it for later.Our original read time calculation was geared toward “slow” images, like comics, where you would really want to sit down and invest in the image. This resulted in articles with crazy big read times. For instance, this article containing 140 images was clocking in at a whopping 87 minute read. So we amended our read time calculation to count 12 seconds for the first image, 11 for the second, and minus an additional second for each subsequent image. Any images after the tenth image are counted at three seconds.
    You might see this change reflected across the site. Keep in mind that our estimated read time is just that: an estimation. You might finish a story faster or slower depending on various factors such as how many children or cats you have, your caffeine/alcohol intake, or if you’re a time-traveler from the future and already read that story. We just want to give you a ballpark figure so you can decide whether you have time to read one more story before the bus comes, or if you should bookmark it for later
    .`,
    description: 'Introduction to writing',
    // authorId: user.id,
    references: ['reference1.com', 'reference2.com', 'reference3.com'],
    categoryId: category.id
  }, {
    slug: 'health-tips-you-must-know',
    body: `Our original read time calculation was geared toward “slow” images, like comics, where you would really want to sit down and invest in the image. This resulted in articles with crazy big read times. For instance, this article containing 140 images was clocking in at a whopping 87 minute read. So we amended our read time calculation to count 12 seconds for the first image, 11 for the second, and minus an additional second for each subsequent image. Any images after the tenth image are counted at three seconds.
    You might see this change reflected across the site. Keep in mind that our estimated read time is just that: an estimation. You might finish a story faster or slower depending on various factors such as how many children or cats you have, your caffeine/alcohol intake, or if you’re a time-traveler from the future and already read that story. We just want to give you a ballpark figure so you can decide whether you have time to read one more story before the bus comes, or if you should bookmark it for later.`,
    description: 'Health tips you must know',
    // authorId: user.id,
    references: ['reference1.com', 'reference2.com'],
    categoryId: category.id
  }];
  const createdArticles = dummyArticles.map(async articleEntry => {
    const newArticle = await user.createArticle(articleEntry);
    await newArticle.createArticleRating({
      ratings: 4,
      userId: user.id,
      articleId: newArticle.id
    });
    await newArticle.createArticleRating({
      ratings: 4,
      userId: user1.id,
      articleId: newArticle.id
    });
    await newArticle.createArticleRating({
      ratings: 5,
      userId: user2.id,
      articleId: newArticle.id
    });
    await newArticle.addTags([tag1, tag2, tag3]); // last version of the comment

    const newComment = await newArticle.createComment({
      articleId: newArticle.id,
      commentBody: 'Article Comment'
    }); // 1st version of comment

    await newComment.createCommentHistory({
      commentBody: 'Article comme',
      commentId: newComment.id
    }); // 2nd version of comment

    await newComment.createCommentHistory({
      commentBody: 'Article commen',
      commentId: newComment.id
    });
    return newArticle;
  });
  const allCreatedArticles = await Promise.all(createdArticles);
  console.log(allCreatedArticles.length, '>>>Created Articles');
};

exports.seedArticles = seedArticles;