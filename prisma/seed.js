const { createClassrooms } = require('./factories/classroom');
const { createUsers } = require('./factories/user');

const main = async () => {
  try {
    console.log('Creating users...');
    const users = await createUsers();
    console.log('Users created successfully.');

    console.log('Creating classrooms...');
    await createClassrooms(users);
    console.log('Classrooms created successfully.');
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    console.log('Script execution completed.');
  }
};

main();
