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
        if (gender) {
            filter.gender = gender;
        }
        if (type) {
            filter.type = type;
        }
        const totalCount = await Animal.countDocuments(filter); // 總動物數量
        const stats = await Animal.aggregate([
            { $match: filter },
            {
                $addFields: {
                    currentWeight: {
                        $arrayElemAt: ['$weight', -1],
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
            // 如果 currentWeight 是一個物件，提取 `value`
            {
                $addFields: {
                    currentWeightValue: '$currentWeight.value', // 提取 `value` 欄位
                },
            },
            {
                $facet: {
                    genderStats: [{ $group: { _id: '$gender', count: { $sum: 1 } } }, { $sort: { _id: -1 } }],
                    weightDistribution: [
                        {
                            $bucket: {
                                groupBy: '$currentWeightValue', // 使用 `currentWeightValue` 來分組
                                boundaries: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
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
                                boundaries: [0, 1, 3, 5, 10, 15, 20, 25, 30],
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
                                                            { case: { $lte: ['$$item._id', 5] }, then: '0-5 kg' },
                                                            { case: { $lte: ['$$item._id', 10] }, then: '6-10 kg' },
                                                            { case: { $lte: ['$$item._id', 15] }, then: '11-15 kg' },
                                                            { case: { $lte: ['$$item._id', 20] }, then: '16-20 kg' },
                                                            { case: { $lte: ['$$item._id', 25] }, then: '21-25 kg' },
                                                            { case: { $lte: ['$$item._id', 30] }, then: '26-30 kg' },
                                                            { case: { $lte: ['$$item._id', 35] }, then: '31-35 kg' },
                                                            { case: { $lte: ['$$item._id', 40] }, then: '36-40 kg' },
                                                            { case: { $lte: ['$$item._id', 45] }, then: '41-45 kg' },
                                                            { case: { $lte: ['$$item._id', 50] }, then: '46-50 kg' },
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
                                                            { case: { $lte: ['$$item._id', 1] }, then: '1歲以下' },
                                                            { case: { $lte: ['$$item._id', 3] }, then: '1-3歲' },
                                                            { case: { $lte: ['$$item._id', 5] }, then: '4-5歲' },
                                                            { case: { $lte: ['$$item._id', 10] }, then: '6-10歲' },
                                                            { case: { $lte: ['$$item._id', 15] }, then: '11-15歲' },
                                                            { case: { $lte: ['$$item._id', 20] }, then: '16-20歲' },
                                                            { case: { $lte: ['$$item._id', 25] }, then: '21-25歲' },
                                                            { case: { $lte: ['$$item._id', 30] }, then: '26-30歲' },
                                                        ],
                                                        default: '30歲以上',
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
