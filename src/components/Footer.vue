<template>
    <div class="git-footer">
        <div class="footer-left" @click.prevent="e => list(e)" v-if="listActive && iconsActive">
            <i class="list alternate icon" :style="{opacity: loading ? '0.4' : '1'}"></i>
        </div>
        <div class="footer-rigth" @click.prevent="e => settings(e)" v-if="iconsActive">
            <i class="cog icon" :style="{opacity: loading ? '0.4' : '1'}"></i>
        </div>
    </div>
</template>

<script>
    import {SettingsMenuService} from "../services/SettingsMenuService";

    const {ipcRenderer, remote} = require('electron');
    import {RepositoriesList} from "../services/RepositoriesList";
    import {AppService} from "@/services/AppService";

    export default {
        name     : "Footer",
        data     : function () {
            return {
                listActive : false,
                iconsActive: false,
                loading    : false
            }
        },
        created  : function () {
            this.activateRepo();
            this.removeOnDataRefresh = RepositoriesList.onDataRefresh(this.activateRepo);
            this.appProgressRemove = AppService.inProgress((v) => this.loading = !!v);
        },
        destroyed: function () {
            this.removeOnDataRefresh ? this.removeOnDataRefresh() : undefined;
            this.appProgressRemove ? this.appProgressRemove() : undefined;
        },
        methods  : {
            activateRepo() {
                this.listActive = RepositoriesList.get().length > 1;
                this.iconsActive = (!!RepositoriesList.get().length)
            },
            settings(e) {
                if (!AppService.isInProgress())
                {
                    SettingsMenuService.openMenu(e).catch(e => console.log(e));
                }
            },
            list(e) {
                if (!AppService.isInProgress())
                {
                    SettingsMenuService.openList(e).catch(e => console.log(e));
                }
            }
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