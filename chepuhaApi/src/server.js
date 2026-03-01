import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });
import express from 'express';
import cors from 'cors';
import gameSessionRoutes from './routes/gameSession.js';
import playerRoutes from './routes/player.js';
import roundRoutes from './routes/round.js';
import answerRoutes from './routes/answer.js';
import storySheetRoutes from './routes/storySheet.js';
const app = express();
const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGINS = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', process.env.FRONTEND_URL].filter(Boolean);
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());
app.use('/api/game-sessions', gameSessionRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/rounds', roundRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/story-sheets', storySheetRoutes);
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', strapi: process.env.STRAPI_URL });
});
app.get('/', (_req, res) => {
    res.send(`<h1>Chepuha API Server is Running!</h1>
<p>Proxying to Strapi at: <b>${process.env.STRAPI_URL}</b></p>
<p>Authorized CORS origin: <b>${ALLOWED_ORIGINS.join(', ')}</b></p>`);
});
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: err.message });
});
app.listen(PORT, () => {
    console.log(`✅ Chepuha API Server running on http://localhost:${PORT}`);
    console.log(`   → Proxying to Strapi: ${process.env.STRAPI_URL}`);
    console.log(`   → CORS allowed for:   ${ALLOWED_ORIGINS.join(', ')}`);
});

export default app;
