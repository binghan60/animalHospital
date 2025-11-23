import mongoose from 'mongoose';

// 單個活動項目的子結構
const activityItemSchema = new mongoose.Schema({
    time: { type: String, required: true }, // 格式: "HH:mm"
    activityType: { 
        type: String, 
        required: true,
        enum: ['meal', 'bloodSugar', 'snack', 'medicine', 'insulin', 'exercise', 'weight', 'other']
    },
    description: { type: String, default: '' },
    value: { type: String, default: '' }, // 可選的數值（如血糖值、體重等）
    notes: { type: String, default: '' },
}, { _id: true });

// 每隻動物只有一筆記錄，包含多個活動項目
const activityTimelineSchema = new mongoose.Schema(
    {
        animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true, unique: true, index: true },
        activities: [activityItemSchema], // 活動項目陣列
    },
    { timestamps: true }
);

const ActivityTimeline = mongoose.model('ActivityTimeline', activityTimelineSchema);
export default ActivityTimeline;
