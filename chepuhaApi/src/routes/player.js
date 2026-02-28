import { Router } from 'express';
import strapiRequest from '../strapiClient.js';
const router = Router();
const connectRelation = (id) => ({ connect: [id] });
router.get('/', async (req, res) => {
    let path = '/api/players?populate=*';
    if (req.query.sessionId) path += `&filters[session_id][documentId][$eq]=${req.query.sessionId}`;
    const { status, data } = await strapiRequest('GET', path);
    res.status(status).json(data);
});
router.get('/:id', async (req, res) => {
    const { status, data } = await strapiRequest('GET', `/api/players/${req.params.id}?populate=*`);
    res.status(status).json(data);
});
router.post('/', async (req, res) => {
    const payload = { ...req.body };
    if (typeof payload.session_id === 'string') payload.session_id = connectRelation(payload.session_id);
    const { status, data } = await strapiRequest('POST', '/api/players', { data: payload });
    res.status(status).json(data);
});
router.put('/:id', async (req, res) => {
    const { status, data } = await strapiRequest('PUT', `/api/players/${req.params.id}`, { data: req.body });
    res.status(status).json(data);
});
router.delete('/:id', async (req, res) => {
    const { status, data } = await strapiRequest('DELETE', `/api/players/${req.params.id}`);
    res.status(status).json(data);
});
export default router;
