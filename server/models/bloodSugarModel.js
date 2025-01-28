import mongoose from 'mongoose';

const bloodSugarSchema = new mongoose.Schema(
    {
        animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true, index: true },
        date: { type: Date, required: true },
        morning: { time: { type: String }, bloodSugar: { type: Number }, insulin: { type: Number }, notes: { type: String } },
        evening: { time: { type: String }, bloodSugar: { type: Number }, insulin: { type: Number }, notes: { type: String } },
        records: [
            {
                time: { type: String, required: true },
                bloodSugar: { type: Number },
                insulin: { type: Number },
                notes: { type: String },
                author: { type: mongoose.Schema.Types.ObjectId, required: true },
                authorRole: { type: String, enum: ['user', 'hospital'], required: true },
            },
        ],
        notes: { type: String, default: '' },
    },
    { timestamps: true }
);
bloodSugarSchema.pre('save', function (next) {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    for (const record of this.records) {
        if (!timeRegex.test(record.time)) {
            const error = new Error(`Invalid time format: ${record.time}. Expected HH:mm.`);
            return next(error);
        }
    }
    this.records.sort((a, b) => a.time.localeCompare(b.time));
    const defaultRecord = { time: '', bloodSugar: '', insulin: '', notes: '' };
    const morningRecord = this.records.find((record) => record.time >= '00:00' && record.time < '12:00');
    const eveningRecord = [...this.records].reverse().find((record) => record.time >= '12:00' && record.time <= '23:59');
    this.morning = morningRecord
        ? {
              time: morningRecord.time,
              bloodSugar: morningRecord.bloodSugar,
              insulin: morningRecord.insulin,
              notes: morningRecord.notes,
          }
        : defaultRecord;
    this.evening = eveningRecord
        ? {
              time: eveningRecord.time,
              bloodSugar: eveningRecord.bloodSugar,
              insulin: eveningRecord.insulin,
              notes: eveningRecord.notes,
          }
        : defaultRecord;

    next();
});

const BloodSugarSchema = mongoose.model('DiaryBloodRecord', bloodSugarSchema);
export default BloodSugarSchema;
