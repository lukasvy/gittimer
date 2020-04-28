module.exports = {
    readdirSync : () => [],
    readFileSync: () => [],
    existsSync  : () => true,
    lstatSync   : () => ({isDirectory: () => true}),
};
