# Mongoose Query Logger

![CI](https://github.com/marcosfede/mongoose-query-logger/workflows/CI/badge.svg) [![npm version](https://badge.fury.io/js/mongoose-query-logger.svg)](https://www.npmjs.com/package/mongoose-query-logger)

This middleware logs to console (by default) all your mongoose queries and execution timings.
It also logs index usage and warns you about full collection scans

warning: don't use `{explain: true}` in production, it will run each query twice.

## Installation

```
npm install --save-dev mongoose-query-logger
```

## Usage

Apply the plugin to all schemas:

```typescript
import { queryLogger } from 'mongoose-query-logger';

mongoose.plugin(queryLogger, { explain: true });
```

Apply the plugin to specific schemas:

```typescript
import { queryLogger } from 'mongoose-query-logger';

const schema = new mongoose.Schema({
  /* schema definition */
});

schema.plugin(queryLogger, { explain: true });

// compile the model AFTER registering plugins
const User = mongoose.model('User', schema);
```

## custom logging function

## License

MIT © [Federico Marcos](http://github.com/marcosfede)
