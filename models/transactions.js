const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({

    transactionID:{
        type: String,
        required: true, 
        unique: true,
    },
    accountNumber1:{
        type: Number,
        required: true, 
        unique: false,
    },
    name1:{
        type: String,
        required: true,
        unique: false,   
    },
    accountNumber2:{
        type: Number,
        required: true,
        unique: false,

    },
    name2:{
        type: String,
        required: true,
        unique: false,  
    },
    amount:{
        type: Number,
        required: true,
        unique: false
    },

},{timestamps:true});

const Transaction = mongoose.model('Transaction',transactionSchema);
module.exports = Transaction;