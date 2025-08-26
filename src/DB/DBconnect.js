import mongoose from "mongoose";
import { DBNAME } from "../constant.js";
import { app } from "../app.js";

const ConnectDB = async () => {
  try {
    const connectionInsted = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DBNAME}`
    );
    app.on("error", (error) => {
      console.log("❌ Application-level error:- ", error);
      return error;
    });
    console.log(
      `✅ Database connected successfully: DB Host is :- ${connectionInsted.connection.host}`
    );
  } catch (error) {
    console.log("❌ Failed to connect to the database:- ", error);
    process.exit(1);
  }
};

export default ConnectDB;
