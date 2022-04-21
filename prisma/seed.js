const { createClassrooms } = require('./factories/classroom');
const { createUsers } = require('./factories/user');

(async () => {
  const users = await createUsers();
  await createClassrooms(users);
})();
