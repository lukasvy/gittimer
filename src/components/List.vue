<template>
    <div class="git-content">
        <div class="ui middle aligned divided list medium item-container">
            <div class="scrollable-content">
                <RecyclerView
                        ref="RecyclerView"
                        :prerender="30"
                        :fetch="(limit, skip) => fetch(undefined, limit, skip)"
                        :item="Branch"
                        @inited="initView"
                ></RecyclerView>
            </div>
        </div>
    </div>
</template>

<script>
    import {RepositoriesList} from "~/src/services/RepositoriesList";
    import {ListSearchService} from "~/src/services/ListSearchService";
    import Branch from "@/components/Branch";
    import {fetch} from "@/services/FetchRepositoryListService";
    import InfiniteLoading from 'vue-infinite-loading';

    export default {
        name      : "List",
        components: {
            Branch,
        },
        data      : function () {
            return {
                branchesList: [],
                search      : [],
                repos       : [],
                fetch       : fetch,
                Branch      : Branch,
                style       : '',
            }
        },
        methods   : {
            initView() {
                if (this.$refs.RecyclerView)
                {
                }
                console.log(this.$refs.RecyclerView)
            },
            setBranchesList() {
                if (this.$refs.RecyclerView)
                {
                    // this.$refs.RecyclerView.init()
                }
            },
            activateRepo() {
                this.activeRepo = RepositoriesList.getActiveRepo();
                if (!RepositoriesList.get().length)
                {
                    return this.$router.push('nothing');
                }
                this.repos = RepositoriesList.get();
                this.setBranchesList();
            }
        },
        watch     : {
            '$route': 'activateRepo'
        },
        created() {
            ListSearchService.clear();
            this.removeOnSwitch = RepositoriesList.onSwitchBranch(this.activateRepo);
            this.removeOnDataRefresh = RepositoriesList.onDataRefresh(this.activateRepo);
            this.searchSubRemove = ListSearchService.onChange(() => this.setBranchesList());
            this.activateRepo();
        },
        destroyed() {
            this.removeOnDataRefresh ? this.removeOnDataRefresh() : undefined;
            this.removeOnSwitch ? this.removeOnSwitch() : undefined;
            this.searchSubRemove ? this.searchSubRemove() : undefined;
        }
    }
</script>

<style>
    .recyclerview-container {
        height: calc(76vh - 17px);;
    }

    .recyclerview {
        background-color: #f4f4f4 !important;
    }

    .item-container {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .content {
        display: flex;
        flex-direction: column;
        width: 90%;
        display: flex;
        flex-direction: column;
        width: 90%;
        line-height: 18px;
        padding-left: 6px;
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
</style>