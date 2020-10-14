import mongoose from 'mongoose';
import { MongooseQueryLogger } from '../src/index';

mongoose.set('debug', (...args) => console.dir(args));
export const queryLogger = new MongooseQueryLogger();

const MONGO_URI = 'mongodb://localhost/mongoose-query-logger';

beforeAll(async () => {
  if (!mongoose.connection.readyState) {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
  }
});

afterAll(async () => {
  // wait for all logs to be done before ending tests
  await new Promise(r => setTimeout(r, 1000));
  mongoose.connection.db.dropDatabase(function(err, result) {});
});

const taskSchema = new mongoose.Schema({
  name: String,
  createdAt: String,
  updatedAt: String,
});

taskSchema.index({ createdAt: 1 });
taskSchema.index({ name: 1 });

taskSchema.plugin(queryLogger.getPlugin());

export const Task = mongoose.model('task', taskSchema);
