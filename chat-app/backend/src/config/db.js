import mongoose from 'mongoose';

export async function connectToDatabase(mongoUri) {
  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined');
  }
  const sanitizedUri = String(mongoUri).trim();
  // Basic visibility for troubleshooting env issues in dev
  if (process.env.NODE_ENV !== 'production') {
    const preview = sanitizedUri.slice(0, 20);
    console.log(`Connecting to MongoDB... (${preview}...)`);
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(sanitizedUri, {
    dbName: undefined,
  });
  return mongoose.connection;
}


