import express from 'express'
import BloodSugar from '../models/bloodSugarModel.js'
import BloodSugarCurve from '../models/bloodSugarCurveModel.js'
import mongoose from 'mongoose'
const router = express.Router()

router.get('/average', async (req, res) => {
  try {
    const { animalId, startDate, endDate } = req.query
    if (!startDate || !endDate || isNaN(new Date(startDate)) || isNaN(new Date(endDate))) {
      return res.status(400).send({ message: 'Invalid date format' })
    }
    const start = new Date(startDate)
    const end = new Date(endDate)
    const results = await BloodSugar.aggregate([
      {
        $match: {
          animalId: new mongoose.Types.ObjectId(animalId),
          date: { $gte: start, $lte: end },
        },
      },
      {
        $facet: {
          averages: [
            {
              $group: {
                _id: null,
                morningAverage: {
                  $avg: {
                    $cond: [{ $gt: ['$morning.bloodSugar', 0] }, '$morning.bloodSugar', null],
                  },
                },
                eveningAverage: {
                  $avg: {
                    $cond: [{ $gt: ['$evening.bloodSugar', 0] }, '$evening.bloodSugar', null],
                  },
                },
              },
            },
          ],
          morningCounts: [
            {
              $group: {
                _id: null,
                count_low: {
                  $sum: {
                    $cond: [{ $lt: ['$morning.bloodSugar', 70] }, 1, 0],
                  },
                },
                count_normal: {
                  $sum: {
                    $cond: [{ $and: [{ $gte: ['$morning.bloodSugar', 70] }, { $lt: ['$morning.bloodSugar', 180] }] }, 1, 0],
                  },
                },
                count_caution: {
                  $sum: {
                    $cond: [{ $and: [{ $gte: ['$morning.bloodSugar', 180] }, { $lt: ['$morning.bloodSugar', 250] }] }, 1, 0],
                  },
                },
                count_warning: {
                  $sum: {
                    $cond: [{ $and: [{ $gte: ['$morning.bloodSugar', 250] }, { $lt: ['$morning.bloodSugar', 400] }] }, 1, 0],
                  },
                },
                count_danger: {
                  $sum: {
                    $cond: [{ $gte: ['$morning.bloodSugar', 400] }, 1, 0],
                  },
                },
              },
            },
          ],
          eveningCounts: [
            {
              $group: {
                _id: null,
                count_low: {
                  $sum: {
                    $cond: [{ $lt: ['$evening.bloodSugar', 70] }, 1, 0],
                  },
                },
                count_normal: {
                  $sum: {
                    $cond: [{ $and: [{ $gte: ['$evening.bloodSugar', 70] }, { $lt: ['$evening.bloodSugar', 180] }] }, 1, 0],
                  },
                },
                count_caution: {
                  $sum: {
                    $cond: [{ $and: [{ $gte: ['$evening.bloodSugar', 180] }, { $lt: ['$evening.bloodSugar', 250] }] }, 1, 0],
                  },
                },
                count_warning: {
                  $sum: {
                    $cond: [{ $and: [{ $gte: ['$evening.bloodSugar', 250] }, { $lt: ['$evening.bloodSugar', 400] }] }, 1, 0],
                  },
                },
                count_danger: {
                  $sum: {
                    $cond: [{ $gte: ['$evening.bloodSugar', 400] }, 1, 0],
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
            morningAverage: { $ifNull: [{ $arrayElemAt: ['$averages.morningAverage', 0] }, 0] },
            eveningAverage: { $ifNull: [{ $arrayElemAt: ['$averages.eveningAverage', 0] }, 0] },
            combinedAverage: {
              $cond: {
                if: {
                  $eq: [
                    {
                      $sum: [
                        {
                          $cond: [{ $gt: [{ $arrayElemAt: ['$averages.morningAverage', 0] }, 0] }, 1, 0],
                        },
                        {
                          $cond: [{ $gt: [{ $arrayElemAt: ['$averages.eveningAverage', 0] }, 0] }, 1, 0],
                        },
                      ],
                    },
                    0,
                  ],
                },
                then: 0,
                else: {
                  $divide: [
                    {
                      $sum: [
                        {
                          $cond: [{ $gt: [{ $arrayElemAt: ['$averages.morningAverage', 0] }, 0] }, { $arrayElemAt: ['$averages.morningAverage', 0] }, 0],
                        },
                        {
                          $cond: [{ $gt: [{ $arrayElemAt: ['$averages.eveningAverage', 0] }, 0] }, { $arrayElemAt: ['$averages.eveningAverage', 0] }, 0],
                        },
                      ],
                    },
                    {
                      $sum: [
                        {
                          $cond: [{ $gt: [{ $arrayElemAt: ['$averages.morningAverage', 0] }, 0] }, 1, 0],
                        },
                        {
                          $cond: [{ $gt: [{ $arrayElemAt: ['$averages.eveningAverage', 0] }, 0] }, 1, 0],
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
          morningCounts: {
            $ifNull: [{ $arrayElemAt: ['$morningCounts', 0] }, { _id: null, count_low: 0, count_normal: 0, count_caution: 0, count_warning: 0, count_danger: 0 }],
          },
          eveningCounts: {
            $ifNull: [{ $arrayElemAt: ['$eveningCounts', 0] }, { _id: null, count_low: 0, count_normal: 0, count_caution: 0, count_warning: 0, count_danger: 0 }],
          },
        },
      },
    ])
    const defaultData = {
      averages: [{ morningAverage: 0, eveningAverage: 0, combinedAverage: 0 }],
      morningCounts: { _id: null, count_low: 0, count_normal: 0, count_caution: 0, count_warning: 0, count_danger: 0 },
      eveningCounts: { _id: null, count_low: 0, count_normal: 0, count_caution: 0, count_warning: 0, count_danger: 0 },
    }
    const isEmptyArray = (arr) => Array.isArray(arr) && arr.length === 0
    const data = results[0] && !isEmptyArray(results[0].averages) ? results[0] : defaultData
    return res.status(200).send(data)
  } catch (error) {
    console.error(error)
    return res.status(500).send({ message: 'Server error', error: error.message })
  }
})

router.get('/diary', async (req, res) => {
  const { animalId, startDate, endDate } = req.query
  if (!mongoose.Types.ObjectId.isValid(animalId)) {
    return res.status(400).send({ message: 'Invalid animal ID' })
  }
  if (!startDate || !endDate) {
    return res.status(400).send({ message: 'startDate and endDate are required' })
  }
  try {
    const data = await BloodSugar.find({
      animalId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 })
    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).send({ message: 'Server error' })
  }
})

// 獲取所有標記的日記資料 (不受日期限制)
router.get('/marked', async (req, res) => {
  const { animalId } = req.query
  if (!mongoose.Types.ObjectId.isValid(animalId)) {
    return res.status(400).send({ message: 'Invalid animal ID' })
  }
  try {
    const data = await BloodSugar.find({
      animalId,
      is_marked: true
    }).sort({ date: -1 }) // 按日期降序排列，最新的在前
    return res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching marked diary entries:', error)
    return res.status(500).send({ message: 'Server error' })
  }
})
router.post('/create', async (req, res) => {
  try {
    const { animalId, date, records, notes } = req.body
    if (!mongoose.Types.ObjectId.isValid(animalId)) {
      return res.status(400).json({ message: 'Invalid animalId' })
    }
    const existingRecord = await BloodSugar.findOne({
      animalId,
      date: new Date(date),
    })
    if (existingRecord) {
      existingRecord.records = [...existingRecord.records, ...records]
      existingRecord.notes = notes || existingRecord.notes
      const updatedRecord = await existingRecord.save()
      return res.status(200).send({ message: '新增成功', ...updatedRecord })
    }
    const newBloodSugar = new BloodSugar({
      animalId,
      date: new Date(date),
      records,
      notes,
    })
    const bloodSugarRecord = await newBloodSugar.save()
    return res.status(201).send({ message: '新增成功', ...bloodSugarRecord })
  } catch (error) {
    console.error('Error creating or updating blood sugar record:', error)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors })
    }
    res.status(500).json({ message: 'Server Error' })
  }
})
router.delete('/task/:id', async (req, res) => {
  try {
    const { id } = req.params // 父層記錄的 ID
    const { taskId, animalId } = req.body // 要刪除的記錄項目 ID 與驗證用的 animalId
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: 'Invalid ID' })
    }
    // 查找主記錄
    const existingRecord = await BloodSugar.findById(id)
    if (!existingRecord) {
      return res.status(404).json({ message: 'Record not found' })
    }
    // 驗證 animalId 是否一致
    if (animalId != existingRecord.animalId) {
      return res.status(403).json({ message: 'This account is not authorized' })
    }
    // 查找並移除子記錄
    const recordIndex = existingRecord.records.findIndex((record) => record._id.toString() === taskId)
    if (recordIndex === -1) {
      return res.status(404).json({ message: 'Record item not found' })
    }
    // 移除記錄項
    existingRecord.records.splice(recordIndex, 1)
    // 保存修改後的記錄
    await existingRecord.save()
    return res.status(200).json({ message: '刪除成功' })
  } catch (error) {
    console.error('Error deleting blood sugar record:', error)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors })
    }
    res.status(500).json({ message: 'Server Error' })
  }
})
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { animalId, taskId, task, notes } = req.body
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: 'Invalid ID' })
    }
    const existingRecord = await BloodSugar.findById(id)
    if (!existingRecord) {
      return res.status(404).json({ message: 'Record not found' })
    }
    if (animalId != existingRecord.animalId) {
      return res.status(404).json({ message: 'this account not auth' })
    }
    const recordIndex = existingRecord.records.findIndex((record) => record._id.toString() === taskId)
    if (recordIndex === -1) {
      return res.status(404).json({ message: 'Record item not found' })
    }
    existingRecord.records[recordIndex] = { ...existingRecord.records[recordIndex], ...task }
    if (notes !== undefined) {
      existingRecord.notes = notes
    }
    const updatedBloodSugar = await existingRecord.save()
    return res.status(200).json({ message: '更新成功', ...updatedBloodSugar })
  } catch (error) {
    console.error('Error updating blood sugar record:', error)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors })
    }
    res.status(500).json({ message: 'Server Error' })
  }
})

