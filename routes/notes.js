const express = require('express');
const router = express.Router();
const fetchuser = require('../midleware/fetchuser')
const Notes = require('../models/notes');
const { body, validationResult } = require('express-validator');


//Route 1: get all notes GET: "/api/notes/fetchnotes"
router.get('/fetchnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id })
        res.json(notes);

    } catch (error) {
        console.error(error.message)
        res.status(500).send("error occured! ")
    }
})
//Router 2: adding a note using: POST "/api/notes/addnote"
router.post('/addnote', [
    body('title', "Title should be 3 character long").isLength({ min: 3 }),
    body('description', "Description should be 3 character long").isLength({ min: 3 })
], fetchuser, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.message });
        }
        const note = await Notes.create({
            user: req.user.id,
            title: req.body.title,
            description: req.body.description
        })
        res.json(note);

    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

//Route 3 : updating an existing note using: PUT "/api/notes/updatenote"
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    try {
        const {title, description} = req.body;
        const newnote = {};
        if(title){newnote.title = title}
        if(description){newnote.description = description}

        let note = await Notes.findById(req.params.id);
        if(!note){
            return res.status(404).send({error: "Note not found"})
        }
        if(note.user.toString() !== req.user.id){
            return res.status(401).send({error: "Unauthorized"})
        }
        note = await Notes.findByIdAndUpdate(req.params.id, {$set: newnote}, {new: true})
        res.json(note); 

    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

//Route 4 : deleting an existing note using: DELETE "/api/notes/deletenote"
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        const findnote = await Notes.findById(req.params.id);
        if(!findnote){
            return res.status(404).send({error: "Note not found"})
        }
        if(findnote.user.toString() !== req.user.id){
            return res.status(401).send({error: "Unauthorized"})
        }
        await Notes.findByIdAndDelete(req.params.id)
        res.json({msg: "Note deleted"});

    } catch (error) {
        res.status(500).send({ 'error': error.message })
    }
})
module.exports = router;