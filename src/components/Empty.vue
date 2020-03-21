<template>
    <div>
        <br/>
        <br/>
        <br/>
        <div class="ui bottom attached loading tab segment" v-if="loading"></div>
        <div class="ui placeholder segment" v-if="!loading">
            <div class="ui icon header">
                <i class="code branch icon"></i>
                <p></p>
                <p>No git repository was found</p>
                <p>Please add directory with git repository</p>
            </div>
            <div class="ui primary button" @click="() => !loading && processDir()">Add repo</div>
        </div>
    </div>
</template>

<script>
    const {dialog} = require('electron').remote;
    import {isArray} from 'underscore';
    import {RepositoriesList} from "../services/RepositoriesList";

    export default {
        name   : "Empty",
        data   : function () {
            return {
                loading: false
            }
        },
        methods: {
            processDir() {
                this.loading = true;
                dialog.showOpenDialog({properties: ['openDirectory']})
                      .then((dir) => {
                          if (!dir || !isArray(dir.filePaths) || !dir.filePaths[0])
                          {
                              throw new Error('Invalid directory selected');
                          }
                          return RepositoriesList.createFromDir(dir.filePaths[0])
                                                 .then(() => this.$router.push('active'))
                      })
                      .catch((e) => dialog.showErrorBox('Uh Oh!', e.message))
                      .finally(() => this.loading = false);
            }
        }
    }
</script>

<style scoped>

</style>