import 'dotenv/config.js'
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import custRoutes from './routes/customer.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import router from './routes/product.routes.js';
import wrouter from './routes/wishlist.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';

const app = express();
const Port = 9000;
dotenv.config();

mongoose.connect(process.env.dbUrl).then(()=>{
    console.log("DB Connected");
}).catch((error)=>{
    console.log(error);
})

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json());
app.use(cookieParser());
app.use('/customers', custRoutes);
app.use('/products', router)
app.use('/wishlist', wrouter);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

app.listen(Port, ()=>{
    console.log("Server Started");
})