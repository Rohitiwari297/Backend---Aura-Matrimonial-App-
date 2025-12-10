import express from 'express'
import env from 'dotenv'
import connectDB from './config/dbConnection.js'

import path from 'path'

import userRoutes from './routes/userRoutes.js'
import subscriptionPlanRoutes from './routes/subscriptionPlanRoute.js'
import purchasePlanRoute from './routes/purchasePlanRoute.js'
import messageRoute from './routes/messageRoute.js'
import socialMedia from './routes/followRequestRoute.js'
import dashboard from './routes/dashboardRoute.js'
import numerology from './routes/numerologyRoute.js'
import mail from './routes/sendMailRoute.js'
import { app, server } from './socketIO/socketServer.js'

import cors from 'cors'


//create instance 
// const app = express();  // now we are user socke app 

//dotenv
env.config()

//Database connection
connectDB()
//parsh json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//Port
const PORT = process.env.PORT || 3000;

//creating demo routes
app.use('/ping', (req, res)=> {
    console.log('server in up');
    res.send('pong')
})

//cors
app.use(cors({
  origin: "*", // or "http://localhost:5173"
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));


//create route
app.use('/users', userRoutes )
app.use('/api/social', socialMedia)
app.use('/subscriptionPlans', subscriptionPlanRoutes )
app.use('/subcription', purchasePlanRoute)
app.use('/message', messageRoute)
app.use('/api/dashboard', dashboard)
app.use('/api/numerology', numerology)
app.use('/api/mail', mail)

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

//starting the server
server.listen(PORT, ()=> {
    console.log(`sever is up on ${PORT}`)
})