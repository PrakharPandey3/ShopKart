import jwt from 'jsonwebtoken';
import Customer from '../models/customer.model.js';

export const isAuthenticated = async (req, res, next)=>{
    const token = req.cookies.token;
    
    if(!token){
        return res.status(401).json({message: "Not Authorized"});
    }

    const decoded = jwt.verify(token, process.env.jwtSec);

    const cust = await Customer.findById(decoded.userId);

    if(!cust){
        return res.status(404).json({message: "User not Found"});
    }

    req.cust = cust

    next();
}