import { Router } from 'express';
import strapiRequest from '../strapiClient.js';
const router = Router();
const connectRelation = (id) => ({ connect: [id] });
router.get('/', async (req, res) => {
    let path = '/api/rounds?sort=round_number:asc&populate=*';
    if (req.query.sessionId) path += `&filters[session_id][documentId][$eq]=${req.query.sessionId}`;
    const { status, data } = await strapiRequest('GET', path);
    res.status(status).json(data);
});
router.get('/:id', async (req, res) => {
    const { status, data } = await strapiRequest('GET', `/api/rounds/${req.params.id}?populate=*`);
    res.status(status).json(data);
});
router.post('/', async (req, res) => {
    const payload = { ...req.body };
    if (typeof payload.session_id === 'string') payload.session_id = connectRelation(payload.session_id);
    const { status, data } = await strapiRequest('POST', '/api/rounds', { data: payload });
    res.status(status).json(data);
});
router.put('/:id', async (req, res) => {
    const { status, data } = await strapiRequest('PUT', `/api/rounds/${req.params.id}`, { data: req.body });
    res.status(status).json(data);
});
export default router;
