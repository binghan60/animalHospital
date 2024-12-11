import express from 'express';
import User from '../model/userModel.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.send({ message: 'UserRouter' });
});
router.post('/register', async (req, res) => {
    try {
        res.send({ posr: 'register' });
    } catch (error) {}
});

export default router;
