import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.send({ message: '動物路由' });
});
router.get('/', async (req, res) => {});

export default router;
