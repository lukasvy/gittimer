import {Subscription} from "~/src/services/Observable";

let elapsed = 0;
let startedAt;
let _isPaused = false;

const sub = Subscription();

function tick(elapsed) {
    if (_isPaused) {
        return;
    }
    sub.trigger(elapsed);
}

function pause() {
    _isPaused = true;
}

function resume() {
    _isPaused = false;
}

function start() {
    if (startedAt) {
        return resume();
    }
    startedAt = new Date();
    setInterval(()=> tick(++elapsed) ,1000)
}

export const TickerService = {
    start,
    pause,
    subscribeToTick : sub.subscribe
};