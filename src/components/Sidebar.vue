<template>
<div class="sidebar col-md-3 col-sm-12" :class="{'open':$store.state.sidebarOpen}">
    <div class="row">
        <div class="col-md-12 col-xs-12 logo">
            <img src="../assets/darcy_logo_with_ibex.svg" />
        </div>
    </div>

    <!-- <div class="row">
        <div class="col-md-12 addButton">
            <button class="btn btn-white">Add Feed</button>
        </div>
    </div> -->

    <div class="row">
        <div class="col-xs-12 col-md-12 feeds">
            <ul class="feedList" ref="feedList">
                <li @click="changeFeed('')" :class="{'active':currentFeed==''}">All friends</li>
                
                <li v-for="feed in sortedFeeds" v-bind:key="feed.url" @click="changeFeed(feed.url)" :class="{'active':currentFeed==feed.url}" class="friends">{{feed.name}}</li>
               
                <li @click="changeFeed($store.state.webID+'/')" :class="{'active':currentFeed==$store.state.webID+'/'}">Your Posts</li>
            </ul>
        </div>
    </div>
    <br/>
    <div class="row">
        <div class="col-xs-12 col-md-12" style="text-align:center;">
            <small>Manage your friends on<br/><a href="https://solid.community">solid.community</a></small>
        </div>
    </div>

    <div class="row">
        <div class="col-xs-12 col-md-12" style="text-align:center;">
            <br/><br/>
            <button class="btn btn-white" @click="logout">Logout</button>
        </div>
    </div>

    <div class="row" style="margin-top:10rem;">
        <div class="col-xs-12 col-md-12" style="text-align:center;">
            <hr/>
            <a href="https://darcy.is/ibex" target="_blank">What is this?</a>
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
                function compare(a,b){
                    return a.name < b.name;
                }
                return this.feeds.sort(compare);
            }
        },
        methods:{
            changeFeed(feed){
                this.$store.state.sidebarOpen = !this.$store.state.sidebarOpen;
                this.$emit("changeFeed",feed); //Sends a change feed event to feed component
            },
            logout(){
                this.$emit("logout");
            }
        }
    }

</script>
