import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGO_URI;

console.log('📡 Attempting to connect to MongoDB...');
console.log('🔗 URI:', uri.replace(/:([^@]+)@/, ':****@')); // Hide password

mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000
})
    .then(() => {
        console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ CONNECTION ERROR:');
        console.error('Name:', err.name);
        console.error('Message:', err.message);

        if (err.message.includes('Server selection timed out')) {
            console.log('\n💡 TROUBLESHOOTING TIP:');
            console.log('This usually means your IP address is not whitelisted in MongoDB Atlas.');
            console.log('1. Go to MongoDB Atlas > Network Access');
            console.log('2. Click "Add IP Address"');
            console.log('3. Select "Allow Access From Anywhere" (0.0.0.0/0) or "Add Current IP Address"');
            console.log('4. Wait 1-2 minutes and try again.');
        }

        process.exit(1);
    });