// Update is_marked field for diary entry
router.put('/mark/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { animalId, is_marked } = req.body
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID' })
    }
    
    const existingRecord = await BloodSugar.findById(id)
    if (!existingRecord) {
      return res.status(404).json({ message: 'Record not found' })
    }
    
    if (animalId != existingRecord.animalId) {
      return res.status(403).json({ message: 'This account is not authorized' })
    }
    
    existingRecord.is_marked = is_marked
    const updatedRecord = await existingRecord.save()
    
    return res.status(200).json({ message: '標記更新成功', is_marked: updatedRecord.is_marked })
  } catch (error) {
    console.error('Error updating is_marked:', error)
    res.status(500).json({ message: 'Server Error' })
  }
})
router.get('/getCurve', async (req, res) => {
  const { animalId, startDate, endDate } = req.query
  if (!mongoose.Types.ObjectId.isValid(animalId)) {
    return res.status(400).json({ message: 'Invalid animalId' })
  }

  try {
    let query = { animalId }

    // If date range is provided, filter by date range; otherwise return all data
    if (startDate && endDate) {
      if (isNaN(new Date(startDate)) || isNaN(new Date(endDate))) {
        return res.status(400).send({ message: 'Invalid date format' })
      }
      query.date = { $gte: startDate, $lte: endDate }
    }

    const data = await BloodSugarCurve.find(query).sort({ date: 1 }).lean()

    return res.status(200).send({
      data: data.map((x) => ({
        date: x.date,
        records: x.records,
        _id: x._id,
        createdAt: x.createdAt,
        updatedAt: x.updatedAt,
      })),
      total: data.length,
      message: startDate && endDate ? 'Filtered data retrieved successfully' : 'All data retrieved successfully',
    })
  } catch (error) {
    console.error('Error retrieving blood sugar curve data:', error)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors })
    }
    res.status(500).json({ message: 'Server Error' })
  }
})
router.post('/createCurve', async (req, res) => {
  try {
    const { animalId, date, records } = req.body
    if (!mongoose.Types.ObjectId.isValid(animalId)) {
      return res.status(400).json({ message: 'Invalid animalId' })
    }
    const targetDate = new Date(date)
    const existingRecord = await BloodSugarCurve.findOne({
      animalId,
      date: { $gte: targetDate, $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000) },
    })
    if (existingRecord) {
      existingRecord.records.push(...records)
      const updatedRecord = await existingRecord.save()
      return res.status(200).send(updatedRecord)
    } else {
      //沒資料
      const newBloodSugarCurve = new BloodSugarCurve({
        animalId,
        date: targetDate,
        records,
      })
      const bloodSugarCurve = await newBloodSugarCurve.save()
      return res.status(201).send(bloodSugarCurve)
    }
  } catch (error) {
    console.error('Error creating or updating blood sugar record:', error)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors })
    }
    res.status(500).json({ message: 'Server Error' })
  }
})

