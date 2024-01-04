import mongoose, { ConnectOptions } from "mongoose";

export const connectWithDatabase = async () => {
  try {
    await mongoose.connect(
      `${process.env.MONGO_URI}${process.env.MONGO_DATABASE}`,
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      } as ConnectOptions
    );
  } catch (error) {
    console.error(error);
  }
};
