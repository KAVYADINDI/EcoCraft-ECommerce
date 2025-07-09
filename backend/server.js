
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import './config/cloudinary.js' // Ensure Cloudinary config loads at startup
import connectdB from './config/mongoDB.js'
import authRouter from './routes/authRouter.js'
import productRouter from './routes/productRouter.js'
import uploadRouter from './routes/uploadRouter.js';

// App Config
const app = express()
const port = process.env.PORT || 4000

//connect to dB
connectdB()

// middlewares
app.use(cors())

// api endpoints

app.use(express.json()); // For parsing application/json
app.use('/api/auth', authRouter)
app.use('/api/products', productRouter)


// Upload route (handled in uploadRouter)
app.use('/api', uploadRouter);

app.get('/', (req,res)=>{
    res.send("Welcome to EcoCraft E-Commerce Backend!")
})

app.listen(port, () => console.log('Server is running on PORT : ' + port))