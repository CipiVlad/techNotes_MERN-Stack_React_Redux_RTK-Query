const express = require('express')
const router = express.Router()
const usersController = require('../controller/usersController')
const verifyJWT = require('../middleware/verifyJWT')

//! apply verifyJWT to all noteRoutes
router.use(verifyJWT)
//--> /users
router.route('/')
    .get(usersController.getAllUsers)
    .post(usersController.createNewUser)
    .patch(usersController.updateUser)
    .delete(usersController.deleteUser)

module.exports = router