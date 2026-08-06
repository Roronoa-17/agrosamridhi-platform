# Deploying AgroSamridhi to AWS EC2

This guide deploys the full `docker-compose.yml` stack (MySQL, Redis,
Eureka, 4 Spring Boot services, API Gateway, and the frontend) onto a
single EC2 instance. It assumes you're starting from a new AWS account
with promotional credit.

Only `api-gateway` (port 8080) and `frontend` (port 3000) publish host
ports in `docker-compose.yml` — every other service (MySQL, Redis,
Eureka, auth-service, data-ingestion-service, ai-inference-service,
dashboard-aggregator-service) is reachable only on the internal Docker
network. The security group below matches that exactly, so there's no
internal-service exposure to lock down beyond it.

## Phase 1 — Protect your credit before touching EC2

1. **AWS Budgets** → Billing Console → Budgets → create alerts at
   $20 / $50 / $80, so you're emailed before a surprise bill, not after.
2. Recommended but skippable: create an IAM user with
   `AmazonEC2FullAccess` instead of using the root account for daily work.

## Phase 2 — Launch the EC2 instance

EC2 Console → **Launch Instance**:

| Setting | Value | Why |
|---|---|---|
| Region | `ap-south-1` (Mumbai) | Closest to the target users (Indian farmers) |
| AMI | Ubuntu Server 24.04 LTS | Standard, well-supported |
| Instance type | `t3.medium` (2 vCPU, 4GB RAM) | Fits 6 JVM services + MySQL + Redis + frontend; ~$30/mo, resizable later without a rebuild |
| Key pair | Create new, download `.pem` | `chmod 400 key.pem` locally afterward |
| Storage | 30GB gp3 (bump from default 8GB) | 6 Docker images + MySQL data won't fit in 8GB |

**Security group** — create new, with exactly these rules:

| Type | Port | Source |
|---|---|---|
| SSH | 22 | My IP only |
| Custom TCP | 3000 (frontend) | Anywhere (0.0.0.0/0) |
| Custom TCP | 8080 (api-gateway) | Anywhere (0.0.0.0/0) |

## Phase 3 — Allocate an Elastic IP

EC2 → **Elastic IPs** → Allocate → Associate with your instance. This
gives a stable address (`<EIP>` below) that survives stop/start —
important since the frontend bakes its API URL in at build time.

AWS charges ~$3.65/month for any public IPv4 address now, attached or
not, running or stopped — so there's no cost penalty to using an
Elastic IP over the ephemeral one, and you get stability in exchange.

## Phase 4 — Connect and install Docker

```bash
ssh -i key.pem ubuntu@<EIP>
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
docker compose version   # confirm the plugin is present
```

## Phase 5 — Get the code onto the instance

```bash
git clone -b development https://github.com/Roronoa-17/agrosamridhi-platform.git
cd agrosamridhi-platform
```

The production-readiness fixes live on `development`. Clone that
branch, or merge to `main` first if you'd rather deploy from there.

## Phase 6 — Configure credentials via AWS SSM Parameter Store

The Spring Boot services fetch their own secrets (`JWT_SECRET`,
`DB_PASSWORD`, `GEMINI_API_KEY`, `AGMARKNET_API_KEY`) directly from
SSM Parameter Store at startup — there's no `.env` file to create or
copy to the instance. `CORS_ALLOWED_ORIGINS` isn't a credential, so it
still comes from a plain shell/compose variable (default
`http://localhost:3000` — export it before deploying if the frontend's
real origin differs).

### 6a. Create the IAM role and attach it to the instance

1. IAM Console → **Policies** → **Create policy** → JSON tab, using
   your account ID and the region above:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["ssm:GetParameter", "ssm:GetParameters", "ssm:GetParametersByPath"],
         "Resource": "arn:aws:ssm:ap-south-1:<ACCOUNT_ID>:parameter/agrosamridhi/*"
       },
       {
         "Effect": "Allow",
         "Action": "kms:Decrypt",
         "Resource": "arn:aws:kms:ap-south-1:<ACCOUNT_ID>:alias/aws/ssm"
       }
     ]
   }
   ```
   Name it e.g. `agrosamridhi-ssm-read`.
2. IAM Console → **Roles** → **Create role** → trusted entity type
   **AWS service** → use case **EC2** → attach `agrosamridhi-ssm-read`.
   Name it e.g. `agrosamridhi-ec2-role`.
3. EC2 Console → select the instance → **Actions** → **Security** →
   **Modify IAM role** → attach `agrosamridhi-ec2-role`.
4. Docker containers reach instance credentials over the metadata
   service (IMDS) with a default hop limit of 1, which blocks
   containerized processes. Raise it once:
   ```bash
   aws ec2 modify-instance-metadata-options \
     --instance-id <INSTANCE_ID> \
     --http-put-response-hop-limit 2 \
     --http-endpoint enabled
   ```

### 6b. Create the SSM parameters

Run from your local machine (with AWS CLI configured) or from the
instance itself once the role is attached:

```bash
aws ssm put-parameter --region ap-south-1 --type SecureString \
  --name /agrosamridhi/common/DB_PASSWORD --value '<pick a real password>'

aws ssm put-parameter --region ap-south-1 --type SecureString \
  --name /agrosamridhi/common/JWT_SECRET --value '<pick a real 256-bit secret>'

aws ssm put-parameter --region ap-south-1 --type SecureString \
  --name /agrosamridhi/ai-inference-service/GEMINI_API_KEY --value '<your Gemini key>'

# Optional - only needed to override the shared public data.gov.in fallback
aws ssm put-parameter --region ap-south-1 --type SecureString \
  --name /agrosamridhi/data-ingestion-service/AGMARKNET_API_KEY --value '<your key>'
```

## Phase 7 — Build and run

```bash
export CORS_ALLOWED_ORIGINS=http://<EIP>:3000
export VITE_API_BASE_URL=http://<EIP>:8080
./scripts/deploy.sh
docker compose ps
```

`deploy.sh` exports `SPRING_PROFILES_ACTIVE=aws` (so the services pull
their secrets from SSM) and `DB_PASSWORD` (pulled from SSM, needed
because the `agrosamridhi-db` MySQL container isn't a Spring app and
can't fetch its own `MYSQL_ROOT_PASSWORD`), then runs
`docker compose up --build -d`.

All 9 containers should show `Up`, with only `api-gateway` and
`frontend` showing published ports — that's expected, not a sign
anything's missing.

## Phase 8 — Verify

```bash
curl -X POST http://<EIP>:8080/api/auth/register -H "Content-Type: application/json" -d '{}'
# expect: {"status":400,"error":"Bad Request",...}
```

Then open `http://<EIP>:3000` in a browser and register/log in for
real. To confirm Eureka registration without exposing the dashboard
publicly:

```bash
docker compose exec discovery-server wget -qO- http://localhost:8761/eureka/apps
```

## Phase 9 — Manage the credit going forward

- **Stop the instance** (EC2 console or `aws ec2 stop-instances`)
  whenever you're not actively demoing it — compute billing stops
  immediately; only ~$2.70/mo (storage) + ~$3.65/mo (Elastic IP) keep
  ticking while stopped.
- Check the Billing Dashboard weekly against the budget alerts from
  Phase 1.

## Possible follow-ups

- Domain + free HTTPS via Let's Encrypt (Caddy or certbot) in front of
  the gateway/frontend.
- A GitHub Actions workflow that redeploys automatically on push to
  `development`.
