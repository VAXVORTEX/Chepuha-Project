import { Router } from 'express';
import strapiRequest from '../strapiClient.js';
const router = Router();
router.get('/', async (req, res) => {
    const { status, data } = await strapiRequest('GET', '/api/game-sessions?populate=*&pagination[limit]=1000');
    res.status(status).json(data);
});
router.get('/:id', async (req, res) => {
    const { status, data } = await strapiRequest('GET', `/api/game-sessions/${req.params.id}?populate=*`);
    res.status(status).json(data);
});
router.post('/', async (req, res) => {
    const { status, data } = await strapiRequest('POST', '/api/game-sessions', { data: req.body });
    res.status(status).json(data);
});
router.put('/:id', async (req, res) => {
    const { status, data } = await strapiRequest('PUT', `/api/game-sessions/${req.params.id}`, { data: req.body });
    res.status(status).json(data);
});
router.delete('/:id', async (req, res) => {
    const { status, data } = await strapiRequest('DELETE', `/api/game-sessions/${req.params.id}`);
    res.status(status).json(data);
});
export default router;
