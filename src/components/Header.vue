<template>
    <div class="git-header">
        <div class="git-header-controll">
            <div class="scroll-repo-left">
            </div>
            <div class="git-header-name">
                {{activeRepo ? activeRepo.getName() : 'Git Timer'}}
            </div>
            <div class="scroll-repo-right" @click.prevent="hideWindow">
                <i class="close icon" style="padding-left: 12px;"></i>
            </div>
        </div>
        <collapse-transition :delay="400">
            <div class="git-header-counter" v-show="activeRepo">
                <div class="git-header-counter-icon">
                    <i class="ui icon play circle padded-icon"></i>
                </div>

                <div class="git-header-text-overflow">
                    {{activeBranch ? activeBranch.getName() : ''}}
                </div>
                <div class="git-header-countdown">
                    {{activeBranch && activeBranch.getFormattedTimeSpent() ? activeBranch.getFormattedTimeSpent() : ''}}
                </div>
                <div class="git-search-list" v-if="activeRepo && activeSearch">
                    Search: {{activeSearch}}
                </div>
            </div>
        </collapse-transition>
    </div>
</template>

<script>
    import {RepositoriesList} from "~/src/services/RepositoriesList";
    import {CollapseTransition} from 'vue2-transitions';
    import {AppService} from "~/src/services/AppService";
    import {ListSearchService} from "~/src/services/ListSearchService";

    export default {
        name      : "Header",
        data      : function () {
            return {
                activeRepo  : undefined,
                activeBranch: undefined,
                activeSearch: ''
            }
        },
        components: {
            CollapseTransition
        },
        methods   : {
            activateRepo() {
                this.activeRepo = RepositoriesList.getActiveRepo();
                this.activeBranch = RepositoriesList.getActiveBranch();
            },
            hideWindow() {
                AppService.hide();
            }
        },
        watch     : {
            '$route': 'activateRepo'
        },
        created() {
            this.removeOnSwitch = RepositoriesList.onSwitchBranch(this.activateRepo);
            this.removeOnSwitch = RepositoriesList.onDataRefresh(this.activateRepo);
            this.searchSubRemove = ListSearchService.onChange(
                () => this.activeSearch = ListSearchService.getText());
            this.activateRepo();
        },
        destroyed() {
            this.removeOnSwitch ?  this.removeOnSwitch() : undefined;
            this.searchSubRemove ? this.searchSubRemove() : undefined;
        }
    }
</script>

<style>
    .git-header {
        padding: 5px 10px 5px 10px;
        display: flex;
        border-bottom: 1px solid #dbdada;
        flex-direction: column;
        background-image: linear-gradient(to top, #E6E6E6 8%, #F2F2F2 100%);
        box-shadow: 0px 0px 8px 0px #d0d0d0;
        z-index: 10;
    }

    .git-header-controll {
        display: flex;
        flex-direction: row;
        padding: 5px;
    }

    .git-header-name {
        font-family: arial;
        font-size: 14px;
        flex-grow: 2;
        text-align: center;

    }

    .git-header-counter {
        border-top: 1px solid #dddddd;
        padding-bottom: 5px;
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .git-header-text-overflow {
        padding-top: 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 3;
        padding-left: 2px;
    }

    .git-header-counter-icon {
        max-width: 35px;
        margin-left: -5px;
        padding-left: 4px;
        padding-top: 10px;
        padding-right: 5px;
    }

    i.padded-icon {
        font-size: 1.2em !important;
    }

    .git-header-countdown {
        flex: 1px;
        padding-top: 10px;
        text-align: right;
    }

    .git-search-list {
        font-size: .7em;
        background: lightgray;
        position: absolute;
        top: 64px;
        left: 35px;
        max-width: 319px;
        line-height: 14px;
        overflow: hidden;
        display: inline-block;
        white-space: nowrap;
        border: 1px #c6c6c6 solid;
        padding: 1px;
        box-shadow:
                0 2.8px 2.2px rgba(0, 0, 0, 0.034),
                0 6.7px 5.3px rgba(0, 0, 0, 0.048),
                0 12.5px 10px rgba(0, 0, 0, 0.06),
                0 22.3px 17.9px rgba(0, 0, 0, 0.072),
                0 41.8px 33.4px rgba(0, 0, 0, 0.086),
                0 100px 80px rgba(0, 0, 0, 0.12)
    }
</style>