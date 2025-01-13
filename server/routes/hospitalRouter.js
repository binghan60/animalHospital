import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Hospital from '../models/hospitalModel.js';
const router = express();
router.post('/register', async (req, res) => {
    try {
        const { account, password, name, phone, address, email, isActive } = req.body;
        if ((!account.trim(), !password.trim())) {
            res.status(400).send({ message: '註冊失敗' });
            return;
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
        };
        delete hospital.password;
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
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
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(400).json({ message: '登入失敗' });
            }
            const hospital = await Hospital.findById(decoded._id).lean();
            delete hospital.password;
            if (!hospital) {
                return res.status(400).json({ message: '登入失敗' });
            }
            if (!hospital.isActive) {
                return res.status(400).json({ message: '登入失敗' });
            }
            return res.status(200).json({ ...hospital, message: '登入成功', token });
        });
    }
});
export default router;
