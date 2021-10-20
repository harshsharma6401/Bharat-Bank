const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({

    accountNumber:{
        type: Number,
        required: true   
    },
    name:{
        type: String,
        required: true   
    },
    email:{
        type: String,
        required: true   
    }, 
    balance:{
        type: Number,
        required: true   
    }

},{timestamps:true});

const User = mongoose.model('User',userSchema);
module.exports = User;