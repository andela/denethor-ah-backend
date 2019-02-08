import { sequelize } from '../../server/models';

after((done) => {
  sequelize.drop().then(() => sequelize.queryInterface.dropTable('session').then(() => done()));
});
