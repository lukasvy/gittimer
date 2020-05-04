import {Branch} from "./Branch";
import {Settings} from "@/services/SettingsService";
import {createCollection, promiseData} from "@/services/DbService";

export class Repository
{
    constructor(name, dir) {
        this._name = name;
        this._dir = dir;
        this._timeSpent = 0;
        this._initialised = new Date();
        this._deleted = 0;
        this._tempTime = 0;
        this._lastAccessed = undefined;
        this._isActive = false;
        this._currentBranch = undefined;
    }

    async init() {
        this._collection = await createCollection(this._dir);
        return this;
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

    /**
     * @param array
     * @returns {Promise<*>}
     */
    addBranches(array) {
        return this._collection.insert(
            array.map(part => Branch.unserialize(part).serialize()), {w: 1})
                   .then(() => this._collection.findOne({current: {$eq: true}})
                                         .then(current => this.switchCurrentBranchByName(current.name))
                   );
    }

    /**
     * @param data
     */
    async addBranch(data) {
        const branch = new Branch(data.name, data.current);
        if (branch.isCurrent())
        {
            if (this.getCurrentBranch())
            {
                const current = this.getCurrentBranch();
                await this._collection.update(
                    {name: current.getName()},
                    {$set: {current: true}},
                    {w: 1}
                );
            }
            this._currentBranch = branch.setIsCurrent(true);
        }
        await this._collection.update(
            {name: data.name},
            {
                ...Branch.unserialize(data).serialize(),
                current: true
            },
            {
                upsert: true,
                w     : 1
            });
    }

    /**
     * @param name
     * @returns {Promise<Branch>}
     */
    async getBranchByName(name) {
        return this._collection.findOne({name: name})
                   .then(data => Branch.unserialize(data));
    }

    /**
     *
     * @param query
     * @param opts
     * @returns {Promise<Array<Branch>>}
     */
    getBranchesCursor(query) {
        const sortedOpts = {sort: {lastAccessedSeconds: -1}};
        return this._collection.find(query, sortedOpts)
    }

    /**
     * @returns {Promise<Array<Branch>>}
     */
    async getBranches() {
        return new Promise((r, j) => {
            this._collection
                .find({})
                .toArray(promiseData(r, j))
        }).then(parts => parts.map(part => Branch.unserialize(part)));
    }

    /**
     * @returns {Promise<undefined>}
     */
    async cleanup() {
        return this._collection.remove({}, {w: 1});
    }

    /**
     * @returns {string}
     */
    getName() {
        return this._name;
    }

    /**
     * @returns {Branch}
     */
    getCurrentBranch() {
        return this._currentBranch;
    }

    getLatestCommit() {
        return this._latestCommit
    }

    /**
     * @param commit
     * @returns {Repository}
     */
    setLatestCommit(commit) {
        this._latestCommit = commit;
        return this;
    }

    isActive() {
        return this._isActive;
    }

    /**
     * @param value
     * @returns {Repository}
     */
    setIsActive(value) {
        this._isActive = value;
        return this;
    }

    /**
     * @param name
     * @returns {Repository}
     */
    async switchCurrentBranchByName(name) {
        console.log(name);
        const current = this.getCurrentBranch();
        const branch = await this.getBranchByName(name);
        if (branch)
        {
            branch.setIsCurrent(true);
            await this._collection.update({name: branch.getName()}, {$set: {current: true}}, {w: 1});
            if (current)
            {
                await this._collection.update({name: current.getName()}, {$set: {current: false}}, {w: 1});
            }
            this._currentBranch = branch;
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
        const current = this.getCurrentBranch();
        if (current)
        {
            current.fileChanged();
            this._collection.update({name: current.getName()}, current.serialize(), {w: 1}, (err, r) => {
                console.log(err, r);
            })
        }
    }

    getInitDate() {
        return new Date(this._initialised);
    }

    /**
     * Fill data to repo from serialized structure
     * @param data {Object}
     */
    async fill(data) {
        this._initialised = new Date(data.initialised);
        this._latestCommit = data.latestCommit;
        this._lastAccessed = data.lastAccessed ? new Date(data.lastAccessed) : undefined;
        this._isActive = data.isActive;
        this._timeSpent = data.timeSpent;
        this._deleted = data.deleted ? new Date(data.deleted) : undefined;
        await this._collection.findOne({current: true})
                  .then(async (part) => {
                      if (part)
                      {
                          await this.switchCurrentBranchByName(part.name);
                      }
                  });
        return this;
    }

    serialize() {
        return {
            initialised : this._initialised.toISOString(),
            latestCommit: this._latestCommit,
            lastAccessed: this._lastAccessed ? this._lastAccessed.toISOString() : undefined,
            isActive    : this._isActive,
            timeSpent   : this._timeSpent,
            name        : this._name,
            dir         : this._dir,
            deleted     : this._deleted ? this._deleted.toISOString() : undefined,
            // branches    : this._branches.map(branch => branch.serialize())
        }
    }

    /**
     * @param data {Object}
     */
    static async unserialize(data) {
        const repo = await new Repository(data.name, data.dir).init();
        return await repo.fill(data);
    }
}

