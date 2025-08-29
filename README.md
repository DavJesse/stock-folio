# StockFolio: A Stock Portfolio Tracker

A modern web application for simulating stock trading and tracking a virtual portfolio, built with [Next.js](https://nextjs.org). Users can search for real stocks, view live prices, simulate trades, and monitor their portfolio performance—all in a responsive, user-friendly interface.

---

## Purpose

**Why?**
StockFolio helps individual investors, students, and finance enthusiasts practice investment strategies and learn about the stock market—without risking real money. It solves the problem of safely exploring trading concepts, tracking performance, and visualizing market data in a realistic, interactive way.

---

## Key Features

- **Stock Search:** Find stocks by ticker and view company name, current price, and percentage change (real-time data).
- **Simulated Trading:** Buy and sell shares virtually—no real money required.
- **Portfolio Management:** Track your simulated holdings, quantities, purchase prices, current prices, total value, and gain/loss.
- **Historical Price Charts:** Visualize daily, weekly, or monthly price trends for any stock.
- **Local Persistence:** Your portfolio is saved in browser local storage for session persistence.
- **Responsive UI:** Works seamlessly on desktop and mobile.
- **Clear Error Handling:** Friendly messages for invalid tickers or API issues.
- **Accessible & Modern Design:** Simple, intuitive, and visually appealing interface.

---

## Video Demonstration
Here's a link to a [video demostration of how to navigate and use StockFolio](https://www.loom.com/share/8bb7bee5ade54b1c860870f61c9ed7bc?sid=9addeb65-ad3a-422d-b0c3-38d1986111f0)

---

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), [pnpm](https://pnpm.io/), or [bun](https://bun.sh/) (choose one)
- [Docker](https://www.docker.com/) (optional, for containerized deployment)

### Setup
Clone the repository and install dependencies:

```bash
git clone https://github.com/Lantel-Dev/Github_Assessment_David_Jesse_Odhiambo.git
cd Github_Assessment_David_Jesse_Odhiambo
npm install # or yarn install or pnpm install or bun install
```

#### API Key Configuration
1. Register for a free API key at [Finnhub.io](https://finnhub.io/) (or another supported provider).
2. Create a `.env.local` file in the project root and add:
   ```env
   NEXT_PUBLIC_STOCK_API_KEY=your_api_key_here
   ```
3. (See [`docs/SRS.md`](docs/SRS.md) for more details on API usage and constraints.)

---

## Quick Start

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

**Production build:**
```bash
npm run build && npm start
```

**Linting:**
```bash
npm run lint
```

---

## Docker Deployment

The application can be containerized using Docker for consistent deployment across different environments.

### Building and Running with Docker

1. **Build the Docker image:**
   ```bash
   docker build -t stockfolio .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 --env-file .env stockfolio
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000).

3. **For persistent database storage:**
   ```bash
   docker run -p 3000:3000 --env-file .env -v $(pwd)/data:/app/db stockfolio
   ```

### Docker Maintenance

The project includes a garbage collection script to help manage Docker resources:

```bash
# Clean up unused Docker resources
./docker-gc.sh
```

This script helps remove:
- Stopped containers
- Unused images
- Dangling volumes
- Unused networks

Run it periodically to keep your Docker environment clean and free up disk space.

---

## Testing

The project includes comprehensive testing with both unit tests and end-to-end tests using Playwright.

### Running Tests

**Unit Tests:**
```bash
npm run test
```

**Unit Tests with Coverage Report:**
```bash
npm run test:coverage
```

**End-to-End Tests:**
```bash
npm run test:e2e
```

### Test Structure

- **Unit Tests:** Test individual components and functions in isolation
- **End-to-End Tests:** Use Playwright to test complete user workflows and interactions
- **Coverage Reports:** Generate detailed coverage reports to ensure code quality

Make sure to run tests before deploying to ensure application stability and reliability.

---

## Usage

1. **Search for a stock ticker** in the search bar to view real-time data.
2. **Simulate buying or selling shares** by entering a quantity and confirming the action.
3. **View your portfolio** to track holdings, total value, and gain/loss.
4. **Explore historical charts** for deeper analysis.

> **Note:** All trades are simulated. No real financial transactions occur.

<!-- ---

## Screenshots -->

<!-- Add screenshots of the main UI pages here (e.g., search, portfolio, trade simulation) -->

---

## Resources

- [Software Requirements Specification (SRS)](docs/SRS.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Finnhub.io API Docs](https://finnhub.io/docs/api)
- [Project Diagrams & Design Docs](docs/) <!-- Add links to diagrams or design docs as needed -->

---

## API Usage Notes

- The app uses a free-tier stock data API. Be aware of rate limits and quotas (see provider documentation).
- API keys should be kept secure and never exposed publicly.

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests for new features, bug fixes, or improvements. Kindly follow the [contributing guidelines](docs/CONTRIBUTING.md) for setup, workflow, and code standards.

Before submitting changes:
1. Run the test suite: `npm run test`
2. Ensure end-to-end tests pass: `npm run test:e2e`
3. Verify code coverage: `npm run test:coverage`
4. Test Docker build: `docker build -t stockfolio .`

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Finnhub.io](https://finnhub.io/)
- [Vercel](https://vercel.com/)
- [Playwright](https://playwright.dev/) for end-to-end testing

---

## Deployment

The easiest way to deploy your Next.js app is with [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) or [Netlify](https://www.netlify.com/). 

For containerized deployments, use the provided Dockerfile with your preferred container orchestration platform (Docker Compose, Kubernetes, etc.).

See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---