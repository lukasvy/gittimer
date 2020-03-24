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
        console.log(value, this._deleted !== 0);
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

    setTimeSpent(value) {
        this._timeSpend = value;
        return this;
    }

    setInitialised(value) {
        this._initialised = value;
        return this;
    }

    setBranches(data) {
        this._branches = data.map(part => Branch.unserialize(part));
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

    static unserialize(data) {
        return new Repository(data.name, data.dir)
            .setLatestCommit(data.latestCommit)
            .setIsActive(data.isActive)
            .setTimeSpent(data.timeSpent)
            .setLatestCommit(data.latestCommit)
            .setBranches(data.branches)
            .setInitialised(data.initialised)
            .delete(data.deleted)
    }
}

