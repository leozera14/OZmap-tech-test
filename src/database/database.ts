import mongoose, { ConnectOptions } from "mongoose";

const env = {
  MONGO_URI: "mongodb://localhost:27017/",
  MONGO_DATABASE: "OZmap_test",
};

export const connectWithDatabase = async () => {
  try {
    await mongoose.connect(`${env.MONGO_URI}${env.MONGO_DATABASE}`, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    } as ConnectOptions);
  } catch (error) {
    console.error(error);
  }
};
