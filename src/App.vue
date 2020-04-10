<template>
    <transition name="fade">
        <div class="git-container" v-show="shown">
            <router-view name="header"></router-view>
            <transition name="slide" mode="out-in">
                <router-view name="content"></router-view>
            </transition>
            <router-view name="footer"></router-view>
        </div>
    </transition>
</template>

<script>
    import {AppService} from "./services/AppService";
    import {RepositoriesList} from "./services/RepositoriesList";

    const {ipcRenderer, remote} = require('electron');
    const window = remote.getCurrentWindow();

    export default {
        name: "App",
        data: function () {
            return {
                shown : false
            }
        },
        created() {

            ipcRenderer.on('suspend', () => {
                RepositoriesList.storeData();
                AppService.stop()
            });
            ipcRenderer.on('lock-screen', () => {
                RepositoriesList.storeData();
                AppService.stop()
            });
            ipcRenderer.on('unlock-screen', () => {
                RepositoriesList.createFromData();
                AppService.start()
            });
            ipcRenderer.on('resuming', () => {
                RepositoriesList.createFromData();
                AppService.start()
            });
            ipcRenderer.on('quitting', (event, arg) => {
                this.shown = false;
                RepositoriesList.storeData();
            });

            ipcRenderer.on('after-show', (event, arg) => {
                this.shown = true;
            });

            ipcRenderer.on('before-hide', (event, arg) => {
                this.shown = false;
            });

            ipcRenderer.on('lost-focus', (event, arg) => {
                if (this.shown)
                {
                    AppService.hide();
                }
            });

            AppService.onBeforeHide(() => new Promise((resolve, reject) => {
                this.shown = false;
                setTimeout(resolve, 500);
            }));

            AppService.start(window);
            RepositoriesList.createFromData();

            this.shown = true;

            if (RepositoriesList.get().length)
            {
                this.$router.push('active');
            } else
            {
                this.$router.push('nothing');
            }
        }
    }
</script>

<style>
    body {
        background: rgba(0, 0, 0, 0) !important;
        overflow: hidden;
    }

    .slide-enter-active,
    .slide-leave-active {
        transition: opacity 1s, transform 0.3s;
    }

    .slide-enter,
    .slide-leave {
        opacity: 0;
    }

    .fade-enter-active, .fade-leave-active {
        transform: matrix(1, 0, 0, 1, 0, 0);
        opacity: 1;
        transition: transform 0.3s ease-out 0s, opacity 0.3s ease-in-out 0s;
    }

    .fade {
        /*transform:matrix(1,0,0,1,0,0);*/
    }

    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
    {
        transform: matrix(1, 0, 0, 1, 0, 35);
        opacity: 0;
    }

    .ui.container {
        display: flex;
        max-width: 100% !important;
    }

    .git-container {
        display: flex;
        flex-direction: column;
        border-radius: 13px;
        -moz-border-radius: 13px;
        -webkit-border-radius: 13px;
        overflow: hidden;
        background: #E6E6E6;
        border-bottom: 1px solid #DEDEDE;
        border-left: 1px solid #E6E6E6;
        border-right: 1px solid #DBDBDB;
        height: 100%;
        max-width: 400px;
    }
</style>