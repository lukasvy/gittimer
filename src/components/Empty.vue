<template>
    <div class="git-container">
        <div class="git-header">
            <div class="git-header-controll">
                No repo selected
            </div>

        </div>
        <div class="git-content">
            <div class="ui middle aligned divided list medium item-container">
                <div class="">
                    <div class="ui bottom attached loading" v-if="loading"></div>
                    <div class="ui placeholder" v-if="!loading">
                        <div class="ui icon header">
                            <i class="code branch icon"></i>
                            <p></p>
                            <p>No git repository was found</p>
                            <p>Please add directory with git repository</p>
                        </div>
                        <div class="ui primary button" @click="() => !loading && processDir()">Add repo</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="git-footer">
            <div class="footer-left">
                <i class="file alternate outline icon"></i>
            </div>
            <div class="footer-rigth">
                <i class="cog icon"></i>
            </div>
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

<style>
    html, body, div, span, applet, object, iframe,
    h1, h2, h3, h4, h5, h6, p, blockquote, pre,
    a, abbr, acronym, address, big, cite, code,
    del, dfn, em, img, ins, kbd, q, s, samp,
    small, strike, strong, sub, sup, tt, var,
    b, u, i, center,
    dl, dt, dd, ol, ul, li,
    fieldset, form, label, legend,
    table, caption, tbody, tfoot, thead, tr, th, td,
    article, aside, canvas, details, embed,
    figure, figcaption, footer, header, hgroup,
    menu, nav, output, ruby, section, summary,
    time, mark, audio, video {
        margin: 0;
        padding: 0;
        border: 0;
        font-size: 100%;
        font: inherit;
        vertical-align: baseline;
    }
    /* HTML5 display-role reset for older browsers */
    article, aside, details, figcaption, figure,
    footer, header, hgroup, menu, nav, section {
        display: block;
    }
    body {
        line-height: 1;
        background: rgba(0, 0, 0, 0);
    }
    ol, ul {
        list-style: none;
    }
    blockquote, q {
        quotes: none;
    }
    blockquote:before, blockquote:after,
    q:before, q:after {
        content: '';
        content: none;
    }
    table {
        border-collapse: collapse;
        border-spacing: 0;
    }
    body {
        font-family: Calibri , Arial;
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

    .git-content {
        padding: 10px;
        background-color: #f4f4f4;
        border-bottom: 1px solid #e8e8e8;
        overflow-y: overlay;
        flex: 1 1 auto;
        height:100%;
    }

    .item-container {
        display: flex;
        flex-direction: column;
    }

    .git-footer {
        border-top: 1px solid whitesmoke;
        padding: 5px 10px 5px 10px;
        display: flex;
        flex-direction: row;
        box-shadow: 0px 0px 8px 0px #d0d0d0;
        background-image: linear-gradient(to top, #E6E6E6 40%, #F2F2F2 100%);
        z-index: 10;
    }

    .text-overflow {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    i.padded-icon {
        padding: 10px !important;
        margin-right: 15px;
    }

    .item {
        display: flex;
        flex-direction: row;
        padding-bottom: 5px;
        padding-top: 5px;
        border-bottom: 1px solid #e2e0e0;
    }

    .content {
        display: flex;
        flex-direction: column;
        width: 90%;
        display: flex;
        flex-direction: column;
        width: 90%;
        line-height: 18px;
    }

    .time-spent {
        font-size: 0.8em;
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
    .git-header-countrer-icon {
        max-width: 35px;
        margin-left: -3px;
    }
    .git-header-countdown {
        flex: 1px;
        padding-top: 10px;
        text-align: right;
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