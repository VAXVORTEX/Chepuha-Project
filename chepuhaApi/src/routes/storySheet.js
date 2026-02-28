import { Router } from 'express';
import strapiRequest from '../strapiClient.js';
const router = Router();
const connectRelation = (id) => ({ connect: [id] });
router.get('/', async (req, res) => {
    let path = '/api/story-sheets?populate[answers][populate]=player&populate[player]=true&populate[game_session]=true';
    if (req.query.sessionId) path += `&filters[game_session][documentId][$eq]=${req.query.sessionId}`;
    const { status, data } = await strapiRequest('GET', path);
    res.status(status).json(data);
});
router.get('/:id', async (req, res) => {
    const { status, data } = await strapiRequest('GET', `/api/story-sheets/${req.params.id}?populate=*`);
    res.status(status).json(data);
});
router.post('/', async (req, res) => {
    const payload = { ...req.body };
    if (typeof payload.game_session === 'string') payload.game_session = connectRelation(payload.game_session);
    if (typeof payload.player === 'string') payload.player = connectRelation(payload.player);
    const { status, data } = await strapiRequest('POST', '/api/story-sheets', { data: payload });
    res.status(status).json(data);
});
router.put('/:id', async (req, res) => {
    const { status, data } = await strapiRequest('PUT', `/api/story-sheets/${req.params.id}`, { data: req.body });
    res.status(status).json(data);
});
router.delete('/:id', async (req, res) => {
    const { status, data } = await strapiRequest('DELETE', `/api/story-sheets/${req.params.id}`);
    res.status(status).json(data);
});
export default router;
