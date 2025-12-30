# ============================================================================
# Issue Alerts (Project-scoped)
# ============================================================================

# Critical Production Errors (P0) - App Project
resource "sentry_issue_alert" "critical_production_errors_app" {
  organization = var.sentry_org
  project      = "hookahplus-app"
  name         = "Critical Production Errors"
  action_match = "all"
  frequency    = 0 # Every occurrence

  conditions = [
    {
      id    = "sentry.rules.conditions.environment.EnvironmentCondition"
      value = "production"
    },
    {
      id    = "sentry.rules.conditions.level.LevelCondition"
      match = "gte"
      level = "error"
    }
  ]

  actions = concat(
    [
      {
        id = "sentry.rules.actions.notify_event_service.NotifyEventServiceAction"
        service = "email"
      }
    ],
    var.slack_workspace_id != "" ? [
      {
        id        = "sentry.integrations.slack.notify_action.SlackNotifyServiceAction"
        workspace = var.slack_workspace_id
        channel   = var.slack_channel
      }
    ] : []
  )
}

# Critical Production Errors (P0) - Guests Project
resource "sentry_issue_alert" "critical_production_errors_guests" {
  organization = var.sentry_org
  project      = "hookahplus-guests"
  name         = "Critical Production Errors"
  action_match = "all"
  frequency    = 0 # Every occurrence

  conditions = [
    {
      id    = "sentry.rules.conditions.environment.EnvironmentCondition"
      value = "production"
    },
    {
      id    = "sentry.rules.conditions.level.LevelCondition"
      match = "gte"
      level = "error"
    }
  ]

  actions = concat(
    [
      {
        id = "sentry.rules.actions.notify_event_service.NotifyEventServiceAction"
        service = "email"
      }
    ],
    var.slack_workspace_id != "" ? [
      {
        id        = "sentry.integrations.slack.notify_action.SlackNotifyServiceAction"
        workspace = var.slack_workspace_id
        channel   = var.slack_channel
      }
    ] : []
  )
}

# New Issue Detection (P2) - App Project
resource "sentry_issue_alert" "new_issue_detected_app" {
  organization = var.sentry_org
  project      = "hookahplus-app"
  name         = "New Issue Detected"
  action_match = "all"
  frequency    = 60 # Once per hour

  conditions = [
    {
      id = "sentry.rules.conditions.first_seen_event.FirstSeenEventCondition"
    },
    {
      id    = "sentry.rules.conditions.environment.EnvironmentCondition"
      value = "production"
    }
  ]

  actions = [
    {
      id = "sentry.rules.actions.notify_event_service.NotifyEventServiceAction"
      service = "email"
    }
  ]
}

# New Issue Detection (P2) - Guests Project
resource "sentry_issue_alert" "new_issue_detected_guests" {
  organization = var.sentry_org
  project      = "hookahplus-guests"
  name         = "New Issue Detected"
  action_match = "all"
  frequency    = 60 # Once per hour

  conditions = [
    {
      id = "sentry.rules.conditions.first_seen_event.FirstSeenEventCondition"
    },
    {
      id    = "sentry.rules.conditions.environment.EnvironmentCondition"
      value = "production"
    }
  ]

  actions = [
    {
      id = "sentry.rules.actions.notify_event_service.NotifyEventServiceAction"
      service = "email"
    }
  ]
}

# Payment-Related Errors (P0) - App Project
resource "sentry_issue_alert" "payment_errors_app" {
  organization = var.sentry_org
  project      = "hookahplus-app"
  name         = "Payment-Related Errors"
  action_match = "all"
  frequency    = 0 # Every occurrence

  conditions = [
    {
      id    = "sentry.rules.conditions.environment.EnvironmentCondition"
      value = "production"
    },
    {
      id    = "sentry.rules.conditions.level.LevelCondition"
      match = "gte"
      level = "error"
    },
    {
      id    = "sentry.rules.conditions.tagged_event.TaggedEventCondition"
      key   = "component"
      match = "eq"
      value = "payment"
    }
  ]

  actions = concat(
    [
      {
        id = "sentry.rules.actions.notify_event_service.NotifyEventServiceAction"
        service = "email"
      }
    ],
    var.slack_workspace_id != "" ? [
      {
        id        = "sentry.integrations.slack.notify_action.SlackNotifyServiceAction"
        workspace = var.slack_workspace_id
        channel   = var.slack_channel
      }
    ] : []
  )
}

# Database Connection Errors (P1) - App Project
resource "sentry_issue_alert" "database_errors_app" {
  organization = var.sentry_org
  project      = "hookahplus-app"
  name         = "Database Connection Errors"
  action_match = "all"
  frequency    = 5 # Once per 5 minutes

  conditions = [
    {
      id    = "sentry.rules.conditions.environment.EnvironmentCondition"
      value = "production"
    },
    {
      id        = "sentry.rules.conditions.event_attribute.EventAttributeCondition"
      attribute = "message"
      match     = "contains"
      value     = "database"
    }
  ]

  actions = [
    {
      id = "sentry.rules.actions.notify_event_service.NotifyEventServiceAction"
      service = "email"
    }
  ]
}

# Authentication Failures (P2) - App Project
resource "sentry_issue_alert" "auth_failures_app" {
  organization = var.sentry_org
  project      = "hookahplus-app"
  name         = "Authentication Failures"
  action_match = "all"
  frequency    = 60 # Once per hour

  conditions = [
    {
      id    = "sentry.rules.conditions.environment.EnvironmentCondition"
      value = "production"
    },
    {
      id        = "sentry.rules.conditions.event_attribute.EventAttributeCondition"
      attribute = "message"
      match     = "contains"
      value     = "authentication"
    }
  ]

  actions = [
    {
      id = "sentry.rules.actions.notify_event_service.NotifyEventServiceAction"
      service = "email"
    }
  ]
}
