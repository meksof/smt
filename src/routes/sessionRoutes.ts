import { getVisits } from "../controllers/sessionController";

const router = require('express').Router();

router.get('/:id', getVisits)

export default router;