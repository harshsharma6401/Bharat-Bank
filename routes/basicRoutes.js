const {Router} = require('express');
const router = Router();
const basicController = require('../controllers/basicController');


router.get('/transfer-money',basicController.transferMoney_get);

//router.post('/transfer',basicController.transfer_post);

 router.get('/add-user',basicController.addUser_get);

 router.post('/view-users',basicController.viewUsers_post);

 router.get('/view-users',basicController.viewUsers_get);

 router.get('/all-users',basicController.allUsers_get);
  
 router.get('/transac-history',basicController.transacHistory_get);

 router.get('/transaction-history',basicController.transactionHistory_get);

 router.get('/login',basicController.login_get);

 //router.post('/login',basicController.login_post);
  



module.exports = router;