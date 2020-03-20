<template>
    <div>
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
                <div class="item" style="float:right; font-size: 2em; font:bold;">
                    {{activeBranch.getTimeSpent() ? activeBranch.getTimeSpent() : ''}}
                </div>
            </div>
            <div class="ui attached middle aligned divided list huge">
                <div class="item" v-for="branch in branchesList" :key="branch.getName()">
                    <i class="ui icon code branch padded-icon"></i>
                    <div class="content">
                        <div class="header">{{branch.getName()}}</div>
                        <template v-if="branch.getTimeSpent()">
                            <small>
                                {{branch.getTimeSpent() ? 'Time spent : '+ branch.getTimeSpent() : ''}}
                            </small> |
                            <small>
                                {{branch.getLastAccess() ? 'Last access : '+ branch.getLastAccess() : ''}}
                            </small>
                        </template>
                        <template v-if="!branch.getTimeSpent()">
                            <small>no time recorder yet</small>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {RepositoriesList} from "../services/RepositoriesList";
    import {find} from 'underscore'

    export default {
        name: "ActiveList",
        data: function () {
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
                this.branchesList = this.activeRepo.getBranches().filter(part => !part.isCurrent());
            }
        },
        created() {
            this.repoList = RepositoriesList.get();
            this.activateRepo();
        }
    }
</script>

<style scoped>
    i.padded-icon {
        padding: 10px !important;
    }
</style>