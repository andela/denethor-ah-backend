import database from './firebase';

const handleSocket = (socket) => {
  let id;
  socket.on('addUserListener', async (userId) => {
    id = userId;

    database.ref(`notifications/${userId}`).on('value', (snapshots) => {
      const notifications = [];

      snapshots.forEach((snapshot) => {
        notifications.unshift({ ...snapshot.val() });
      });

      const uniqueNotifications = notifications.filter(({
        message, articleId
      }, pos, arr) => arr.findIndex(({ message: message2, articleId: articleId2 }) => ((message === message2)
          && (articleId === articleId2))) === pos);

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
