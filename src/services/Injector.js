const $inject = function (name) {
    if (!$inject._replacements)
    {
        $inject._replacements = {};
    }
    if ($inject._replacements[name])
    {
        return $inject._replacements[name];
    }

    return process.env.NODE_ENV.match(/test/) ?
           require('~/test/mocks/' +
                   name.replace(/[^a-zA-Z0-9\._-]/g, '.')
                   + '.mock') : require(name)
};
$inject.replace = function (name, by) {
    if (!$inject._replacements)
    {
        $inject._replacements = {};
    }
    $inject._replacements[name] = by;
    return $inject;
};
$inject.revert = function (name) {
    if ($inject._replacements[name])
    {
        delete $inject._replacements[name];
    }
    return $inject;
};
module.exports = $inject;