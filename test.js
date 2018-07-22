const storage = require('./lib/storage');
storage.init().then(() => {
    const interface = storage.interface;
    console.log(interface.size());
    interface.set('test', 'árvíztűrő tükörfúrógép').then(() => {
        console.log(interface.size());
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
