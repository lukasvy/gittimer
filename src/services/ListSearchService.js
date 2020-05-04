import {Subscription} from "~/src/services/Observable";
import {KeyboardListener} from "~/src/services/KeyboardListener";
import {RepositoriesList} from "@/services/RepositoriesList";

let search = [];
const change = Subscription();
const clearFinished = Subscription();

RepositoriesList.onDataRefresh(clear);

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
                     getSearchReg,
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
    const regex = getSearchReg();
    if (!regex) {
        return true;
    }
    return !!name.match(getSearchReg());
}

/**
 * @returns {RegExp|undefined}
 */
function getSearchReg () {
    if (!search.length) {
        return undefined;
    }
    return search.join('');
}

function clear() {
    search = [];
    change.trigger('');
}

