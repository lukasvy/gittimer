import {Subscription} from "~/src/services/Observable";
import {KeyboardListener} from "~/src/services/KeyboardListener";
import {RepositoriesList} from "@/services/RepositoriesList";
import {AppService} from "@/services/AppService";
import _ from 'lodash';

let search = [];
const change = Subscription();
const reloadChange = Subscription();
const clearFinished = Subscription();

reloadChange.trigger = _.debounce(reloadChange.trigger, 500);


RepositoriesList.onDataRefresh(clear);

// AppService.inProgress(clear);

const listener = (event) => {
    // if (AppService.isInProgress()) {
    //     return;
    // }
    reloadChange.trigger.cancel();
    if (event.key === 'Backspace')
    {
        search.pop();
        reloadChange.trigger(search.join(''));
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
        reloadChange.trigger(search.join(''));
        change.trigger(search.join(''));
    }
};

KeyboardListener.listen(listener);


export const ListSearchService =
                 {
                     onChange       : change.subscribe,
                     onReloadChange : reloadChange.subscribe,
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
    if (!regex)
    {
        return true;
    }
    return !!name.match(getSearchReg());
}

/**
 * @returns {String}
 */
function getSearchReg() {
    if (!search.length)
    {
        return undefined;
    }
    return search.join('');
}

function clear() {
    search = [];
    change.trigger('');
    reloadChange.trigger('');
}

