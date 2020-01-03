import Vue from 'vue'
import Router from 'vue-router'
import Login from './views/Login.vue'
import Feed from './views/Feed.vue';
import PostPage from './views/PostPage.vue';

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: "/feed",
      name: "feed",
      component: Feed
    },
    {
      path: "/post/:id",
      name: "post",
      component: PostPage,
      props: true
    }
  ]
})
