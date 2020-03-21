<template>
    <div class="ui container">
        <router-view></router-view>
    </div>
</template>

<script>
    import {TickerService} from "./services/TickerService";

    export default {
        name: "App",
        created() {
            TickerService.start();
            this.$router.push('nothing');
        }
    }
</script>

<style scoped>
    .container {
        height : 100%;
    }
</style>