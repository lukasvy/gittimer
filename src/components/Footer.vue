<template>
    <div class="git-footer">
        <div class="footer-left" @click.prevent="e => list(e)" v-if="listActive && iconsActive">
            <i class="list alternate icon"></i>
        </div>
        <div class="footer-rigth" @click.prevent="e => settings(e)" v-if="iconsActive">
            <i class="cog icon"></i>
        </div>
    </div>
</template>

<script>
    import {SettingsMenuService} from "../services/SettingsMenuService";

    const {ipcRenderer, remote} = require('electron');
    import {RepositoriesList} from "../services/RepositoriesList";

    export default {
        name     : "Footer",
        data     : function () {
            return {
                listActive : false,
                iconsActive: false
            }
        },
        created  : function () {
            this.activateRepo();
            this.removeOnDataRefresh = RepositoriesList.onDataRefresh(this.activateRepo);
        },
        destroyed: function () {
            this.removeOnDataRefresh();
        },
        methods  : {
            activateRepo() {
                this.listActive = RepositoriesList.get().length > 1;
                this.iconsActive = (!!RepositoriesList.get().length)
            },
            settings: SettingsMenuService.openMenu,
            list    : SettingsMenuService.openList
        }
    }
</script>

<style>
    .git-footer {
        border-top: 1px solid whitesmoke;
        padding: 5px 10px 5px 10px;
        display: flex;
        flex-direction: row;
        box-shadow: 0px 0px 8px 0px #d0d0d0;
        background-image: linear-gradient(to top, #E6E6E6 40%, #F2F2F2 100%);
        z-index: 10;
        min-height: 30px;
    }

    .footer-left {
        display: flex;
        flex-direction: row;
    }

    .footer-rigth {
        margin-left: auto;
        margin-right: -8px;
    }
</style>