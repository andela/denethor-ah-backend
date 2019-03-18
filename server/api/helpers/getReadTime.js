/**
* @export
* @function getReadTime
* @param {String} articleBody - article.body
* @returns {String} - Read Time eg '2 minutes'
*/
const getReadTime = (articleBody) => {
  // Read time is based on the average reading speed of an adult (roughly 275 WPM).
  // We take the total word count of a post and translate it into minutes.
  // Then, we add 12 seconds for each inline image.
  // TIME = DISTANCE / SPEED
  const words = articleBody.split(' ');
  const wordCount = words.length;

  const readTimeInMinutes = wordCount / 275;
  let readTimeInSeconds = readTimeInMinutes * 60;

  const imagesFound = articleBody.split('<img'); // search for image tags

  imagesFound.forEach(() => {
    readTimeInSeconds += 12; // add 12 seconds for each inline image
  });

  let readTime = Math.ceil(readTimeInSeconds / 60); // convert back to minutes
  readTime += readTime > 1 ? ' minutes' : ' minute';
  return readTime;
};

export default getReadTime;
