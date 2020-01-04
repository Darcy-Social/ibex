<template>
<div class="container-fluid">
    <div class="row" style="margin-top:20px">
        <div class="col-12">
            <router-link class="btn btn-default" :to="'/feed'">Back to the feed</router-link>
        </div>
    </div>
    <div class="row">
        <article class="post col-xs-12 col-md-12">
            <header class="row">
                <div class="col-md-12">
                    <span class="user">{{(post.pod==$store.state.webID && post.pod)?'You':post.pod.replace("https://","")}}</span><br/>
                    <small class="time">{{post.date}}</small>
                </div>
            </header>
            <div class="content" v-html="content">
                
            </div>
        </article>
    </div>
    <div class="row">
        <div class="col-xs-12 col-md-12 pl-0">
            <textarea v-model="newCommentContent" rows="2" placeholder="Write your comment"></textarea>
        </div>
    </div>

    <div class="row">
        <div class="col-xs-12 col-md-12 pl-0">
            <br/>
            <button class="btn btn-primary" :disabled="!newCommentContent.length" @click="postComment">Submit comment</button>
        </div>
    </div>
    
    <div class="row" v-if="post.comments.length">
        <div class="col-xs-12 col-md-12 pl-0">
            <h1>{{post.comments.length}} Comment{{(post.comments.length>1)?'s':''}}</h1>
        </div>
    </div>

    <comment v-for="comment in sortedComments" v-bind:key="comment.id" :comment="comment"></comment>

</div>
</template>

<script>

    import darcy from "../js/darcy.js";

    import axios from "axios";
    import commonmark from "commonmark";

    import notie from 'notie';

    import md5 from 'js-md5';

    var reader = new commonmark.Parser();
    let writer = new commonmark.HtmlRenderer();

    import Comment from "../components/Comment.vue";

    export default{
        name:"PostPage",
        props:["id"],
        components:{
            Comment,
        },
        data:()=>{
            return {
                post:"",
                content:"",
                newCommentContent:"",
                parsedComments:[],
            }
        },
        computed:{
            sortedComments(){
                function compare( a, b ) {
                    return new Date(a.date) - new Date(b.date);
                }

                return this.parsedComments.sort(compare);
            }
        },
        methods:{
            postComment(){ //Submit a new comment
                if(this.newCommentContent.length){
                    darcy.publishComment(this.$store.state.webID+"/",this.post.url,this.newCommentContent);
                    this.post.comments = [];
                    this.newCommentContent = "";
                    let vm = this;
                    setTimeout(function(comments){
                        vm.reloadComments();
                    },3000);
                }
                
            },
            parseComments(){

                var allComments = [];

                if(this.post.comments.length){

                    this.post.comments.forEach(comment => {
                        
                        if( !!comment ){ //if not null
                            let vm = this;

                            var newComment = {
                                url:comment,
                                content:"",
                                date:"",
                                pod:"",
                                id:md5(comment)
                            }

                            const regex = /(\d{4})-(\d{2})-(\d{2})T(\d{2}).(\d{2}).(\d{2})/g;
                            const matches = regex.exec(comment);
                            newComment.date = new Date(matches[0].replace(/\./g,':')+"Z");

                            newComment.pod = "https://"+comment.split("/")[2];

                            axios({
                                method:"get",
                                url: comment,
                            })
                            .then((res)=>{ //Fetching the comment content
                                newComment.content = writer.render(reader.parse(res.data));
                                vm.parsedComments.push(newComment);
                            })
                            .catch((err)=>{
                                console.log(err);
                            });

                        } //End if comment !== null

                    });//End foreach

                }

            },

            reloadComments(){

                darcy.getComments(this.post.url)
                .then((comments)=>{
                    this.post.comments = comments;
                    this.parsedComments = [];
                    this.parseComments();
                });
            }

            
        },
        created(){
            let vm = this;

            //console.log(this.$route.params.id);

            if(!this.id.length)
                this.id = this.$route.params.id;

            console.log(this.id);

            this.post = this.$store.state.posts.find(element => element.id == vm.id );

           if(this.post == undefined){
               this.$router.push("/");
           }

            let url = this.post.filename.toString().replace(/</g,"").replace(/>/g,"");
            
            axios({
                method:"get",
                url: url,
            })
            .then((res)=>{
                vm.content = writer.render(reader.parse(res.data));

                this.parseComments();
            })
            .catch((err)=>{
                console.log(err);
            });
        }
}
</script>