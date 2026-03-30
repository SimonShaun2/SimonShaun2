# TrayLoop Production Deployment

## Architecture

```
                    ┌─────────────┐
                    │  CloudFlare  │ (DNS + CDN, optional)
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐  ┌─────▼──────┐  ┌──────▼──────┐
   │   Vercel    │  │   Vercel   │  │  AWS ALB    │
   │  Storefront │  │  Merchant  │  │  (HTTPS)    │
   │  :443       │  │  :443      │  └──────┬──────┘
   └─────────────┘  └────────────┘         │
                                    ┌──────▼──────┐
                                    │ ECS Fargate │
                                    │  API x2     │
                                    │  :3001      │
                                    └──────┬──────┘
                                    ┌──────┴──────┐
                               ┌────▼───┐   ┌────▼────┐
                               │  RDS   │   │ ElastiC │
                               │ PG 16  │   │ Redis 7 │
                               └────────┘   └─────────┘
```

## Step-by-Step Setup

### 1. Prerequisites

- AWS account with admin access
- Domain name (trayloop.com) with DNS control
- Stripe account with live keys
- Resend account (for transactional email)
- Vercel account (free tier works)
- GitHub repository connected

### 2. AWS Bootstrap (one-time)

```bash
# Create Terraform state bucket
aws s3api create-bucket \
  --bucket trayloop-terraform-state \
  --region us-east-1

aws s3api put-bucket-versioning \
  --bucket trayloop-terraform-state \
  --versioning-configuration Status=Enabled

# Create Terraform lock table
aws dynamodb create-table \
  --table-name trayloop-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

# Create ECR repository
aws ecr create-repository --repository-name trayloop-api

# Create OIDC provider for GitHub Actions
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

### 3. Create GitHub Actions IAM Role

```bash
# Create trust policy (replace YOUR_GITHUB_ORG/YOUR_REPO)
cat > trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
      },
      "StringLike": {
        "token.actions.githubusercontent.com:sub": "repo:simonshaun2/simonshaun2:*"
      }
    }
  }]
}
EOF

aws iam create-role \
  --role-name trayloop-github-actions \
  --assume-role-policy-document file://trust-policy.json

# Attach required policies
aws iam attach-role-policy --role-name trayloop-github-actions \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser
aws iam attach-role-policy --role-name trayloop-github-actions \
  --policy-arn arn:aws:iam::aws:policy/AmazonECS_FullAccess
aws iam attach-role-policy --role-name trayloop-github-actions \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite
```

### 4. SSL Certificate

```bash
# Request certificate (must be in us-east-1 for ALB)
aws acm request-certificate \
  --domain-name api.trayloop.com \
  --subject-alternative-names "*.trayloop.com" \
  --validation-method DNS

# Add the CNAME records shown in the output to your DNS
# Wait for validation (check with):
aws acm describe-certificate --certificate-arn <ARN>
```

### 5. Terraform Apply

```bash
cd trayloop/infrastructure/terraform

# Create tfvars for production
cat > production.tfvars << 'EOF'
environment         = "production"
domain_name         = "trayloop.com"
db_instance_class   = "db.t3.medium"
redis_node_type     = "cache.t3.small"
api_cpu             = 512
api_memory          = 1024
api_desired_count   = 2
acm_certificate_arn = "arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT_ID"
EOF

terraform init
terraform plan -var-file=production.tfvars
terraform apply -var-file=production.tfvars
```

### 6. Populate Secrets

After Terraform creates the Secrets Manager secret, populate it:

```bash
aws secretsmanager put-secret-value \
  --secret-id trayloop/production/app \
  --secret-string '{
    "DATABASE_URL": "postgresql://trayloop_admin:PASSWORD@RDS_ENDPOINT:5432/trayloop?sslmode=require",
    "REDIS_URL": "rediss://ELASTICACHE_ENDPOINT:6379",
    "JWT_SECRET": "GENERATE_A_64_CHAR_RANDOM_STRING",
    "STRIPE_SECRET_KEY": "sk_live_...",
    "STRIPE_PUBLISHABLE_KEY": "pk_live_...",
    "STRIPE_WEBHOOK_SECRET": "whsec_...",
    "EMAIL_PROVIDER": "resend",
    "EMAIL_FROM": "TrayLoop <orders@trayloop.com>",
    "RESEND_API_KEY": "re_..."
  }'
