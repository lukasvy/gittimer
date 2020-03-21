<template>
    <div class="ui container">
        <router-view></router-view>
    </div>
</template>

<script>
    import {AppService} from "./services/AppService";
    const {ipcRenderer} = require('electron');

    export default {
        name: "App",
        created() {

            ipcRenderer.on('suspend', () => AppService.stop());
            ipcRenderer.on('lock-screen', () => AppService.stop());
            ipcRenderer.on('unlock-screen', () => AppService.start());
            ipcRenderer.on('resuming', () => AppService.start());
            AppService.start();
            this.$router.push('nothing');
        }
    }
</script>

<style scoped>
    .container {
        height: 100%;
    }
</style>