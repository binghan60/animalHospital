import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/userModel.js';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', (req, res) => {
    res.send({ message: 'UserRouter' });
});
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ isSuccess: false, message: '參數不足' });
        }
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ isSuccess: false, message: '帳號重複' });
        }
        const passwordString = String(password);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordString, salt);
        const newUser = new User({
            username,
            password: hashedPassword,
        });
        await newUser.save();
        res.status(201).json({ isSuccess: true, message: '註冊成功' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ isSuccess: false, message: '伺服器錯誤' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ isSuccess: false, message: '參數不足' });
        }
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ isSuccess: false, message: '查無帳號' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ isSuccess: false, message: '密碼錯誤' });
        }
        const payload = {
            userId: user._id,
            username: user.username,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        const expired = Date.now() + 7 * 24 * 60 * 60 * 1000;
        res.status(200).json({ isSuccess: true, message: '登入成功', token, expired });
    } catch (error) {
        console.error(error);
        res.status(500).json({ isSuccess: false, message: '伺服器錯誤' });
    }
});

export default router;
