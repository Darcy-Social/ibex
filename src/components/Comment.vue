<template>
    <div class="row">
        <article class="col-xs-12 col-md-12 comment">
            <header class="row">
                <div class="col-xs-12 col-md-12">
                    <span class="user">{{comment.pod.replace("https://","")}}</span><br/>
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
    },
    methods:{
        
    },
    created(){
        
    }
}
</script>