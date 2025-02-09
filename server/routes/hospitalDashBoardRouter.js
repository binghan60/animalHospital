import express from 'express';
import mongoose from 'mongoose';
import Animal from '../models/animalModel.js';
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { hospitalId, gender, type } = req.query;
        if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
            return res.status(400).json({ error: 'Invalid hospital ID' });
        }
        const filter = { hospitalId: new mongoose.Types.ObjectId(hospitalId) };
        if (gender != '0') {
            filter.gender = gender;
        }
        if (type != '0') {
            filter.type = type;
        }
        const totalCount = await Animal.countDocuments(filter); // 總動物數量
        const stats = await Animal.aggregate([
            { $match: filter },
            {
                $addFields: {
                    currentWeight: {
                        $arrayElemAt: ['$weight.value', -1],
                    },
                    age: {
                        // subtract 計算時間差 new Date()-$birthday
                        // divide再除以一年秒數 算出年齡
                        // floor無條件捨去
                        $floor: {
                            $divide: [{ $subtract: [new Date(), '$birthday'] }, 1000 * 60 * 60 * 24 * 365],
                        },
                    },
                },
            },
            {
                $facet: {
                    genderStats: [{ $group: { _id: '$gender', count: { $sum: 1 } } }, { $sort: { _id: -1 } }],
                    weightDistribution: [
                        {
                            $bucket: {
                                groupBy: '$currentWeight',
                                boundaries: [0.1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 100000],
                                default: '未輸入體重',
                                output: { count: { $sum: 1 } },
                            },
                        },
                        { $sort: { _id: 1 } },
                    ],
                    ageDistribution: [
                        {
                            $bucket: {
                                groupBy: '$age', // 使用 `age` 來分組
                                boundaries: [0, 1, 5, 10, 15, 20, 25, 30, 10000],
                                default: -1, // 設定 -1 為 "未輸入生日"
                                output: { count: { $sum: 1 } },
                            },
                        },
                        { $sort: { _id: 1 } },
                    ],
                    sterilizedStats: [{ $group: { _id: '$sterilized', count: { $sum: 1 } } }, { $sort: { _id: -1 } }],
                    breedStats: [{ $group: { _id: '$breed', count: { $sum: 1 } } }, { $sort: { _id: -1 } }],
                    bloodTypeStats: [{ $group: { _id: '$bloodType', count: { $sum: 1 } } }, { $sort: { _id: -1 } }],
                    typeStats: [{ $group: { _id: '$type', count: { $sum: 1 } } }, { $sort: { _id: 1 } }],
                    insulinBrandStats: [{ $group: { _id: '$insulinBrand', count: { $sum: 1 } } }, { $sort: { _id: -1 } }],
                },
            },
            // 將體重區間名稱加入
            {
                $addFields: {
                    weightDistribution: {
                        $map: {
                            input: '$weightDistribution',
                            as: 'item',
                            in: {
                                $mergeObjects: [
                                    '$$item',
                                    {
                                        weightRange: {
                                            $cond: {
                                                if: { $eq: ['$$item._id', '未輸入體重'] },
                                                then: '未輸入體重',
                                                else: {
                                                    $switch: {
                                                        branches: [
                                                            { case: { $lt: ['$$item._id', 5] }, then: '0-4.9 kg' },
                                                            { case: { $lt: ['$$item._id', 10] }, then: '5-9.9 kg' },
                                                            { case: { $lt: ['$$item._id', 15] }, then: '10-14.9 kg' },
                                                            { case: { $lt: ['$$item._id', 20] }, then: '15-19.9 kg' },
                                                            { case: { $lt: ['$$item._id', 25] }, then: '20-24.9 kg' },
                                                            { case: { $lt: ['$$item._id', 30] }, then: '25-29.9 kg' },
                                                            { case: { $lt: ['$$item._id', 35] }, then: '30-34.9 kg' },
                                                            { case: { $lt: ['$$item._id', 40] }, then: '35-39.9 kg' },
                                                            { case: { $lt: ['$$item._id', 45] }, then: '40-44.9 kg' },
                                                            { case: { $lt: ['$$item._id', 50] }, then: '45-49.9 kg' },
                                                        ],
                                                        default: '50 kg以上',
                                                    },
                                                },
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    ageDistribution: {
                        $let: {
                            vars: {
                                sortedItems: {
                                    $concatArrays: [
                                        {
                                            $filter: {
                                                input: '$ageDistribution',
                                                as: 'item',
                                                cond: { $ne: ['$$item._id', -1] }, // 排除未輸入生日的項目
                                            },
                                        },
                                        {
                                            $filter: {
                                                input: '$ageDistribution',
                                                as: 'item',
                                                cond: { $eq: ['$$item._id', -1] }, // 僅保留未輸入生日的項目
                                            },
                                        },
                                    ],
                                },
                            },
                            in: {
                                $map: {
                                    input: '$$sortedItems',
                                    as: 'item',
                                    in: {
                                        $mergeObjects: [
                                            '$$item',
                                            {
                                                ageRange: {
                                                    $switch: {
                                                        branches: [
                                                            { case: { $eq: ['$$item._id', -1] }, then: '未輸入生日' }, // 處理未輸入生日的情況
                                                            { case: { $lt: ['$$item._id', 1] }, then: '1歲以下' },
                                                            { case: { $lt: ['$$item._id', 3] }, then: '1-3歲' },
                                                            { case: { $lt: ['$$item._id', 5] }, then: '4-5歲' },
                                                            { case: { $lt: ['$$item._id', 10] }, then: '6-10歲' },
                                                            { case: { $lt: ['$$item._id', 15] }, then: '11-15歲' },
                                                            { case: { $lt: ['$$item._id', 20] }, then: '16-20歲' },
                                                            { case: { $lt: ['$$item._id', 25] }, then: '21-25歲' },
                                                            { case: { $lt: ['$$item._id', 30] }, then: '26-30歲' },
                                                            { case: { $lt: ['$$item._id', 1000] }, then: '30歲以上' },
                                                        ],
                                                        default: '未輸入生日',
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
            },
            // 加入 total 欄位
            {
                $addFields: {
                    total: totalCount,
                },
            },
        ]);
        // 返回結果
        res.status(200).json({
            message: '查詢成功',
            stats: stats[0], // 取得結果中的第一個項目
        });
    } catch (error) {
        console.error('Error fetching animal statistics:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
