const dotenv =  require('dotenv');
dotenv.config({path:'./config.env'});


const User = require('../models/users');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
//const JWT_SECRET = 'kccJUYHFV87fb6768O^(043jbrj(&5t&597%98%34bt242erjfbs424dihGFYUFK6ikRRKylfv6fULsdi5464&^$*sbdvs';

const handleErrors = (err) =>{
    console.log(err.message,err.code);
    let errors = { email : '' , password: '' };

     // incorrect email
    if (err.message === 'incorrect email') {
        errors.email = 'Email not registered'; 
        
        //For privacy reasons you should write Incorrect email / password
    }

    // incorrect password
    if (err.message === 'incorrect password') {
        errors.password = 'Incorrect Password';
    }

    //Duplicate email
    if(err.code === 11000){
        errors.email = "Email already registered";
        return errors;
    }

    // Validation errors
    if(err.message.includes('user validation failed')){

        Object.values(err.errors).forEach(({properties}) =>{
            errors[properties.path] = properties.message; 
            
            //properties.path either refer to email / password . 
            // properties.message is the error message (Specific , acc to email/ password)

        });
    }

    console.log('Errors are : ',errors);

    return errors;
}

const max_Age = 3 * 24 * 60 * 60; //   This is 3 days in seconds

const createToken = (id)=> {
return jwt.sign({id},JWT_SECRET,{
    expiresIn : max_Age  // expiresIn takes values in seconds
});
}


module.exports.signup_get = (req,res) =>{
    res.render('signup');
}
module.exports.login2_get = (req,res) =>{
    res.render('login2',{title : 'Login2'});
}

module.exports.signup_post = async(req,res) =>{

    const {email,password} = req.body;
    //console.log(email,password);

    try{
        const user = await User.create({email,password});

        const token = createToken(user._id);

        res.cookie('JWT',token,{ httponly : true, maxAge :max_Age * 1000,  SameSite : 'None'}); //maxAge field taken input in miliseconds

        console.log('User created : ',user);
        res.status(201).json({user : user._id});
    }
    catch(err){
        //console.log(err);
        const errors = handleErrors(err);
        res.status(400).json({errors});
    }
}

module.exports.login2_post = async(req,res) =>{
    //console.log(req.body);

    const {email,password} = req.body;
    console.log(email,password);

    try{
        const user = await User.login(email,password);
        
        const token = createToken(user._id);

        res.cookie('JWT',token,{ httponly : true, maxAge :max_Age * 1000 ,SameSite : 'None'}); //maxAge field taken input in miliseconds

        console.log('Logged in : ',user);
        res.status(200).json({user : user._id});
    }
    catch(err){

        const errors = handleErrors(err);

        res.status(400  ).json({errors});
        
    }

   // res.send('user login');
}

module.exports.logout2_get = (req,res) =>{
    
    res.cookie('JWT','',{maxAge : 1}); // Replacing the cookie for a empty string  and setting expiry a milisecond
    //Hence deleting it 
   // res.clearCookie('JWT');

    res.redirect('/');

}