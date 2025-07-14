// Extends Jest's expect with custom DOM matchers from Testing Library (e.g., .toBeInTheDocument())
import '@testing-library/jest-dom';

// Polyfill `fetch` and related classes for use in Node.js testing environments.
// Jest tests run in Node, which lacks native `fetch`, so we simulate a browser-like environment using node-fetch.
// `require` is used here instead of `import` to avoid ESM compatibility issues.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require('node-fetch');

// Destructure required Web API constructors from node-fetch
const { Headers, Request, Response } = fetch;

// Assign Web API globals so that code using fetch APIs runs without modification
global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;
