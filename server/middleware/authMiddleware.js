import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import Hospital from '../models/hospitalModel.js';
dotenv.config();
export default async function authenticateToken(req, res, next) {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ message: '沒有金鑰' });
    }
    const token = authorization.slice(7, authorization.length);
    try {
        const decoded = jwt.verify(token, process.env.LOGIN_SECRET);
        let account;
        if (decoded.accountType === 'hospital') {
            account = await Hospital.findById(decoded._id);
        } else if (decoded.accountType === 'user') {
            account = await User.findById(decoded._id);
        }
        if (!account) {
            return res.status(401).send({ message: '用戶不存在' });
        }
        const passwordUpdatedAt = Math.floor(new Date(account.passwordUpdatedAt).getTime() / 1000);
        if (decoded.iat < passwordUpdatedAt) {
            return res.status(444).send({ message: 'Token 已失效，請重新登入' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).send({ message: '金鑰無效' });
    }
}
