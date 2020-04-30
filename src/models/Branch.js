import {humanReadableSeconds} from '~/src/services/DateTimeService';
import * as moment from 'moment';
import {Settings} from "@/services/SettingsService";

export class Branch
{
    constructor(name, current) {
        this._name = name;
        this._current = current;
        this._timeSpent = 0;
        this._lastAccessed = undefined;
        this._tempTime = 0;
    }

    getName() {
        return this._name;
    }

    setIsCurrent(value) {
        if (value)
        {
            this._current = true;
        } else
        {
            this._tempTime = 0;
            this._lastAccessed = new Date();
            this._current = false;
        }
    }

    isCurrent() {
        return this._current;
    }

    tick() {
        if (++this._tempTime >= Settings.inactivityTimeInSeconds)
        {
            this._tempTime = 0;
        }
    }

    getTimeSpent() {
        return this._timeSpent + this._tempTime;
    }

    getFormattedTimeSpent() {
        return humanReadableSeconds(this.getTimeSpent(), true);
    }

    getLastAccess() {
        return this._lastAccessed;
    }

    getFormattedLastAccess() {
        return this._lastAccessed ? moment(this._lastAccessed).format('YYYY-MM-DD HH:mm:ss') : '';
    }

    fileChanged() {
        this._lastAccessed = new Date();
        this._timeSpent += this._tempTime;
        this._tempTime = 0;
    }

    serialize() {
        return {
            timeSpent   : this._timeSpent,
            lastAccessed: this._lastAccessed ? this._lastAccessed.toJSON() : undefined,
            current     : this._current,
            name        : this._name
        }

    }

    /**
     * @param data {Object}
     */
    fill(data) {
        this._timeSpent = data.timeSpent;
        this._lastAccessed = new Date(data.lastAccessed);
        return this;
    }

    /**
     * @param data
     * @return {*}
     */
    static unserialize(data) {
        return new Branch(data.name, data.current).fill(data);
    }
}