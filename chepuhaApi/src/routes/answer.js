import { Router } from 'express';
import strapiRequest from '../strapiClient.js';
const router = Router();
const connectRelation = (id) => ({ connect: [id] });
router.get('/', async (req, res) => {
    let path = '/api/answers?sort=position_in_sheet:asc&populate=*';
    if (req.query.roundId) path += `&filters[round][documentId][$eq]=${req.query.roundId}`;
    if (req.query.sheetId) path += `&filters[story_sheet][documentId][$eq]=${req.query.sheetId}`;
    const { status, data } = await strapiRequest('GET', path);
    res.status(status).json(data);
});
router.get('/:id', async (req, res) => {
    const { status, data } = await strapiRequest('GET', `/api/answers/${req.params.id}?populate=*`);
    res.status(status).json(data);
});
router.post('/', async (req, res) => {
    const payload = { ...req.body };
    if (typeof payload.player === 'string') payload.player = connectRelation(payload.player);
    if (typeof payload.round === 'string') payload.round = connectRelation(payload.round);
    if (typeof payload.story_sheet === 'string') payload.story_sheet = connectRelation(payload.story_sheet);
    const { status, data } = await strapiRequest('POST', '/api/answers', { data: payload });
    res.status(status).json(data);
});
router.put('/:id', async (req, res) => {
    const { status, data } = await strapiRequest('PUT', `/api/answers/${req.params.id}`, { data: req.body });
    res.status(status).json(data);
});
router.delete('/:id', async (req, res) => {
    const { status, data } = await strapiRequest('DELETE', `/api/answers/${req.params.id}`);
    res.status(status).json(data);
});
export default router;
