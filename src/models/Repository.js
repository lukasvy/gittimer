import {Branch} from "./Branch";

export class Repository
{
    constructor(name, active) {
        this._name = name;
        this._timeSpend = 0;
        this._initialised = new Date();
        this._branches = [];
        this._isActive = active;
    }

    addBranch(data) {
        this._branches.push(new Branch(data.name, data.current));
    }

    getBranches() {
        return this._branches
    }

    getName() {
        return this._name;
    }

    isActive( ) {
        return this._isActive;
    }

    tick() {
        this._timeSpend++;
    }

    getInitDate() {
        return new Date(this._initialised);
    }
}

