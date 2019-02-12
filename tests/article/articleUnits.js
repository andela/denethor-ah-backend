import { expect } from 'chai';
import { getReadTime } from '../../server/api/controllers/article';

describe('Tests for article read time utility', () => {
  const dummyArticleBody = `Our original read time calculation was geared toward “slow” images, like comics, where you would really want to sit down and invest in the image. This resulted in articles with crazy big read times. For instance, this article containing 140 images was clocking in at a whopping 87 minute read. So we amended our read time calculation to count 12 seconds for the first image, 11 for the second, and minus an additional second for each subsequent image. Any images after the tenth image are counted at three seconds.
  You might see this change reflected across the site. Keep in mind that our estimated read time is just that: an estimation. You might finish a story faster or slower depending on various factors such as how many children or cats you have, your caffeine/alcohol intake, or if you’re a time-traveler from the future and already read that story. We just want to give you a ballpark figure so you can decide whether you have time to read one more story before the bus comes, or if you should bookmark it for later.`;
  const readTime = getReadTime(dummyArticleBody);

  const dummyArticleBodyWithImages = `Our original read time calculation was geared toward “slow” images, like comics, where you would really want to sit down and invest in the image. This resulted in articles with crazy big read times. For instance, this article containing 140 images was clocking in at a whopping 87 minute read. So we amended our read time calculation to count 12 seconds for the first image, 11 for the second, and minus an additional second for each subsequent image. Any images after the tenth image are counted at three seconds.
    You might see this change reflected across the site. 
    <img src='dummty.jpg' />
    <img src='dummty.jpg' />
    <img src='dummty.jpg' />
    <img src='dummty.jpg' />
    Keep in mind that our estimated read time is just that: an estimation. You might finish a story faster or slower depending on various factors such as how many children or cats you have, your caffeine/alcohol intake, or if you’re a time-traveler from the future and already read that story. We just want to give you a ballpark figure so you can decide whether you have time to read one more story before the bus comes, or if you should bookmark it for later.Our original read time calculation was geared toward “slow” images, like comics, where you would really want to sit down and invest in the image. This resulted in articles with crazy big read times. For instance, this article containing 140 images was clocking in at a whopping 87 minute read. So we amended our read time calculation to count 12 seconds for the first image, 11 for the second, and minus an additional second for each subsequent image. Any images after the tenth image are counted at three seconds.
    You might see this change reflected across the site. Keep in mind that our estimated read time is just that: an estimation. You might finish a story faster or slower depending on various factors such as how many children or cats you have, your caffeine/alcohol intake, or if you’re a time-traveler from the future and already read that story. We just want to give you a ballpark figure so you can decide whether you have time to read one more story before the bus comes, or if you should bookmark it for later
    .`;
  const readTime2 = getReadTime(dummyArticleBodyWithImages);
  expect(readTime).to.not.equal(undefined);
  expect(readTime2).to.equal('3 minutes');
});
