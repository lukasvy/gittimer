<template>
    <div class="git-header">
        <div class="git-header-controll">
            <div class="scroll-repo-left">
            </div>
            <div class="git-header-name">
                {{activeRepo ? activeRepo.getName() : 'Git Timer'}}
            </div>
            <div class="scroll-repo-right" @click.prevent="hideWindow">
                <i class="arrow alternate circle down icon" style="padding-left: 12px;"></i>
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
        </div>
        </collapse-transition>
    </div>
</template>

<script>
    import {RepositoriesList} from "~/src/services/RepositoriesList";
    import {CollapseTransition} from 'vue2-transitions';
    import {AppService} from "~/src/services/AppService";

    export default {
        name   : "Header",
        data   : function () {
            return {
                activeRepo  : undefined,
                activeBranch: undefined
            }
        },
        components: {
            CollapseTransition
        },
        methods: {
            activateRepo() {
                this.activeRepo = RepositoriesList.getActiveRepo();
                this.activeBranch = RepositoriesList.getActiveBranch();
            },
            hideWindow() {
                AppService.hide();
            }
        },
        watch: {
            '$route': 'activateRepo'
        },
        created() {
            RepositoriesList.subscribe('switchBranch', this.activateRepo);
            this.activateRepo();
        },
        destroyed() {
            RepositoriesList.unsubscribe('switchBranch', this.activateRepo);
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
        margin-left: -3px;
    }

    .git-header-countdown {
        flex: 1px;
        padding-top: 10px;
        text-align: right;
    }
</style>