import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import hospitalRouter from './routes/hospitalRouter.js';
import userRouter from './routes/userRouter.js';
import animalRouter from './routes/animalRouter.js';
import bloodSugarRouter from './routes/bloodSugarRouter.js';
import authenticateToken from './middleware/authMiddleware.js';

dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use('/hospital', hospitalRouter);
app.use('/user', userRouter);
app.use('/animal', authenticateToken, animalRouter);
app.use('/bloodSugar', authenticateToken, bloodSugarRouter);
app.get('/', (req, res) => {
    res.send('AnimalHospital Server');
});
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('資料庫連線成功');
    })
    .catch((err) => {
        console.log('資料庫連線失敗');
        console.log(err.message);
    });

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
export default app;
