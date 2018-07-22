"use strict";

let SIZE = 0;
const LIMIT = 13312;
const url = process.env.DATABASE_URL || 'sqlite:test.sqlite';
const Sequelize = require('sequelize');
const sequelize = new Sequelize(url, { logging: false });
const Storage = sequelize.define('storage', {
    key: {
        type: Sequelize.STRING(LIMIT),
        primaryKey: true
    },
    value: {
        type: Sequelize.STRING(LIMIT)
    },
    size: {
        type: Sequelize.INTEGER
    }
});

module.exports = {

    init: async () => {
        await sequelize.authenticate();
        await Storage.sync();
        SIZE = await Storage.sum('size') || 0;
    },

    interface: {

        key: async (index) => {
            let result = await Storage.findAll({
                offset: parseInt(index) || 0,
                limit: 1
            });
            let item = result.shift();
            return item ? item.key : undefined;
        },

        get: async (key) => {
            key = String(key);
            let item = await Storage.findById(key);
            return item ? item.value : undefined;
        },

        set: async (key, value) => {
            key = String(key);
            value = String(value);
            let length = Buffer.byteLength(key + value, 'utf8');
            let item = await Storage.findById(String(key));
            if (item && length - item.size + SIZE <= LIMIT) {
                SIZE += length - item.size;
                item.value = value;
                item.size = length;
                await item.save();
                return true;
            }
            if (!item && length + SIZE <= LIMIT) {
                SIZE += length;
                await Storage.create({
                    key: String(key),
                    value: value,
                    size: length
                });
                return true;
            }
            return false;
        },

        remove: async (key) => {
            await Storage.destroy({
                where: {
                    key: String(key)
                }
            });
        },

        clear: async () => {
            await Storage.destroy({
                truncate: true
            });
        },

        length: async () => {
            let count = await Storage.count();
            return count;
        },

        size: () => {
            return SIZE;
        }
    }
};