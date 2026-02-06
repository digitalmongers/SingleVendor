import Cache from './src/utils/cache.js';
import dotenv from 'dotenv';

dotenv.config();

const clearAllLocks = async () => {
  try {
    console.log('🔓 Clearing all Redis locks...');

    // Get all keys matching lock pattern
    const keys = await Cache.keys('lock:*');

    if (keys && keys.length > 0) {
      console.log(`Found ${keys.length} locks to clear`);

      // Delete all lock keys
      for (const key of keys) {
        await Cache.del(key);
        console.log(`  ✓ Deleted: ${key}`);
      }

      console.log('✅ All locks cleared successfully!');
    } else {
      console.log('ℹ️  No locks found in Redis');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing locks:', error.message);
    process.exit(1);
  }
};

clearAllLocks();
