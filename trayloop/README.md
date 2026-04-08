# TrayLoop

Monorepo for the live TrayLoop platform.

## Structure

```
trayloop/
├── apps/
│   ├── web-marketing/    # Marketing website
│   ├── web-storefront/   # Customer-facing storefront
│   ├── web-merchant/     # Merchant dashboard
│   ├── web-admin/        # Internal admin panel
│   ├── api/              # Backend API service
│   └── worker/           # Background job workers
├── packages/
│   ├── ui/               # Shared UI component library
│   ├── config/           # Shared configuration
│   ├── types/            # Shared TypeScript types
│   ├── database/         # Database client and migrations
│   ├── utils/            # Shared utilities
│   └── auth/             # Authentication logic
├── infrastructure/
│   ├── docker/           # Dockerfiles and compose configs
│   ├── terraform/        # Infrastructure as code
│   └── k8s-or-ecs/      # Container orchestration configs
├── docs/
│   ├── product/          # Product specs and requirements
│   ├── architecture/     # Architecture decision records
│   ├── api/              # API documentation
│   └── runbooks/         # Operational runbooks
└── .github/
    └── workflows/        # CI/CD pipelines
```

## Getting Started

```bash
npm install
npm run dev
```

## Operations

- Production deployment notes: [C:\Users\simon\SimonShaun2\trayloop\PRODUCTION.md](C:\Users\simon\SimonShaun2\trayloop\PRODUCTION.md)
- Launch checklist: [C:\Users\simon\SimonShaun2\trayloop\LAUNCH_CHECKLIST.md](C:\Users\simon\SimonShaun2\trayloop\LAUNCH_CHECKLIST.md)
- Merchant launch runbook: [C:\Users\simon\SimonShaun2\trayloop\docs\runbooks\launch-flow.md](C:\Users\simon\SimonShaun2\trayloop\docs\runbooks\launch-flow.md)

## Scripts

- `npm run build` - Build all apps and packages
- `npm run dev` - Start all apps in development mode
- `npm run lint` - Lint all apps and packages
- `npm run test` - Run all tests
- `npm run clean` - Clean build artifacts
