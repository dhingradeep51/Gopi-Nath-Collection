import mongoose from "mongoose";
import colors from "colors";

//mongodb connection
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`Mongodb connected : ${conn.connection.host}`.bgYellow.white);
    } catch (error) {
    console.log(`Error : ${error.message}`.bgRed.white);
    process.exit(1);
    }
};
//This is monogo code
export default connectDB;
