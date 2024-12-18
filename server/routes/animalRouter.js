import express from 'express';
import Animal from '../models/animalModel.js';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', (req, res) => {
    res.send({ message: '動物路由' });
});

router.get('/detail/:animalId', async (req, res) => {
    try {
        const { animalId } = req.params;
        const animalInfo = await Animal.findById(animalId);
        if (animalInfo) {
            res.send(animalInfo);
            console.log(animalInfo);
            return;
        }
        res.status(404).send({ message: '找不到符合條件的動物，請檢查搜尋條件' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '伺服器錯誤' });
    }
});
router.get('/:userId', async (req, res) => {
    const { searchKeyword } = req.query;
    try {
        const userId = req.params.userId;
        let animals;

        if (searchKeyword) {
            animals = await Animal.find({ userId, name: { $regex: searchKeyword, $options: 'i' } });
        } else {
            animals = await Animal.find({ userId });
        }
        animals.forEach((animal) => {
            if (animal.weight && animal.weight.length > 0) {
                animal.weight = animal.weight[animal.weight.length - 1];
            }
        });
        if (animals.length > 0) {
            res.send(animals);
        } else {
            res.status(404).send({ message: '找不到符合條件的動物，請檢查搜尋條件' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '伺服器錯誤' });
    }
});

router.post('/create', async (req, res) => {
    const { userId, name, gender, weight, birthday, sterilized, breed, bloodType, type, insulinBrand, admissionDate } = req.body;
    try {
        const newAnimal = new Animal({
            userId,
            name,
            gender,
            weight,
            birthday,
            sterilized,
            breed,
            bloodType,
            type,
            insulinBrand,
            admissionDate,
        });
        const animal = await newAnimal.save(); //保存至資料庫
        res.send({ animal });
    } catch (error) {
        res.status(500).json({ message: error.errors });
    }
});

router.post('/createWeight', async (req, res) => {
    try {
        const { animalId, date, value } = req.body;
        if (!animalId || !date || !value) {
            return res.status(400).json({ message: '缺少參數：animalId, date, value' });
        }
        if (typeof value !== 'number' || value <= 0) {
            return res.status(400).json({ message: '體重值無效，請輸入大於 0 的數字' });
        }
        const animal = await Animal.findById(animalId);
        if (!animal) {
            return res.status(404).json({ message: '找不到對應的動物' });
        }
        animal.weight.push({ date: new Date(date), value });
        animal.weight.sort((a, b) => new Date(a.date) - new Date(b.date));
        const updatedAnimal = await animal.save();
        res.send({ message: '新增成功', animal: updatedAnimal.weight });
    } catch (error) {
        console.error('新增體重時發生錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});

export default router;
