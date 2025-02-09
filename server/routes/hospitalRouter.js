import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import Hospital from '../models/hospitalModel.js';
import PasswordResetToken from '../models/passwordResetTokenTokenModel.js';
const router = express.Router();
router.post('/register', async (req, res) => {
    try {
        const { account, password, name, phone, address, email, isActive } = req.body;
        if ((!account.trim(), !password.trim())) {
            res.status(400).send({ message: '註冊失敗' });
            return;
        }
        const existingHospital = await Hospital.findOne({ account });
        if (existingHospital) {
            return res.status(400).json({ message: '帳號已存在' });
        }
        const passwordString = String(password.trim());
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordString, salt);
        const newHospital = new Hospital({
            account: account.trim(),
            password: hashedPassword,
            name,
            phone,
            address,
            email,
            isActive,
        });
        await newHospital.save();
        res.status(200).send({ message: '註冊成功' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: '伺服器錯誤' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { account, password } = req.body;
        if (!account || !password) {
            return res.status(400).send({ message: '帳號或密碼錯誤' });
        }
        const hospital = await Hospital.findOne({ account }).lean();
        if (!hospital) {
            return res.status(400).send({ message: '帳號或密碼錯誤' });
        }
        const isMatch = await bcrypt.compare(password, hospital.password);
        if (!isMatch) {
            return res.status(400).json({ message: '帳號或密碼錯誤' });
        }
        if (!hospital.isActive) {
            return res.status(400).json({ message: '帳號已停用' });
        }
        const payload = {
            _id: hospital._id,
            accountType: 'hospital',
        };
        delete hospital.password;
        const token = jwt.sign(payload, process.env.LOGIN_SECRET, { expiresIn: '7d' });
        const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
        return res.status(200).json({ ...hospital, message: '登入成功', token, expiresAt, role: 'hospital' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: '伺服器錯誤' });
    }
});
router.post('/tokenLogin', async (req, res) => {
    const authorization = req.headers.authorization;
    const token = authorization?.slice(7);
    if (token) {
        jwt.verify(token, process.env.LOGIN_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(400).json({ message: '登入失敗' });
            }
            const hospital = await Hospital.findById(decoded._id);
            if (!hospital) {
                return res.status(400).json({ message: '登入失敗' });
            }
            if (!hospital.isActive) {
                return res.status(400).json({ message: '登入失敗' });
            }
            const response = hospital.toObject();
            delete response.password;
            response.role = 'hospital';
            return res.status(200).json({ ...response, message: '登入成功', token });
        });
    }
});
router.post('/forgetPassword', async (req, res) => {
    try {
        const account = await Hospital.findOne({ account: req.body.account });
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
        const hospitalId = req.params.id;
        const hospital = await Hospital.findById(hospitalId).lean();
        if (!hospital) {
            return res.status(404).json({ message: '找不到該醫院' });
        }
        delete hospital.password;
        delete hospital.passwordUpdatedAt;
        res.json(hospital);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '伺服器錯誤' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const hospitalId = req.params.id;
        const { name, email, address, phone } = req.body;

        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return res.status(404).json({ message: '醫院不存在' });
        }
        hospital.name = name || hospital.name;
        hospital.email = email || hospital.email;
        hospital.address = address || hospital.address;
        hospital.phone = phone || hospital.phone;
        await hospital.save();
        res.json({ message: '更新成功', profile: { ...hospital.toObject(), role: 'hospital' } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '伺服器錯誤' });
    }
});

export default router;
