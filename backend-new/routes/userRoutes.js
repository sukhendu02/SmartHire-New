const express = require('express');
const { getUsers, getUser, updateUser, uploadResume, getResume, deleteUser, upload } = require('../controllers/userController');

const router = express.Router();

// User routes
router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.post('/:id/resume', upload.single('resume'), uploadResume);
router.get('/:id/resume/:filename', getResume);
router.delete('/:id', deleteUser);

module.exports = router;
