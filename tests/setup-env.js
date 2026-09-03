// Tests talk to a real MongoDB, never to the development database.
//
// This used to start mongodb-memory-server, which downloads a mongod binary on
// first run and has no build for Alpine. A real server is already running next
// to the app in development and in CI, so the tests just use it — and the two
// packages that provided the in-memory one are gone.
process.env.MONGODB_URI =
    process.env.MONGO_TEST_URI ?? 'mongodb://127.0.0.1:27017/inmytime_test';
