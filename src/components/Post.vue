<template>
<div class="row" style="margin-left:0">
    <h3 class="mb-0" v-if="prettyPreviousDate">{{prettyPreviousDate}}</h3>
    <article class="post">
        <header class="col-xs-12 col-md-12">
            <div class="row">
                <div class="col-xs-10 col-md-10">
                    <span class="user"><a :href="this.post.pod" target="_blank">{{prettyUserName}}</a></span><br/>
                    <small class="time">{{prettyDate}}</small>
                </div>
                <div class="col-xs-2 col-md-2" style="text-align:right;" v-if="canDelete">
                    <button class="btn btn-default" @click="deletePost">&times;</button>
                </div>
            </div>
        </header>
        <div class="content" id="contentDiv" v-html="post.content">
        </div>
        <footer >
            <router-link :to="'/post/'+post.id">{{(post.comments.length)?"See":"No"}} Comments</router-link>
        </footer>
    </article>
</div>
</template>

<script>

    import moment from "moment";
    import darcy from '../js/darcy.js';
    import notie from "notie";

    export default{
        props:["post","previousDate"],
        data:()=>{
            return {
                
            }
        },
        computed:{
            prettyDate(){
               return moment(this.post.date).format("MMMM Do YYYY, HH:mm:ss");
            },
            prettyPreviousDate(){
               let currentDate = moment(this.post.date).format("d/MM/YYYY"); //Date from current post
               let prevDate    = (this.previousDate!=0)?moment(this.previousDate).format("d/MM/YYYY"):0; //Date form previous post or 0
               if( currentDate != prevDate )
                return moment(this.post.date).format("MMMM Do YYYY");
               else
                return "";
            },
            prettyUserName(){
               
                let feed = this.$store.state.feeds.find(element => element.url == this.post.pod);
                if(feed){
                    return feed.name;
                }else{
                    let webID = darcy.getPodFromPodPath(this.$store.state.webID);
                    if(this.post.pod == webID || this.post.pod+"/" == webID)
                        return "You";
                    else
                        return this.post.pod;
                }
               
           },
           canDelete(){
               return ( darcy.getPodFromPodPath(this.post.pod) == darcy.getPodFromPodPath(this.$store.state.webID));
           }

           
        },
        methods:{
             deletePost(){
                darcy.deletePost(this.post.url,darcy.getPodFromPodPath(this.$store.state.webID))
                .then((res)=>{
                    //console.log(res);
                    notie.alert({ text: 'Post deleted',type:"info"});
                    this.$parent.getAllPosts();
                })
                .catch((err)=>{
                    console.log(err);
                })
            },
        },
        created(){
        }
    }

</script>