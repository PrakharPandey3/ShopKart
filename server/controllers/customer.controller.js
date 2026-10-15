
import Customer from "../models/customer.model.js";
import bcrypt from 'bcrypt';
import { genToken } from "../utils/generateToken.js";

const cookiesOptions = {
    httpOnly: true
}

export const registerCust = async (req, res)=>{
    try {
        const {fullName, email, password, phone} = req.body;

        if(!fullName || !email || !password || !phone){
            return res.status(400).json({message: "All fields are mandatory"});
        }

        if(password.length < 6){
            return res.status(400).json({message: "Password length too short"});
        }
        if(phone.length < 10){
            return res.status(400).json({message: "Invalid Phone Number"});
        }

        const phoneExists = await Customer.findOne({phone});
        const emailExists = await Customer.findOne({email});

        if(phoneExists){
            return res.status(409).json({message: "Phone Number already registered"});
        }
        if(emailExists){
            return res.status(409).json({message: "Email already registered"});
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPass = await bcrypt.hash(password, salt); 

        const newCustomer = await Customer.create({
            fullName, email, password: hashedPass, phone
        });

        const token = genToken(newCustomer._id);
        res.cookie("token", token, cookiesOptions);

        res.status(201).json({success: true, message: "User registered", cust: newCustomer})

    } catch (error) {
        res.status(500).json({message: "Internal Server Error", error: error});
    }
}

export const loginCust = async (req, res)=>{
    try {
        const {email, password} = req.body;
        const cust = await Customer.findOne({email});

        if(!cust){
            return res.status(401).json({message: "Invalid Credentials"})
        }

        const passwordCheck = await bcrypt.compare(password, cust.password);

        if(!passwordCheck){
            return res.status(400).json({message: "Wrong Password"});
        }

        const token = genToken(cust._id);
        res.cookie("token", token, cookiesOptions);

        res.status(200).json({success: true, message: "Customer Logged In"});

    } catch (error) {
        res.status(500).json({message: "Internal Server Error", error: error});
    }
}

export const getCust = async (req, res)=>{
    res.status(200).json({message: "Customer Authenticated", custData: req.cust});
}

export const logoutCust = async (req, res) => {
    try {
        res.clearCookie("token", cookiesOptions);

        res.status(200).json({
            success: true,
            message: "Logged Out Successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error
        });
    }
}