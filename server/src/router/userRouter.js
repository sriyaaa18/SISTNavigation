import { Router } from 'express';
import userController from '../controllers/userController.js'

const router = Router();

router.post('/users', userController.saveuserDetails);

export default router;