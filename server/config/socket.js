import moment from 'moment';
import database from './firebase';

const handleSocket = (socket) => {
  let id;
  socket.on('addUserListener', async (userId) => {
    id = userId;

    database.ref(`notifications/${userId}`).on('value', (snapshots) => {
      const notifications = [];

      snapshots.forEach((snapshot) => {
        notifications.push({ ...snapshot.val() });
      });

      let uniqueNotifications = notifications.filter(({
        message, articleId, read
      }, pos, arr) => arr.findIndex(({ message: message2, articleId: articleId2, read: read2 }) => ((message === message2)
          && (articleId === articleId2)
          && (read === read2))) === pos);

      uniqueNotifications.sort((a, b) => moment(b.time).valueOf() - moment(a.time).valueOf());

      uniqueNotifications = uniqueNotifications.filter((notification, i) => i < 10);

      socket.emit('setNotifications', uniqueNotifications);
    });
  });

  socket.on('setRemainingNotifications', async (notificationsToBeSaved) => {
    await database.ref(`notifications/${id}`).remove();
    notificationsToBeSaved.forEach(async (notification) => {
      await database.ref(`notifications/${id}`).push(notification);
    });
  });
};

export default handleSocket;
