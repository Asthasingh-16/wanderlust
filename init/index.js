const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("✅ Connection successful!");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  try {
    await Listing.deleteMany({});
    console.log("🧹 Old listings deleted.");

    // Ensure all listings have owner + valid geometry fallback
    const seedData = initData.data.map((obj) => {
      return {
        ...obj,
        owner: "6867a851bc9b339ba6268969",
        geometry: obj.geometry && obj.geometry.type && obj.geometry.coordinates
          ? obj.geometry
          : {
              type: "Point",
              coordinates: [0, 0], // Fallback coordinates
            }
      };
    });

    await Listing.insertMany(seedData);
    console.log("🌱 Sample data initialized!");
  } catch (err) {
    console.error("❌ Error initializing DB:", err);
  } finally {
    mongoose.connection.close();
  }
};

initDB();
