import express from 'express';
import ActivityTimeline from '../models/activityTimelineModel.js';
import authenticateToken from '../middleware/authMiddleware.js';

const router = express.Router();

// 獲取特定動物的日常作息時間表
router.get('/:animalId', authenticateToken, async (req, res) => {
    try {
        const { animalId } = req.params;
        
        if (!animalId) {
            return res.status(400).json({ message: '缺少動物 ID' });
        }

        let timeline = await ActivityTimeline.findOne({ animalId }).lean();
        
        // 如果沒有記錄，返回空陣列
        if (!timeline) {
            timeline = { animalId, activities: [] };
        }

        res.status(200).json({ success: true, data: timeline });
    } catch (error) {
        console.error('獲取作息時間表錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤', error: error.message });
    }
});

// 更新整個作息時間表（新增或更新）
router.put('/:animalId', authenticateToken, async (req, res) => {
    try {
        const { animalId } = req.params;
        const { activities } = req.body;

        if (!activities || !Array.isArray(activities)) {
            return res.status(400).json({ message: '活動資料格式錯誤' });
        }

        // 使用 findOneAndUpdate 的 upsert 選項，如果不存在就創建
        const timeline = await ActivityTimeline.findOneAndUpdate(
            { animalId },
            { animalId, activities },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: timeline });
    } catch (error) {
        console.error('更新作息時間表錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤', error: error.message });
    }
});

// 新增單個活動項目
router.post('/:animalId/activity', authenticateToken, async (req, res) => {
    try {
        const { animalId } = req.params;
        const { time, activityType, description, value, notes } = req.body;

        if (!time || !activityType) {
            return res.status(400).json({ message: '缺少必要欄位' });
        }

        const newActivity = {
            time,
            activityType,
            description: description || '',
            value: value || '',
            notes: notes || ''
        };

        // 使用 findOneAndUpdate 與 $push，如果文檔不存在則創建
        const timeline = await ActivityTimeline.findOneAndUpdate(
            { animalId },
            { 
                $push: { activities: newActivity },
                $setOnInsert: { animalId }
            },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(201).json({ success: true, data: timeline });
    } catch (error) {
        console.error('新增活動項目錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤', error: error.message });
    }
});

// 更新單個活動項目
router.put('/:animalId/activity/:activityId', authenticateToken, async (req, res) => {
    try {
        const { animalId, activityId } = req.params;
        const { time, activityType, description, value, notes } = req.body;

        const updateFields = {};
        if (time !== undefined) updateFields['activities.$.time'] = time;
        if (activityType !== undefined) updateFields['activities.$.activityType'] = activityType;
        if (description !== undefined) updateFields['activities.$.description'] = description;
        if (value !== undefined) updateFields['activities.$.value'] = value;
        if (notes !== undefined) updateFields['activities.$.notes'] = notes;

        const timeline = await ActivityTimeline.findOneAndUpdate(
            { animalId, 'activities._id': activityId },
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!timeline) {
            return res.status(404).json({ message: '找不到該活動項目' });
        }

        res.status(200).json({ success: true, data: timeline });
    } catch (error) {
        console.error('更新活動項目錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤', error: error.message });
    }
});

// 刪除單個活動項目
router.delete('/:animalId/activity/:activityId', authenticateToken, async (req, res) => {
    try {
        const { animalId, activityId } = req.params;

        const timeline = await ActivityTimeline.findOneAndUpdate(
            { animalId },
            { $pull: { activities: { _id: activityId } } },
            { new: true }
        );

        if (!timeline) {
            return res.status(404).json({ message: '找不到該活動項目' });
        }

        res.status(200).json({ success: true, data: timeline });
    } catch (error) {
        console.error('刪除活動項目錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤', error: error.message });
    }
});

export default router;
