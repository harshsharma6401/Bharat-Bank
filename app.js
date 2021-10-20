const express = require('express')
const morgan = require('morgan');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const User = require('./models/users');
const swal = require('sweetalert');

const app = express();
const port = process.env.PORT || 3000;
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID =  '31624390503-udfmvc5bep0ebdss2k4ku812dccrec22.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);
// app.listen(port);
//Connect to MongoDb

const dbURI = 'mongodb+srv://HarshSharma:Harsh@bank7654@bank.if57d.mongodb.net/Bank?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
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


app.get('/', (req, res) => {
     res.render('index',{title:'Home'});
 });

 app.get('/index', (req, res) => {
    res.redirect('/');
});

// This will directly transfer to login if not logged in
app.get('/transfer-money',checkAuthenticated,  (req, res) => {
  res.render('transfer-money',{title:'Transfer'});
});


app.get('/add-user', (req, res) => {

  res.render('add-user',{title:'Add user'});

});

app.get('/Adduser', (req, res) => {
    const user = new User({
     accountNumber: '445353',
     name: 'gfvvfdd',
     email: 'mnfrbd',
     balance:'8677'
    })
  
    user.save()
      .then(result => {
        res.send(result);
      })
      .catch(err => {
        console.log(err);
      });
  });

   app.get('/view-users', (req, res) => {
      res.redirect('all-users');
  });

app.post('/view-users',(req,res)=>{

  const user = new User(req.body);

  user.save()
  .then((result)=>{
    res.redirect('/all-users');     
  })
  .catch((err)=>{
      console.log(err);
  })
  
  });

  app.post('/transfer',async (req,res)=>{

    const { sender, reciever, amount } = req.body;

    console.log(req.body);
    const sendid = sender;

    let senderUser, transferUser;
    try {
      senderUser = await User.findOne({ accountNumber: sender });
      transferUser = await User.findOne({ accountNumber: reciever });

    }
    catch (err) {
      res.render("payment-failure", { title: "Something went wrong" });
    }

    if (!senderUser || !transferUser) {
      res.render("payment-failure", { title: "No User" });
    }

    console.log('Success');

    if ( senderUser.balance < amount  ||  amount < 0 ) {
      res.render("payment-failure", { title: "Not Enough" });
    }


    senderUser.balance = senderUser.balance - Number(amount);
    transferUser.balance = transferUser.balance + Number(amount);
    let savedsenderUser, savedtransferUser;
    try {
      savedsenderUser = await senderUser.save();
      savedtransferUser = await transferUser.save();
    }
    catch (err) {
      res.render("payment-failure", { title: "Smthng2" });
    }

    res.render("payment-success", { title: "Transaction successful" });


    });

  app.get('/all-users', (req, res) => {
    User.find()
      .then(result => {
        res.render('view-users', { users: result, title: 'Users' });
      })
      .catch(err => {
        console.log(err);
      });
  });

  app.get('/transaction-history', (req, res) => {
    //  console.log(req.body);
  User.find()
  .then((result)=>{
    res.render('transaction-history', { users: result, title: 'Transactions' });     
  })
  .catch((err)=>{
      res.render('404', { title: 'User Not Found', message :"Something went wrong"});
     // console.log(err);
  })
});


app.get('/login',(req,res)=>{
  // res.send('Hello !');
   res.render(__dirname + '/views/login',{title :"Login"});
});

app.post('/login',(req,res)=>{
  let token = req.body.token;
  console.log(token);

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

})
app.get('/dashboard',checkAuthenticated2,async(req,res)=>{  
  res.render(__dirname + '/views/dashboard',{ title :"Dashboard",myuser :req.user, myclient : req.user });
});

app.get('/protectedroute',checkAuthenticated2,(req,res)=>{
  res.render(__dirname + '/views/protectedroute',{title : "protectedroute" ,myuser:req.user});
});

app.get('/logout',(req,res)=>{

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
 //res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
 // signOut();
  res.redirect('/login');
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
          res.render('404', { title: 'User Not Found' ,message : 'User not found in database'});
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
      swal({
        title: "Login",
        text: "You are not logged in!",
        icon: "error",
        button: "OK",
      });
        res.redirect('/login')
    })

}
app.use((req,res)=>{
res.status(404).render('404',{title :'404', message :"Something went wrong"});
});