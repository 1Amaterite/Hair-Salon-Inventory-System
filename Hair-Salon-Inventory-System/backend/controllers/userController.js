const getUsers = (req, res) => {
    res.send('Get all users');
};

const createUser = (req, res) => {
    res.send('Create a user');
};

module.exports = { getUsers, createUser };