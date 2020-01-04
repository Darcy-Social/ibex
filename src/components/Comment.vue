<template>
    <div class="row">
        <article class="col-xs-12 col-md-12 comment">
            <header class="row">
                <div class="col-xs-12 col-md-12">
                    <span class="user"><a :href="comment.pod" target="_blank">{{prettyUserName}}</a></span><br/>
                    <small class="time">{{prettyDate}}</small>
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

import commonmark from "commonmark";

var reader = new commonmark.Parser();
let writer = new commonmark.HtmlRenderer();

export default{
    name:"Comment",
    props:["comment"],
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
                if(this.comment.pod == this.$store.state.webID)
                    return "You"
                else
                    return "[Unknown User]";
            }
        }
    },
    methods:{
        
    },
    created(){
        
    }
}
</script>