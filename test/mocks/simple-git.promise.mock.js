module.exports = function (dir) {
    return {
        log   : () => Promise.resolve(true),
        status: () => Promise.resolve(true),
        branch: () => Promise.resolve(true),
        raw   : () => Promise.resolve(true),
        diff  : () => Promise.resolve('test'),
    };
};;