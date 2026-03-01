import { Router } from 'express';
import apiRequest from '../apiClient.js';
const router = Router();
router.get('/', async (req, res) => {
    const { status, data } = await apiRequest('GET', '/api/game-sessions?populate=*&pagination[limit]=1000');
    res.status(status).json(data);
});
router.get('/:id', async (req, res) => {
    const { status, data } = await apiRequest('GET', `/api/game-sessions/${req.params.id}?populate=*`);
    res.status(status).json(data);
});
router.post('/', async (req, res) => {
    const { status, data } = await apiRequest('POST', '/api/game-sessions', { data: req.body });
    res.status(status).json(data);
});
router.put('/:id', async (req, res) => {
    const { status, data } = await apiRequest('PUT', `/api/game-sessions/${req.params.id}`, { data: req.body });
    res.status(status).json(data);
});
router.delete('/:id', async (req, res) => {
    const { status, data } = await apiRequest('DELETE', `/api/game-sessions/${req.params.id}`);
    res.status(status).json(data);
});
export default router;
