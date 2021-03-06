const config = require('dbConfig.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../_helpers/MySQLDB');

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    updateTotalPoints,
    delete: _delete
};

async function authenticate({ userName, password }) {
    const user = await db.User.scope('withHash').findOne({ where: { userName } });

    if (!user || !(await bcrypt.compare(password, user.passHash)))
        throw 'Username or password is incorrect';

    // authentication successful
    const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '2d' });
    return { ...omitHash(user.get()), token };
}

async function getAll() {
    return await db.User.findAll();
}

async function getById(id) {
    return await getUser(id);
}

async function create(params) {
    // validate
    if (await db.User.findOne({ where: { userName: params.userName } })) {
        throw 'Username "' + params.userName + '" is already taken';
    }

    // hash password
    if (!params.password) {
        throw 'Password required!';
    }
    else {
        params.passHash = await bcrypt.hash(params.password, 12);
    }

    // save user
    await db.User.create(params);
}

async function update(id, params) {
    const user = await getUser(id);

    // validate
    const usernameChanged = params.userName && user.userName !== params.userName;
    if (usernameChanged && await db.User.findOne({ where: { userName: params.userName } })) {
        throw 'Username "' + params.userName + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.passHash = await bcrypt.hash(params.password, 10);
    }

    // copy params to user and save
    Object.assign(user, params);
    await user.save();

    return omitHash(user.get());
}

async function updateTotalPoints(id, params) {
    const user = await getUser(id);

    if (params.totalPoints !== user.totalPoints) {
        await db.User.update(params, { where: { id: id } });
        const user = await db.User.findOne({ where: { id: id } });
        return user.get();
    }
    else {
        return { message: 'Points do not need to be updated' };
    }
}

async function _delete(id) {
    const user = await getUser(id);
    await user.destroy();
}

// helper functions

async function getUser(id) {
    const user = await db.User.findByPk(id);
    if (!user) throw 'User not found';
    return user;
}

function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}