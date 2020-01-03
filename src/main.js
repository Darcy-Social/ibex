import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

//const axios = require('axios').default;

import { moment } from 'moment';

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
  methods:{
    async checkLogin(){

      let vm = this;

      vm.$store.state.session = await window.solid.auth.currentSession(); //Check if logged in into solid
      console.log(vm.$store.state.session);


      if(vm.$store.state.session){ //then populate the storage data if logged in
        vm.$store.state.loggedIn = true;
        vm.$store.state.webID = vm.$store.state.session.webId;
      }

    }
  },
  created(){
    this.checkLogin()
  }
  
}).$mount('#app')


/**
 * async popupLogin(){
            let vm = this;
            vm.$store.state.session = await solid.auth.currentSession();
            let popupUri = 'https://solid.community/common/popup.html';
            if (!vm.$store.state.session){
                 vm.$store.state.session = await solid.auth.popupLogin({ popupUri });
                 vm.$store.state.loggedIn = true;
            }else{
                
            }
            vm.$store.state.webId = vm.$store.state.session.webId
            console.log(`Logged in as ${vm.$store.state.session.webId}`);
        }, 
 */