<template>
    <div class="row">
        <article class="col-xs-12 col-md-12 comment">
            <header class="row">
                <div class="col-xs-12 col-md-12">
                    <div class="row">
                        <div class="col-xs-10 col-md-10">
                            <span class="user"><a :href="comment.pod" target="_blank">{{prettyUserName}}</a></span><br/>
                            <small class="time">{{prettyDate}}</small>
                        </div>
                        <div class="col-xs-2 col-md-2" style="text-align:right;" >
                            <button class="btn btn-default" @click="deleteComment" v-if="canDelete">&times;</button>
                        </div>
                    </div>
                </div>
            </header>
            <div class="content" v-html="comment.content">
            </div>
        </article>
    </div>
</template>

<script>

import axios from "axios";
import moment from "moment";
import notie from "notie";

import commonmark from "commonmark";

var reader = new commonmark.Parser();
let writer = new commonmark.HtmlRenderer();

import darcy from "../js/darcy.js";

export default{
    name:"Comment",
    props:["comment","post"],
    data:()=>{
        return{
           
        }
    },
    computed:{
        prettyDate(){
            return moment(this.comment.date).format("MMMM Do YYYY, HH:mm:ss");
        },
        prettyUserName(){

            let feed = this.$store.state.feeds.find(element => element.url == this.comment.pod+"/");
            if(feed){
                return feed.name;
            }else{
                let webID = darcy.getPodFromPodPath(this.$store.state.webID);
                if(this.comment.pod == webID || this.comment.pod+"/" == webID)
                    return "You";
                else
                    return this.comment.pod;
            }
        },
        canDelete(){
            if( 
                (darcy.getPodFromPodPath(this.comment.pod)==darcy.getPodFromPodPath(this.$store.state.webID) ) || ( darcy.getPodFromPodPath(this.post.pod) == darcy.getPodFromPodPath(this.$store.state.webID) )){
                return true;
            }else{
                return false;
            }
        }
        
    },
    methods:{
        deleteComment(){
            let vm = this;
            darcy.deleteComment(this.comment.url,this.post.url,darcy.getPodFromPodPath(this.$store.state.webID))
            .then((res)=>{
                console.log(res);
                vm.$emit("commentDeleted");
                notie.alert({ text: 'Comment deleted',type:"info"});
            })
            .catch((err)=>{
                console.log(err);
            });
        }
    },
    created(){
        
    }
}
</script>