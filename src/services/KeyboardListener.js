import {Subscription} from "~/src/services/Observable";

const {subscribe, trigger} = Subscription();

if (typeof document !== 'undefined')
{
    document.addEventListener("keyup", trigger);
}

export const KeyboardListener = {
    listen: subscribe
};