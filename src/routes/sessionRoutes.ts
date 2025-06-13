import { getSession, getSessions } from "../controllers/sessionController";

const router = require('express').Router();

router.get('/:id', getSession)
router.get('/', getSessions)
export default router;