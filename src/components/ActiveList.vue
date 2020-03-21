<template>
    <div class="root-container">
        <div class="ui top attached tabular menu">
            <div
                    class="item"
                    :class="{active: repo.isActive()}"
                    v-for="repo in repoList">
                {{repo.getName()}}
            </div>
            <div class="item">(Add new ...)</div>
        </div>
        <div class="ui bottom attached active tab segment">
            <div class="ui success icon message" v-if="activeBranch">
                <i class="play icon"></i>
                <div class="content">
                    <div class="header">
                        {{activeBranch.getName()}}
                    </div>
                </div>
                <div class="time-spent" style="float:right; font-size: 20px; font:bold;">
                    {{activeBranch.getFormattedTimeSpent() ? activeBranch.getFormattedTimeSpent() : ''}}
                </div>
            </div>
            <div class="ui attached middle aligned divided list huge item-container">
                <div class="scrollable-content">
                    <div class="item" v-for="branch in branchesList" :key="branch.getName()">
                        <i class="ui icon code branch padded-icon"></i>
                        <div class="content">
                            <div class="header text-overflow">{{branch.getName()}}</div>
                            <template v-if="branch.getFormattedTimeSpent()">
                                <div class="time-spent">
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
                            </template>
                            <template v-if="!branch.getTimeSpent()">
                                <small>no time recorder yet</small>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {RepositoriesList} from "../services/RepositoriesList";

    export default {
        name   : "ActiveList",
        data   : function () {
            return {
                repoList    : [],
                activeRepo  : null,
                activeBranch: null,
                branchesList: []
            }
        },
        methods: {
            activateRepo() {
                this.activeRepo = this.repoList.find(part => part.isActive());
                this.activeBranch = this.activeRepo.getBranches().find(part => part.isCurrent());
                this.branchesList = this.activeRepo.getBranches().filter(part => !part.isCurrent())
                                        .sort((a, b) => {
                                            if (!b.getLastAccess() && a.getLastAccess())
                                            {
                                                return -1;
                                            }
                                            return a.getLastAccess() > b.getLastAccess() ? -1 : 1;
                                        });
            }
        },
        created() {
            RepositoriesList.subscribe('switchBranch', this.activateRepo);
            this.repoList = RepositoriesList.get();
            this.activateRepo();
        },
        destroyed() {
            RepositoriesList.unsubscribe('switchBranch', this.activateRepo);
        }
    }
</script>

<style scoped>
    i.padded-icon {
        padding: 10px !important;
    }

    .time-spent {
        font-size: 15px;
    }

    .header {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .segment {
        display: flex !important;
        flex-direction: column;
        height: calc(100% - 80px);
    }

    .root-container {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

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

    .scrollable-content {
        flex: 1 1 auto;
        overflow-y: scroll;
    }

    .scrollable-content {
        overflow-y: scroll;
        flex: 1 1 auto;
        min-width: 200px;
        height: 100px;
    }

    .item {
        display: flex;
        flex-direction: row;
        padding-top: 15px;
    }

    .content {
        padding-left: 20px;
        min-width: 0px;
        line-height: 1.2em;
    }
</style>