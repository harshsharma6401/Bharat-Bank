const dotenv =  require('dotenv');
dotenv.config({path:'./config.env'});

const bcrypt = require('bcryptjs');
const User = require('../models/users');
const Transaction = require('../models/transactions');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

//const {requireAuth,checkUser} = require('../middlewares/authMiddleware');

module.exports.transferMoney_get = (req,res) =>{
    res.render('transfer-money',{title:'Transfer'});
 }
 module.exports.addUser_get = (req,res) =>{
    res.render('add-user',{title:'Add user'});
 }
 module.exports.viewUsers_get = (req,res) =>{
    res.redirect('all-users');
 }
 module.exports.allUsers_get = (req,res) =>{

    console.log('Res.locals : ',res.locals);
    console.log('Res.locals.Googleuser : ',res.locals.Googleuser);

    User.find()
    .then(result => {
      res.render('view-users', { users: result, title: 'Users' });
    })
    .catch(err => {
      console.log(err);
    });
 }

 module.exports.transactionHistory_get = (req,res) =>{
    Transaction.find()
    .then(result => {
      res.render('transaction-history', { transactions: result, title: 'Transactions' });
    })
    .catch(err => {
      console.log(err);
    });
 }
 module.exports.transacHistory_get = (req,res) =>{
    User.find()
    .then((result)=>{
      res.render('transac-history', { users: result, title: 'Transactions' });     
    })
    .catch((err)=>{
        res.render('404', { title: 'User Not Found', message :"Something went wrong"});
       // console.log(err);
    })
 }


 module.exports.viewUsers_post = async(req,res) =>{

    let last_user;
  
    last_user = await User.findOne().sort({ field: 'asc', _id: -1 }).limit(1);
    console.log(last_user);
    
    req.body.accountNumber = last_user.accountNumber + 1;
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
}
module.exports.transfer_post = async(req,res,) =>{
    const { sender, reciever, amount } = req.body;
    console.log(req.body);
    const sendid = sender;

    let senderUser, transferUser;
    try {
      senderUser = await User.findOne({ accountNumber: sender });
      transferUser = await User.findOne({ accountNumber: reciever });

    }
    catch (err) {
      res.render("payment-failure", { title: "Something went wrong" , message : "Something went wrong" });
    }

    if (!senderUser || !transferUser) {
      res.render("payment-failure", { title: "No User", message : "User not Found. Please check and try again!"  });
    }


    else if ( senderUser.balance < amount  ||  amount < 0 ) {
      res.render("payment-failure", { title: "Not Enough", message : "Amount entered is more than balance."  });
    }

    else if(req.user.email != senderUser.email){

    console.log("Invalid ",senderUser.email,req.user.email);
    res.render("payment-failure", { title: "Not logged in" , message : "Please login with your registered email address."});

    }
    else
    { 
    console.log('Success');

    senderUser.balance = senderUser.balance - Number(amount);
    transferUser.balance = transferUser.balance + Number(amount);
    let savedsenderUser, savedtransferUser;
    try {
      savedsenderUser = await senderUser.save();
      savedtransferUser = await transferUser.save();
    }
    catch (err) {
      res.render("payment-failure", { title: "Smthng2", message : "Something went wrong. Please try again !" });
    }

    let currency = '₹';

    const Amount = amount;
    const transaction_id = uuidv4();

    const transaction = new Transaction({
     transactionID : transaction_id,
     accountNumber1: savedsenderUser.accountNumber,
     name1: savedsenderUser.name,
     accountNumber2: savedtransferUser.accountNumber,
     name2: savedtransferUser.name,
     amount: Amount
     });  
     
     await transaction.save()
    .then((result)=>{
    res.render("payment-success", { title: "Transaction successful" ,message: `Your balance is ${currency} ${savedsenderUser.balance}.`});
    })
    .catch((err)=>{
     console.log(err);
     res.render("payment-failure", { title: "Something went wrong" , message : "Transaction cannot be saved in the database" });
    })
  }
 }
 
 module.exports.modify_post = async(req,res) =>{

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
}