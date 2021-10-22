app.use("/static", express.static('./static/'));
    function onSignIn(googleUser) {
      var id_token = googleUser.getAuthResponse().id_token;
      localStorage.setItem('token',id_token);
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
          location.assign('/dashboard');
          res.set({'Cache-Control': 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'});
        }
      };
      xhr.send(JSON.stringify({token: id_token}));
    }


    function signOut() {
      var auth2 = gapi.auth2.getAuthInstance();
      auth2.signOut().then(function () {
        localStorage.removeItem('token');
        console.log("User signed out.");
       
      });
    }

    function checkSignIn() {  
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "/checksignin");
      xhr.setRequestHeader(
        "Content-Type",
        "application/json"
      );
        xhr.onload = function () {
        console.log("Signed in as: " + xhr.responseText);
        if(xhr.responseText == 'No token')
        {
            swal({
            title: "Login",
            text: "You are not logged in!",
            icon: "error",
            button: "OK",
            closeOnClickOutside: false,
          });
        }
        else
        {
          swal({
            title: "Login",
            text: "You are logged in!",
            icon: "success",
            button: "OK",
            closeOnClickOutside: false,
          });
        }
      };
      xhr.send('No');
      
    }