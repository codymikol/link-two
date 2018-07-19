const storage = require('./lib/storage');
Promise.all([
    storage.model.sequelize.authenticate(),
    storage.model.sync(),
]).then(() => {
    const interface = storage.interface;
    interface.set('test', {test: 'ok'}).then(() => {
        return interface.get('test');
    }).then(value => {
        console.log(value);
        return interface.key(0);
    }).then(key => {
        console.log(key);
        return interface.length();
    }).then(lenght => {
        console.log(lenght);
        interface.clear();
    });
});
