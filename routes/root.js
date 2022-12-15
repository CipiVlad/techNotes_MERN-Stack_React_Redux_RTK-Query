const express = require('express')
const router = express.Router()
const path = require('path')

//?     --> using "regex"
//      -->  selft setting up public folder for css and html 
router.get('^/$|/(.html)?', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
})

module.exports = router