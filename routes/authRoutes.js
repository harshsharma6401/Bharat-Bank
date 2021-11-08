const {Router} = require('express');
const router = Router();
const authController = require('../controllers/authControllers');
const {requireAuth,checkUser,checkAuthenticated2,checkAuthenticated,checkAuthenticated3,checkLogin} = require('../middlewares/authMiddleware');

router.get('/signup',authController.signup_get);

router.post('/signup',authController.signup_post);

router.get('/login2',authController.login2_get);

router.post('/login2',authController.login2_post);

router.get('/logout2',authController.logout2_get);

router.get('/login',authController.login_get);

router.post('/login',authController.login_post);

router.get('/logout',checkAuthenticated3,authController.logout_get);

router.get('/dashboard',checkAuthenticated3,authController.dashboard_get);

router.get('/checksignin',authController.checksignin_get);

module.exports = router;