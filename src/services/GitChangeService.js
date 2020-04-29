import {Subscription} from "~/src/services/Observable";
import {TickerService} from "~/src/services/TickerService";
import {Settings} from "~/src/services/SettingsService";
import sha256 from 'crypto-js/sha256';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import Base64 from 'crypto-js/enc-base64';
const $injector = require('~/src/services/Injector');
const originalGit = require('simple-git/promise');
const git = (dir) => {
    return $injector.inject('simple-git/promise', originalGit)(dir);
};

const subscriptions = {};

let tickerTime = 1;
TickerService.subscribeToTick(() => {
    if (++tickerTime >= Settings.gitDiffCheckInSeconds)
    {
        tickerTime = 1;
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
        .then(async (diffText) => {
            // use encrypted text
            const hashDigest = sha256(diffText);
            const privateKey = '123';
            const changedText = Base64.stringify(hmacSHA512(hashDigest, privateKey));
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
    subscribe: subscribe,
    reset : () => tickerTime = 1
};