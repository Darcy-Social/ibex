<template>
<div class="sidebar col-md-3 col-sm-12" :class="{'open':$store.state.sidebarOpen}">
    <div class="row">
        <div class="col-md-12 col-xs-12 logo">
            <img src="../assets/logo-white.svg" />
        </div>
    </div>

    <!-- <div class="row">
        <div class="col-md-12 addButton">
            <button class="btn btn-white">Add Feed</button>
        </div>
    </div> -->

    <div class="row">
        <div class="col-xs-12 col-md-12" style="padding-right:0">
            <ul class="feedList" ref="feedList">
                <li @click="changeFeed('')" :class="{'active':currentFeed==''}">All friends</li>
                <li v-for="feed in sortedFeeds" v-bind:key="feed" @click="changeFeed(feed+'/')" :class="{'active':currentFeed==feed+'/'}">{{feed.replace("https://","")}}</li>
                <li @click="changeFeed($store.state.webID)" :class="{'active':currentFeed==$store.state.webID}">Your Posts</li>
            </ul>
        </div>
    </div>
    <br/>
    <div class="row">
        <div class="col-xs-12 col-md-12" style="text-align:center;">
            <small>Manage your friends on<br/><a href="https://solid.community">solid.community</a></small>
        </div>
    </div>
    
</div>
</template>

<script>

    export default{
        name:"Sidebar",
        props:["currentFeed","feeds"],
        data:()=>{
            return{

            }
        },
        computed:{
            sortedFeeds(){
                var newFeeds = this.feeds.slice(); //Separate the array from the Vue object
                newFeeds.pop(); //Remove the last item (your id)
                return newFeeds.sort();
            }
        },
        methods:{
            changeFeed(feed){
                this.$store.state.sidebarOpen = !this.$store.state.sidebarOpen;
                this.$emit("changeFeed",feed); //Sends a change feed event to feed component
            }
        }
    }

</script>