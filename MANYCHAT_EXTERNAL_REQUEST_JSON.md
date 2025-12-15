# ManyChat External Request JSON Bodies

**Quick Reference:** Copy-paste these JSON bodies into your ManyChat External Request actions.

## A. Comment Trigger - External Request Body

```json
{
  "event_type": "comment",
  "user": {
    "id": "{{subscriber_id}}",
    "instagram_username": "{{instagram_username}}",
    "instagram_id": "{{instagram_id}}",
    "name": "{{first_name}} {{last_name}}",
    "email": "{{email}}",
    "phone": "{{phone}}",
    "tags": {{tags}},
    "custom_fields": {
      "business_name": "{{custom_field.business_name}}",
      "order_method": "{{custom_field.order_method}}",
      "location": "{{custom_field.location}}",
      "seating_types": "{{custom_field.seating_types}}",
      "total_capacity": "{{custom_field.total_capacity}}",
      "number_of_tables": "{{custom_field.number_of_tables}}",
      "average_session_duration": "{{custom_field.average_session_duration}}",
      "current_pos": "{{custom_field.current_pos}}",
      "pricing_model": "{{custom_field.pricing_model}}",
      "preferred_features": "{{custom_field.preferred_features}}",
      "facebook_url": "{{custom_field.facebook_url}}",
      "website_url": "{{custom_field.website_url}}",
      "base_hookah_price": "{{custom_field.base_hookah_price}}",
      "refill_price": "{{custom_field.refill_price}}",
      "menu_link": "{{custom_field.menu_link}}"
    }
  },
  "comment": {
    "text": "{{comment_text}}"
  }
}
```

## B. DM Keyword Trigger - External Request Body

```json
{
  "event_type": "message",
  "user": {
    "id": "{{subscriber_id}}",
    "instagram_username": "{{instagram_username}}",
    "instagram_id": "{{instagram_id}}",
    "name": "{{first_name}} {{last_name}}",
    "email": "{{email}}",
    "phone": "{{phone}}",
    "tags": {{tags}},
    "custom_fields": {
      "business_name": "{{custom_field.business_name}}",
      "order_method": "{{custom_field.order_method}}",
      "location": "{{custom_field.location}}",
      "seating_types": "{{custom_field.seating_types}}",
      "total_capacity": "{{custom_field.total_capacity}}",
      "number_of_tables": "{{custom_field.number_of_tables}}",
      "average_session_duration": "{{custom_field.average_session_duration}}",
      "current_pos": "{{custom_field.current_pos}}",
      "pricing_model": "{{custom_field.pricing_model}}",
      "preferred_features": "{{custom_field.preferred_features}}",
      "facebook_url": "{{custom_field.facebook_url}}",
      "website_url": "{{custom_field.website_url}}",
      "base_hookah_price": "{{custom_field.base_hookah_price}}",
      "refill_price": "{{custom_field.refill_price}}",
      "menu_link": "{{custom_field.menu_link}}"
    }
  },
  "message": {
    "text": "{{message_text}}"
  }
}
```

## C. Story Reply Trigger - External Request Body

```json
{
  "event_type": "story_reply",
  "user": {
    "id": "{{subscriber_id}}",
    "instagram_username": "{{instagram_username}}",
    "instagram_id": "{{instagram_id}}",
    "name": "{{first_name}} {{last_name}}",
    "email": "{{email}}",
    "phone": "{{phone}}",
    "tags": {{tags}},
    "custom_fields": {
      "business_name": "{{custom_field.business_name}}",
      "order_method": "{{custom_field.order_method}}",
      "location": "{{custom_field.location}}",
      "seating_types": "{{custom_field.seating_types}}",
      "total_capacity": "{{custom_field.total_capacity}}",
      "number_of_tables": "{{custom_field.number_of_tables}}",
      "average_session_duration": "{{custom_field.average_session_duration}}",
      "current_pos": "{{custom_field.current_pos}}",
      "pricing_model": "{{custom_field.pricing_model}}",
      "preferred_features": "{{custom_field.preferred_features}}",
      "facebook_url": "{{custom_field.facebook_url}}",
      "website_url": "{{custom_field.website_url}}",
      "base_hookah_price": "{{custom_field.base_hookah_price}}",
      "refill_price": "{{custom_field.refill_price}}",
      "menu_link": "{{custom_field.menu_link}}"
    }
  },
  "story_reply": {
    "text": "{{story_reply_text}}"
  }
}
```

## Configuration Steps

1. **Go to ManyChat** → **Automation** → Select your automation (Comment/DM/Story Reply)
2. **Find the External Request action** (or add it if not present)
3. **Set Method:** POST
4. **Set URL:** `https://app.hookahplus.net/api/webhooks/manychat`
5. **Set Headers:** `Content-Type: application/json`
6. **Paste the appropriate JSON body above** into the Body field
7. **Save** the automation

## Important Notes

- ✅ External Request must come **BEFORE** "Send to Flow" action
- ✅ All ManyChat variables (like `{{subscriber_id}}`) will be replaced automatically
- ✅ Empty custom fields will send as empty strings (handled by webhook)
- ✅ The webhook handler will parse and map all fields to the operator dashboard

## What Gets Captured

All fields from the JSON body will be:
1. **Stored in the lead record** (operator dashboard)
2. **Included in metadata** for inspection and learning
3. **Available for filtering** in the dashboard
4. **Tracked for analytics** and optimization

