const express= require('express')
const router=express.Router();
const userController= require('../Controllers/userController')
const cardController=require('../Controllers/cardController')


router.post('/createUser',userController.createUser)
router.post('/loginUser',userController.loginUser)

router.post('/createCard',cardController.createCard)
router.get('/getCard',cardController.getCard)
router.put('/updateCard',cardController.updateCard)
router.delete('/deleteCard',cardController.deleteCard)

module.exports=router;