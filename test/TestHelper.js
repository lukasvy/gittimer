const sinon = require("sinon");
const sandbox = sinon.createSandbox();
const clock = sandbox.useFakeTimers(new Date('2020-12-12T11:11:11'));
const keyboard = require('~/src/services/Observable').Subscription();

global.document = {addEventListener: (event, sub) => keyboard.subscribe(sub)};

export const utils = {
    sandbox,
    clock,
    keyboard: keyboard.trigger,
    git     : {
        log   : () => Promise.resolve(),
        status: () => Promise.resolve(),
        branch: () => Promise.resolve(),
        raw   : () => Promise.resolve(),
    }
};