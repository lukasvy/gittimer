export class Branch {
    constructor(name, current) {
        this._name = name;
        this._current = current;
    }

    getName() {
        return this._name;
    }

    isCurrent() {
        return this._current;
    }

    getTimeSpent() {
        return '';
    }

    getLastAccess() {
        return '';
    }
}