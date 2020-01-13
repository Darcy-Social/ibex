<template>
<div class="container-fluid" style="padding-left:0">
    <div class="topBar">
        <a @click="$store.state.sidebarOpen=!$store.state.sidebarOpen" class="menuBtn"><img src="../assets/menu-icon.svg" /></a>
    </div>
    <div class="row">
        <Sidebar @changeFeed="changeFeed" @logout="logout" :feeds="$store.state.feeds" :currentFeed="currentFeed"></Sidebar>
        <div class="col-xs-12 col-md-9 col-lg-9 feed">

            <div class="container-fluid">
           
            <h1>Logged in as <em>{{$store.state.webID.replace("https://","")}}</em></h1>

            <textarea v-model="newPostContent" rows="2" placeholder="Write something..."></textarea>
            <div class="markdownHelp">
                <img style="width:27px;" src="https://upload.wikimedia.org/wikipedia/commons/4/48/Markdown-mark.svg" />  &nbsp;&nbsp;&nbsp; <b>**bold**</b> &nbsp;&nbsp;&nbsp; <i>_italic_</i> &nbsp;&nbsp;&nbsp; <span style="text-decoration: line-through;">~~strikethrough~~</span> &nbsp;&nbsp;&nbsp; <a href="https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet" target="_blank">See more</a>
            </div>

            <br/><br/>
            <button class="btn btn-primary" :disabled="!newPostContent.length" @click="doPublishPost">Publish now</button> 
            <br><br>
            <button class="btn btn-default" @click="getAllPosts">Check new posts</button>

            <h1 v-if="currentFeed!=''">Showing posts by {{currentFeed}}</h1>
            
            <Post v-for="(post, index) in sortedPosts" v-bind:key="post.id" :post="post" :previousDate="(index>0)?sortedPosts[index-1].date:0"></Post>

            <h1 style="font-size:2em;text-align:center;" v-if="!sortedPosts.length">No posts to show</h1>

            </div>
        </div>
    </div>
</div>
</template>

<script>

import Sidebar from '../components/Sidebar.vue';
import Post from '../components/Post.vue';

import md5 from 'js-md5';
import axios from "axios";

import notie from 'notie';

import commonmark from "commonmark";

var reader = new commonmark.Parser();
let writer = new commonmark.HtmlRenderer();

const auth = require('solid-auth-client');
let solid = { auth }

import darcy from "../js/darcy.js";

