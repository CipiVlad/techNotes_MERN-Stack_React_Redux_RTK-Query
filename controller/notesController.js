const Note = require('../models/Note')
const User = require("../models/User");
const asyncHandler = require('express-async-handler');


//*@desc    Get all users notes
//*@route   GET /notes
//*@access  Private
const getNotes = asyncHandler(async (req, res) => {
    //todo:     get all notes
    const notes = await Note.find().lean()



    //?         what if there are no notes?
    if (!notes.length) {
        return res.status(400).json({ msg: `There aren't any notes!` })
    }

    //todo      Add username to each note before sending the  response with      
    //Promise.all()
    const notesWithUser = await Promise.all(
        notes.map(async (note) => {
            const user = await User.findById(note.user).lean().exec()
            return { ...note, username: user.username }
        })
    )


    //todo      send all notes to 
    res.status(200).json(notesWithUser)
})


//*@desc    Create a new note
//*@route   POST /notes
//*@access  Private
const createNote = asyncHandler(async (req, res) => {
    //?     What will user input
    const { user, title, text } = req.body

    //todo  Confirm data
    if (!user || !title || !text) {
        res.status(400).json({ msg: 'All fields required' })
    }

    //todo  Check for duplicates
    const duplicates = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()
    if (duplicates) {
        return res.status(409).json({ msg: 'Duplicate note title' })
    }

    //todo  Create and store the new users note
    const note = await Note.create({ user, title, text })

    if (note) { // Created 
        return res.status(201).json({ message: 'New note created' })
    } else {
        return res.status(400).json({ message: 'Invalid note data received' })
    }

})


//*@desc    Update a note
//*@route   PATCH /notes
//*@access  Private
const updateNote = asyncHandler(async (req, res) => {
    //?     What does user want to update?
    const { id, user, title, text, completed } = req.body

    //todo   Confirm input data
    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    //todo   find the note that you want to update, confirm it exists
    const note = await Note.findById(id).exec()
    if (!note) {
        return res.status(400).json({ msg: 'Not not found!' })
    }

    //todo  check for duplicate tilte
    const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()
    //Allow renaming of the original note
    if (duplicate && duplicate?._id.toString() !== id) {
        res.status(409).json({ msg: 'Duplicate note title' })
    }

    //todo  UPDATE
    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    //todo  save update
    const updatedNote = await note.save()

    res.json(`'${updatedNote.title} updated!'}`)

})


//*@desc    Delete a note
//*@route   DELETE /notes
//*@access  Private
const deleteNote = asyncHandler(async (req, res) => {
    //?     Which note do you want to delete?
    const { id } = req.body

    //todo  Confirm user input data
    if (!id) {
        return res.status(400).json({ message: 'Note ID required' })
    }

    //todo  find note in db
    const note = await Note.findById(id).exec()

    if (!note) {
        res.status(400).json({ msg: 'Not not found!' })
    }

    //todo  delete note
    const deleteNote = await note.deleteOne()

    //todo  give feedback about deleted note
    const feedback = `Note ${deleteNote.title} with ID ${deleteNote._id}   has been successfully delted!`

    res.json(feedback)
})

module.exports = {
    getNotes,
    createNote,
    updateNote,
    deleteNote
}

