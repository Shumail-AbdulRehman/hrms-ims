/**
 * Seed Script — Clears DB and creates a super_admin user
 * 
 * Run: node src/seed.js
 */

import mongoose from "mongoose";
import bcrypt from "bcrypt";

import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve("../.env") }); 

const MONGODB_URL = process.env.MONGODB_URL;

console.log("MONGODB_URL:", process.env.MONGODB_URL);

async function seed() {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URL);
        console.log("✅ Connected");

        // Drop ALL collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        for (const col of collections) {
            await mongoose.connection.db.dropCollection(col.name);
            console.log(`🗑️  Dropped collection: ${col.name}`);
        }
        console.log("✅ All collections cleared");

        // Create a default unit for the super_admin
        const unitResult = await mongoose.connection.db.collection("units").insertOne({
            name: "HQ",
            code: "HQ-001",
            location: "Headquarters",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        console.log("✅ Default unit 'HQ' created");

        // Hash password
        const hashedPassword = await bcrypt.hash("admin123", 10);

        // Create super_admin
        const superAdmin = {
            employeeId: "EMP-SUPER001",
            firstName: "Super",
            lastName: "Admin",
            email: "admin@hrms.com",
            password: hashedPassword,
            role: "super_admin",
            unit: unitResult.insertedId,
            designation: "DW&CE(N)",
            department: "Administration",
            status: "active",
            employeeType: "permanent",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await mongoose.connection.db.collection("personnels").insertOne(superAdmin);

        console.log("\n✅ Super Admin created successfully!");
        console.log("────────────────────────────────");
        console.log("📧 Email:    admin@hrms.com");
        console.log("🔑 Password: admin123");
        console.log("👤 Role:     super_admin");
        console.log("🏢 Unit:     HQ (HQ-001)");
        console.log("────────────────────────────────\n");

        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
}

seed();
