import express from 'express';
import BloodSugar from '../models/bloodSugarModel.js';
import BloodSugarCurve from '../models/bloodSugarCurveModel.js';
import mongoose from 'mongoose';
const router = express.Router();
router.get('/diary', async (req, res) => {
    const { animalId, startDate, endDate } = req.query;
    if (!mongoose.Types.ObjectId.isValid(animalId)) {
        return res.status(400).send({ message: 'Invalid animal ID' });
    }
    if (!startDate || !endDate) {
        return res.status(400).send({ message: 'startDate and endDate are required' });
    }
    try {
        const data = await BloodSugar.find({
            animalId,
            date: { $gte: startDate, $lte: endDate },
        }).sort({ date: 1 });
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).send({ message: 'Server error' });
    }
});
router.post('/create', async (req, res) => {
    try {
        const { animalId, date, records, notes } = req.body;
        if (!mongoose.Types.ObjectId.isValid(animalId)) {
            return res.status(400).json({ message: 'Invalid animalId' });
        }
        const existingRecord = await BloodSugar.findOne({
            animalId,
            date: new Date(date),
        });
        if (existingRecord) {
            existingRecord.records = [...existingRecord.records, ...records];
            existingRecord.notes = notes || existingRecord.notes;
            const updatedRecord = await existingRecord.save();
            return res.status(200).send({ message: '新增成功', ...updatedRecord });
        }
        const newBloodSugar = new BloodSugar({
            animalId,
            date: new Date(date),
            records,
            notes,
        });
        const bloodSugarRecord = await newBloodSugar.save();
        return res.status(201).send({ message: '新增成功', ...bloodSugarRecord });
    } catch (error) {
        console.error('Error creating or updating blood sugar record:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Server Error' });
    }
});
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { animalId, taskId, task, notes } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }
        const existingRecord = await BloodSugar.findById(id);
        if (!existingRecord) {
            return res.status(404).json({ message: 'Record not found' });
        }
        if (animalId != existingRecord.animalId) {
            return res.status(404).json({ message: 'this account not auth' });
        }
        const recordIndex = existingRecord.records.findIndex((record) => record._id.toString() === taskId);
        if (recordIndex === -1) {
            return res.status(404).json({ message: 'Record item not found' });
        }
        existingRecord.records[recordIndex] = { ...existingRecord.records[recordIndex], ...task };
        if (notes !== undefined) {
            existingRecord.notes = notes;
        }
        const updatedBloodSugar = await existingRecord.save();
        return res.status(200).json({ message: '更新成功', ...updatedBloodSugar });
    } catch (error) {
        console.error('Error updating blood sugar record:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/getCurve', async (req, res) => {
    const { animalId, startDate, endDate } = req.query;
    if (!mongoose.Types.ObjectId.isValid(animalId)) {
        return res.status(400).json({ message: 'Invalid animalId' });
    }
    if (!startDate || !endDate) {
        return res.status(400).send({ message: 'startDate and endDate are required' });
    }
    try {
        const data = await BloodSugarCurve.find({
            animalId,
            date: { $gte: startDate, $lte: endDate },
        })
            .sort({ date: 1 })
            .lean();
        return res.status(201).send({ data: data.map((x) => ({ date: x.date, records: x.records })) });
    } catch (error) {
        console.error('Error creating or updating blood sugar record:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Server Error' });
    }
});
router.post('/createCurve', async (req, res) => {
    try {
        const { animalId, date, records } = req.body;
        if (!mongoose.Types.ObjectId.isValid(animalId)) {
            return res.status(400).json({ message: 'Invalid animalId' });
        }
        const targetDate = new Date(date);
        const existingRecord = await BloodSugarCurve.findOne({
            animalId,
            date: { $gte: targetDate, $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000) },
        });
        if (existingRecord) {
            existingRecord.records.push(...records);
            const updatedRecord = await existingRecord.save();
            return res.status(200).send(updatedRecord);
        } else {
            //沒資料
            const newBloodSugarCurve = new BloodSugarCurve({
                animalId,
                date: targetDate,
                records,
            });
            const bloodSugarCurve = await newBloodSugarCurve.save();
            return res.status(201).send(bloodSugarCurve);
        }
    } catch (error) {
        console.error('Error creating or updating blood sugar record:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