export default{
    name:"Feed",
    components:{
      Sidebar,
      Post
    },
    data:()=>{
        return {
            currentFeed:"", // "" means all feeds
            newPostContent:"",
        }
    },
    computed:{
        posts(){
            return this.$store.state.posts;
        },
        feeds(){
            return this.$store.state.feeds;
        },
        sortedPosts(){

            let vm = this;

            function compare( a, b ) {
                return new Date(b.date) - new Date(a.date);
            }

            if(this.currentFeed!=''){
                var userPosts = this.posts.filter( element => element.pod == vm.currentFeed);
                return userPosts.sort(compare)
            }else{
                return this.posts.sort(compare);
            }
        },
        
    },
    watch:{
        // feeds(newValue,oldValue){
        //     if(newValue!=[])
        //         this.getAllPosts();
        // }
    },
    methods:{
       
        doGetPosts(pod){ //get the posts from the selected pods
            let vm = this;
            darcy.getPosts(pod+"/").then((posts)=>{
               
                posts.forEach((post)=>{

                        let url = post.toString().replace(/</g,"").replace(/>/g,"");
                        var postID = darcy.stabilizeURLFragment(url.replace("https://",""));
                        var content = "";
                    
                        if(!vm.$store.state.posts.find(element => element.id == postID)){ //Don't allow
                        
                        const regex = /(\d{4})-(\d{2})-(\d{2})T(\d{2}).(\d{2}).(\d{2})/g;
                        const matches = regex.exec(post);
                        var date = new Date(matches[0].replace(/\./g,':')+"Z");

                        
                        
                        var comments = []; 
                        
                        axios({
                            method:"get",
                            url: url,
                        })
                        .then((res)=>{ //Fetching the post content
                            
                            content = writer.render(reader.parse(res.data));


                            darcy.getComments(url)  //Get post comments
                            .then((comms)=>{
                                
                                comments = comms;

                                var newPost = {
                                    filename:post.toString(),
                                    pod: pod,
                                    date: date,
                                    content: content,
                                    id: postID,
                                    url:url,
                                    comments:comments,
                                }

                                vm.$store.state.posts.push(newPost); //Add comment to list in VUEX

                            }) 
                            .catch((err)=>{
                                console.log("this is the getComments() error");
                                console.log("===="+err.message);
                               // if(err.)
                            });
                            //End of comment fetching
                            

                        })
                        .catch((err)=>{
                            console.log("this sis the axios for post content error");
                            console.log("===="+err.message);
                            //notie.alert({ text: 'Error while fetching post',type:"error"});
                        });

                    }

                    
                });
                
            });
        },
        changeFeed(feedURL){ //recieve a change feed action from Sidebar component
            this.currentFeed = feedURL;
        },

        getAllPosts(){
           
            let vm = this;

            vm.$store.state.posts = [];

            this.$store.state.feeds.forEach((feed)=>{
                if(feed.url!='')
                    vm.doGetPosts(feed.url);
            });

            vm.doGetPosts(vm.$store.state.webID+"/");
            notie.alert({ text: 'Loading posts',type:"success"});
           
        },

        
        doPublishPost(){

            if(this.newPostContent.length){
                darcy.publishPost(darcy.getPodFromPodPath(this.$store.state.webID)+"/",this.newPostContent)
                .then((res)=>{
                    this.doGetPosts(darcy.getPodFromPodPath(this.$store.state.webID)+"/");
                    this.newPostContent = "";
                    notie.alert({ text: 'Posts published',type:"success"});
                })
                .catch((err)=>{
                    console.log(err);
                    notie.alert({ text: 'Error while posting',type:"error"});
                });
            }
            
        },

        getFriends(){ //Get friends and store them in the vuex store

            console.log("getting friends");
            
            let vm = this;

            if(this.$store.state.feeds.length<=1){ //Fetch only when feeds includes only the logged in user

                darcy.listFriends(darcy.getPodFromPodPath(vm.$store.state.webID)+"/profile/card#me") //Important! include /profile/card#me
                .then((res)=>{

                   
                    res.forEach((friend)=>{
                       
                        let friendURL = new URL(friend.value).origin+"/";

                        var newFeed = {
                            name: friendURL,
                            url: friendURL
                        }

                        vm.$store.state.feeds.push(newFeed);
                        vm.getFriendName(friendURL);
                       
                    });

                    vm.getAllPosts();
                    
                })
                .catch((err)=>{
                    console.log(err);
                    notie.alert({ text: 'Error while getting friends',type:"error"});
                });

            }
        },

        getFriendName(webID){
            let vm = this;
            darcy.getName(webID+"/profile/card#me")
            .then((res)=>{
                
                let feed = vm.$store.state.feeds.find(elements => elements.url == webID);
                if(feed){
                    feed.name = res;
                }
            })
            .catch((err)=>{
                console.log(err);
            });
            
        },

        logout(){
            let vm = this;
            solid.auth.logout()
            .then(() =>{
                 vm.$store.state.session = {};
                vm.$store.state.loggedIn = false;
                vm.$store.state.webID = "";
                vm.$router.push("/")
            });
        },

    },
    mounted(){

        
    },
    created(){

        let vm = this;

        solid.auth.trackSession(session => {
            vm.$store.state.session = session;
            vm.$store.state.loggedIn = true;
            vm.$store.state.webID = new URL(vm.$store.state.session.webId).origin;
            
        });

        if(this.$store.state.loggedIn){
            console.log("logged in > getting friends");
            //vm.getFriends();
        }else
            this.$router.push("/");

        if(!this.$store.state.feeds.length)
            this.getFriends();
    }
}

</script>