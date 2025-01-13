import express from 'express';
import BloodSugar from '../models/bloodSugarModel.js';
import BloodSugarCurve from '../models/bloodSugarCurveModel.js';
import mongoose from 'mongoose';
const router = express.Router();

router.get('/average', async (req, res) => {
    try {
        const { animalId, startDate, endDate } = req.query;
        if (!startDate || !endDate || isNaN(new Date(startDate)) || isNaN(new Date(endDate))) {
            return res.status(400).send({ message: 'Invalid date format' });
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        const results = await BloodSugar.aggregate([
            {
                $match: {
                    animalId: new mongoose.Types.ObjectId(animalId), // 轉換 animalId 為 ObjectId
                    date: { $gte: start, $lte: end }, // 篩選日期範圍
                },
            },
            {
                $facet: {
                    averages: [
                        {
                            $group: {
                                _id: null,
                                morningAverage: { $avg: '$morning.bloodSugar' },
                                eveningAverage: { $avg: '$evening.bloodSugar' },
                            },
                        },
                    ],
                    morningCounts: [
                        {
                            // 統計早上血糖分布
                            // $cond: [{ $and: [{ $lte: ['$morning.bloodSugar', 249] }, { $ne: ['$morning.bloodSugar', null] }] }, 1, 0] 符合條件回傳1  不符合回傳0
                            $group: {
                                _id: null,
                                count_1_249: {
                                    $sum: {
                                        $cond: [{ $and: [{ $lte: ['$morning.bloodSugar', 249] }, { $ne: ['$morning.bloodSugar', null] }] }, 1, 0],
                                    },
                                },
                                count_250_399: {
                                    $sum: {
                                        $cond: [{ $and: [{ $gte: ['$morning.bloodSugar', 250] }, { $lte: ['$morning.bloodSugar', 399] }, { $ne: ['$morning.bloodSugar', null] }] }, 1, 0],
                                    },
                                },
                                count_400_plus: {
                                    $sum: {
                                        $cond: [{ $and: [{ $gte: ['$morning.bloodSugar', 400] }, { $ne: ['$morning.bloodSugar', null] }] }, 1, 0],
                                    },
                                },
                            },
                        },
                    ],
                    eveningCounts: [
                        {
                            // 統計晚上血糖分布
                            $group: {
                                _id: null,
                                count_1_249: {
                                    $sum: {
                                        $cond: [{ $and: [{ $lte: ['$evening.bloodSugar', 249] }, { $ne: ['$evening.bloodSugar', null] }] }, 1, 0],
                                    },
                                },
                                count_250_399: {
                                    $sum: {
                                        $cond: [{ $and: [{ $gte: ['$evening.bloodSugar', 250] }, { $lte: ['$evening.bloodSugar', 399] }, { $ne: ['$evening.bloodSugar', null] }] }, 1, 0],
                                    },
                                },
                                count_400_plus: {
                                    $sum: {
                                        $cond: [{ $and: [{ $gte: ['$evening.bloodSugar', 400] }, { $ne: ['$evening.bloodSugar', null] }] }, 1, 0],
                                    },
                                },
                            },
                        },
                    ],
                },
            },
            {
                // $project 用來重新格式化輸出的數據
                // $ifNull 檢查某個值是否為 null [ '檢查值' , '檢查不通過回傳值']
                // $arrayElemAt: ['$averages', 0]   上面計算好的averages第0筆
                $project: {
                    averages: {
                        $mergeObjects: [
                            {
                                // 計算早晚、總平均
                                morningAverage: {
                                    $avg: [{ $ifNull: [{ $arrayElemAt: ['$averages.morningAverage', 0] }, 0] }],
                                },
                                eveningAverage: {
                                    $avg: [{ $ifNull: [{ $arrayElemAt: ['$averages.eveningAverage', 0] }, 0] }],
                                },
                                combinedAverage: {
                                    $avg: [{ $ifNull: [{ $arrayElemAt: ['$averages.morningAverage', 0] }, 0] }, { $ifNull: [{ $arrayElemAt: ['$averages.eveningAverage', 0] }, 0] }],
                                },
                            },
                        ],
                    },
                    morningCounts: { $ifNull: [{ $arrayElemAt: ['$morningCounts', 0] }, { count_1_249: 0, count_250_399: 0, count_400_plus: 0 }] },
                    eveningCounts: { $ifNull: [{ $arrayElemAt: ['$eveningCounts', 0] }, { count_1_249: 0, count_250_399: 0, count_400_plus: 0 }] },
                },
            },
        ]);
        const defaultData = {
            averages: { morningAverage: 0, eveningAverage: 0, combinedAverage: 0 },
            morningCounts: { count_1_249: 0, count_250_399: 0, count_400_plus: 0 },
            eveningCounts: { count_1_249: 0, count_250_399: 0, count_400_plus: 0 },
        };
        // 檢查結果是否為空物件，如果是就使用預設資料
        const isEmptyObject = (obj) => Object.keys(obj).length === 0;
        const data = results[0] && !isEmptyObject(results[0]) ? results[0] : defaultData;
        return res.status(200).send(data);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Server error', error: error.message });
    }
});

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
router.delete('/task/:id', async (req, res) => {
    try {
        const { id } = req.params; // 父層記錄的 ID
        const { taskId, animalId } = req.body; // 要刪除的記錄項目 ID 與驗證用的 animalId
        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }
        // 查找主記錄
        const existingRecord = await BloodSugar.findById(id);
        if (!existingRecord) {
            return res.status(404).json({ message: 'Record not found' });
        }
        // 驗證 animalId 是否一致
        if (animalId != existingRecord.animalId) {
            return res.status(403).json({ message: 'This account is not authorized' });
        }
        // 查找並移除子記錄
        const recordIndex = existingRecord.records.findIndex((record) => record._id.toString() === taskId);
        if (recordIndex === -1) {
            return res.status(404).json({ message: 'Record item not found' });
        }
        // 移除記錄項
        existingRecord.records.splice(recordIndex, 1);
        // 保存修改後的記錄
        await existingRecord.save();
        return res.status(200).json({ message: '刪除成功' });
    } catch (error) {
        console.error('Error deleting blood sugar record:', error);
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
