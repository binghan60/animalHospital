import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
// 驗證 JWT
export default function authenticateToken(req, res, next) {
    const authorization = req.headers.authorization;
    if (authorization) {
        const token = authorization.slice(7, authorization.length); //抓取token部分  Bearer XXXXXX
        jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
            if (err) {
                res.status(401).send({ message: '金鑰無效' });
            } else {
                req.user = decode;
                next();
            }
        });
    } else {
        res.status(401).send({ message: '沒有金鑰' });
    }
}
