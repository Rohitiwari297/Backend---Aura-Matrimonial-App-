import express from 'express'
import { getFilteredUsers } from '../controllers/dashboardController.js'

const route  = express.Router()

route.get('/get/filtered/users', getFilteredUsers)

export default route