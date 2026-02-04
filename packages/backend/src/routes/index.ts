import { Router } from 'express';
import healthRoutes from './health.routes';
import postRoutes from './post.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/post', postRoutes);

export default router;
