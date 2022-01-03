const {Router} = require('express');
const router = Router();
const authController = require('../controllers/authControllers');
const {checkAuthenticated3} = require('../middlewares/authMiddleware');

router.get('/loginother',authController.loginother_get);

router.get('/signup',authController.signup_get);

router.get('/sign-up',authController.signUp_get); //This is same  as add user 

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