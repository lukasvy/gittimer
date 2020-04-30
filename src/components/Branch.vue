<template>
    <div class="item" >
        <i class="ui icon code branch padded-icon"></i>
        <div class="content">
            <div class="header text-overflow">
                {{data.getName()}}
            </div>
            <div class="time-spent" v-if="!data.getFormattedTimeSpent()">
                <small>No time recorder yet</small>
            </div>
            <div class="time-spent" v-if="data.getFormattedTimeSpent()">
                <small>
                    {{data.getFormattedTimeSpent() ? 'Time spent : '+
                    data.getFormattedTimeSpent() :
                    ''}}
                </small> |
                <small>
                    {{data.getFormattedLastAccess() ? 'Last access : '+
                    data.getFormattedLastAccess() : ''}}
                </small>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Branch",
        props: {
            data : Object
        }
    }
</script>

<style>
    .item {
        display: flex;
        flex-direction: row;
        align-items: center;
        border-bottom: 1px solid #e2e0e0;
        width: 100%;
        padding: 5px 10px;
    }
    .text-overflow {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    i.padded-icon {
        /*padding-top: 5px;*/
        margin-top: -7px !important;
        font-size: 1.2em !important;
    }
    .time-spent {
        font-size: 0.8em;
    }
</style>