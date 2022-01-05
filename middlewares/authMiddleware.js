const dotenv =  require('dotenv');
dotenv.config({path:'./config.env'});


const jwt = require('jsonwebtoken');
const User = require('../models/users');

const JWT_SECRET = process.env.JWT_SECRET;
const {OAuth2Client} = require('google-auth-library');

const CLIENT_ID = process.env.CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);  //Creating Object from class OAuth2Client

//Read about this class at : https://tinyurl.com/OAuth2Client OR
//https://googleapis.dev/nodejs/google-auth-library/5.5.0/classes/OAuth2Client.html


// Making sure the user is logged in (Simple Login)
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
  // Miidleware to check if person is logged in (Simple Login)
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
  // Miidleware to check if person is logged in with Google
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
      
        //Theory of Login
        //verifyIdToken is a method of Class OAuth2Client, client is the latter's object
        //It checks the certs and audience  {Visit : https://tinyurl.com/VerifyIdToken}
        //Parameter : options, Type : VerifyIdTokenOptions  {Visit : https://tinyurl.com/VerifyIdTokenOptions}
        //VerifyIdTokenOptions (It is an interface) Properties : audience, idToken, maxExpiry (Optional)
        //verifyIdToken returns Promise<LoginTicket> .It is a class {Visit : https://tinyurl.com/LoginTicket}
        // One of its method is getPayload() , which returns TokenPayload 
        //TokenPayload is an interface having properties : at_hash,aud, azp,email, 
        //email_verified, exp,given_name,hd,iat, iss, name, picture, profile.
       
        const ticket = await client.verifyIdToken({   
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        });     
        console.log("client.verifyIdToken function : " ,ticket);
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

// Miidleware to check if user is logged in with Google  / simple Id - Pass & is Registered 
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

    // Miidleware to check if user is logged in with Google & is Registered 
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
  // Miidleware to check if person is logged in with Google
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