```

Generate JWT_SECRET: `openssl rand -hex 32`

### 7. Initialize Database

```bash
# Connect to RDS via a bastion or SSM Session Manager
psql $DATABASE_URL -f packages/database/init.sql
```

### 8. GitHub Repository Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|--------|-------|
| `AWS_ROLE_ARN` | `arn:aws:iam::ACCOUNT:role/trayloop-github-actions` |

### 9. DNS Records

Point these to the ALB DNS name (from `terraform output alb_dns`):

| Record | Type | Value |
|--------|------|-------|
| `api.trayloop.com` | CNAME | `trayloop-production-XXXXX.us-east-1.elb.amazonaws.com` |

### 10. Deploy Frontends to Vercel

**Storefront:**
```bash
cd trayloop
npx vercel link  # select apps/web-storefront as root
npx vercel env add NEXT_PUBLIC_API_URL  # → https://api.trayloop.com
npx vercel --prod
```

**Merchant Dashboard:**
```bash
npx vercel link  # select apps/web-merchant as root
npx vercel env add NEXT_PUBLIC_API_URL  # → https://api.trayloop.com
npx vercel --prod
```

Then add custom domains in the Vercel dashboard:
- Storefront: `order.trayloop.com`
- Merchant: `dashboard.trayloop.com`

### 11. Stripe Webhook

In [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks):

1. Add endpoint: `https://api.trayloop.com/api/webhooks/stripe`
2. Select events:
   - `checkout.session.completed`
   - `checkout.session.expired`
3. Copy the signing secret → update in AWS Secrets Manager as `STRIPE_WEBHOOK_SECRET`

### 12. Verify

```bash
# API health
curl https://api.trayloop.com/health

# Check ECS service
aws ecs describe-services \
  --cluster trayloop-production \
  --services trayloop-production-api

# Check logs
aws logs tail /ecs/trayloop-production-api --follow
```

## Cost Estimate (Monthly)

| Service | Staging | Production |
|---------|---------|------------|
| ECS Fargate (0.5 vCPU, 1GB × 2) | ~$30 | ~$30 |
| RDS db.t3.medium (single-AZ) | ~$30 | ~$60 (multi-AZ) |
| ElastiCache cache.t3.small | ~$12 | ~$25 (2 nodes) |
| ALB | ~$16 | ~$16 |
| NAT Gateway | ~$32 | ~$32 |
| ECR, CloudWatch, Secrets | ~$5 | ~$5 |
| **Total AWS** | **~$125** | **~$168** |
| Vercel (free tier) | $0 | $0 |
| Resend (free tier, 3k/mo) | $0 | $0 |
| Stripe | 2.9% + $0.30/txn | 2.9% + $0.30/txn |

## Cost Reduction Tips

- **NAT Gateway** is the biggest fixed cost ($32/mo). Alternative: use VPC endpoints for ECR/CloudWatch/Secrets Manager and remove the NAT Gateway.
- **Staging**: Use `db.t3.micro` ($13/mo) and single ElastiCache node.
- **Start small**: 1 Fargate task is fine until you hit ~100 concurrent users.

## Rollback

```bash
# Quick rollback to previous task definition
PREV_TASK=$(aws ecs describe-services \
  --cluster trayloop-production \
  --services trayloop-production-api \
  --query 'services[0].taskDefinition' --output text)

# List revisions and pick the previous one
aws ecs list-task-definitions --family trayloop-production-api --sort DESC

aws ecs update-service \
  --cluster trayloop-production \
  --service trayloop-production-api \
  --task-definition trayloop-production-api:PREVIOUS_REVISION
```
