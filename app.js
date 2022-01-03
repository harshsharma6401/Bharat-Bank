const dotenv =  require('dotenv');
dotenv.config({path:'./config.env'});

const express = require('express')
const morgan = require('morgan');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/users');
const basicRoutes = require('./routes/basicRoutes');
const authRoutes = require('./routes/authRoutes');
const {checkUser,checkAuthenticated3,checkLogin} = require('./middlewares/authMiddleware');

const app = express();
const port = process.env.PORT || 3000;

const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = process.env.CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);


const JWT_SECRET = process.env.JWT_SECRET;
const dbURI = process.env.DATABASE;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex:true,useFindAndModify: false })
.then((result)=> app.listen(port))
.catch((err)=> console.log(err));

app.use(morgan('dev'));
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(cookieParser());

//everytime you use the browser back button, the page is reloaded and not cached. (Restricted  to go to protected routes after logout )
app.use(function(req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
     next();
});

app.use(basicRoutes);
app.use(authRoutes);

app.get('*',checkUser);
app.get('*',checkLogin);

app.get('/', (req, res) => {
  console.log('res.locals : ',res.locals);
   res.render('index',{title:'Home'});
});

app.get('/index', (req, res) => {
  res.redirect('/');
});

app.get('/protectedroute',checkAuthenticated3,(req,res)=>{
  res.render('protectedroute',{title : "protectedroute" ,myuser:req.user});
});

app.get('/smoothies',checkAuthenticated3, (req, res) => res.render('smoothies',{title : 'Smoothies'}) );

app.use((req,res)=>{
res.status(404).render('404',{title :'404', message :"Something went wrong"});
});
