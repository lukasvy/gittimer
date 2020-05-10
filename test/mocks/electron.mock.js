module.exports = {
    remote: {
        dialog          : () => null,
        getCurrentWindow: () => null,
        app             : {
            getAppPath: () => __dirname
        }
    }
};