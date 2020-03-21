import {humanReadableSeconds} from '~/src/services/DateTimeService';

export class Branch {
    constructor(name, current) {
        this._name = name;
        this._current = current;
        this._timeSpent = 0;
    }

    getName() {
        return this._name;
    }

    isCurrent() {
        return this._current;
    }

    tick() {
        this._timeSpent++;
    }

    getTimeSpent() {
        return humanReadableSeconds(this._timeSpent, true);
    }

    getLastAccess() {
        return '';
    }
}