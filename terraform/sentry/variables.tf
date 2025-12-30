variable "sentry_auth_token" {
  description = "Sentry API authentication token"
  type        = string
  sensitive   = true
}

variable "sentry_org" {
  description = "Sentry organization slug"
  type        = string
  default     = "hookahplusnet"
}

variable "sentry_projects" {
  description = "Map of Sentry project slugs to their display names"
  type = map(string)
  default = {
    "hookahplus-app"    = "HookahPlus App"
    "hookahplus-guests" = "HookahPlus Guests"
  }
}

variable "slack_workspace_id" {
  description = "Slack workspace integration ID (optional, leave empty if not using Slack)"
  type        = string
  default     = ""
}

variable "slack_channel" {
  description = "Slack channel for alerts (e.g., #hookahplus-alerts)"
  type        = string
  default     = "#hookahplus-alerts"
}

variable "alert_email_recipients" {
  description = "List of email addresses to receive alerts (optional)"
  type        = list(string)
  default     = []
}

