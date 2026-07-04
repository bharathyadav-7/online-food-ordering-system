import { MongoClient } from "mongodb";

const sourceUri = process.env.SOURCE_MONGODB_URI;
const targetUri = process.env.TARGET_MONGODB_URI;
const dbName = process.env.MIGRATION_DB_NAME || "food_ordering";

if (!sourceUri || !targetUri) {
  console.error("SOURCE_MONGODB_URI and TARGET_MONGODB_URI are required.");
  process.exit(1);
}

const sourceClient = new MongoClient(sourceUri);
const targetClient = new MongoClient(targetUri);

async function run() {
  await sourceClient.connect();
  await targetClient.connect();

  const sourceDb = sourceClient.db(dbName);
  const targetDb = targetClient.db(dbName);
  const collections = await sourceDb.listCollections().toArray();

  for (const { name } of collections) {
    const sourceCollection = sourceDb.collection(name);
    const targetCollection = targetDb.collection(name);
    const documents = await sourceCollection.find({}).toArray();

    await targetCollection.deleteMany({});

    if (documents.length > 0) {
      await targetCollection.insertMany(documents, { ordered: true });
    }

    console.log(`${name}: copied ${documents.length}`);
  }

  console.log(`Migration complete for database "${dbName}".`);
}

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sourceClient.close();
    await targetClient.close();
  });
