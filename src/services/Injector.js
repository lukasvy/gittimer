const {Subscription} = require("~/src/services/Observable");
const replacementSubscriptions = Subscription();

const $inject = {};
$inject.inject = (name, requiredModule) => {
    if ($inject._replacements && $inject._replacements[name]) {
        return $inject._replacements[name];
    }
    return requiredModule;
};
$inject.replace = function (name, by, note) {
    if (!$inject._replacements)
    {
        $inject._replacements = {};
    }
    $inject._replacements[name] = by;
    replacementSubscriptions.trigger(name, $inject._replacements[name]);
    return $inject;
};
$inject.revert = function (name) {
    if ($inject._replacements && $inject._replacements[name])
    {
        delete $inject._replacements[name];
        replacementSubscriptions.trigger(name, undefined);
    }
    return $inject;
};
$inject.subscribe = replacementSubscriptions.subscribe;
module.exports = $inject;