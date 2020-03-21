const callBacks = [];
let elapsed = 0;
let startedAt;
let _isPaused = false;

function tick(elapsed) {
    if (_isPaused) {
        return;
    }
    callBacks.forEach((call) => call(elapsed))
}

function subscribeToTick(call) {
    if (callBacks.lastIndexOf(call) === -1) {
        callBacks.push(call)
    }
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
    subscribeToTick
};