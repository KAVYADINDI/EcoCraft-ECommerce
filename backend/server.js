import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import './config/cloudinary.js' // Ensure Cloudinary config loads at startup
import connectdB from './config/mongoDB.js'
import authRouter from './routes/authRouter.js'
import productRouter from './routes/productRouter.js'
import uploadRouter from './routes/uploadRouter.js';
import userRouter from './routes/userRouter.js';
import cartRouter from './routes/cartRouter.js';

// App Config
const app = express()
const port = process.env.PORT || 4000

// Connect to dB
connectdB()

// Middlewares
app.use(cors())
app.use(express.json()); // For parsing application/json

// API Endpoints
app.use('/api/auth', authRouter)
app.use('/api/products', productRouter)
app.use('/api/users', userRouter)
app.use('/api/cart', cartRouter);
app.use('/api', uploadRouter); // Upload route (handled in uploadRouter)

app.get('/', (req, res) => {
    res.send("Welcome to EcoCraft E-Commerce Backend!")
})

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});