import { Db } from "mongodb";

export const validateCollections = async (db: Db) => {
  const collections = await db.listCollections().toArray();

  const collectionNames = collections.map((collection) => collection.name);

  if (!collectionNames.includes("users")) {
    await db.createCollection("users");
  }

  if (!collectionNames.includes("regions")) {
    await db.createCollection("regions");
  }
};
