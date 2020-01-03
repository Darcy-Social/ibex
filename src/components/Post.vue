<template>
<div class="row" style="margin-left:0">
    <h3 class="mb-0" v-if="prettyPreviousDate">{{prettyPreviousDate}}</h3>
    <article class="post">
        <header class="row">
            <div class="col-xs-12 col-md-12">
                <span class="user">{{prettyUserName}}</span><br/>
                <small class="time">{{prettyDate}}</small>
            </div>
        </header>
        <div class="content" id="contentDiv" v-html="post.content">
        </div>
        <footer >
            <router-link :to="'/post/'+post.id">{{(post.comments.length)?post.comments.length:"No"}} Comments</router-link>
        </footer>
    </article>
</div>
</template>

<script>

    import moment from "moment";

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
               return (this.post.pod==this.$store.state.webID)?"You":this.post.pod.replace("https://","").replace("/","");
           }
        },
        created(){
        }
    }

</script>