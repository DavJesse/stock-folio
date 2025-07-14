// Extends Jest's expect with custom DOM matchers from Testing Library (e.g., .toBeInTheDocument())
import '@testing-library/jest-dom';

// Polyfill `fetch` and related classes for use in Node.js testing environments.
// Jest runs in Node, which lacks native `fetch`. We use `node-fetch` to simulate the browser environment.

// eslint-disable-next-line @typescript-eslint/no-require-imports -- node-fetch is ESM-only; require avoids ESM import errors in Jest
const fetch = require('node-fetch');

// Destructure required Web API constructors from node-fetch
const { Headers, Request, Response } = fetch;

// Assign Web API globals so that code using fetch APIs runs without modification
global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;
