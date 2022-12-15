const express = require('express')
const router = express.Router()
const notesController = require('../controller/notesController')
const verifyJWT = require('../middleware/verifyJWT')

//! apply verifyJWT to all noteRoutes
router.use(verifyJWT)

router.route('/')
    .get(notesController.getNotes)
    .post(notesController.createNote)
    .patch(notesController.updateNote)
    .delete(notesController.deleteNote)

module.exports = router