let _data = {};
module.exports = class Store{
    get(name){
        return _data[name];
    }
    set(name, data){
        _data[name] = data;
    }
};