import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import Animal from '../models/animalModel.js';
import DiaryBloodRecord from '../models/bloodSugarModel.js';
import BloodSugarCurve from '../models/bloodSugarCurveModel.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();
const router = express.Router();
const upload = multer();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const streamUpload = (req) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'avatars' }, // 上傳到 Cloudinary 中的指定資料夾
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream); // 將檔案 buffer 轉成 Readable Stream
    });
};

router.post('/create', upload.single('avatar'), async (req, res) => {
    try {
        // 解析 JSON 格式的欄位
        const parsedWeight = JSON.parse(req.body.weight || '[]');
        const parsedSharedWith = JSON.parse(req.body.sharedWith || '[]');
        const { hospitalId, userId, name, gender, sterilized, breed, bloodType, type, insulinBrand, admissionDate } = req.body;
        let { birthday } = req.body;
        if (!name || !name.trim()) {
            res.status(400).send({ message: '缺少參數：name' });
            return;
        }

        if (typeof birthday === 'number') {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth();
            const currentDay = currentDate.getDate();
            const birthYear = currentYear - Math.floor(birthday);
            const fractionalAge = birthday % 1;
            const daysInYear = 365.25;
            const fractionalDays = Math.round(fractionalAge * daysInYear);
            birthday = new Date(birthYear, currentMonth, currentDay - fractionalDays);
        }
        let avatarUrl = null;
        if (req.file) {
            const uploadResult = await streamUpload(req);
            avatarUrl = uploadResult.secure_url; // Cloudinary回傳圖片URL
        }
        const newAnimal = new Animal({
            hospitalId,
            userId,
            name,
            gender,
            weight: parsedWeight,
            birthday,
            sterilized,
            breed,
            bloodType,
            type,
            insulinBrand,
            admissionDate,
            sharedWith: parsedSharedWith,
            avatar: avatarUrl,
        });
        const animal = await newAnimal.save();
        res.status(201).send({ animal });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
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
        const animals = await Animal.find({ hospitalId }).populate('sharedWith').lean();
        animals.forEach((animal) => {
            if (animal.weight && animal.weight.length > 0) {
                animal.weight = animal.weight[animal.weight.length - 1].value;
            }
            if (animal.birthday instanceof Date && animal.birthday.toISOString() === '1970-01-01T00:00:00.000Z') {
                animal.birthday = '';
            }
        });
        return res.status(200).send(animals);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: '伺服器錯誤' });
    }
});
router.put('/edit', upload.single('avatar'), async (req, res) => {
    const { animalId, name, gender, weight, birthday, sterilized, breed, bloodType, type, insulinBrand, sharedWith, admissionDate } = req.body;
    // 確保 sharedWith 和 weight 正確解析
    const parsedSharedWith = JSON.parse(sharedWith || '[]');
    let parsedWeight = [];
    if (weight) {
        try {
            parsedWeight = JSON.parse(weight);
        } catch (error) {
            console.error('解析 weight 失敗:', error);
            return res.status(400).send({ message: '體重資料格式錯誤' });
        }
    }
    if (!animalId) {
        return res.status(400).send({ message: '缺少動物 ID' });
    }
    try {
        const animal = await Animal.findById(animalId);
        if (!animal) {
            return res.status(404).send({ message: '找不到指定的動物資料' });
        }
        let avatarUrl = animal.avatar;
        if (req.file) {
            if (animal.avatar) {
                const publicId = animal.avatar.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy('avatars/' + publicId);
            }
            const uploadResult = await streamUpload(req);
            avatarUrl = uploadResult.secure_url;
        }
        animal.name = name || animal.name;
        animal.gender = gender || animal.gender;
        animal.birthday = birthday || animal.birthday;
        animal.sterilized = sterilized || animal.sterilized;
        animal.breed = breed || animal.breed;
        animal.bloodType = bloodType || animal.bloodType;
        animal.type = type || animal.type;
        animal.insulinBrand = insulinBrand || animal.insulinBrand;
        animal.sharedWith = parsedSharedWith;
        animal.admissionDate = admissionDate || animal.admissionDate;
        animal.avatar = avatarUrl;
        if (parsedWeight.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            // 體重有資料就改最後一筆，日期改為今天
            if (animal.weight && Array.isArray(animal.weight) && animal.weight.length > 0) {
                const lastWeightEntry = animal.weight[animal.weight.length - 1];
                lastWeightEntry.value = parsedWeight[0].value || lastWeightEntry.value; // 用傳入的值更新
                lastWeightEntry.date = today;
            } else {
                animal.weight = [{ value: parsedWeight[0].value, date: today }];
            }
        }
        await animal.save();
        res.send({ animal });
    } catch (error) {
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
router.delete('/delete/:animalId', async (req, res) => {
    try {
        const { animalId } = req.params;
        const animal = await Animal.findById(animalId);
        if (!animal) {
            return res.status(404).json({ message: '動物未找到' });
        }
        await DiaryBloodRecord.deleteMany({ animalId });
        await BloodSugarCurve.deleteMany({ animalId });
        if (animal.avatar) {
            const publicId = animal.avatar.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy('avatars/' + publicId);
        }
        await animal.deleteOne();
        return res.json({ message: '刪除成功', animal });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '伺服器錯誤' });
    }
});
router.get('/share/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: '無效的 userId' });
        }
        const objectId = new mongoose.Types.ObjectId(userId.trim());
        const animals = await Animal.find({
            sharedWith: objectId,
        });
        if (animals.length > 0) {
            res.status(200).json(animals);
        } else {
            res.status(404).json({ message: '沒有找到符合條件的動物' });
        }
    } catch (error) {
        console.error('查詢失敗:', error);
        res.status(500).json({ message: '伺服器錯誤', error });
    }
});

export default router;
