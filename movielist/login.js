$(document).ready(function(){
    const app = firebase.app();
    console.log(app);
    //Auth setup from https://firebase.google.com/docs/auth/web/firebaseui
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#firebaseAuthContainer', {
        callbacks: {
            signInSuccessWithAuthResult: function(authResult, redirect){
                return true;
            }
        },
        signInFlow: 'popup',
        signInSuccessUrl: 'index.html',
        signInOptions: [
          // List of OAuth providers supported.
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.EmailAuthProvider.PROVIDER_ID

        ]
      });
});