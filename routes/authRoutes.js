const {Router} = require('express');
const router = Router();
const authController = require('../controllers/authControllers');
const {checkAuthenticated3} = require('../middlewares/authMiddleware');

router.get('/loginother',authController.loginother_get);

router.get('/sign-up',authController.signUp_get); //This is same  as add user 

router.post('/signup',authController.signup_post);

router.get('/login',authController.login_get); // Both login and login to will redirect to same page

router.get('/login2',authController.login2_get); 

router.post('/login2',authController.login2_post);  //For Sigin in with Email - pass (Simple JWT)

router.get('/logout2',authController.logout2_get);

router.post('/login',authController.login_post);  //For Sigin in with Google

router.get('/logout',checkAuthenticated3,authController.logout_get); 

router.get('/dashboard',checkAuthenticated3,authController.dashboard_get); //Dashboard is a protected route

router.get('/checksignin',authController.checksignin_get);

module.exports = router;