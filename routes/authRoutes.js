const {Router} = require('express');
const router = Router();
const authController = require('../controllers/authControllers');


router.get('/signup',authController.signup_get);

router.post('/signup',authController.signup_post);

router.get('/login2',authController.login2_get);

router.post('/login2',authController.login2_post);

router.get('/logout2',authController.logout2_get);


module.exports = router;