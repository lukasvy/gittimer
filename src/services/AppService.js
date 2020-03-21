import {TickerService} from "./TickerService";

/**
 *
 */
function stop()
{
    TickerService.pause();
}


function restart()
{
    TickerService.start();
}

/**
 * @param electronApp
 * @param window
 */
function start(electronApp, window)
{
    TickerService.start();
}

export const AppService = {
    start,
    stop
};