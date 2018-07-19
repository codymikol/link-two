"use strict";

const Sequelize = require('sequelize');
const url = process.env.DATABASE_URL || 'sqlite:test.sqlite';
const sequelize = new Sequelize(url, { logging: false });
const model = sequelize.define('storage', {
    key: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    value: {
        type: Sequelize.TEXT
    }
});

module.exports = {
    
    model: model,

    interface: {

        key: async function (index) {
            let result = await model.findAll({
                offset: parseInt(index) || 0,
                limit: 1
            });
            let item = result.shift();
            return item ? item.key : undefined;
        },

        get: async function (key) {
            let item = await model.findById(String(key));
            return item ? JSON.parse(item.value) : undefined;
        },

        set: async function (key, value) {
            value = JSON.stringify(value);
            let item = await model.findById(String(key));
            if (item) {
                item.value = value;
                await item.save();
            } else {
                await model.create({key: String(key), value: value});
            }
        },

        remove: async function(key) {
            await model.destroy({
                where: {
                    key: String(key)
                }
            });
        },

        clear: async function() {
            await model.destroy({
                truncate: true
            });
        },

        length: async function() {
            let count = await model.count();
            return count;
        }
    }
};