const dotenv =  require('dotenv');

const express = require('express')
const morgan = require('morgan');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const User = require('./models/users');
const Transaction = require('./models/transactions');
const swal = require('sweetalert');
const { v4: uuidv4 } = require('uuid');
dotenv.config({path:'./config.env'});

const authRoutes = require('./routes/authRoutes');
const {requireAuth,checkUser} = require('./middlewares/authMiddleware');

const basicRoutes = require('./routes/basicRoutes');

const app = express();
const port = process.env.PORT || 3000;

const {OAuth2Client} = require('google-auth-library');

const CLIENT_ID = process.env.CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const dbURI = process.env.DATABASE;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
.then((result)=> app.listen(port))
.catch((err)=> console.log(err));

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

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

app.get('/', (req, res) => {
   res.render('index',{title:'Home'});
});

app.get('/index', (req, res) => {
  res.redirect('/');
});

app.post('/modify', async (req, res) => {
  console.log(req.body);

  const plainTextPassword = req.body.password;
  const username = req.body.username;

  const salt = await bcrypt.genSalt();
  const set_password  = await bcrypt.hash(plainTextPassword,salt);
  //const set_password = await bcrypt.hash(plainTextPassword,10);

  console.log(set_password);

      const response = await User.updateOne (
          {
             email :  username
          },
          {
              $set: {
                 password: set_password
              }
          }
      )
  
      console.log(response);
  
      res.json({ status: 'ok' })
  });

  app.post('/login',(req,res)=>{
    let token = req.body.token;
    //console.log(token);
  
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        // If request specified a G Suite domain:
        // const domain = payload['hd'];
  
        console.log(payload);
  
      }
      verify()
      .then(()=>{
        res.cookie('session-token',token);
        //res.render(__dirname + '/views/add-user',{title:'Add user'});
        res.send('success');
      })
      .catch(console.error);
  
  });


app.get('/dashboard',checkAuthenticated2,async(req,res)=>{  
  res.render('dashboard',{ title :"Dashboard",myuser :req.user});
});

app.get('/protectedroute',checkAuthenticated2,(req,res)=>{
  res.render('protectedroute',{title : "protectedroute" ,myuser:req.user});
});

app.get('/smoothies',requireAuth, (req, res) => res.render('smoothies',{title : 'Smoothies'}) );

app.get('/logout',checkAuthenticated,(req,res)=>{

  let myuser = req.user;
  console.log(myuser);
  async function asyncCall() {
      async function deleteCookie()
      { 
       // While deploying set domain to be heroku
      // let dom = window.location.hostname;
       //console.log(dom);
        res.clearCookie('session-token',{path:'/',domain:'localhost'});
        //res.clearCookie('session-token',{path:'/',domain:`${dom}`});
       // res.clearCookie('session-token');
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
      }
      await deleteCookie();

    }
    asyncCall();
    
    res.redirect('/');
});

app.get('/checksignin',(req,res)=>{

  //let my user =  req.user;
  let token = req.cookies['session-token'];
  if(!token)
  {
    console.log("No token ");
    res.send('No token');
  }
  else
  {
  //console.log(token);
  
  let user = {};
  async function verify() {
      const ticket = await client.verifyIdToken({
          idToken: token,
          audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      });
      const payload = ticket.getPayload();
      user.name = payload.name;
      user.email = payload.email;
      user.picture = payload.picture;
    }
    verify()
    .then(()=>{
        req.user = user;
        console.log(req.user);
        res.send(user.email);
        //res.redirect('/login');
       // res.redirect('/login');
    })
    .catch(err=>{
      res.send('No token');
    //  res.redirect('/login');
    })
  }
});

function checkAuthenticated(req, res, next){

  let token = req.cookies['session-token'];

  let user = {};
  async function verify() {
      const ticket = await client.verifyIdToken({
          idToken: token,
          audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      });
      const payload = ticket.getPayload();
      user.name = payload.name;
      user.email = payload.email;
      user.picture = payload.picture;
    }
    verify()
    .then(()=>{
        req.user = user;
        next();
    })
    .catch(err=>{
        res.redirect('/login')
    })

}
function checkAuthenticated2(req, res, next){

  let token = req.cookies['session-token'];

  let user = {};
  async function verify() {
      const ticket = await client.verifyIdToken({
          idToken: token,
          audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      });
      const payload = ticket.getPayload();
      user.name = payload.name;
      user.email = payload.email;
      user.picture = payload.picture;
      let username = user.email;
      await User.findOne({email : username},(error,result)=>{
        
        if(error || result ==null)
        {
          res.render('404', { title: 'User Not Found' ,message : 'This user is not added in the database.'});
        }
        else
        { 
          console.log(result);
          user.accountNumber  = result.accountNumber;
          user.balance = result.balance;
        }
        });
        
    }
    verify()
    .then(()=>{
        req.user = user;
        next();
    })
    .catch(err=>{
        res.redirect('/login');
    })

}

app.use((req,res)=>{
res.status(404).render('404',{title :'404', message :"Something went wrong"});
});