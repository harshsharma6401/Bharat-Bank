const {Router} = require('express');
const router = Router();
const basicController = require('../controllers/basicController');
const {checkUser,checkAuthenticated3,checkLogin} = require('../middlewares/authMiddleware');

 router.get('*',checkUser);
 router.get('*',checkLogin);

 router.get('/transfer-money',basicController.transferMoney_get);

 router.post('/transfer',checkAuthenticated3,checkUser,checkLogin,basicController.transfer_post);

 router.get('/add-user',basicController.addUser_get);

 router.post('/view-users',basicController.viewUsers_post);  // For registering a user / Sign - up

 router.get('/view-users',basicController.viewUsers_get);

 router.get('/all-users',basicController.allUsers_get);
  
 router.get('/transac-history',basicController.transacHistory_get); //This is sample page. 

 router.get('/transaction-history',basicController.transactionHistory_get);

 router.post('/modify',basicController.modify_post);

  
module.exports = router;
