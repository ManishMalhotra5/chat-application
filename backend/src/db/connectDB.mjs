import { DB_NAME } from "../constants.mjs";
import mongoose from 'mongoose';

const connectDB = async () => {
	try {
        console.log("Connecting to database")
        const connectionString = `${process.env.DB_URI}/${DB_NAME}`;
        const connectionObj = await mongoose.connect(connectionString);
        console.log("Database connected at ",connectionObj.connection.host);
	} catch (error) {
        console.log("Failed to connect with database"+error);
    }
};

export default connectDB;