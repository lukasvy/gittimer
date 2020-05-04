<template>
    <div class="git-content">
        <div class="ui middle aligned divided list medium item-container">
            <div class="scrollable-content">
                <Branch v-for="branch in branchesList" :key="branch.getName()" :data="branch"></Branch>
                <infinite-loading spinner="waveDots" :identifier="infiniteId" @infinite="infiniteHandler"
                                  force-use-infinite-wrapper=".git-content">
                    <div slot="no-more">~</div>
                    <div slot="no-results">No results</div>
                </infinite-loading>
            </div>
        </div>
    </div>
</template>

<script>
    import {RepositoriesList} from "@/services/RepositoriesList";
    import {ListSearchService} from "@/services/ListSearchService";
    import Branch from "@/components/Branch";
    import {fetch} from "@/services/FetchRepositoryListService";


    export default {
        name      : "List",
        components: {
            Branch
        },
        data      : function () {
            return {
                branchesList: [],
                branchesKeys: {},
                search      : [],
                fetch       : fetch,
                infiniteId  : new Date(),
                page        : 0,
                limit       : 30
            }
        },
        methods   : {
            async infiniteHandler($state) {
                try
                {
                    this.search = ListSearchService.getText();
                    const data = await fetch(
                        this.activeRepo, this.limit, this.page * this.limit, this.search
                    );
                    if (data.text !== this.search) {
                        return $state.loaded();
                    }
                    if (data.list.length)
                    {
                        data.list.forEach((part) => {
                            if (!this.branchesKeys[part.getName()] &&
                            part.getName() !== RepositoriesList.getActiveBranch().getName()) {
                                this.branchesList.push(part);
                                this.branchesKeys[part.getName()] = true;
                            }
                        });
                        if (this.branchesList.length >= data.count)
                        {
                            return $state.complete();
                        }
                        this.page++;
                        return $state.loaded();
                    }
                } catch (e)
                {
                    $state.error(e);
                }
                $state.complete();
            },
            setBranchesList() {
                this.page = 0;
                this.branchesList = [];
                this.branchesKeys = {};
                this.infiniteId = new Date();
            },
            activateRepo() {
                this.activeRepo = RepositoriesList.getActiveRepo();
                if (!RepositoriesList.get().length)
                {
                    return this.$router.push('nothing');
                }
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