const Sequelize = require('sequelize');
const sequelize = new Sequelize('testDB', null, null, {
    dialect: "sqlite",
    storage: "./test.sqlite",
})

sequelize.authenticate().then(err => {
    console.log('Connection established.');
}, err => {
    console.log('Connection error: ', err);
});

const Storage = sequelize.define('storage', {
    key: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    value: {
        type: Sequelize.TEXT
    }
});

Storage.sync().then(() => {
    Storage.findById("test").then(item => {
        if (!item) {
            Storage.create({
                key: "test",
                value: "This is a test!"
            });
        }
    });
});