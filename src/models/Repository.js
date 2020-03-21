import {Branch} from "./Branch";

export class Repository
{
    constructor(name, active, dir) {
        this._name = name;
        this._dir = dir;
        this._timeSpend = 0;
        this._initialised = new Date();
        this._branches = [];
        this._isActive = active;
        this._checkRepoEverySeconds = 30;
    }

    getDir() {
        return this._dir;
    }

    addBranch(data) {
        this._branches.push(new Branch(data.name, data.current));
    }

    getBranchByName(name) {
        return this._branches.find(branch => branch.getName() === name);
    }

    getBranches() {
        return this._branches
    }

    getName() {
        return this._name;
    }

    getCurrentBranch() {
        return this._branches.find((branch) => branch.isCurrent());
    }

    isActive( ) {
        return this._isActive;
    }

    switchCurrentBranchByName(name) {
        let current = this.getCurrentBranch();
        current.setIsCurrent(false);
        this.getBranchByName(name).setIsCurrent(true);
    }

    tick() {
        this._timeSpend++;
        try
        {
            this.getCurrentBranch().tick();
        } catch (e)
        {
            console.log(e);
        }
    }

    getInitDate() {
        return new Date(this._initialised);
    }
}

