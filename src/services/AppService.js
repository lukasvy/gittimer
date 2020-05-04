import {TickerService} from "./TickerService";
import {DialogService} from "./DialogService";
import {ListSearchService} from "~/src/services/ListSearchService";
import {FileWatchService} from "~/src/services/FileWatchService";

const subscriptions = {
    'onBeforeHide': []
};

let window;

ListSearchService.onClearFinished(hide);

/**
 *
 */
function stop() {
    TickerService.pause();
    FileWatchService.pause();
}


function restart() {
    TickerService.start();
    FileWatchService.start();
}

/**
 * @param w window
 */
function start(w) {
    if (w)
    {
        window = w;
    }
    TickerService.start();
    FileWatchService.start();
}

/**
 *
 * @return {Promise}
 */
function hide() {
    if (DialogService.isOpened()) {
        return Promise.resolve();
    }
    if (!subscriptions['onBeforeHide'].length)
    {
        return Promise.resolve(window.hide());
    }
    return Promise.all(subscriptions['onBeforeHide'].map(p => p()))
                  .then(window.hide);
}

/**
 *
 * @param {Function<Promise>} call
 */
function onBeforeHide(call) {
    if (subscriptions['onBeforeHide'].lastIndexOf(call) < 0)
    {
        subscriptions['onBeforeHide'].push(call)
    }
}

export const AppService = {
    start,
    hide,
    onBeforeHide,
    stop
};