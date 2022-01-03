const dotenv =  require('dotenv');
dotenv.config({path:'./config.env'});


const jwt = require('jsonwebtoken');
const User = require('../models/users');

const JWT_SECRET = process.env.JWT_SECRET;
const {OAuth2Client} = require('google-auth-library');

const CLIENT_ID = process.env.CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

const requireAuth = (req,res,next) =>{
    const token = req.cookies.JWT; // JWT is the name of the cookie
    console.log(req.body);
    //Check if JSON web token exists and verified  
    if(token)
    { 
        //console.log('Token : ',token);
        jwt.verify(token,JWT_SECRET,(err,decodedToken) =>{
        
            if(err)
            {
                console.log(err.message);
                res.redirect('/login');
            }
            else{
                console.log(decodedToken);
                next();
            }

        });
    }
    else
    {
        res.redirect('/login');
    }
}
// Check Current user
const checkUser = (req,res,next)=>{
    const token = req.cookies.JWT;
    if(token)
    { 
        //console.log('Token : ',token);
        jwt.verify(token,JWT_SECRET,async(err,decodedToken) =>{
        
            if(err)
            {
                console.log(err.message);
                res.locals.user = null;
                next();
            }
            else{
                console.log('Decoded token : ',decodedToken);
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                //console.log(typeof res.locals.user);
                next();
            }

        });
    }
    else
    {
        res.locals.user = null;
        next();
    }
}
const checkLogin = (req, res, next)=>{

    let token = req.cookies['session-token'];
    if(!token)
    {
      //console.log("No token ");
      res.locals.Googleuser = null;
      next();
    }
    else
    {

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
          //console.log("Req.user : ",req.user);
          res.locals.Googleuser = user;
          next();
  
      })
      .catch(err=>{
          console.log('checkLogin error : ',err);
          res.locals.Googleuser = null;
          next();

      })
    }
}


const checkAuthenticated3 = (req, res, next)=>{

    let token = req.cookies['session-token'];
    if(token)
    {
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
              //throw Error('This user is not registered');
            res.render('404', { title: 'User Not Found' ,message : 'This user is not registered.'});
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
          console.log(err);
          res.redirect('/login');
      })
    }
    else
    {
        const token = req.cookies.JWT; // JWT is the name of the cookie
        console.log(req.body);
        //Check if JSON web token exists and verified  
        if(token)
        { 
            //console.log('Token : ',token);
            jwt.verify(token,JWT_SECRET,(err,decodedToken) =>{
            
                if(err)
                {
                    console.log(err.message);
                    res.redirect('/login');
                }
                else{
                    console.log(decodedToken);
                    next();
                }

            });
        }
        else
        {
            res.redirect('/login');
        }
    }
  }
  
const checkAuthenticated2 = (req, res, next)=>{

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
          console.log(err);
          res.redirect('/login');
      })
  
  }

  const checkAuthenticated = (req, res, next)=>{ 
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
  
module.exports = {requireAuth ,checkUser,checkAuthenticated2,checkAuthenticated,checkAuthenticated3,checkLogin };