# DeFi Vault Pro

DefiVault Pro is a comprehensive DeFi portfolio management application that leverages 1inch APIs to provide users with a unified platform for tracking, swapping, and analyzing their decentralized finance investments. Built with Next.js and TypeScript, it features a modern, responsive interface with real-time data updates and advanced analytics.

## Features

### Core Features
- 📊 **Portfolio Dashboard** - Real-time portfolio valuation with multi-chain support (Ethereum, Polygon, Arbitrum)
- 🔄 **Smart Swap Interface** - Aggregated pricing from multiple DEXs with slippage protection
- 📈 **Analytics Dashboard** - Advanced profit/loss tracking, win rate calculations, and risk analysis
- 📋 **Transaction History** - Complete transaction timeline with advanced filtering and export functionality
- 🎯 **Limit Orders** - Professional trading features with automated order execution
- 🌾 **Yield Farming Tracker** - Multi-protocol yield monitoring with APY tracking and reward calculation
- 🔔 **Price Alerts** - Real-time price monitoring with instant notifications

### Technical Features
- 🔐 **Secure Vault Management** - Professional-grade DeFi vault operations
- 💼 **Modern UI/UX** - Built with Tailwind CSS for responsive design
- ⚡ **Fast Performance** - Optimized with Next.js App Router
- 🔧 **TypeScript** - Type-safe development experience
- 📱 **Responsive Design** - Works seamlessly across all devices

## Core Features Breakdown

### 1. Portfolio Dashboard
- **Real-time portfolio valuation** using 1inch Price API
- **Asset allocation pie charts** and performance tracking
- **Multi-chain support** (Ethereum, Polygon, Arbitrum, etc.)
- **Profit/loss calculations** with historical performance

### 2. Smart Swap Interface
- **Aggregated pricing** from multiple DEXs via 1inch Aggregation Protocol
- **Slippage protection** and gas estimation
- **Real-time quote updates** with best available rates
- **Token metadata integration** for seamless token selection

### 3. Analytics Dashboard
- **Deep insights** into DeFi performance
- **Profit/Loss tracking** with win rate calculations
- **Risk analysis** and yield farming performance
- **Portfolio performance charts** and trend analysis

### 4. Transaction History
- **Complete transaction timeline** across all supported chains
- **Advanced filtering** by date, token, and transaction type
- **Export functionality** for accounting and tax purposes
- **Gas fee tracking** and optimization insights

### 5. Limit Orders
- **Professional trading features** with 1inch Limit Order Protocol
- **Order creation interface** with advanced order types
- **Active order management** and order book visualization
- **Order history tracking** with execution analytics

### 6. Yield Farming Tracker
- **Multi-protocol yield tracking** across DeFi platforms
- **APY monitoring** with real-time rate updates
- **Reward calculation** and harvesting optimization
- **Risk assessment** for yield farming strategies

### 7. Price Alerts
- **Real-time price monitoring** using 1inch Price API
- **WebSocket connections** for instant updates
- **Customizable alert conditions** with multiple notification channels
- **Alert history** and performance tracking

## Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **APIs**: [1inch APIs](https://1inch.io/api/) (Balance, Price, Aggregation, Limit Orders, History)
- **Real-time Updates**: WebSocket connections
- **Linting**: [ESLint](https://eslint.org/)
- **Deployment**: [Vercel](https://vercel.com)

## Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager
- 1inch API key (for production features)
- WalletConnect Project ID (for wallet connections)
- Alchemy API key (for blockchain data)

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/tanweer919/defi-valult-pro.git
   cd defi-vault-pro
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` with your configuration values.

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
defi-vault-pro/
├── src/
│   ├── app/          # Next.js App Router pages
│   ├── components/   # Reusable React components
│   ├── lib/          # Utility functions and configurations
│   └── styles/       # Global styles and Tailwind config
├── public/           # Static assets
├── .next/            # Next.js build output (auto-generated)
├── .env.local        # Environment variables (not committed)
└── README.md
```

## Configuration Files

- `next.config.ts` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.mjs` - ESLint configuration
- `postcss.config.mjs` - PostCSS configuration

## Development

You can start editing the application by modifying files in the `src/app/` directory. The page auto-updates as you edit files thanks to Next.js hot reloading.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a modern font family from Vercel.

## Environment Variables

Create a `.env.local` file in the root directory and add your environment variables:

```env
# 1inch API Configuration
ONEINCH_API_KEY=your_oneinch_api_key

# Wallet Integration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=project_id_from_wallet_connect

# Blockchain Data Provider
NEXT_PUBLIC_ALCHEMY_ID=your_alchemy_id

# Application Settings
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_IS_DEMO_ALLOWED=true

```

## API Integration

This application integrates with several 1inch APIs:

- **Balance API** - Fetch wallet token balances across chains
- **Price API** - Real-time token pricing and market data
- **Aggregation Protocol** - Best swap routes and execution
- **Token Metadata API** - Token information and logos
- **Limit Order Protocol** - Advanced trading functionality
- **History API** - Transaction history and analytics

## Deployment

### Deploy on Vercel (Recommended)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on every push

### Other Deployment Options

- **Docker**: Build and deploy using containerization
- **Static Export**: Generate static files for CDN deployment
- **Self-hosted**: Deploy on your own server infrastructure

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - utility-first CSS framework
- [TypeScript Documentation](https://www.typescriptlang.org/docs) - typed JavaScript

## Support

For support and questions:

- 📧 Email: [tanweer.anwar919@gmail.com](mailto:tanweer.anwar919@gmail.com)
- 🐛 Issues: [GitHub Issues](https://github.com/tanweer919/defi-vault-pro/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/tanweer919/defi-vault-pro/discussions)

---

Built with ❤️ using [Next.js](https://nextjs.org)
