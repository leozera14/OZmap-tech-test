import mongoose from "mongoose";
import { Db, MongoClient } from "mongodb";
import { validateCollections } from "./validateCollections";

const env = {
  MONGO_URI: "mongodb://localhost:27017/",
  MONGO_DATABASE: "OZmap_test",
};

const connectWithDatabase = async (): Promise<Db> => {
  await mongoose.connect(`${env.MONGO_URI}${env.MONGO_DATABASE}`);
  return mongoose.connection.db as any; // Return the db connection
};

const initializeDatabase = async () => {
  // Connect to MongoDB server
  const client = new MongoClient(env.MONGO_URI);
  await client.connect();

  // Check for the existence of the database
  const adminDb = client.db().admin();
  const { databases } = await adminDb.listDatabases();
  const dbExists = databases.some((db) => db.name === env.MONGO_DATABASE);

  // Close the initial connection
  await client.close();

  // If the database does not exist, connect to it to create it
  if (!dbExists) {
    const connection = await connectWithDatabase();

    await validateCollections(connection as Db);
  } else {
    console.log(`Database ${env.MONGO_DATABASE} already exists.`);
  }
};

export { initializeDatabase };
