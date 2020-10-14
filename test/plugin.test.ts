import { defaultExplainLogger, defaultQueryLogger } from '../src/logger';
import { Task, queryLogger } from './setupMongo';

describe('MongooseQueryLogger', () => {
  const logger = jest.fn(console.log);
  const queryLoggerFn = jest.fn(args => defaultQueryLogger(args, logger));
  const explainFn = jest.fn(args => defaultExplainLogger(args, logger));

  beforeAll(() => {
    queryLogger
      .setExplain(true)
      .setAdditionalLogProperties(true)
      .setQueryLogger(queryLoggerFn)
      .setExplainLogger(explainFn);
  });

  it('logs', async () => {
    const examples = [
      {
        method: 'find',
        args: [{}, { _id: 1 }],
        expected: 'tasks.find({}, {"_id":1})',
      },
      {
        method: 'find',
        args: [{ name: 'john' }],
        expected: 'tasks.find({"name":"john"})',
      },
      {
        method: 'count',
        args: [],
        expected: 'tasks.count({})',
      },
      {
        method: 'countDocuments',
        args: [],
        expected: 'tasks.countDocuments({})',
      },
      {
        method: 'estimatedDocumentCount',
        args: [],
        expected: 'tasks.estimatedDocumentCount({})',
      },
      {
        method: 'findOne',
        args: [],
        expected: 'tasks.findOne({})',
      },
      {
        method: 'findOneAndUpdate',
        args: [{ name: 'bob' }, { name: 'john' }],
        expected:
          'tasks.findOneAndUpdate({"name":"bob"}, {"$set":{"name":"john"}})',
      },
      {
        method: 'findOneAndRemove',
        args: [],
        expected: 'tasks.findOneAndRemove({})',
      },
      {
        method: 'findOneAndDelete',
        args: [],
        expected: 'tasks.findOneAndDelete({})',
      },
      {
        method: 'update',
        args: [],
        expected: 'tasks.update({})',
      },
      {
        method: 'updateOne',
        args: [],
        expected: 'tasks.updateOne({})',
      },
      {
        method: 'updateMany',
        args: [],
        expected: 'tasks.updateMany({})',
      },
      {
        method: 'deleteOne',
        args: [],
        expected: 'tasks.deleteOne({})',
      },
      {
        method: 'deleteMany',
        args: [],
        expected: 'tasks.deleteMany({})',
      },
      // {
      //   method: 'aggregate',
      //   args: [[{ $match: { name: 'bob' } }]],
      //   expected: 'tasks.aggregate([{"$match": {"name": "bob"}}])',
      // },
    ];

    for (let example of examples) {
      const { method, args, expected } = example;

      console.log(...args);
      const result = await Task[method](...args);
      expect(logger.mock.calls[logger.mock.calls.length - 1][0]).toContain(
        expected
      );
    }
  });

  it('works with option chaining', async () => {
    const result = await Task.find({})
      .limit(10)
      .skip(5)
      .exec();

    expect(logger.mock.calls[logger.mock.calls.length - 1][0]).toContain(
      'tasks.find({}, {"limit":10,"skip":5})'
    );
  });
});
