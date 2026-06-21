import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDb } from "../src/config/db.js";
import { User } from "../src/models/User.js";

dotenv.config();

const users = [
  { name: "Admin", email: "admin@gmail.com", password: "Admin@123", role: "admin" },
  { name: "Restaurant Owner", email: "restaurant@gmail.com", password: "Restaurant@123", role: "restaurant" },
  { name: "Delivery Staff", email: "delivery@gmail.com", password: "Delivery@123", role: "delivery" },
  { name: "Customer", email: "customer@gmail.com", password: "User@123", role: "customer" }
];

async function run() {
  await connectDb(process.env.MONGODB_URI);

  for (const account of users) {
    const passwordHash = await bcrypt.hash(account.password, 10);
    await User.findOneAndUpdate(
      { email: account.email },
      {
        name: account.name,
        email: account.email,
        passwordHash,
        role: account.role
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log("RBAC users ready:");
  for (const account of users) {
    console.log(`- ${account.email} / ${account.password} / ${account.role}`);
  }
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
