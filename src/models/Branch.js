import {humanReadableSeconds} from '~/src/services/DateTimeService';
import * as moment from 'moment';

export class Branch
{
    constructor(name, current) {
        this._name = name;
        this._current = current;
        this._timeSpent = 0;
        this._lastAccessed = undefined;
    }

    getName() {
        return this._name;
    }

    setLastAccessed(value) {
        this._lastAccessed = value;
        return this;
    }

    setTimeSpent(value) {
        this._timeSpent = value;
        return this;
    }

    setIsCurrent(value) {
        if (value)
        {
            this._current = true;
        } else
        {
            this._lastAccessed = new Date();
            this._current = false;
        }
    }

    isCurrent() {
        return this._current;
    }

    tick() {
        this._timeSpent++;
    }

    getTimeSpent() {
        return this._timeSpent;
    }

    getFormattedTimeSpent() {
        return humanReadableSeconds(this._timeSpent, true);
    }

    getLastAccess() {
        return this._lastAccessed;
    }

    getFormattedLastAccess() {
        return this._lastAccessed ? moment(this._lastAccessed).format('YYYY-MM-DD HH:mm:ss') : '';
    }

    serialize() {
        return {
            timeSpent   : this._timeSpent,
            lastAccessed: this._lastAccessed,
            current     : this._current,
            name        : this._name
        }
    }

    static unserialize(data) {
        return new Branch(data.name, data.current)
            .setLastAccessed(data.lastAccessed)
            .setTimeSpent(data.timeSpent)
    }
}