import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
//import orderRouter from './routes/orderRouter.js'; // Import the order router


const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
//app.use('/api/orders', orderRouter); // Add the order router

export default app;