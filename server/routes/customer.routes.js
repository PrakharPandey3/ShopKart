import express from 'express';
import { getCust, loginCust, logoutCust, registerCust } from '../controllers/customer.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const custRoutes = express.Router();

custRoutes.post('/register', registerCust);
custRoutes.post('/login', loginCust);
custRoutes.get('/me', isAuthenticated, getCust)
custRoutes.post('/logout', logoutCust)

export default custRoutes;