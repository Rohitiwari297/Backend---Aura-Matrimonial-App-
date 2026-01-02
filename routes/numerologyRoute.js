import express from 'express'
import { createNumeroList, getAllNumerology, getNumeroList, numerologyDetails } from '../controllers/numerologyController.js';
import authMiddleware, { isAdmin } from '../middlewares/Auth.js';
import multer from '../utils/multer.js';

const route = express.Router()

route.post('/details/:id', authMiddleware, numerologyDetails);
route.get('/details', authMiddleware, isAdmin , getAllNumerology);
route.post('/numero-list', authMiddleware, isAdmin, multer.single("image"), createNumeroList)
route.get('/numero-list', authMiddleware, isAdmin, getNumeroList)


// export route
export default route;