import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import express from 'express';
import connectDb from './db/index.js';
import personnelRoutes from "./routes/personnel.route.js";
import inventoryOperatorRoutes from "./routes/inventory-operator.route.js";
import stockRequestRoutes from "./routes/stock-request.route.js";
import vendorRoutes from "./routes/vendor.route.js";
import unitRoutes from "./routes/unit.route.js";
import attendanceRoutes from "./routes/attendance.route.js";
import shiftRoutes from "./routes/shift.route.js";


const app = express();

dotenv.config();
connectDb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



app.use("/api/v1/personnel", personnelRoutes);
app.use("/api/v1/inventory", inventoryOperatorRoutes);
app.use("/api/v1/stock-requests", stockRequestRoutes);
app.use("/api/v1/vendors", vendorRoutes);
app.use("/api/v1/units", unitRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/shifts", shiftRoutes);

