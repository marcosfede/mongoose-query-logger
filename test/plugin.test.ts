import waitForExpect from 'wait-for-expect';
import mongoose from 'mongoose';
import { defaultExplainLogger, defaultQueryLogger } from '../src/logger';
import { Task, queryLogger } from './setupMongo';

const expectToContain = async (fn, expected) => {
  return waitForExpect(() => {
    expect(fn.mock.calls[fn.mock.calls.length - 1][0]).toContain(expected);
  });
};

const objectid1 = '507f1f77bcf86cd799439011';

describe('MongooseQueryLogger', () => {
  const logger = jest.fn(console.log);
  const queryLoggerFn = jest.fn(args => defaultQueryLogger(args, logger));
  const explainLogger = jest.fn(console.log);
  const explainFn = jest.fn(args => defaultExplainLogger(args, explainLogger));

  beforeAll(async () => {
    queryLogger
      .setExplain(true)
      .setAdditionalLogProperties(true)
      .setQueryLogger(queryLoggerFn)
      .setExplainLogger(explainFn);

    await Task.deleteMany({});
    await Task.create({ _id: objectid1 });
  });

  beforeEach(() => {
    logger.mockClear();
    explainLogger.mockClear();
  });

  describe('test query logger', () => {
    it('logs for query middleware', async () => {
      const examples = [
        {
          method: 'find',
          args: [{ _id: objectid1 }],
          expected: `tasks.find({"_id":"${objectid1}"})`,
        },
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
      ];

      for (let example of examples) {
        const { method, args, expected } = example;

        const result = await Task[method](...args);

        await expectToContain(logger, expected);
      }
    });

    it('works with skip and limit', async () => {
      const result = await Task.find({})
        .limit(10)
        .skip(5)
        .exec();

      const expected = 'tasks.find({}, {"limit":10,"skip":5})';

      await expectToContain(logger, expected);
    });

    it('works with sort', async () => {
      const result = await Task.find()
        .sort('name')
        .exec();

      const expected = 'tasks.find({}, {"sort":{"name":1}})';

      await expectToContain(logger, expected);
    });

    it('works for aggregate', async () => {
      const result = await Task.aggregate([{ $match: { name: 'john' } }]);

      const expected = 'tasks.aggregate([{"$match":{"name":"john"}}])';

      await expectToContain(logger, expected);
    });

    it('works for aggregate v2', async () => {
      const result = await Task.aggregate([
        {
          $match: {
            status: { $in: ['pending'] },
            user: '123',
            project: {
              $in: ['321', '234'],
            },
          },
        },
        { $group: { _id: { project: '$project' }, pending: { $sum: 1 } } },
      ]);
      const expected =
        'tasks.aggregate([{"$match":{"status":{"$in":["pending"]},"user":"123","project":{"$in":["321","234"]}}},{"$group":{"_id":{"project":"$project"},"pending":{"$sum":1}}}])';

      await expectToContain(logger, expected);
    });
  });

  describe('test explain logger', () => {
    it('simple find COLLSCAN', async () => {
      const tasks = Task.find({}).exec();

      const expected = '"stage": "COLLSCAN"';

      await expectToContain(explainLogger, expected);
    });

    it('simple find IXSCAN', async () => {
      const tasks = Task.find({ name: 'john' }).exec();

      const expected = 'IXSCAN {"name":1}';

      await expectToContain(explainLogger, expected);
    });

    it('limit and skip', async () => {
      const result = await Task.find({})
        .limit(10)
        .skip(5)
        .exec();

      await expectToContain(explainLogger, '"stage": "SKIP"');

      await expectToContain(explainLogger, '"skipAmount": 5');

      await expectToContain(explainLogger, '"stage": "LIMIT"');

      await expectToContain(explainLogger, '"limitAmount": 10');
    });

    it('aggregate with IXSCAN', async () => {
      const result = await Task.aggregate([{ $match: { name: 'john' } }]);

      const expected = 'IXSCAN {"name":1}';

      await expectToContain(explainLogger, expected);
    });

    it('aggregate with COLLSCAN', async () => {
      const result = await Task.aggregate([
        {
          $match: {
            status: { $in: ['pending'] },
            user: '123',
            project: {
              $in: ['321', '234'],
            },
          },
        },
        { $group: { _id: { project: '$project' }, pending: { $sum: 1 } } },
      ]);

      await expectToContain(explainLogger, '"stage": "COLLSCAN"');

      await expectToContain(explainLogger, '"stage": "PROJECTION_SIMPLE"');
    });

    it('works with sort', async () => {
      await Task.find()
        .sort('name')
        .exec();

      await expectToContain(explainLogger, 'IXSCAN {"name":1}');
    });
  });
});
