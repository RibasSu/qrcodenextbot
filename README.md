# QR Code Telegram Bot

Telegram bot for generating and reading QR codes, running on Cloudflare Workers.

[![CI](https://github.com/RibasSu/qrcodenextbot/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/RibasSu/qrcodenextbot/actions)

## Features

- Generate QR codes from text messages
- Read QR codes from images
- Multi-language support (Portuguese and English)
- Web interface for QR code generation via URL
- Serverless architecture on Cloudflare Workers
- Compatible with both Bun and Node.js runtimes

## Bot Commands

- `/start` - Welcome message
- `/help` - Usage instructions
- `/privacy` - Privacy policy
- `/dev` - Developer information
- Send any text to generate a QR code
- Send an image containing a QR code to decode it

## Prerequisites

- Cloudflare account
- Bun runtime
- Telegram bot token (via @BotFather)

## Installation

```bash
bun install
```

## Configuration

### Environment Variables

Configure secrets via Wrangler CLI:

```bash
wrangler secret put TELEGRAM_TOKEN
wrangler secret put URL_PAGE
```

Or configure via Cloudflare dashboard after connecting your GitHub repository.

## Deployment

### Cloudflare Native Integration (Recommended)

1. Go to Cloudflare Dashboard: https://dash.cloudflare.com/
2. Navigate to Workers & Pages
3. Click "Create Application" > "Pages"
4. Connect your GitHub repository
5. Configure build settings:
   - Framework preset: None
   - Build command: (empty or `npm install`)
   - Build output directory: (empty)
6. Add environment variables in dashboard
7. Deploy automatically on every push

### Manual Deployment

```bash
bun run deploy
```

### Webhook Configuration

After deployment, access: `https://your-worker.workers.dev/setWebhook`

## Development

### Local Development

```bash
bun run dev
```

Note: For local development to work completely with webhooks, use a tunneling tool like ngrok.

### Running Original Bot

```bash
bun start
```

## Testing

### Run Tests

```bash
bun test
```

### Run Tests with Coverage

```bash
bun test --coverage
```

### Test Watch Mode

```bash
bun test --watch
```

### Test Coverage Goals

- Lines: 70%+
- Functions: 70%+
- Branches: 70%+
- Statements: 70%+

### Test Structure

```
test/
├── i18n.test.js      - Translation system tests
├── commands.test.js  - Command handlers tests
└── worker.test.js    - Main worker tests
```

## CI/CD

### Continuous Integration

GitHub Actions workflow runs automatically on:

- Push to master, main, or dev branches
- Pull requests to these branches
- Manual trigger via workflow_dispatch

CI includes:

- Tests on Bun runtime
- Code quality checks
- Security audit
- Coverage report generation
- Artifacts storage (7 days retention)

No secrets required for CI.

### Deployment

Use Cloudflare's native GitHub integration for automatic deployments. The GitHub Actions deploy workflow is disabled by default. Manual deployment via Wrangler CLI is recommended for development.

## Project Structure

```
qrcodenextbot/
├── src/
│   ├── worker.js      - Main Cloudflare Worker
│   ├── commands.js    - Command handlers
│   └── i18n.js        - Translation system
├── test/
│   ├── i18n.test.js
│   ├── commands.test.js
│   └── worker.test.js
├── .github/
│   └── workflows/
│       ├── ci.yml     - CI pipeline
│       └── deploy.yml - Deploy workflow (disabled)
├── commands/          - Original Node.js command handlers
├── config/            - Original Node.js configuration
├── langs/             - Original translation files
├── bot.js             - Original Node.js bot implementation
├── wrangler.toml      - Cloudflare Workers configuration
├── vitest.config.js   - Test configuration
└── package.json
```

## API Endpoints

- `GET /` - Generate QR code image

  - Query parameter: `text` (required)
  - Returns: PNG image
  - Example: `https://your-worker.workers.dev/?text=Hello`

- `POST /webhook` - Telegram webhook endpoint

  - Automatically configured
  - Handles all bot updates

- `GET /setWebhook` - Configure Telegram webhook
  - Sets webhook URL to current worker URL
  - Returns: Telegram API response

## Architecture

### Cloudflare Workers Version

- Webhook-based updates (real-time)
- Inline translations (no filesystem dependency)
- Uses `@paulmillr/qr` for QR code reading
- Native Workers fetch API for HTTP requests
- Serverless, distributed globally on Cloudflare edge

### Node.js Version

- Long polling for updates
- Filesystem-based translations with i18next
- Express for HTTP server
- Jimp for image processing
- Traditional server architecture

## Dependencies

### Production

- `qrcode` - QR code generation
- `jsqr` - QR code reading (Workers-compatible)

### Development

- `wrangler` - Cloudflare Workers CLI
- Bun native test runner (built-in)

### Optional (Node.js version)

- `telegraf` - Telegram bot framework
- `express` - HTTP server
- `axios` - HTTP client
- `jimp` - Image processing
- `i18next` - Internationalization

## Performance

### Cloudflare Workers

- Cold start: ~0ms (edge computing)
- Global distribution across 300+ cities
- Free tier: 100,000 requests/day
- Automatic scaling

## Cloudflare Workers Limits (Free Tier)

- 100,000 requests per day
- 10ms CPU time per request
- 128MB memory limit
- 1MB request/response size limit

## Troubleshooting

### Tests failing in CI but passing locally

Ensure you are using the latest version of Bun. CI uses Bun latest.

### Webhook not working

1. Verify `TELEGRAM_TOKEN` is configured correctly
2. Access `/setWebhook` endpoint after deployment
3. Check Cloudflare Workers logs in dashboard

### QR code reading fails

QR code reader works best with clear, well-lit images. Image quality significantly affects decoding accuracy.

### Deployment fails

1. Verify `wrangler.toml` is present in repository root
2. Check environment variables are configured
3. Review Cloudflare Workers logs

## Security

- No user data storage
- Environment variables encrypted via Cloudflare
- Secrets managed via Wrangler CLI or dashboard
- HTTPS-only communication
- Regular security audits via npm audit in CI

## License

MIT

## Author

Developed by @RibasSu

Likn & Co. - https://likn.com.br/

## Links

- Cloudflare Workers: https://workers.cloudflare.com/
- Bun Runtime: https://bun.sh
- Telegram Bot API: https://core.telegram.org/bots/api