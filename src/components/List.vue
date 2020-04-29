<template>
    <div class="git-content">
        <div class="ui middle aligned divided list medium item-container">
            <div class="scrollable-content">
                <div class="item" v-for="branch in branchesList" :key="branch.getName()">
                    <i class="ui icon code branch padded-icon"></i>
                    <div class="content">
                        <div class="header text-overflow">
                            {{branch.getName()}}
                        </div>
                        <div class="time-spent" v-if="!branch.getFormattedTimeSpent()">
                            <small>No time recorder yet</small>
                        </div>
                        <div class="time-spent" v-if="branch.getFormattedTimeSpent()">
                            <small>
                                {{branch.getFormattedTimeSpent() ? 'Time spent : '+
                                branch.getFormattedTimeSpent() :
                                ''}}
                            </small> |
                            <small>
                                {{branch.getFormattedLastAccess() ? 'Last access : '+
                                branch.getFormattedLastAccess() : ''}}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {RepositoriesList} from "~/src/services/RepositoriesList";
    import {ListSearchService} from "~/src/services/ListSearchService";

    const {remote} = require('electron');

    export default {
        name   : "List",
        data   : function () {
            return {
                branchesList: [],
                search      : []
            }
        },
        methods: {
            setBranchesList() {
                this.branchesList =
                    this.activeRepo
                        .getBranches()
                        .filter(part =>
                                    !part.isCurrent() &&
                                    ListSearchService.itemPassesFilter(part.getName()))
                        .sort((a, b) => {
                            if (!b.getLastAccess() && a.getLastAccess())
                            {
                                return -1;
                            }
                            return a.getLastAccess() > b.getLastAccess() ? -1 : 1;
                        });
            },
            activateRepo() {
                this.activeRepo = RepositoriesList.getActiveRepo();
                if (!this.activeRepo)
                {
                    return this.$router.push('nothing');
                }
                this.setBranchesList();

            }
        },
        watch  : {
            '$route': 'activateRepo'
        },
        created() {
            ListSearchService.clear();
            this.removeOnSwitch = RepositoriesList.onSwitchBranch(this.activateRepo);
            this.removeOnDataRefresh = RepositoriesList.onDataRefresh(this.activateRepo);
            this.searchSubRemove = ListSearchService.onChange(() => this.setBranchesList());
            this.activateRepo();
        },
        destroyed() {
            if (this.window)
            {
                this.window.removeEventListener('keyup', this.listenToKeys);
            }
            this.removeOnDataRefresh ?  this.removeOnDataRefresh() : undefined;
            this.removeOnSwitch ?  this.removeOnSwitch() : undefined;
            this.searchSubRemove ? this.searchSubRemove() : undefined;
        }
    }
</script>

<style>
    .item-container {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .text-overflow {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .item {
        display: flex;
        flex-direction: row;
        align-items: center;
        border-bottom: 1px solid #e2e0e0;
        width: 100%;
        padding: 5px 10px;
    }

    .content {
        display: flex;
        flex-direction: column;
        width: 90%;
        display: flex;
        flex-direction: column;
        width: 90%;
        line-height: 18px;
        padding-left: 6px;
    }

    i.padded-icon {
        /*padding-top: 5px;*/
        margin-top: -7px !important;
        font-size: 1.2em !important;
    }

    .git-content {
        background-color: #f4f4f4;
        border-bottom: 1px solid #e8e8e8;
        overflow-y: overlay;
        flex: 1 1 auto;
        height: 100%;
        padding-top: 5px;
        padding-bottom: 5px;
    }

    .time-spent {
        font-size: 0.8em;
    }
</style>