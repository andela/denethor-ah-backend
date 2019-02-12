import { seedArticles } from './article-seeds';
import { seedUsers } from './user-seeds';

const seedDatabase = async () => {
  const users = await seedUsers();
  await seedArticles(users);
};

seedDatabase();
