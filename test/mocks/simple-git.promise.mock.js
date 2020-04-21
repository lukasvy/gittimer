const git = {
    log   : () => git.log   ,
    status: () => git.status,
    branch: () => git.branch,
    raw   : () => git.raw   ,
};
const defaultGit = {
    defaultValues : git
};
module.exports = function (dir, stub) {
    if (stub) {
        defaultGit.defaultValues = stub;
    }
    return defaultGit.defaultValues;
};