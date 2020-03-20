const callBacks = [];
let elapsed = 0;

function tick(elapsed) {
    callBacks.forEach((call) => call(elapsed))
}

function subscribeToTick(call) {
    if (callBacks.lastIndexOf(call) === -1) {
        callBacks.push(call)
    }
}

function start() {
    setInterval(()=> tick(++elapsed) ,1000)
}

export const TickerService = {
    start,
    subscribeToTick
};