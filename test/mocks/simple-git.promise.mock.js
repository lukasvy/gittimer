const git = {
    log   : () => git.log,
    status: () => git.status,
    branch: () => git.branch,
    raw   : () => git.raw,
};
const defaultGit = {
    defaultValues: git
};
let defaultGitFunct = function (dir) {
    return defaultGit.defaultValues;
};
module.exports = defaultGitFunct;