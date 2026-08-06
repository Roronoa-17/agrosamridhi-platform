#!/usr/bin/env bash
# Deploys the docker-compose stack on the EC2 instance using credentials
# pulled from AWS SSM Parameter Store at deploy time - no .env file.
#
# Prerequisites (see docs/AWS_DEPLOYMENT.md):
#   - An IAM instance profile attached to this EC2 instance with
#     ssm:GetParameter(s) + kms:Decrypt on /agrosamridhi/* parameters.
#   - The SSM parameters created (DB_PASSWORD, JWT_SECRET, GEMINI_API_KEY,
#     and optionally AGMARKNET_API_KEY).
#   - AWS CLI installed and able to reach the instance metadata service.
set -euo pipefail

REGION="ap-south-1"

# The Spring Boot services fetch their own secrets (JWT_SECRET,
# GEMINI_API_KEY, AGMARKNET_API_KEY, and their own copy of DB_PASSWORD)
# straight from SSM at startup via the "aws" profile. DB_PASSWORD is
# still exported here too because the MySQL container itself isn't a
# Spring app and needs MYSQL_ROOT_PASSWORD passed in through compose.
export SPRING_PROFILES_ACTIVE=aws
export DB_PASSWORD
DB_PASSWORD="$(aws ssm get-parameter \
  --name /agrosamridhi/common/DB_PASSWORD \
  --with-decryption \
  --query 'Parameter.Value' \
  --output text \
  --region "$REGION")"

# -f explicitly limits compose to this one file, bypassing the
# auto-merge of docker-compose.override.yml (local-dev-only secrets
# that would otherwise shadow the SSM-sourced values above).
docker compose -f docker-compose.yml up --build -d
