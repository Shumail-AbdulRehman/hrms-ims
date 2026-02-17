import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import express from 'express';
import connectDb from './db/index.js';
import personnelRoutes from "./routes/personnel.route.js"


const app = express();

dotenv.config(); 
connectDb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));





app.use("/api/v1/personnel", personnelRoutes);


