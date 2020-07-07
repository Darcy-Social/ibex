<template>
  <div class="login">
    <img src="../assets/logo.svg" alt="Darcy" />
    <br />
    <br />
    <h1>You are not logged in into solid</h1>
    <button
      class="btn btn-primary btn-lg"
      @click="doPopup"
      v-if="!this.$store.state.loggedIn"
    >Log In</button>

    <div class="row">
      <div class="col-xs-12 col-md-12" style="text-align:center;">
        <br />
        <br />
        <a href="https://darcy.is/ibex" target="_blank">What is this?</a>
      </div>
    </div>
  </div>
</template>

<script>
const auth = require("solid-auth-client");
window.solid = { auth };

export default {
  name: "Login",
  methods: {
    async doPopup() {
      let vm = this;
      let session = await auth.currentSession();
      let popupUri = location.href + "/popup-login.html";
      if (!session) session = await auth.popupLogin({ popupUri });
      vm.$store.state.session = session;
      vm.$store.state.loggedIn = true;
      vm.$store.state.webID = new URL(vm.$store.state.session.webId).origin;
    },
    async checkSession() {
      console.log("checking session");
      let vm = this;
      let session = await auth.currentSession();

      console.log(session);

      if (session) {
        vm.$store.state.session = session;
        vm.$store.state.loggedIn = true;
        vm.$store.state.webID = new URL(vm.$store.state.session.webId).origin;
      }

      if (this.loggedIn) this.$router.push("/feed");
    }
  },
  computed: {
    loggedIn() {
      return this.$store.state.loggedIn;
    }
  },
  watch: {
    loggedIn(newValue) {
      console.log("loggedIn: " + newValue);
      if (newValue) {
        //if is now logged in
        this.$router.push("/feed");
      }
    }
  },
  mounted() {
    this.checkSession();
  }
};
</script>