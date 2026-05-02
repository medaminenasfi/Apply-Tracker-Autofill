/**
 * Database Integrity Auto-Fix Script
 * 
 * This script scans all collections and converts any non-string userId fields to strings.
 * Run this script once to fix any existing data inconsistencies.
 * 
 * Usage: node scripts/fix-userid-types.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/apply-tracker';

async function fixUserIdTypes() {
  console.log('[DATABASE FIX] Starting userId type normalization...');
  console.log('[DATABASE FIX] Connecting to MongoDB...');
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[DATABASE FIX] Connected successfully');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    let totalFixed = 0;
    let totalChecked = 0;
    
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`\n[DATABASE FIX] Processing collection: ${collectionName}`);
      
      // Skip admin collection (no userId)
      if (collectionName === 'admin') {
        console.log(`[DATABASE FIX] Skipping ${collectionName} (no userId field)`);
        continue;
      }
      
      const col = db.collection(collectionName);
      const documents = await col.find({}).toArray();
      
      let collectionFixed = 0;
      
      for (const doc of documents) {
        totalChecked++;
        
        if (doc.userId && typeof doc.userId !== 'string') {
          console.log(`[DATABASE FIX] Found invalid userId in ${collectionName}:`, {
            _id: doc._id,
            userId: doc.userId,
            type: typeof doc.userId
          });
          
          const result = await col.updateOne(
            { _id: doc._id },
            { $set: { userId: String(doc.userId) } }
          );
          
          if (result.modifiedCount > 0) {
            collectionFixed++;
            totalFixed++;
            console.log(`[DATABASE FIX] Fixed userId for document ${doc._id}`);
          }
        }
      }
      
      if (collectionFixed > 0) {
        console.log(`[DATABASE FIX] Fixed ${collectionFixed} documents in ${collectionName}`);
      } else {
        console.log(`[DATABASE FIX] No fixes needed for ${collectionName}`);
      }
    }
    
    console.log('\n[DATABASE FIX] Summary:');
    console.log(`[DATABASE FIX] Total documents checked: ${totalChecked}`);
    console.log(`[DATABASE FIX] Total documents fixed: ${totalFixed}`);
    console.log('[DATABASE FIX] Fix completed successfully');
    
  } catch (error) {
    console.error('[DATABASE FIX] Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('[DATABASE FIX] Disconnected from MongoDB');
  }
}

fixUserIdTypes();
