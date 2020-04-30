<template>
    <div class="git-content">
        <div class="ui middle aligned divided list medium item-container">
            <div class="scrollable-content">
                <Branch v-for="branch in branchesList" :key="branch.getName()" :data="branch"></Branch>
            </div>
        </div>
    </div>
</template>

<script>
    import {RepositoriesList} from "~/src/services/RepositoriesList";
    import {ListSearchService} from "~/src/services/ListSearchService";
    import Branch from "@/components/Branch";
    import {fetch} from "@/services/FetchRepositoryListService";

    export default {
        name      : "List",
        components: {
            Branch,
        },
        data      : function () {
            return {
                branchesList: [],
                search      : [],
                fetch       : fetch,
                Branch      : Branch
            }
        },
        methods   : {
            setBranchesList() {
                this.branchesList =
                    Object.freeze(this.activeRepo.getBranches())
                          .filter(
                              part =>
                                  !part.isCurrent() &&
                                  ListSearchService.itemPassesFilter(part.getName()))
                          .sort((a, b) => {
                              if (!b.getLastAccess() && a.getLastAccess())
                              {
                                  return -1;
                              }
                              return a.getLastAccess() > b.getLastAccess() ? -1 : 1;
                          });
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