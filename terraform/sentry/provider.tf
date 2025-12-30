terraform {
  required_version = ">= 1.0"
  
  required_providers {
    sentry = {
      source  = "jianyuan/sentry"
      version = "~> 0.12"
    }
  }
}

provider "sentry" {
  token = var.sentry_auth_token
  base_url = "https://sentry.io/api/"
}

