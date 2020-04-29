import {Branch} from "./Branch";
import {Settings} from "@/services/SettingsService";

export class Repository
{
    constructor(name, dir) {
        this._name = name;
        this._dir = dir;
        this._timeSpent = 0;
        this._initialised = new Date();
        this._branches = [];
        this._deleted = 0;
        this._tempTime = 0;
        this._lastAccessed = undefined;
        this._isActive = false;
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
        if (data.current && this.getCurrentBranch())
        {
            this.getCurrentBranch().setIsCurrent(false);
        }
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
        if (this.getBranchByName(name))
        {
            if (current)
            {
                current.setIsCurrent(false);
            }
            this.getBranchByName(name).setIsCurrent(true);
        }
        return this;
    }

    getTimeSpent() {
        return this._timeSpent + this._tempTime;
    }

    tick() {
        if (++this._tempTime >= Settings.inactivityTimeInSeconds)
        {
            this._tempTime = 0;
        }
        try
        {
            if (this.getCurrentBranch())
            {
                this.getCurrentBranch().tick();
            }
        } catch (e)
        {
            console.log(e);
        }
        return this;
    }

    getLastAccess() {
        return this._lastAccessed;
    }

    fileChanged() {
        this._timeSpent += this._tempTime;
        this._tempTime = 0;
        this._lastAccessed = new Date();
        if (this.getCurrentBranch())
        {
            this.getCurrentBranch().fileChanged();
        }
    }

    getInitDate() {
        return new Date(this._initialised);
    }

    /**
     * Fill data to repo from serialized structure
     * @param data {Object}
     */
    fill(data) {
        this._initialised = new Date(data.initialised);
        this._latestCommit = data.latestCommit ? new Date(data.latestCommit) : undefined;
        this._lastAccessed = data.lastAccessed ? new Date(data.lastAccessed) : undefined;
        this._isActive = data.isActive;
        this._timeSpent = data.timeSpent;
        this._deleted = data.deleted ? new Date(data.deleted) : undefined;
        this._branches = data.branches.map(part => Branch.unserialize(part));
        return this;
    }

    serialize() {
        return {
            initialised : this._initialised.toJSON(),
            latestCommit: this._latestCommit ? this._latestCommit.toJSON() : undefined,
            lastAccessed: this._lastAccessed ? this._lastAccessed.toJSON() : undefined,
            isActive    : this._isActive,
            timeSpent   : this._timeSpent,
            name        : this._name,
            dir         : this._dir,
            deleted     : this._deleted ? this._deleted.toJSON() : undefined,
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

