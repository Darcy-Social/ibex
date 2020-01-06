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
                <div class="col-md-10">
                    <span class="user"><a :href="post.pod" target="_blank">{{prettyUserName}}</a></span><br/>
                    <small class="time">{{prettyDate}}</small>
                </div>
                <div class="col-xs-2 col-md-2" style="text-align:right;">
                    <button class="btn btn-default" @click="deletePost">&times;</button>
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
    
    <div class="row" v-if="sortedComments.length">
        <div class="col-xs-12 col-md-12 pl-0">
            <h1>{{sortedComments.length}} Comment{{(sortedComments.length>1)?'s':''}}</h1>
        </div>
    </div>

    <comment v-for="comment in sortedComments" v-bind:key="comment.id" :comment="comment" :post="post" @commentDeleted="reloadComments"></comment>

</div>
</template>

<script>

    import darcy from "../js/darcy.js";

    import axios from "axios";
    import commonmark from "commonmark";

    import notie from 'notie';

    import moment from "moment";

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
            },
            prettyDate(){
               return moment(this.post.date).format("MMMM Do YYYY, HH:mm:ss");
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
        },
        methods:{
            postComment(){ //Submit a new comment
                if(this.newCommentContent.length){
                    darcy.publishComment(darcy.getPodFromPodPath(this.$store.state.webID),this.post.url,this.newCommentContent);
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

                let vm = this;

                if(vm.post.comments.length){

                    vm.post.comments.forEach(comment => {

                        console.log(comment);
                        
                        if( !!comment ){ //if not null

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
                                console.log("comment: "+err);
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
            },

            getPost(){

                let vm = this;

                this.post = {
                    filename:"",
                    pod: "",
                    date: "",
                    content: "",
                    id: "",
                    url:"",
                    comments:[],
                };

                let postID = this.$route.params.id;
                let splittedID = postID.toString().split("-");
                let dateSTR = splittedID[4]+"-"+splittedID[5]+"-"+splittedID[6]
                //         2020              01                 04T13.46.50.452Z.post
                let url = "https://"+splittedID[0]+"/"+splittedID[1]+"/"+splittedID[2]+"/"+splittedID[3]+"/"+dateSTR;
                //                   pod.solid.community public          darcy             post

                const regex = /(\d{4})-(\d{2})-(\d{2})T(\d{2}).(\d{2}).(\d{2})/g;
                const matches = regex.exec(url);
                var date = new Date(matches[0].replace(/\./g,':')+"Z");

                var content = "";
                var comments = []; 
                        
                axios({
                    method:"get",
                    url: url,
                })
                .then((res)=>{ //Fetching the post content
                            
                            content = writer.render(reader.parse(res.data));

                            vm.content = content;

                            darcy.getComments(url)  //Get post comments
                            .then((comms)=>{
                                
                                comments = comms;

                                vm.post = {
                                    filename:url,
                                    pod: darcy.getPodFromPodPath(url),
                                    date: date,
                                    content: content,
                                    id: postID,
                                    url:url,
                                    comments:comms,
                                }
                                
                                vm.parseComments();

                            }) 
                            .catch((err)=>{
                                console.log(err);
                               // if(err.)
                            });
                            //End of comment fetching
                            

                        })
                        .catch((err)=>{
                            console.log("this is the axios for post content error");
                            console.log("===="+err.message);
                            //notie.alert({ text: 'Error while fetching post',type:"error"});
                        });

            },

            deletePost(){
                darcy.deletePost(this.post.url,darcy.getPodFromPodPath(this.$store.state.webID))
                .then((res)=>{
                    console.log(res);
                    this.$router.push("/feed");
                })
                .catch((err)=>{
                    console.log(err);
                })
            }

            
        },
        created(){
            let vm = this;

            //console.log(this.$route.params.id);

            if(!this.id.length)
                this.id = this.$route.params.id;

           this.post = this.$store.state.posts.find(element => element.id == vm.id );

           if(this.post == undefined){
               this.getPost();
           }else{
           
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
}
</script>