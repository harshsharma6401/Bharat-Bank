const {Router} = require('express');
const router = Router();
const basicController = require('../controllers/basicController');
const {requireAuth,checkUser,checkAuthenticated3,checkAuthenticated2,checkAuthenticated,checkLogin} = require('../middlewares/authMiddleware');

 router.get('*',checkUser);
 router.get('*',checkLogin);

 router.get('/transfer-money',basicController.transferMoney_get);

 router.post('/transfer',checkAuthenticated2,basicController.transfer_post);

 router.get('/add-user',basicController.addUser_get);

 router.post('/view-users',basicController.viewUsers_post);

 router.get('/view-users',basicController.viewUsers_get);

 router.get('/all-users',basicController.allUsers_get);
  
 router.get('/transac-history',basicController.transacHistory_get);

 router.get('/transaction-history',basicController.transactionHistory_get);

 router.post('/modify',basicController.modify_post);

  
module.exports = router;
