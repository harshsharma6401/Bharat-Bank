const dotenv = require("dotenv");
const User = require("../models/users");
const jwt = require("jsonwebtoken");

dotenv.config({ path: "./config.env" });

// Importing google-auth-library and destructuring class OAuth2Client
const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID = process.env.CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID); //Creating Object from class OAuth2Client

const JWT_SECRET = process.env.JWT_SECRET;

const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", password: "" };

  // incorrect email
  if (err.message === "incorrect email") {
    errors.email = "Email not registered";

    //For privacy reasons you should write Incorrect email / password
  }

  // incorrect password
  if (err.message === "incorrect password") {
    errors.password = "Incorrect Password";
  }

  //Duplicate email
  if (err.code === 11000) {
    errors.email = "Email already registered";
    return errors;
  }

  // Validation errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;

      //properties.path either   refer to email / password .
      // properties.message is the error message (Specific , acc to email/ password)
    });
  }

  console.log("Errors are : ", errors);

  return errors;
};

const max_Age = 3 * 24 * 60 * 60; //   This is 3 days in seconds
const token_Age = 3 * 60 * 60; // This is 3 hr in seconds

const createToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: max_Age, // expiresIn takes values in seconds
  });
};

// Get requests

module.exports.signUp_get = (req, res) => {
  res.render("add-user", { title: "Sign Up" });
};

module.exports.login2_get = (req, res) => {
  res.render("login2", { title: "Login2" });
};

module.exports.login_get = (req, res) => {
  res.render("login2", { title: "Login" });
};

module.exports.logout_get = (req, res) => {
  let myuser = req.user;
  if (myuser) {
    console.log(myuser);
    async function asyncCall() {
      async function deleteCookie() {
     
        res.cookie("session-token", "", {
          maxAge: 1,
          SameSite: "None",
          Secure: true,
        });

      }
      await deleteCookie();
    }
    asyncCall();
    res.redirect("/");
  } else {
    res.cookie("JWT", "", { maxAge: 1 }); // Replacing the cookie for a empty string  and setting expiry a milisecond
    //Hence deleting it
    // res.clearCookie('JWT');

    res.redirect("/");
  }
};
module.exports.logout2_get = (req, res) => {
  res.cookie("JWT", "", { maxAge: 1 }); // Replacing the cookie for a empty string  and setting expiry a milisecond
  //Hence deleting it
  // res.clearCookie('JWT');

  res.redirect("/");
};

//Post requests
module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body;
  //console.log(email,password);

  try {
    const user = await User.create({ email, password });

    const token = createToken(user._id);

    res.cookie("JWT", token, {
      httponly: true,
      maxAge: max_Age * 1000,
      SameSite: "None",
    }); //maxAge field takes input in miliseconds

    console.log("User created : ", user);
    res.status(201).json({ user: user._id });
  } catch (err) {
    //console.log(err);
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.login_post = async (req, res) => {
  let token = req.body.token;

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userid = payload["sub"];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    console.log(payload);
  }
  verify()
    .then(() => {
      res.cookie("session-token", token, {
        SameSite: "None",
        Secure: true,
        maxAge: token_Age * 1000,
      });
      res.send("success");
    })
    .catch((error) => {
      console.log(error);
      res.send("failure");
    });
};

module.exports.login2_post = async (req, res) => {

  const { email, password } = req.body;
  console.log(email, password);

  try {
    const user = await User.login(email, password);

    const token = createToken(user._id);

    res.cookie("JWT", token, {
      httponly: true,
      maxAge: token_Age * 1000,
      SameSite: "None",
      Secure: true,
    }); //maxAge field taken input in miliseconds

    console.log("Logged in : ", user);
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);

    res.status(400).json({ errors });
  }

};

module.exports.dashboard_get = async (req, res) => {
  if (res.locals.user) {
    console.log("Res.locals.user : ", res.locals.user);
    req.user = await res.locals.user;
  }

  res.render("dashboard", { title: "Dashboard", myuser: req.user });
};

module.exports.checksignin_get = async (req, res) => {
  
  let token = req.cookies["session-token"];
  if (!token) {
    console.log("No token ");
    res.send("No token");
  } else {
   
    let user = {};
    async function verify() {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
      });

      const payload = ticket.getPayload();
      user.name = payload.name;
      user.email = payload.email;
      user.picture = payload.picture;
    }
    verify()
      .then(() => {
        req.user = user;
        console.log(req.user);
        res.send(user.email);
      })
      .catch((err) => {
        res.send("No token");
      });
  }
};

module.exports.loginother_get = (req, res) => {
  res.render("loginother", { title: "Other Login" });
};
