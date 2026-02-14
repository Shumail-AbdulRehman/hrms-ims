import mongoose from "mongoose";


const connectDb = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URL}`
        );
        console.log("MONGODB CONNECTED");
    } catch (error) {
        console.log("DB ERROR:", error);
    }
};

export default connectDb;