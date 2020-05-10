module.exports = {
    readdirSync : () => [],
    readFileSync: () => [],
    existsSync  : () => true,
    openSync    : () => undefined,
    closeSync   : () => undefined,
    lstatSync   : () => ({isDirectory: () => true}),
};
