<template>
    <div class="git-footer">
        <div class="footer-left">
<!--            <i class="file alternate outline icon"></i>-->
        </div>
        <div class="footer-rigth" @click.prevent="e => settings(e)">
            <i class="cog icon"></i>
        </div>
    </div>
</template>

<script>
    const {ipcRenderer, remote} = require('electron');
    import {RepositoriesList} from "../services/RepositoriesList";
    export default {
        name: "Footer",
        methods : {
            settings : function(e) {
                RepositoriesList.removeRepo();
                // ipcRenderer.sendSync('settingsClicked', {})
            }
        }
    }
</script>

<style >
    .git-footer {
        border-top: 1px solid whitesmoke;
        padding: 5px 10px 5px 10px;
        display: flex;
        flex-direction: row;
        box-shadow: 0px 0px 8px 0px #d0d0d0;
        background-image: linear-gradient(to top, #E6E6E6 40%, #F2F2F2 100%);
        z-index: 10;
    }
    .footer-left {
        display:flex;
        flex-direction: row;
    }
    .footer-rigth {
        margin-left: auto;
        margin-right: -8px;
    }
</style>