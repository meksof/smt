import { Router } from 'express';
import { getVisits } from '../controllers/visitController';

const router = Router();

router.get('/', getVisits);

export default router;
