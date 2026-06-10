import { Router } from 'express';
import { getVisits } from '../controllers/visitController';
import { getVisitsBySessionId } from '../controllers/visitController';

const router = Router();

router.get('/', getVisits);

router.get('/:id', getVisitsBySessionId);

export default router;
