import {Branch} from "./Branch";

export class Repository
{
    constructor(name, dir) {
        this._name = name;
        this._dir = dir;
        this._timeSpend = 0;
        this._initialised = new Date();
        this._branches = [];
        this._deleted = 0;
    }

    delete(value) {
        this._isDeleted = value || new Date();
        return this;
    }

    isDeleted() {
        return this._deleted !== 0;
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

    getLatestCommit() {
        return this._latestCommit
    }

    setLatestCommit(commit) {
        this._latestCommit = commit;
        return this;
    }

    isActive() {
        return this._isActive;
    }

    setIsActive(value) {
        this._isActive = value;
        return this;
    }

    switchCurrentBranchByName(name) {
        let current = this.getCurrentBranch();
        current.setIsCurrent(false);
        this.getBranchByName(name).setIsCurrent(true);
        return this;
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
        return this;
    }

    getInitDate() {
        return new Date(this._initialised);
    }

    /**
     * Fill data to repo from serialized structure
     * @param data {Object}
     */
    fill(data) {
        this._initialised = data.initialised;
        this._latestCommit = data.latestCommit;
        this._isActive = data.isActive;
        this._timeSpend = data.timeSpend;
        this._deleted = data.deleted;
        this._branches = data.branches.map(part => Branch.unserialize(part));
        return this;
    }

    serialize() {
        return {
            initialised : this._initialised,
            latestCommit: this._latestCommit,
            isActive    : this._isActive,
            timeSpend   : this._timeSpend,
            name        : this._name,
            dir         : this._dir,
            deleted     : this._deleted,
            branches    : this._branches.map(branch => branch.serialize())
        }
    }

    /**
     * @param data {Object}
     */
    static unserialize(data) {
        return new Repository(data.name, data.dir).fill(data);
    }
}

