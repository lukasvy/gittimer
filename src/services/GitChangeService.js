import {Subscription} from "~/src/services/Observable";
import {TickerService} from "~/src/services/TickerService";

const asmCrypto = require('asmcrypto-lite');
const $injector = require('~/src/services/Injector');
const git = $injector.inject('simple-git/promise', require('simple-git/promise'));

const subscriptions = {};

let tickerTime = 0;
TickerService.subscribeToTick(() => {
    if (tickerTime++ > 10)
    {
        tickerTime = 0;
        Object.keys(subscriptions).forEach((key) => {
            check(subscriptions[key]);
        });
    }
});

/**
 * @param sub
 */
async function check(sub) {
    return git(sub.dir)
        .diff()
        .then((diffText) => {
            // use encrypted text
            const changedText = asmCrypto.SHA256.hex(diffText);
            if (!sub.diff) {
                sub.diff = changedText
            } else {
                if (sub.diff !== changedText) {
                    sub.diff = changedText;
                    sub.trigger();
                }
            }
        });
}

/**
 * @param dir
 * @param callBack
 * @returns {(function(...[*]=))|Promise<PushSubscription>}
 */
function subscribe(dir, callBack) {
    if (!subscriptions[dir])
    {
        const newSub = Subscription();
        subscriptions[dir] = {
            trigger   : newSub.trigger,
            subscribe : newSub.subscribe,
            dir       : dir,
            lastUpdate: new Date(),
        };
    }
    return subscriptions[dir].subscribe(callBack);
}

export const GitChangeService = {
    subscribe: subscribe
};