import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/userModel.js';
import PasswordResetToken from '../models/passwordResetTokenTokenModel.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.send({ message: 'UserRouter' });
});
router.get('/allUser', async (req, res) => {
    try {
        const user = await User.find({}).select('_id account name');
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '伺服器錯誤' });
    }
});
router.post('/register', async (req, res) => {
    try {
        const { account, password, name, phone, address, email, isActive } = req.body;
        if (!account || !password) {
            return res.status(400).json({ message: '參數不足' });
        }
        const existingUser = await User.findOne({ account });
        if (existingUser) {
            return res.status(400).json({ message: '帳號已存在' });
        }
        const passwordString = String(password);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordString, salt);
        const newUser = new User({
            account: account.trim(),
            password: hashedPassword,
            name,
            phone,
            address,
            email,
            isActive,
        });
        await newUser.save();
        res.status(201).json({ message: '註冊成功' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '伺服器錯誤' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { account, password } = req.body;
        if (!account || !password) {
            return res.status(400).json({ message: '帳號或密碼錯誤' });
        }
        const user = await User.findOne({ account });
        if (!user) {
            return res.status(400).send({ message: '帳號或密碼錯誤' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: '帳號或密碼錯誤' });
        }
        if (!user.isActive) {
            return res.status(400).json({ message: '帳號已停用' });
        }
        const payload = {
            _id: user._id,
            accountType: 'user',
        };
        const token = jwt.sign(payload, process.env.LOGIN_SECRET, { expiresIn: '7d' });
        const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
        const response = user.toObject();
        response.role = 'user';
        delete response.password;
        return res.status(200).json({ ...response, message: '登入成功', token, expiresAt });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: '伺服器錯誤' });
    }
});
router.post('/tokenLogin', async (req, res) => {
    const authorization = req.headers.authorization;
    const token = authorization?.slice(7, authorization?.length);
    jwt.verify(token, process.env.LOGIN_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: '登入失敗' });
        }
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(400).json({ message: '登入失敗' });
        }
        if (!user.isActive) {
            return res.status(400).json({ message: '登入失敗' });
        }
        const response = user.toObject();
        delete response.password;
        response.role = 'user';
        return res.status(200).json({ ...response, message: '登入成功', token });
    });
});
router.post('/forgetPassword', async (req, res) => {
    try {
        const account = await User.findOne({ account: req.body.account });
        if (!account) {
            return res.status(404).json({ message: '帳號不存在' });
        }
        if (account.email === '') {
            return res.status(404).json({ message: '此帳號未設定email' });
        }
        const existToken = await PasswordResetToken.findOne({ accountId: account._id });
        if (existToken) {
            return res.status(404).json({ message: '密碼重置信件已寄出，請至信箱查看。' });
        }
        const token = jwt.sign({ accountId: account._id, role: req.body.role }, process.env.RESETPASSWORD_SECRET, { expiresIn: 600 });
        const now = new Date();
        const newResetPasswordToken = new PasswordResetToken({
            accountId: account._id,
            accountType: req.body.role,
            token,
            expiresAt: new Date(now.getTime() + 600 * 1000),
            createdAt: now,
        });
        await newResetPasswordToken.save();
        // Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });
        const resetLink = `${process.env.VITE_PATH}/reset-password?token=${token}`;
        const mailOptions = {
            from: process.env.SMTP_EMAIL,
            to: account.email,
            subject: '動物健康管理系統重置密碼',
            html: `
                <p>您好，${account.account}</p>
                <p>請點擊以下連結來重置您的密碼：</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>此連結將在 10 分鐘後過期。</p>
            `,
        };
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: '重置密碼的連結已發送至您的 Email' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).lean();
        if (!user) {
            return res.status(404).json({ message: '找不到該醫院' });
        }
        delete user.password;
        delete user.passwordUpdatedAt;
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '伺服器錯誤' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email, address, phone } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: '醫院不存在' });
        }
        user.name = name || user.name;
        user.email = email || user.email;
        user.address = address || user.address;
        user.phone = phone || user.phone;
        await user.save();
        res.json({ message: '更新成功', profile: { ...user.toObject(), role: 'user' } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '伺服器錯誤' });
    }
});

export default router;
