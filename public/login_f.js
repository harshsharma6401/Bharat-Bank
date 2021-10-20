
    function onSignIn(googleUser) {
      var id_token = googleUser.getAuthResponse().id_token;
      // console.log(id_token);
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "/login");
      xhr.setRequestHeader(
        "Content-Type",
        "application/json"
      );
      xhr.onload = function () {
        console.log("Signed in as: " + xhr.responseText);
        if(xhr.responseText == 'success')
        {
          signOut();
         // res.set({'Cache-Control': 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'})
            //res.render('/dashboard');
          location.assign('/dashboard');
          res.set({'Cache-Control': 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'});
        }
      };
      xhr.send(JSON.stringify({token: id_token}));
    }


    function signOut() {
      var auth2 = gapi.auth2.getAuthInstance();
      auth2.signOut().then(function () {
        console.log("User signed out.");
      });
    }

