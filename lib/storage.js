"use strict";

const Sequelize = require('sequelize');
const LIMIT = 13312;
let SIZE = 0;
let Storage;

module.exports = {

    init: async (url) => {
        const sequelize = new Sequelize(url, { logging: false, operatorsAliases: false });
        await sequelize.authenticate();
        Storage = sequelize.define('storage', {
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
        await Storage.sync();
        SIZE = await Storage.sum('size') || 0;
    },

    interface: {

        key: async (index) => {
            let result = await Storage.findAll({
                order: [['key', 'ASC']],
                offset: parseInt(index) || 0,
                limit: 1
            });
            let item = result.shift();
            return item ? item.key : undefined;
        },

        get: async (key, defaultValue, json = true) => {
            key = String(key);
            let item = await Storage.findById(key);
            let value = defaultValue;
            if (item) {
                try {
                    value = json ? JSON.parse(item.value) : item.value;
                } catch(e) {
                }
            }
            return value;
        },

        set: async (key, value, json = true) => {
            key = String(key);
            value = json ? JSON.stringify(value) : String(value);
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
            key = String(key);
            let item = await Storage.findById(key);
            if (item) {
                SIZE -= item.size;
                await item.destroy();
            }
        },

        clear: async () => {
            await Storage.destroy({
                truncate: true
            });
            SIZE = 0;
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