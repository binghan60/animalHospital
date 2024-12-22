import express from 'express';
import Animal from '../models/animalModel.js';
import mongoose from 'mongoose';

const router = express.Router();

router.post('/create', async (req, res) => {
    const { hospitalId, userId, name, gender, weight, birthday, sterilized, breed, bloodType, type, insulinBrand, admissionDate, sharedWith } = req.body;
    if (!name.trim()) {
        res.status(501).send({ message: '缺少參數' });
        return;
    }
    try {
        const newAnimal = new Animal({
            hospitalId,
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
            sharedWith,
        });
        const animal = await newAnimal.save();
        res.send({ animal });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.errors });
    }
});
router.get('/detail/:animalId', async (req, res) => {
    try {
        const { animalId } = req.params;
        const animalInfo = await Animal.findById(animalId);
        if (animalInfo) {
            res.send(animalInfo);
            return;
        }
        res.status(404).send({ message: '找不到符合條件的動物，請檢查搜尋條件' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '伺服器錯誤' });
    }
});
router.get('/:hospitalId', async (req, res) => {
    try {
        const hospitalId = req.params.hospitalId;
        const animals = await Animal.find({ hospitalId }).lean();
        animals.forEach((animal) => {
            if (animal.weight && animal.weight.length > 0) {
                animal.weight = [animal.weight[animal.weight.length - 1]];
            }
        });
        return res.status(200).send(animals);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: '伺服器錯誤' });
    }
});
router.put('/edit', async (req, res) => {
    const { animalId, name, gender, weight, birthday, sterilized, breed, bloodType, type, insulinBrand, admissionDate } = req.body;
    if (!animalId) {
        return res.status(400).send({ message: '缺少動物 ID' });
    }
    try {
        const animal = await Animal.findById(animalId);
        if (!animal) {
            return res.status(404).send({ message: '找不到指定的動物資料' });
        }
        animal.name = name || animal.name;
        animal.gender = gender || animal.gender;
        animal.birthday = birthday || animal.birthday;
        animal.sterilized = sterilized || animal.sterilized;
        animal.breed = breed || animal.breed;
        animal.bloodType = bloodType || animal.bloodType;
        animal.type = type || animal.type;
        animal.insulinBrand = insulinBrand || animal.insulinBrand;
        animal.admissionDate = admissionDate || animal.admissionDate;
        if (animal.weight.length > 0) {
            //體重有資料就改最後一筆，日期改為今天
            const today = new Date().toISOString().split('T')[0];
            const lastWeightEntry = animal.weight[animal.weight.length - 1];
            lastWeightEntry.value = weight[0].value;
            lastWeightEntry.date = today;
        } else {
            animal.weight = [{ value: weight.value, date: today }];
        }
        await animal.save();
        res.send({ animal });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: '更新發生錯誤' });
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
        res.send({ message: '新增成功', weight: updatedAnimal.weight });
    } catch (error) {
        console.error('新增體重時發生錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});

export default router;
