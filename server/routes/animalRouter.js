import express from 'express';
import Animal from '../models/animalModel.js';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', (req, res) => {
    res.send({ message: '動物路由' });
});
router.get('/:userId', async (req, res) => {
    const { searchKeyword } = req.query;
    try {
        const userId = req.params.userId;
        let animal;
        if (searchKeyword) {
            animal = await Animal.find({ userId, name: { $regex: searchKeyword, $options: 'i' } });
        } else {
            animal = await Animal.find({ userId });
        }
        if (animal.length > 0) {
            res.send(animal);
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
router.get('/', async (req, res) => {});

export default router;
