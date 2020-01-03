<template>
<div class="container-fluid" style="padding-left:0">
    <div class="topBar">
        <a @click="$store.state.sidebarOpen=!$store.state.sidebarOpen" class="menuBtn"><img src="../assets/menu-icon.svg" /></a>
    </div>
    <div class="row">
        <Sidebar @changeFeed="changeFeed" :feeds="feeds" :currentFeed="currentFeed"></Sidebar>
        <div class="col-xs-12 col-md-9 col-lg-9 feed">

            <div class="container-fluid">
           
            <h1>Logged in as <em>{{$store.state.webID.replace("https://","")}}</em></h1>

            <textarea v-model="newPostContent" rows="2" placeholder="Write something..."></textarea>
            <br/><br/>
            <button class="btn btn-primary" :disabled="!newPostContent.length" @click="doPublishPost">Publish now</button> 
            <br><br>
            <button class="btn btn-default" @click="getAllPosts">Check new posts</button>
            
            
            <Post v-for="(post, index) in sortedPosts" v-bind:key="post.id" :post="post" :previousDate="(index>0)?sortedPosts[index-1].date:0"></Post>
            

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

const $rdf = require('rdflib');

//require("../js/darcy.js")();

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
        feeds(newValue,oldValue){
            if(newValue!=[])
                this.getAllPosts();
        }
    },
    methods:{
       
        doGetPosts(pod){ //get the posts from the selected pods
            let vm = this;
            darcy.getPosts(pod+"/").then((posts)=>{
               
                posts.forEach((post)=>{
                    
                    var postID = md5(post.toString());
                    
                        if(!vm.$store.state.posts.find(element => element.id == postID)){
                        
                        const regex = /(\d{4})-(\d{2})-(\d{2})T(\d{2}).(\d{2}).(\d{2})/g;
                        const matches = regex.exec(post);
                        var date = new Date(matches[0].replace(/\./g,':')+"Z");

                        let url = post.toString().replace(/</g,"").replace(/>/g,"");
                        var content = "";
                        var comments = []; 
                        
                        axios({
                            method:"get",
                            url: url,
                        })
                        .then((res)=>{ //Fetching the post content
                            
                            content = writer.render(reader.parse(res.data));

                            var comments = [];

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
                                console.log("this sis the getComments() error");
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
        changeFeed(feed){ //recieve a change feed action from Sidebar component
            this.currentFeed = feed;
        },

        getAllPosts(){
           
            let vm = this;
            this.feeds.forEach((feed)=>{
                if(feed!='')
                    vm.doGetPosts(feed+"/");
            });
            notie.alert({ text: 'Loading posts',type:"success"});
           
        },

        
        doPublishPost(){

            if(this.newPostContent.length){
                darcy.publishPost(this.$store.state.webID+"/",this.newPostContent)
                .then((res)=>{
                    this.doGetPosts(this.$store.state.webID);
                    this.newPostContent = "";
                    notie.alert({ text: 'Posts published',type:"success"});
                })
                .catch((err)=>{
                    notie.alert({ text: 'Error while posting',type:"error"});
                });
            }
            
        },

        getFriends(){ //Get friends and store them in the vuex store
            let vm = this;

            if(this.$store.state.feeds.length<=1){ //Fetch only when feeds includes only the logged in user
            
                darcy.listFriends(vm.$store.state.webID+"/profile/card#me") //Important! include /profile/card#me
                .then((res)=>{
                    res.forEach((friend)=>{
                        vm.$store.state.feeds.push(new URL(friend.value).origin);
                    });
                    
                    if(!this.$store.state.feeds.find(element => element == this.$store.state.webID))
                        this.$store.state.feeds.push(this.$store.state.webID);
                })
                .catch((res)=>{
                    notie.alert({ text: 'Error while getting friends',type:"error"});
                });

            }
        }

    },
    mounted(){

        
    },
    created(){

        let vm = this;

        if(this.$store.state.loggedIn){
            this.getFriends();
            this.getAllPosts();
        }else
            this.$router.push("/");
        
        
        solid.auth.trackSession(session => {
            vm.$store.state.session = session;
            vm.$store.state.loggedIn = true;
            vm.$store.state.webID = new URL(vm.$store.state.session.webId).origin;
            
        });
    }
}

</script>