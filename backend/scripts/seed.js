import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDb } from "../src/config/db.js";
import { User } from "../src/models/User.js";
import { FoodItem } from "../src/models/FoodItem.js";
import { Restaurant } from "../src/models/Restaurant.js";
import { Notification } from "../src/models/Notification.js";
import { Review } from "../src/models/Review.js";

dotenv.config();

const food = [
  {
    name: "French Fries",
    price: 119,
    category: "Veg",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=60",
    description: "Crispy golden fries served hot."
  },
  {
    name: "Chocolate Delight",
    price: 99,
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=60",
    description: "Craving Something Rich And Chocolatey."
  },
  {
    name: "Chicken Dum biryani",
    price: 179,
    category: "Non-Veg",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=60",
    description: "A Dish Fit For Royalty"
  },
  {
    name: "Thums Up",
    price: 39,
    category: "Beverages",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=60",
    description: "Feel Cool"
  },
  {
    name: "Diet Coke",
    price: 39,
    category: "Beverages",
    image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=800&q=60",
    description: "zero sugar"
  },
  {
    name: "veg meals",
    price: 120,
    category: "Veg",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=60",
    description: "enjoy your meals"
  },
  {
    name: "Hyderabadi Biryani",
    price: 199,
    category: "Non-Veg",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=60",
    description: "Authentic spicy biryani with tender meat and aromatic rice."
  },
  {
    name: "Margherita Pizza",
    price: 199,
    category: "Veg",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=60",
    description: "Classic cheese pizza with fresh basil and tomatoes."
  }
];

async function run() {
  await connectDb(process.env.MONGODB_URI);

  await OrderSafeDelete();
  await User.deleteMany({});
  await FoodItem.deleteMany({});
  await Restaurant.deleteMany({});
  await Notification.deleteMany({});
  await Review.deleteMany({});

  const adminPass = await bcrypt.hash("Admin@123", 10);
  const userPass = await bcrypt.hash("User@123", 10);

  await User.create({
    name: "Admin",
    email: "admin@gmail.com",
    passwordHash: adminPass,
    role: "admin"
  });

  await User.create({
    name: "Demo User",
    email: "customer@gmail.com",
    passwordHash: userPass,
    role: "customer"
  });

  const restaurantPass = await bcrypt.hash("Restaurant@123", 10);
  const deliveryPass = await bcrypt.hash("Delivery@123", 10);

  const owner = await User.create({
    name: "Demo Restaurant",
    email: "restaurant@gmail.com",
    passwordHash: restaurantPass,
    role: "restaurant"
  });

  await User.create({
    name: "Demo Delivery",
    email: "delivery@gmail.com",
    passwordHash: deliveryPass,
    role: "delivery"
  });

  const restaurant = await Restaurant.create({
    name: "BiteRush Kitchen",
    ownerId: owner._id,
    location: "Demo City",
    description: "Seeded restaurant profile"
  });

  await FoodItem.insertMany(food.map((item) => ({ ...item, restaurantId: restaurant._id })));

  console.log("Seed complete:");
  console.log("- admin@gmail.com / Admin@123");
  console.log("- customer@gmail.com / User@123");
  console.log("- restaurant@gmail.com / Restaurant@123");
  console.log("- delivery@gmail.com / Delivery@123");
  process.exit(0);
}

async function OrderSafeDelete() {
  try {
    const { Order } = await import("../src/models/Order.js");
    await Order.deleteMany({});
  } catch {
    // ignore
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
