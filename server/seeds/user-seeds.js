import { User } from '../models';

// Seed Users
export const seedUsers = async () => {
  const usersData = [{
    firstname: 'John',
    lastname: 'Doe',
    username: 'johndoe',
    email: 'johndoe@example.test',
    password: 'secretpass',
    isVerified: true,
  },
  {
    firstname: 'John',
    lastname: 'James',
    username: 'johnjames',
    email: 'johnjames@example.test',
    password: 'secretpass',
    isVerified: true,
  },
  {
    firstname: 'Janeth',
    lastname: 'Jack',
    username: 'janethjack',
    email: 'janethjack@example.test',
    password: 'secretpass',
    isVerified: true,
  }];

  let usersCreated = usersData.map(async (userData) => {
    const user = await User.create(userData);
    return user;
  });

  usersCreated = await Promise.all(usersCreated);
  return usersCreated;
};
