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
import orderRouter from './routes/orderRouter.js';

// App Config
const app = express()
const port = process.env.PORT || 4000

//connect to dB
connectdB()

// middlewares
app.use(cors())
app.use(express.json()); // For parsing application/json

// Add this GLOBAL logger
app.use((req, res, next) => {
    console.log(`[GLOBAL LOG] ${req.method} ${req.originalUrl}`);
    console.log(`[GLOBAL LOG] Request Body:`, req.body); // Check if body is being parsed
    next();
});

// api endpoints

app.use('/api/auth', authRouter)
app.use('/api/products', productRouter)
app.use('/api/users', userRouter)
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api', uploadRouter); // Upload route (handled in uploadRouter)

app.get('/', (req,res)=>{
    res.send("Welcome to EcoCraft E-Commerce Backend!")
})

app.listen(port, () => console.log('Server is running on PORT : ' + port))