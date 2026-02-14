import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import express from 'express';
import connectDb from './db/index.js';

const app = express();

dotenv.config(); 
connectDb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
