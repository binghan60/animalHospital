import express from 'express';
import Animal from '../models/animalModel.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.send({ message: '動物路由' });
});

router.post('/create', async (req, res) => {
    try {
        const newAnimal = new Animal({
            //以req.body的資料new一個User
            name: req.body.name,
            birthday: req.body.birthday,
            bloodType: req.body.bloodType,
            variety: req.body.variety,
            type: req.body.type,
            gender: req.body.gender,
            weight: req.body.weight,
            ligation: req.body.ligation,
        });
        const animal = await newAnimal.save(); //保存至資料庫
        res.send({ animal });
    } catch (error) {
        // 捕獲 Mongoose validation 錯誤
        console.error(error);
        if (error.name === 'ValidationError') {
            // 如果是驗證錯誤，返回詳細錯誤信息
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        // 其他錯誤，返回 500 錯誤
        res.status(500).json({ message: 'Server Error' });
    }
});
router.get('/', async (req, res) => {});

export default router;
