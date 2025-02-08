import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import PasswordResetToken from '../models/passwordResetTokenTokenModel.js';
import User from '../models/userModel.js';
import Hospital from '../models/hospitalModel.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const { token, password } = req.body;
    try {
        jwt.verify(token, process.env.RESETPASSWORD_SECRET, async (err, decode) => {
            if (err) {
                return res.status(401).send({ message: '此連結已失效' });
            }
            const existToken = await PasswordResetToken.findOne({ token });
            if (!existToken) {
                return res.status(404).send({ message: '此連結已失效' });
            }
            let account;
            if (existToken.accountType === 'hospital') {
                account = await Hospital.findById(existToken.accountId);
            } else if (existToken.accountType === 'user') {
                account = await User.findById(existToken.accountId);
            }
            if (!account) {
                return res.status(404).send({ message: '找不到該帳號' });
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            account.password = hashedPassword;
            account.passwordUpdatedAt = new Date();
            await account.save();
            await existToken.deleteOne();
            return res.status(200).json({ message: '密碼重設成功' });
        });
    } catch (err) {
        return res.status(500).send({ message: '伺服器錯誤，請稍後再試' });
    }
});

export default router;
