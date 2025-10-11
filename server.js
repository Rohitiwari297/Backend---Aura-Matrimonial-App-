import express from 'express'
import env from 'dotenv'
import connectDB from './config/dbConnection.js'

import userRoutes from './routes/userRoutes.js'
//create instance 
const app = express();

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

//create route
app.use('/users', userRoutes )

//starting the server
app.listen(PORT, ()=> {
    console.log(`sever is up on ${PORT}`)
})