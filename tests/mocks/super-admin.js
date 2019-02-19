import bcrypt from 'bcrypt';

const hashPassword = password => bcrypt.hashSync(password, bcrypt.genSaltSync());

export default [{
  firstname: 'Chubi',
  lastname: 'Best',
  username: 'testuser1',
  email: 'chubi.best@example.com',
  password: hashPassword('password'),
  role: 'super-admin',
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
}];
