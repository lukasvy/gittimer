import {Subscription} from "~/src/services/Observable";
import {KeyboardListener} from "~/src/services/KeyboardListener";

let search = [];
const change = Subscription();
const clearFinished = Subscription();

KeyboardListener.listen(event => {
    if (event.key === 'Backspace')
    {
        search.pop();
        change.trigger(search.join(''));
    } else if (event.key === 'Escape')
    {
        if (getText())
        {
            clear();
        } else
        {
            clear();
            clearFinished.trigger();
        }

    } else if (event.key.match(/^[a-z0-9\/\.\\_-]$/i))
    {
        search.push(event.key);
        change.trigger(search.join(''));
    }
});


export const ListSearchService =
                 {
                     onChange       : change.subscribe,
                     clear,
                     onClearFinished: clearFinished.subscribe,
                     getText,
                     itemPassesFilter
                 };

function getText() {
    return [...search].join('');
}

/**
 *
 * @param {String} name
 * @return boolean
 */
function itemPassesFilter(name) {
    if (!search.length)
    {
        return true;
    }
    return !!name.match(
        RegExp(search.join('').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    return !!search.join('').match(
        RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
}

function clear() {
    search = [];
    change.trigger('');
}

