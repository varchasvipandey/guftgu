const users = [];

//addUser, removeUser, getUser, getUsersInRoom

//adduser
const addUser = ({ id, username, room }) => {
  //clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required"
    };
  }

  //check the existing user
  const existingUser = users.find(
    user => user.room === room && user.username === username
  );

  //validate user
  if (existingUser) {
    return {
      error: "Username is in use"
    };
  }

  //store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

//remove user
const removeUser = id => {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) return users.splice(index, 1)[0];
};

//getUser
const getUser = id => {
  const user = users.find(user => user.id === id);
  if (!user) {
    return {
      error: "No user found on the server"
    };
  }
  return user;
};

//get users in room
const getUsersInRoom = room => {
  room = room.trim().toLowerCase();
  const roomUsers = users.filter(user => user.room === room);
  if (roomUsers.length === 0) {
    return {
      error: `Room ${room} is either empty or does not exist yet`
    };
  }
  return roomUsers;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
