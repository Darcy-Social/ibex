import Vue from 'vue'
import Vuex from 'vuex'

const auth = require('solid-auth-client');
let solid = { auth }

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    session:{}, //the solid auth session
    loggedIn:false, //if the user is logged in
    webID:"", //the user web ID retrieved from the session
    posts:[],
    feeds:[],

    sidebarOpen:false,
  },
  mutations: {

  },
  actions: {

  }
})
