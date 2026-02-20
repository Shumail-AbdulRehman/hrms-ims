import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function fixDatabase() {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;

    try {
        await db.collection('vendors').dropIndex('vendorId_1');
        console.log("✅ Dropped stale vendorId_1 index from vendors");
    } catch (err) {
        if (err.codeName === 'IndexNotFound') console.log("— vendorId_1 index already gone");
        else console.log("— vendors:", err.message);
    }

    const collections = ['itemmasters', 'stockins', 'stockouts', 'stockrequests', 'stockreturns'];
    for (const col of collections) {
        try {
            const exists = await db.listCollections({ name: col }).hasNext();
            if (exists) {
                const lastDoc = await db.collection(col).find().sort({ _id: -1 }).limit(1).toArray();
                if (lastDoc.length > 0) {
                    const doc = lastDoc[0];
                    const idField = Object.keys(doc).find(k => /Id$/.test(k) && k !== '_id');
                    if (idField && doc[idField]) {
                        const match = doc[idField].match(/(\d+)$/);
                        if (match) {
                            const prefix = doc[idField].replace(/-?\d+$/, '').replace(/-$/, '');
                            const seq = parseInt(match[1]);
                            await db.collection('counters').updateOne(
                                { _id: prefix },
                                { $set: { seq: seq } },
                                { upsert: true }
                            );
                            console.log(`✅ Fixed counter for ${prefix}: set to ${seq}`);
                        }
                    }
                }
            }
        } catch (err) {
            console.log(`— ${col}: ${err.message}`);
        }
    }

    console.log("\nCurrent counters:");
    const counters = await db.collection('counters').find().toArray();
    counters.forEach(c => console.log(`  ${c._id}: ${c.seq}`));

    console.log("\nCurrent indexes on itemmasters:");
    try {
        const indexes = await db.collection('itemmasters').indexes();
        indexes.forEach(i => console.log(`  ${i.name}: ${JSON.stringify(i.key)}`));
    } catch (e) {
        console.log("  collection doesn't exist yet");
    }

    console.log("\nCurrent indexes on vendors:");
    try {
        const indexes = await db.collection('vendors').indexes();
        indexes.forEach(i => console.log(`  ${i.name}: ${JSON.stringify(i.key)}`));
    } catch (e) {
        console.log("  collection doesn't exist yet");
    }

    await mongoose.disconnect();
    console.log("\n✅ Done! Restart your backend server.");
}

fixDatabase();
