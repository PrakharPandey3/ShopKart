import jwt from 'jsonwebtoken';

export const genToken = (userId)=>{
    const token = jwt.sign({userId}, process.env.jwtSec, {expiresIn: "10d"});
    return token;
}