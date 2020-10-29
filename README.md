# Mongoose Query Logger

![CI](https://github.com/marcosfede/mongoose-query-logger/workflows/CI/badge.svg) 
![npm version](https://badgen.net/npm/v/mongoose-query-logger)
![types](https://badgen.net/npm/types/mongoose-query-logger)
![license](https://badgen.net/npm/license/mongoose-query-logger)
![bundlephobia](https://badgen.net/bundlephobia/min/react)

This middleware logs all your mongoose queries and execution timings.

Optionally, it also logs index usage and warns you about full collection scans

## Installation

```
npm install --save-dev mongoose-query-logger
```

## Usage

Apply the plugin to all schemas:

```typescript
import { MongooseQueryLogger } from 'mongoose-query-logger';

export const queryLogger = new MongooseQueryLogger();
 
// optionally add custom configuration eg:
// queryLogger
//    .setExplain(true)
//    .setAdditionalLogProperties(true)
//    .setQueryLogger(myCustomQueryLogger)
//    .setExplainLogger(myCustomExplainLogger);

mongoose.plugin(queryLogger.getPlugin());
```

Apply the plugin to specific schemas:

```typescript
import { MongooseQueryLogger } from 'mongoose-query-logger';

export const queryLogger = new MongooseQueryLogger();

// optionally add custom configuration eg:
// queryLogger
//    .setExplain(true)
//    .setAdditionalLogProperties(true)
//    .setQueryLogger(myCustomQueryLogger)
//    .setExplainLogger(myCustomExplainLogger);

const schema = new mongoose.Schema({
  /* schema definition */
});

schema.plugin(queryLogger.getPlugin());

// compile the model AFTER registering plugins
const User = mongoose.model('User', schema);
```

## Explain logging

This is turned off by default. It will fire an explain query for supported operations.
Turn this on by calling: 

```plugin.setExplain(true)```

warning: don't use `explain` in production, it will run each query twice.

## Supported query logging methods
The following methods are supported for query logging

| method | supported |
| --------------- | --------------- |
| count | :heavy_check_mark: |
| countDocuments | :heavy_check_mark: |
| estimatedDocumentCount | :heavy_check_mark: |
| find | :heavy_check_mark: |
| findOne | :heavy_check_mark: |
| findOneAndUpdate | :heavy_check_mark: |
| findOneAndRemove | :heavy_check_mark: |
| findOneAndDelete | :heavy_check_mark: |
| findOneAndRemove | :heavy_check_mark: |
| update | :heavy_check_mark: |
| updateOne | :heavy_check_mark: |
| updateMany | :heavy_check_mark: |
| deleteOne | :heavy_check_mark: |
| deleteMany | :heavy_check_mark: |
| aggregate | :heavy_check_mark: |
| remove |  |
| insertMany |  |
| distinct |  |

If you want only a subset of these to be logged, you can provide an array of supported methods like so:

```
plugin.setQueryMethods({targetMethods: ['find', 'aggregate']})
```

## Supported explain logging methods
The following methods are supported for query explaining

| method | supported |
| --------------- | --------------- |
| find | :heavy_check_mark: |
| findOne | :heavy_check_mark: |
| aggregate | :heavy_check_mark: |

If you want only a subset of these to be logged, you can provide an array of supported methods like so:

```
plugin.setQueryMethods({explainMethods: ['find', 'aggregate']})
```

## Custom query logger
You can provide a custom logging function by calling `plugin.setQueryLogger(myCustomLogger)`
The logger should be a function that accepts a single argument of type object with the following keys:

| key | type | description | example |
| --------------- | --------------- | --------------- | --------------- |
| operation | string | executed operation | find, aggregate |
| collectionName | string | collection name | tasks |
| executionTimeMS | number | query execution time in ms | 320ms |
| filter | Object or null  | filter object provided to the query | {"name": "john"} |
| fields | Object or null | projection fields | {"name": 1} |
| options | any | query options | {"sort": "name"} |
| update | Object or null |  |  |
| additionalLogProperties | any | additional log options |  |


## Custom explain logger
You can provide a custom explain logging function by calling `plugin.setExplainLogger(myCustomExplainLogger)`
The logger should be a function that accepts a single argument of type object with the following keys:

| key | type | description |
| --------------- | --------------- | --------------- |
| queryPlanners | any[] | array of query execution plans as returned from mongodb |

## Additional log properties
You can include additional metadata in your queries by turning this on with 

```plugin.setAdditionalLogProperties(true)```

and using it like `await User.find({"name": "john"}).additionalLogProperties('something')`


## License

MIT © [Federico Marcos](http://github.com/marcosfede)
