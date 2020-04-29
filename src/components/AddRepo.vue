<template>
    <div class="git-content">
        <div class="ui middle aligned divided medium">
            <div class="ui icon header">
                <i class="code branch icon"></i>
                <p></p>
                <p>No git repository was found</p>
                <p>Please add directory with git repository</p>
            </div>
        </div>
        <div class="ui primary button center aligned repo-button"
             @click.prevent="() => !loading && processDir()"
             :class="{loading:loading}">
            Add repo
        </div>
    </div>
</template>

<script>
    import {DialogService} from '../services/DialogService';
    import {RepositoriesList} from "../services/RepositoriesList";

    const {remote} = require('electron');
    import {ListSearchService} from "~/src/services/ListSearchService";
    export default {
        name   : "AddRepo",
        data   : function () {
            return {
                loading: false
            }
        },
        created() {
            ListSearchService.clear();
        },
        methods: {
            processDir() {
                this.loading = true;
                DialogService.showOpenDialog({properties: ['openDirectory']})
                             .then((dir) => {
                                 if (Array.isArray(dir.filePaths) && dir.filePaths[0])
                                 {
                                     return RepositoriesList.createFromDir(dir.filePaths[0])
                                                            .then(() => this.$router.push('active'))
                                 }
                                 return dir;
                             })
                             .catch((e) => DialogService.showErrorBox('Uh Oh!', e.message))
                             .finally(() => this.loading = false);
            }
        }
    }
</script>

<style>
    .repo-button {
        display: flex !important;
        align-content: center;
        text-align: center;
        justify-content: center;
    }

    .git-content {
        background-color: #f4f4f4;
        border-bottom: 1px solid #e8e8e8;
        overflow-y: overlay;
        flex: 1 1 auto;
        height: 100%;
        padding-top: 5px;
        padding-bottom: 5px;
    }

    .item-container {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
</style>