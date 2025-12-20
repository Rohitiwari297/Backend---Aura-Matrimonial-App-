import express from 'express'
import { getAllNumerology, numerologyDetails } from '../controllers/numerologyController.js';
import authMiddleware, { isAdmin } from '../middlewares/Auth.js';

const route = express.Router()

route.post('/details', authMiddleware, numerologyDetails);
route.get('/details', authMiddleware, isAdmin , getAllNumerology);


// export route
export default route;