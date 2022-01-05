const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const basicRoutes = require("./routes/basicRoutes");
const authRoutes = require("./routes/authRoutes");

const {
  checkUser,
  checkAuthenticated3,
  checkLogin,
} = require("./middlewares/authMiddleware");

const app = express();
const port = process.env.PORT || 3000;


const dbURI = process.env.DATABASE;

mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((result) => app.listen(port))
  .catch((err) => console.log(err));

app.use(morgan("dev"));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false })); //can only parse incoming Request Object if strings or arrays
app.use(express.json());  //convert request body to JSON.
app.use(cookieParser());

//everytime you use the browser back button, the page is reloaded and not cached. (Restricted  to go to protected routes after logout )
app.use(function (req, res, next) {
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});

app.use(basicRoutes);
app.use(authRoutes);

app.get("*", checkUser);  //JWT
app.get("*", checkLogin); // Google

app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

app.get("/index", (req, res) => {
  res.redirect("/");
});

app.get("/protectedroute", checkAuthenticated3, (req, res) => {
  res.render("protectedroute", { title: "protectedroute", myuser: req.user });
});

app.use((req, res) => {
  res
    .status(404)
    .render("404", { title: "404", message: "Something went wrong" });
});