router.put('/updateCurve/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { animalId, date, records } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid curve ID' })
    }

    if (!mongoose.Types.ObjectId.isValid(animalId)) {
      return res.status(400).json({ message: 'Invalid animalId' })
    }

    const existingCurve = await BloodSugarCurve.findById(id)
    if (!existingCurve) {
      return res.status(404).json({ message: 'Blood sugar curve not found' })
    }

    // 驗證 animalId 是否一致
    if (animalId != existingCurve.animalId) {
      return res.status(403).json({ message: 'This account is not authorized' })
    }

    // 更新資料
    if (date) {
      existingCurve.date = new Date(date)
    }
    if (records) {
      existingCurve.records = records
    }

    const updatedCurve = await existingCurve.save()
    return res.status(200).json({
      message: '血糖曲線更新成功',
      data: updatedCurve,
    })
  } catch (error) {
    console.error('Error updating blood sugar curve:', error)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors })
    }
    res.status(500).json({ message: 'Server Error' })
  }
})

router.delete('/deleteCurve/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { animalId } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid curve ID' })
    }

    if (!mongoose.Types.ObjectId.isValid(animalId)) {
      return res.status(400).json({ message: 'Invalid animalId' })
    }

    const existingCurve = await BloodSugarCurve.findById(id)
    if (!existingCurve) {
      return res.status(404).json({ message: 'Blood sugar curve not found' })
    }

    // 驗證 animalId 是否一致
    if (animalId != existingCurve.animalId) {
      return res.status(403).json({ message: 'This account is not authorized' })
    }

    await BloodSugarCurve.findByIdAndDelete(id)
    return res.status(200).json({ message: '血糖曲線刪除成功' })
  } catch (error) {
    console.error('Error deleting blood sugar curve:', error)
    res.status(500).json({ message: 'Server Error' })
  }
})

export default router
