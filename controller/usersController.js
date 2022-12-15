const User = require("../models/User");
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

//*@desc    Get all users
//*@route   GET /users
//*@access  Private

const getAllUsers = asyncHandler(async (req, res) => {
    //? ask db for stored users
    const users = await User
        .find()
        .select(' -password') //don't send password
        .lean() // don't send full document for dev

    //?     check data by condition
    if (!users.length) {
        return res.status(400).json({ msg: 'No users found' })
    }

    //? send User from db back to front to see users
    res.json(users)
})

//*@desc    Create new user
//*@route   POST /users
//*@access  Private

const createNewUser = asyncHandler(async (req, res) => {
    //?     what do we post?
    const { username, password, roles } = req.body;

    //?     confirm data conditions
    if (!username || !password) {
        return res.status(400).json({ msg: 'All fields are required.' })
    }

    //?     check for duplicates
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()
    if (duplicate) {
        res.status(409).json({ msg: 'Duplicate username.' })
    }

    //todo: Hash password
    const hashedPwd = await bcrypt.hash(password, 10)

    //todo: Create object 
    const userObject = (!Array.isArray(roles) || !roles.length)
        ? { username, password: hashedPwd }
        : { username, password: hashedPwd, roles }

    //todo: Create and Store new User   
    const user = await User.create(userObject)

    if (user) { //created 
        res.status(201).json({ message: `New user ${username} created` })
    } else {
        res.status(400).json({ message: 'Invalid user data received' })
    }
})

//*@desc    Update a user
//*@route   PATCH /users
//*@access  Private

const updateUser = asyncHandler(async (req, res) => {
    //?     what do you want to update?
    const { id, username, password, roles, active } = req.body

    //todo: Confirm data check
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ msg: 'All fields except password are required!' })
    }

    //todo: define our user and check if stored
    const user = await User.findById(id).exec()
    if (!user) {
        return res.status(400).json({ msg: 'User not found!' })
    }

    //todo: check for duplicate
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

    //? Allow updates to original user
    if (duplicate && duplicate?._id.toString() !== id) {
        res.status(409).json({ msg: 'Duplicate Username' })
    }

    //todo: ready to update with recieved Information
    user.username = username
    user.roles = roles
    user.active = active

    if (password) {
        //Hash password
        user.password = await bcrypt.hash(password, 10)
    }

    //todo: Save updated User to db
    const updatedUser = await user.save()
    res.json({ message: `${updatedUser.username} updated!` })

})

//*@desc    Delete a user
//*@route   DELETE /users
//*@access  Private

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body
    if (!id) {
        return res.status(400).json({ msg: 'User id required!' })
    }

    //! before deleting User, check if Notes are attached to User
    const note = await Note.findOne({ user: id }).lean().exec()
    if (note) {
        return res.status(400).json({ msg: 'user has assigned note!' })
    }

    //?     find User by Id 
    const user = await User.findById(id).exec()

    //todo  check if user is in db
    if (!user) {
        res.status(400).json({ msg: 'User not found!' })
    }

    //if user is in db
    const result = await user.deleteOne()
    const reply = `Username ${result.username} with ID: ${result._id} deleted!`

    res.json(reply)
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}