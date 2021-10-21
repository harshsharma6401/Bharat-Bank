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



app.get('/', (req, res) => {
     res.render('index',{title:'Home'});
 });

 app.get('/index', (req, res) => {
    res.redirect('/');
});

// This will directly transfer to login if not logged in
app.get('/transfer-money', (req, res) => {
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
      if(err.code == '11000')
      {
      console.log("Cannot add duplicate user");
      res.render('404',{title :'404', message :"Cannot add duplicate user"});
      }
    
  })
  
  });

  app.post('/transfer',checkAuthenticated2,async (req,res)=>{

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


    if ( senderUser.balance < amount  ||  amount < 0 ) {
      res.render("payment-failure", { title: "Not Enough" });
    }

    if(req.user.email != senderUser.email){

    console.log("Invalid ",senderUser.email,req.user.email);
    res.render("payment-failure", { title: "Not logged in" });

    }
    console.log('Success');

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

})
app.get('/dashboard',checkAuthenticated2,async(req,res)=>{  
  res.render(__dirname + '/views/dashboard',{ title :"Dashboard",myuser :req.user, myclient : req.user });
});

app.get('/protectedroute',checkAuthenticated2,(req,res)=>{
  res.render(__dirname + '/views/protectedroute',{title : "protectedroute" ,myuser:req.user});
});

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
    
  res.redirect('/login');
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
        res.redirect('/login')
    })

}
app.use((req,res)=>{
res.status(404).render('404',{title :'404', message :"Something went wrong"});
});