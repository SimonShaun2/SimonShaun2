# Container Orchestration

This project uses **AWS ECS with Fargate** for container orchestration.

## Services

| Service | Port | Description |
|---------|------|-------------|
| API | 3001 | Fastify backend API |
| Worker | - | BullMQ background job processor |
| Web Marketing | 3000 | Next.js marketing site |
| Web Storefront | 3000 | Next.js storefront |
| Web Merchant | 3000 | Next.js merchant dashboard |
| Web Admin | 3000 | Next.js admin panel |

## Deployment

Deployments are managed via GitHub Actions + Terraform. See:
- `.github/workflows/deploy.yml` for CI/CD pipeline
- `infrastructure/terraform/` for infrastructure as code

## Local Development

Use Docker Compose for local development:

```bash
cd infrastructure/docker
docker compose up -d
```

This starts PostgreSQL and Redis. Run the apps directly via `npm run dev` from the root.
