--
-- PostgreSQL database dump
--

\restrict a4Uz0yPnDUsT0Ftsqdc48GQJUNEsLGJnDNHq1GqyXm3MVflUbfVJcPxGarjcinO

-- Dumped from database version 15.14
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP EVENT TRIGGER IF EXISTS pgrst_drop_watch;
DROP EVENT TRIGGER IF EXISTS pgrst_ddl_watch;
DROP EVENT TRIGGER IF EXISTS issue_pg_net_access;
DROP EVENT TRIGGER IF EXISTS issue_pg_graphql_access;
DROP EVENT TRIGGER IF EXISTS issue_pg_cron_access;
DROP EVENT TRIGGER IF EXISTS issue_graphql_placeholder;
DROP PUBLICATION IF EXISTS supabase_realtime;
DROP POLICY IF EXISTS "Admin can upload menu files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can read menu files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete menu files" ON storage.objects;
DROP POLICY IF EXISTS venue_write ON public.venues;
DROP POLICY IF EXISTS venue_read ON public.venues;
DROP POLICY IF EXISTS tenant_write_sessions ON public."Session";
DROP POLICY IF EXISTS tenant_write_payments ON public.payments;
DROP POLICY IF EXISTS tenant_write_events ON public.reflex_events;
DROP POLICY IF EXISTS tenant_update_sessions ON public."Session";
DROP POLICY IF EXISTS tenant_update_payments ON public.payments;
DROP POLICY IF EXISTS tenant_update_own ON public.tenants;
DROP POLICY IF EXISTS tenant_update_events ON public.reflex_events;
DROP POLICY IF EXISTS tenant_read_sessions ON public."Session";
DROP POLICY IF EXISTS tenant_read_payments ON public.payments;
DROP POLICY IF EXISTS tenant_read_own_tenants ON public.tenants;
DROP POLICY IF EXISTS tenant_read_events ON public.reflex_events;
DROP POLICY IF EXISTS tenant_no_insert ON public.tenants;
DROP POLICY IF EXISTS tenant_delete_sessions ON public."Session";
DROP POLICY IF EXISTS tenant_delete_payments ON public.payments;
DROP POLICY IF EXISTS tenant_delete_own ON public.tenants;
DROP POLICY IF EXISTS tenant_delete_events ON public.reflex_events;
DROP POLICY IF EXISTS staff_rw ON public.staff;
DROP POLICY IF EXISTS sessions_rw ON public.sessions;
DROP POLICY IF EXISTS service_role_read_audit_logs ON public.audit_logs;
DROP POLICY IF EXISTS service_role_manage_zones ON public.zones;
DROP POLICY IF EXISTS service_role_manage_sync_backlog ON public.sync_backlog;
DROP POLICY IF EXISTS service_role_manage_stations ON public.stations;
DROP POLICY IF EXISTS service_role_manage_session_notes ON public.session_notes;
DROP POLICY IF EXISTS service_role_manage_seats ON public.seats;
DROP POLICY IF EXISTS service_role_manage_pricing_rules ON public.pricing_rules;
DROP POLICY IF EXISTS service_role_manage_preorders ON public.preorders;
DROP POLICY IF EXISTS service_role_manage_orders ON public.orders;
DROP POLICY IF EXISTS service_role_manage_order_items ON public.order_items;
DROP POLICY IF EXISTS service_role_manage_order_events ON public.order_events;
DROP POLICY IF EXISTS service_role_manage_mix_templates ON public.mix_templates;
DROP POLICY IF EXISTS service_role_manage_loyalty_profiles ON public.loyalty_profiles;
DROP POLICY IF EXISTS service_role_manage_loyalty_note_bindings ON public.loyalty_note_bindings;
DROP POLICY IF EXISTS service_role_manage_lounge_configs ON public.lounge_configs;
DROP POLICY IF EXISTS service_role_manage_flavors ON public.flavors;
DROP POLICY IF EXISTS service_role_manage_deliveries ON public.deliveries;
DROP POLICY IF EXISTS service_role_manage_audit_logs ON public.audit_logs;
DROP POLICY IF EXISTS reservations_rw ON public.reservations;
DROP POLICY IF EXISTS refills_rw ON public.refills;
DROP POLICY IF EXISTS ghostlog_read ON public.ghostlog;
DROP POLICY IF EXISTS ghostlog_insert ON public.ghostlog;
DROP POLICY IF EXISTS authenticated_read_zones ON public.zones;
DROP POLICY IF EXISTS authenticated_read_sync_backlog ON public.sync_backlog;
DROP POLICY IF EXISTS authenticated_read_stations ON public.stations;
DROP POLICY IF EXISTS authenticated_read_session_notes ON public.session_notes;
DROP POLICY IF EXISTS authenticated_read_seats ON public.seats;
DROP POLICY IF EXISTS authenticated_read_pricing_rules ON public.pricing_rules;
DROP POLICY IF EXISTS authenticated_read_preorders ON public.preorders;
DROP POLICY IF EXISTS authenticated_read_orders ON public.orders;
DROP POLICY IF EXISTS authenticated_read_order_items ON public.order_items;
DROP POLICY IF EXISTS authenticated_read_order_events ON public.order_events;
DROP POLICY IF EXISTS authenticated_read_mix_templates ON public.mix_templates;
DROP POLICY IF EXISTS authenticated_read_loyalty_profiles ON public.loyalty_profiles;
DROP POLICY IF EXISTS authenticated_read_loyalty_note_bindings ON public.loyalty_note_bindings;
DROP POLICY IF EXISTS authenticated_read_lounge_configs ON public.lounge_configs;
DROP POLICY IF EXISTS authenticated_read_flavors ON public.flavors;
DROP POLICY IF EXISTS authenticated_read_deliveries ON public.deliveries;
DROP POLICY IF EXISTS "Users can read session events" ON public."SessionEvent";
DROP POLICY IF EXISTS "Users can read own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can read own memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can read own events" ON public."Event";
DROP POLICY IF EXISTS "Users can read own awards" ON public."Award";
DROP POLICY IF EXISTS "Users can read active badges" ON public."Badge";
DROP POLICY IF EXISTS "Service role can manage webhook events" ON public.stripe_webhook_events;
DROP POLICY IF EXISTS "Service role can manage taxonomy unknowns" ON public."TaxonomyUnknown";
DROP POLICY IF EXISTS "Service role can manage sessions" ON public.sessions;
DROP POLICY IF EXISTS "Service role can manage session events" ON public."SessionEvent";
DROP POLICY IF EXISTS "Service role can manage memberships" ON public.memberships;
DROP POLICY IF EXISTS "Service role can manage events" ON public."Event";
DROP POLICY IF EXISTS "Service role can manage drift events" ON public."DriftEvent";
DROP POLICY IF EXISTS "Service role can manage badges" ON public."Badge";
DROP POLICY IF EXISTS "Service role can manage awards" ON public."Award";
DROP POLICY IF EXISTS "Authenticated users can update taxonomy unknowns" ON public."TaxonomyUnknown";
DROP POLICY IF EXISTS "Authenticated users can read taxonomy unknowns" ON public."TaxonomyUnknown";
DROP POLICY IF EXISTS "Authenticated users can read drift events" ON public."DriftEvent";
DROP POLICY IF EXISTS "Authenticated users can insert taxonomy unknowns" ON public."TaxonomyUnknown";
DROP POLICY IF EXISTS "Authenticated users can insert drift events" ON public."DriftEvent";
DROP POLICY IF EXISTS "Admin can update menu files" ON public.menu_files;
DROP POLICY IF EXISTS "Admin can read menu files" ON public.menu_files;
DROP POLICY IF EXISTS "Admin can insert menu files" ON public.menu_files;
DROP POLICY IF EXISTS "Admin can delete menu files" ON public.menu_files;
ALTER TABLE IF EXISTS ONLY storage.vector_indexes DROP CONSTRAINT IF EXISTS vector_indexes_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_upload_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads DROP CONSTRAINT IF EXISTS s3_multipart_uploads_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.prefixes DROP CONSTRAINT IF EXISTS "prefixes_bucketId_fkey";
ALTER TABLE IF EXISTS ONLY storage.objects DROP CONSTRAINT IF EXISTS "objects_bucketId_fkey";
ALTER TABLE IF EXISTS ONLY public.staff DROP CONSTRAINT IF EXISTS staff_venue_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_venue_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.session_notes DROP CONSTRAINT IF EXISTS session_notes_session_id_fkey;
ALTER TABLE IF EXISTS ONLY public.seats DROP CONSTRAINT IF EXISTS seats_zone_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reservations DROP CONSTRAINT IF EXISTS reservations_venue_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reflex_events DROP CONSTRAINT IF EXISTS reflex_events_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.refills DROP CONSTRAINT IF EXISTS refills_venue_id_fkey;
ALTER TABLE IF EXISTS ONLY public.refills DROP CONSTRAINT IF EXISTS refills_session_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_session_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_session_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_events DROP CONSTRAINT IF EXISTS order_events_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.menu_files DROP CONSTRAINT IF EXISTS menu_files_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.memberships DROP CONSTRAINT IF EXISTS memberships_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.loyalty_note_bindings DROP CONSTRAINT IF EXISTS loyalty_note_bindings_session_note_id_fkey;
ALTER TABLE IF EXISTS ONLY public.loyalty_note_bindings DROP CONSTRAINT IF EXISTS loyalty_note_bindings_loyalty_profile_id_fkey;
ALTER TABLE IF EXISTS ONLY public.deliveries DROP CONSTRAINT IF EXISTS deliveries_session_id_fkey;
ALTER TABLE IF EXISTS ONLY public.deliveries DROP CONSTRAINT IF EXISTS deliveries_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public."Session" DROP CONSTRAINT IF EXISTS "Session_zone_id_fkey";
ALTER TABLE IF EXISTS ONLY public."Session" DROP CONSTRAINT IF EXISTS "Session_tenant_id_fkey";
ALTER TABLE IF EXISTS ONLY public."Session" DROP CONSTRAINT IF EXISTS "Session_seat_id_fkey";
ALTER TABLE IF EXISTS ONLY public."Session" DROP CONSTRAINT IF EXISTS "Session_preorder_id_fkey";
ALTER TABLE IF EXISTS ONLY public."SessionEvent" DROP CONSTRAINT IF EXISTS "SessionEvent_sessionId_fkey";
ALTER TABLE IF EXISTS ONLY public."Award" DROP CONSTRAINT IF EXISTS "Award_badgeId_fkey";
ALTER TABLE IF EXISTS ONLY auth.sso_domains DROP CONSTRAINT IF EXISTS sso_domains_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_oauth_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_flow_state_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_session_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.one_time_tokens DROP CONSTRAINT IF EXISTS one_time_tokens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_challenges DROP CONSTRAINT IF EXISTS mfa_challenges_auth_factor_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS mfa_amr_claims_session_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_user_id_fkey;
DROP TRIGGER IF EXISTS update_objects_updated_at ON storage.objects;
DROP TRIGGER IF EXISTS prefixes_delete_hierarchy ON storage.prefixes;
DROP TRIGGER IF EXISTS prefixes_create_hierarchy ON storage.prefixes;
DROP TRIGGER IF EXISTS objects_update_create_prefix ON storage.objects;
DROP TRIGGER IF EXISTS objects_insert_create_prefix ON storage.objects;
DROP TRIGGER IF EXISTS objects_delete_delete_prefix ON storage.objects;
DROP TRIGGER IF EXISTS enforce_bucket_name_length_trigger ON storage.buckets;
DROP TRIGGER IF EXISTS tr_check_filters ON realtime.subscription;
DROP INDEX IF EXISTS supabase_functions.supabase_functions_hooks_request_id_idx;
DROP INDEX IF EXISTS supabase_functions.supabase_functions_hooks_h_table_id_h_name_idx;
DROP INDEX IF EXISTS storage.vector_indexes_name_bucket_id_idx;
DROP INDEX IF EXISTS storage.objects_bucket_id_level_idx;
DROP INDEX IF EXISTS storage.name_prefix_search;
DROP INDEX IF EXISTS storage.idx_prefixes_lower_name;
DROP INDEX IF EXISTS storage.idx_objects_lower_name;
DROP INDEX IF EXISTS storage.idx_objects_bucket_id_name;
DROP INDEX IF EXISTS storage.idx_name_bucket_level_unique;
DROP INDEX IF EXISTS storage.idx_multipart_uploads_list;
DROP INDEX IF EXISTS storage.buckets_analytics_unique_name_idx;
DROP INDEX IF EXISTS storage.bucketid_objname;
DROP INDEX IF EXISTS storage.bname;
DROP INDEX IF EXISTS realtime.subscription_subscription_id_entity_filters_key;
DROP INDEX IF EXISTS realtime.messages_inserted_at_topic_index;
DROP INDEX IF EXISTS realtime.ix_realtime_subscription_entity;
DROP INDEX IF EXISTS public.zones_lounge_id_idx;
DROP INDEX IF EXISTS public.sync_backlog_lounge_id_status_created_at_idx;
DROP INDEX IF EXISTS public.sync_backlog_device_id_status_idx;
DROP INDEX IF EXISTS public.stations_lounge_id_idx;
DROP INDEX IF EXISTS public.session_notes_session_id_idx;
DROP INDEX IF EXISTS public.session_notes_note_type_created_at_idx;
DROP INDEX IF EXISTS public.seats_table_id_key;
DROP INDEX IF EXISTS public.seats_lounge_id_zone_id_idx;
DROP INDEX IF EXISTS public.pricing_rules_lounge_id_is_active_effective_at_idx;
DROP INDEX IF EXISTS public.preorders_session_id_key;
DROP INDEX IF EXISTS public.preorders_qr_code_key;
DROP INDEX IF EXISTS public.preorders_lounge_id_status_idx;
DROP INDEX IF EXISTS public.orders_status_created_at_idx;
DROP INDEX IF EXISTS public.orders_session_id_idx;
DROP INDEX IF EXISTS public.order_items_order_id_idx;
DROP INDEX IF EXISTS public.order_events_order_id_created_at_idx;
DROP INDEX IF EXISTS public.mix_templates_lounge_id_idx;
DROP INDEX IF EXISTS public.loyalty_profiles_lounge_id_idx;
DROP INDEX IF EXISTS public.loyalty_profiles_lounge_id_guest_key_key;
DROP INDEX IF EXISTS public.loyalty_note_bindings_loyalty_profile_id_session_note_id_key;
DROP INDEX IF EXISTS public.lounge_configs_lounge_id_version_idx;
DROP INDEX IF EXISTS public.lounge_configs_lounge_id_key;
DROP INDEX IF EXISTS public.idx_tenants_name;
DROP INDEX IF EXISTS public.idx_tenants_created_at;
DROP INDEX IF EXISTS public.idx_taxonomy_unknown_type;
DROP INDEX IF EXISTS public.idx_taxonomy_unknown_last_seen;
DROP INDEX IF EXISTS public.idx_taxonomy_unknown_count;
DROP INDEX IF EXISTS public.idx_sessions_created_by;
DROP INDEX IF EXISTS public.idx_session_timer_status;
DROP INDEX IF EXISTS public.idx_session_tenant_state;
DROP INDEX IF EXISTS public.idx_session_tenant_id;
DROP INDEX IF EXISTS public.idx_session_tenant_created;
DROP INDEX IF EXISTS public.idx_session_table_id;
DROP INDEX IF EXISTS public.idx_session_table;
DROP INDEX IF EXISTS public.idx_session_state_v1_notnull;
DROP INDEX IF EXISTS public.idx_session_state_v1;
DROP INDEX IF EXISTS public.idx_session_state;
DROP INDEX IF EXISTS public.idx_session_started_at;
DROP INDEX IF EXISTS public.idx_session_payment_status;
DROP INDEX IF EXISTS public.idx_session_paused;
DROP INDEX IF EXISTS public.idx_session_lounge_id;
DROP INDEX IF EXISTS public.idx_session_external_ref;
DROP INDEX IF EXISTS public.idx_session_customer_ref;
DROP INDEX IF EXISTS public.idx_session_created_at_state_duration;
DROP INDEX IF EXISTS public.idx_session_created_at_state;
DROP INDEX IF EXISTS public.idx_session_created_at_source;
DROP INDEX IF EXISTS public.idx_session_created_at_payment_status;
DROP INDEX IF EXISTS public.idx_session_created_at_lounge_payment;
DROP INDEX IF EXISTS public.idx_session_created_at;
DROP INDEX IF EXISTS public.idx_reflex_events_type_createdat;
DROP INDEX IF EXISTS public.idx_reflex_events_type;
DROP INDEX IF EXISTS public.idx_reflex_events_trusteventtypev1;
DROP INDEX IF EXISTS public.idx_reflex_events_tenant_id;
DROP INDEX IF EXISTS public.idx_reflex_events_sessionid;
DROP INDEX IF EXISTS public.idx_reflex_events_session;
DROP INDEX IF EXISTS public.idx_reflex_events_payloadhash;
DROP INDEX IF EXISTS public.idx_reflex_events_ctatype;
DROP INDEX IF EXISTS public.idx_reflex_events_ctasource;
DROP INDEX IF EXISTS public.idx_reflex_events_created;
DROP INDEX IF EXISTS public.idx_reflex_events_campaignid;
DROP INDEX IF EXISTS public.idx_reflex_event_trust_type_v1_notnull;
DROP INDEX IF EXISTS public.idx_reflex_event_trust_type_v1;
DROP INDEX IF EXISTS public.idx_reflex_event_created_at_type;
DROP INDEX IF EXISTS public.idx_reflex_event_created_at_refill_types;
DROP INDEX IF EXISTS public.idx_pricing_rules_type;
DROP INDEX IF EXISTS public.idx_pricing_rules_lounge_active;
DROP INDEX IF EXISTS public.idx_payments_tenant_id;
DROP INDEX IF EXISTS public.idx_payments_stripe_charge_id;
DROP INDEX IF EXISTS public.idx_payments_status;
DROP INDEX IF EXISTS public.idx_payments_session_id;
DROP INDEX IF EXISTS public.idx_payments_paid_at;
DROP INDEX IF EXISTS public.idx_payments_created_at;
DROP INDEX IF EXISTS public.idx_orders_status;
DROP INDEX IF EXISTS public.idx_orders_session;
DROP INDEX IF EXISTS public.idx_orders_created;
DROP INDEX IF EXISTS public.idx_menu_files_uploaded_at;
DROP INDEX IF EXISTS public.idx_menu_files_tenant_id;
DROP INDEX IF EXISTS public.idx_menu_files_status;
DROP INDEX IF EXISTS public.idx_menu_files_lead_id;
DROP INDEX IF EXISTS public.idx_memberships_user_tenant;
DROP INDEX IF EXISTS public.idx_memberships_user_id;
DROP INDEX IF EXISTS public.idx_memberships_tenant_id;
DROP INDEX IF EXISTS public.idx_memberships_role;
DROP INDEX IF EXISTS public.idx_drift_event_session;
DROP INDEX IF EXISTS public.idx_drift_event_reason_v1_notnull;
DROP INDEX IF EXISTS public.idx_drift_event_reason_v1;
DROP INDEX IF EXISTS public.idx_drift_event_created;
DROP INDEX IF EXISTS public.idx_award_badge_id;
DROP INDEX IF EXISTS public.flavors_lounge_id_idx;
DROP INDEX IF EXISTS public.deliveries_session_id_idx;
DROP INDEX IF EXISTS public.deliveries_order_id_key;
DROP INDEX IF EXISTS public.deliveries_delivered_by_delivered_at_idx;
DROP INDEX IF EXISTS public.audit_logs_user_id_created_at_idx;
DROP INDEX IF EXISTS public.audit_logs_lounge_id_created_at_idx;
DROP INDEX IF EXISTS public."Session_zone_id_idx";
DROP INDEX IF EXISTS public."Session_seat_id_idx";
DROP INDEX IF EXISTS public."Session_preorder_id_idx";
DROP INDEX IF EXISTS public."Session_lounge_config_version_idx";
DROP INDEX IF EXISTS public."Session_loungeId_state_idx";
DROP INDEX IF EXISTS public."Session_loungeId_externalRef_key";
DROP INDEX IF EXISTS public."SessionEvent_sessionId_idx";
DROP INDEX IF EXISTS auth.users_is_anonymous_idx;
DROP INDEX IF EXISTS auth.users_instance_id_idx;
DROP INDEX IF EXISTS auth.users_instance_id_email_idx;
DROP INDEX IF EXISTS auth.users_email_partial_key;
DROP INDEX IF EXISTS auth.user_id_created_at_idx;
DROP INDEX IF EXISTS auth.unique_phone_factor_per_user;
DROP INDEX IF EXISTS auth.sso_providers_resource_id_pattern_idx;
DROP INDEX IF EXISTS auth.sso_providers_resource_id_idx;
DROP INDEX IF EXISTS auth.sso_domains_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.sso_domains_domain_idx;
DROP INDEX IF EXISTS auth.sessions_user_id_idx;
DROP INDEX IF EXISTS auth.sessions_oauth_client_id_idx;
DROP INDEX IF EXISTS auth.sessions_not_after_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_for_email_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_created_at_idx;
DROP INDEX IF EXISTS auth.saml_providers_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_updated_at_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_session_id_revoked_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_parent_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_user_id_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_idx;
DROP INDEX IF EXISTS auth.recovery_token_idx;
DROP INDEX IF EXISTS auth.reauthentication_token_idx;
DROP INDEX IF EXISTS auth.one_time_tokens_user_id_token_type_key;
DROP INDEX IF EXISTS auth.one_time_tokens_token_hash_hash_idx;
DROP INDEX IF EXISTS auth.one_time_tokens_relates_to_hash_idx;
DROP INDEX IF EXISTS auth.oauth_consents_user_order_idx;
DROP INDEX IF EXISTS auth.oauth_consents_active_user_client_idx;
DROP INDEX IF EXISTS auth.oauth_consents_active_client_idx;
DROP INDEX IF EXISTS auth.oauth_clients_deleted_at_idx;
DROP INDEX IF EXISTS auth.oauth_auth_pending_exp_idx;
DROP INDEX IF EXISTS auth.mfa_factors_user_id_idx;
DROP INDEX IF EXISTS auth.mfa_factors_user_friendly_name_unique;
DROP INDEX IF EXISTS auth.mfa_challenge_created_at_idx;
DROP INDEX IF EXISTS auth.idx_user_id_auth_method;
DROP INDEX IF EXISTS auth.idx_oauth_client_states_created_at;
DROP INDEX IF EXISTS auth.idx_auth_code;
DROP INDEX IF EXISTS auth.identities_user_id_idx;
DROP INDEX IF EXISTS auth.identities_email_idx;
DROP INDEX IF EXISTS auth.flow_state_created_at_idx;
DROP INDEX IF EXISTS auth.factor_id_created_at_idx;
DROP INDEX IF EXISTS auth.email_change_token_new_idx;
DROP INDEX IF EXISTS auth.email_change_token_current_idx;
DROP INDEX IF EXISTS auth.confirmation_token_idx;
DROP INDEX IF EXISTS auth.audit_logs_instance_id_idx;
ALTER TABLE IF EXISTS ONLY supabase_migrations.seed_files DROP CONSTRAINT IF EXISTS seed_files_pkey;
ALTER TABLE IF EXISTS ONLY supabase_migrations.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY supabase_functions.migrations DROP CONSTRAINT IF EXISTS migrations_pkey;
ALTER TABLE IF EXISTS ONLY supabase_functions.hooks DROP CONSTRAINT IF EXISTS hooks_pkey;
ALTER TABLE IF EXISTS ONLY storage.vector_indexes DROP CONSTRAINT IF EXISTS vector_indexes_pkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads DROP CONSTRAINT IF EXISTS s3_multipart_uploads_pkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_pkey;
ALTER TABLE IF EXISTS ONLY storage.prefixes DROP CONSTRAINT IF EXISTS prefixes_pkey;
ALTER TABLE IF EXISTS ONLY storage.objects DROP CONSTRAINT IF EXISTS objects_pkey;
ALTER TABLE IF EXISTS ONLY storage.migrations DROP CONSTRAINT IF EXISTS migrations_pkey;
ALTER TABLE IF EXISTS ONLY storage.migrations DROP CONSTRAINT IF EXISTS migrations_name_key;
ALTER TABLE IF EXISTS ONLY storage.buckets_vectors DROP CONSTRAINT IF EXISTS buckets_vectors_pkey;
ALTER TABLE IF EXISTS ONLY storage.buckets DROP CONSTRAINT IF EXISTS buckets_pkey;
ALTER TABLE IF EXISTS ONLY storage.buckets_analytics DROP CONSTRAINT IF EXISTS buckets_analytics_pkey;
ALTER TABLE IF EXISTS ONLY realtime.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY realtime.subscription DROP CONSTRAINT IF EXISTS pk_subscription;
ALTER TABLE IF EXISTS ONLY realtime.messages DROP CONSTRAINT IF EXISTS messages_pkey;
ALTER TABLE IF EXISTS ONLY public.zones DROP CONSTRAINT IF EXISTS zones_pkey;
ALTER TABLE IF EXISTS ONLY public.venues DROP CONSTRAINT IF EXISTS venues_pkey;
ALTER TABLE IF EXISTS ONLY public.tenants DROP CONSTRAINT IF EXISTS tenants_pkey;
ALTER TABLE IF EXISTS ONLY public.sync_backlog DROP CONSTRAINT IF EXISTS sync_backlog_pkey;
ALTER TABLE IF EXISTS ONLY public.stripe_webhook_events DROP CONSTRAINT IF EXISTS stripe_webhook_events_pkey;
ALTER TABLE IF EXISTS ONLY public.stations DROP CONSTRAINT IF EXISTS stations_pkey;
ALTER TABLE IF EXISTS ONLY public.staff DROP CONSTRAINT IF EXISTS staff_pkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.session_notes DROP CONSTRAINT IF EXISTS session_notes_pkey;
ALTER TABLE IF EXISTS ONLY public.seats DROP CONSTRAINT IF EXISTS seats_pkey;
ALTER TABLE IF EXISTS ONLY public.reservations DROP CONSTRAINT IF EXISTS reservations_pkey;
ALTER TABLE IF EXISTS ONLY public.reflex_events DROP CONSTRAINT IF EXISTS reflex_events_pkey;
ALTER TABLE IF EXISTS ONLY public.refills DROP CONSTRAINT IF EXISTS refills_pkey;
ALTER TABLE IF EXISTS ONLY public.pricing_rules DROP CONSTRAINT IF EXISTS pricing_rules_pkey;
ALTER TABLE IF EXISTS ONLY public.preorders DROP CONSTRAINT IF EXISTS preorders_pkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_stripe_charge_id_key;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.order_events DROP CONSTRAINT IF EXISTS order_events_pkey;
ALTER TABLE IF EXISTS ONLY public.mix_templates DROP CONSTRAINT IF EXISTS mix_templates_pkey;
ALTER TABLE IF EXISTS ONLY public.menu_files DROP CONSTRAINT IF EXISTS menu_files_pkey;
ALTER TABLE IF EXISTS ONLY public.memberships DROP CONSTRAINT IF EXISTS memberships_pkey;
ALTER TABLE IF EXISTS ONLY public.loyalty_profiles DROP CONSTRAINT IF EXISTS loyalty_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.loyalty_note_bindings DROP CONSTRAINT IF EXISTS loyalty_note_bindings_pkey;
ALTER TABLE IF EXISTS ONLY public.lounge_configs DROP CONSTRAINT IF EXISTS lounge_configs_pkey;
ALTER TABLE IF EXISTS ONLY public.ghostlog DROP CONSTRAINT IF EXISTS ghostlog_pkey;
ALTER TABLE IF EXISTS ONLY public.flavors DROP CONSTRAINT IF EXISTS flavors_pkey;
ALTER TABLE IF EXISTS ONLY public.deliveries DROP CONSTRAINT IF EXISTS deliveries_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public."TaxonomyUnknown" DROP CONSTRAINT IF EXISTS "TaxonomyUnknown_pkey";
ALTER TABLE IF EXISTS ONLY public."TaxonomyUnknown" DROP CONSTRAINT IF EXISTS "TaxonomyUnknown_enum_type_raw_label_key";
ALTER TABLE IF EXISTS ONLY public."Session" DROP CONSTRAINT IF EXISTS "Session_pkey";
ALTER TABLE IF EXISTS ONLY public."SessionEvent" DROP CONSTRAINT IF EXISTS "SessionEvent_pkey";
ALTER TABLE IF EXISTS ONLY public."Event" DROP CONSTRAINT IF EXISTS "Event_pkey";
ALTER TABLE IF EXISTS ONLY public."DriftEvent" DROP CONSTRAINT IF EXISTS "DriftEvent_pkey";
ALTER TABLE IF EXISTS ONLY public."Badge" DROP CONSTRAINT IF EXISTS "Badge_pkey";
ALTER TABLE IF EXISTS ONLY public."Award" DROP CONSTRAINT IF EXISTS "Award_pkey";
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_phone_key;
ALTER TABLE IF EXISTS ONLY auth.sso_providers DROP CONSTRAINT IF EXISTS sso_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.sso_domains DROP CONSTRAINT IF EXISTS sso_domains_pkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY auth.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_entity_id_key;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_token_unique;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_pkey;
ALTER TABLE IF EXISTS ONLY auth.one_time_tokens DROP CONSTRAINT IF EXISTS one_time_tokens_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_user_client_unique;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_clients DROP CONSTRAINT IF EXISTS oauth_clients_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_client_states DROP CONSTRAINT IF EXISTS oauth_client_states_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_authorization_id_key;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_authorization_code_key;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_last_challenged_at_key;
ALTER TABLE IF EXISTS ONLY auth.mfa_challenges DROP CONSTRAINT IF EXISTS mfa_challenges_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS mfa_amr_claims_session_id_authentication_method_pkey;
ALTER TABLE IF EXISTS ONLY auth.instances DROP CONSTRAINT IF EXISTS instances_pkey;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_provider_id_provider_unique;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_pkey;
ALTER TABLE IF EXISTS ONLY auth.flow_state DROP CONSTRAINT IF EXISTS flow_state_pkey;
ALTER TABLE IF EXISTS ONLY auth.audit_log_entries DROP CONSTRAINT IF EXISTS audit_log_entries_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS amr_id_pk;
ALTER TABLE IF EXISTS supabase_functions.hooks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.ghostlog ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS auth.refresh_tokens ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS supabase_migrations.seed_files;
DROP TABLE IF EXISTS supabase_migrations.schema_migrations;
DROP TABLE IF EXISTS supabase_functions.migrations;
DROP SEQUENCE IF EXISTS supabase_functions.hooks_id_seq;
DROP TABLE IF EXISTS supabase_functions.hooks;
DROP TABLE IF EXISTS storage.vector_indexes;
DROP TABLE IF EXISTS storage.s3_multipart_uploads_parts;
DROP TABLE IF EXISTS storage.s3_multipart_uploads;
DROP TABLE IF EXISTS storage.prefixes;
DROP TABLE IF EXISTS storage.objects;
DROP TABLE IF EXISTS storage.migrations;
DROP TABLE IF EXISTS storage.buckets_vectors;
DROP TABLE IF EXISTS storage.buckets_analytics;
DROP TABLE IF EXISTS storage.buckets;
DROP TABLE IF EXISTS realtime.subscription;
DROP TABLE IF EXISTS realtime.schema_migrations;
DROP TABLE IF EXISTS realtime.messages;
DROP TABLE IF EXISTS public.zones;
DROP TABLE IF EXISTS public.venues;
DROP TABLE IF EXISTS public.tenants;
DROP TABLE IF EXISTS public.sync_backlog;
DROP TABLE IF EXISTS public.stripe_webhook_events;
DROP TABLE IF EXISTS public.stations;
DROP TABLE IF EXISTS public.staff;
DROP TABLE IF EXISTS public.sessions;
DROP TABLE IF EXISTS public.session_notes;
DROP TABLE IF EXISTS public.seats;
DROP TABLE IF EXISTS public.reservations;
DROP TABLE IF EXISTS public.reflex_events;
DROP TABLE IF EXISTS public.refills;
DROP TABLE IF EXISTS public.pricing_rules;
DROP TABLE IF EXISTS public.preorders;
DROP TABLE IF EXISTS public.payments;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.order_items;
DROP TABLE IF EXISTS public.order_events;
DROP TABLE IF EXISTS public.mix_templates;
DROP TABLE IF EXISTS public.menu_files;
DROP TABLE IF EXISTS public.memberships;
DROP TABLE IF EXISTS public.loyalty_profiles;
DROP TABLE IF EXISTS public.loyalty_note_bindings;
DROP TABLE IF EXISTS public.lounge_configs;
DROP SEQUENCE IF EXISTS public.ghostlog_id_seq;
DROP TABLE IF EXISTS public.ghostlog;
DROP TABLE IF EXISTS public.flavors;
DROP TABLE IF EXISTS public.deliveries;
DROP TABLE IF EXISTS public.audit_logs;
DROP TABLE IF EXISTS public."TaxonomyUnknown";
DROP TABLE IF EXISTS public."SessionEvent";
DROP TABLE IF EXISTS public."Session";
DROP TABLE IF EXISTS public."Event";
DROP TABLE IF EXISTS public."DriftEvent";
DROP TABLE IF EXISTS public."Badge";
DROP TABLE IF EXISTS public."Award";
DROP TABLE IF EXISTS auth.users;
DROP TABLE IF EXISTS auth.sso_providers;
DROP TABLE IF EXISTS auth.sso_domains;
DROP TABLE IF EXISTS auth.sessions;
DROP TABLE IF EXISTS auth.schema_migrations;
DROP TABLE IF EXISTS auth.saml_relay_states;
DROP TABLE IF EXISTS auth.saml_providers;
DROP SEQUENCE IF EXISTS auth.refresh_tokens_id_seq;
DROP TABLE IF EXISTS auth.refresh_tokens;
DROP TABLE IF EXISTS auth.one_time_tokens;
DROP TABLE IF EXISTS auth.oauth_consents;
DROP TABLE IF EXISTS auth.oauth_clients;
DROP TABLE IF EXISTS auth.oauth_client_states;
DROP TABLE IF EXISTS auth.oauth_authorizations;
DROP TABLE IF EXISTS auth.mfa_factors;
DROP TABLE IF EXISTS auth.mfa_challenges;
DROP TABLE IF EXISTS auth.mfa_amr_claims;
DROP TABLE IF EXISTS auth.instances;
DROP TABLE IF EXISTS auth.identities;
DROP TABLE IF EXISTS auth.flow_state;
DROP TABLE IF EXISTS auth.audit_log_entries;
DROP FUNCTION IF EXISTS supabase_functions.http_request();
DROP FUNCTION IF EXISTS storage.update_updated_at_column();
DROP FUNCTION IF EXISTS storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text);
DROP FUNCTION IF EXISTS storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION IF EXISTS storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION IF EXISTS storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION IF EXISTS storage.prefixes_insert_trigger();
DROP FUNCTION IF EXISTS storage.prefixes_delete_cleanup();
DROP FUNCTION IF EXISTS storage.operation();
DROP FUNCTION IF EXISTS storage.objects_update_prefix_trigger();
DROP FUNCTION IF EXISTS storage.objects_update_level_trigger();
DROP FUNCTION IF EXISTS storage.objects_update_cleanup();
DROP FUNCTION IF EXISTS storage.objects_insert_prefix_trigger();
DROP FUNCTION IF EXISTS storage.objects_delete_cleanup();
DROP FUNCTION IF EXISTS storage.lock_top_prefixes(bucket_ids text[], names text[]);
DROP FUNCTION IF EXISTS storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text);
DROP FUNCTION IF EXISTS storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text);
DROP FUNCTION IF EXISTS storage.get_size_by_bucket();
DROP FUNCTION IF EXISTS storage.get_prefixes(name text);
DROP FUNCTION IF EXISTS storage.get_prefix(name text);
DROP FUNCTION IF EXISTS storage.get_level(name text);
DROP FUNCTION IF EXISTS storage.foldername(name text);
DROP FUNCTION IF EXISTS storage.filename(name text);
DROP FUNCTION IF EXISTS storage.extension(name text);
DROP FUNCTION IF EXISTS storage.enforce_bucket_name_length();
DROP FUNCTION IF EXISTS storage.delete_prefix_hierarchy_trigger();
DROP FUNCTION IF EXISTS storage.delete_prefix(_bucket_id text, _name text);
DROP FUNCTION IF EXISTS storage.delete_leaf_prefixes(bucket_ids text[], names text[]);
DROP FUNCTION IF EXISTS storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb);
DROP FUNCTION IF EXISTS storage.add_prefixes(_bucket_id text, _name text);
DROP FUNCTION IF EXISTS realtime.topic();
DROP FUNCTION IF EXISTS realtime.to_regrole(role_name text);
DROP FUNCTION IF EXISTS realtime.subscription_check_filters();
DROP FUNCTION IF EXISTS realtime.send(payload jsonb, event text, topic text, private boolean);
DROP FUNCTION IF EXISTS realtime.quote_wal2json(entity regclass);
DROP FUNCTION IF EXISTS realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer);
DROP FUNCTION IF EXISTS realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]);
DROP FUNCTION IF EXISTS realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text);
DROP FUNCTION IF EXISTS realtime."cast"(val text, type_ regtype);
DROP FUNCTION IF EXISTS realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]);
DROP FUNCTION IF EXISTS realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text);
DROP FUNCTION IF EXISTS realtime.apply_rls(wal jsonb, max_record_bytes integer);
DROP FUNCTION IF EXISTS public.taxonomy_unknown_upsert(p_enum_type text, p_raw_label text, p_example_event_id text, p_example_payload jsonb);
DROP FUNCTION IF EXISTS public.get_jwt_claims();
DROP FUNCTION IF EXISTS public.get_current_user_id();
DROP FUNCTION IF EXISTS public.get_current_tenant_id();
DROP FUNCTION IF EXISTS public.get_current_role();
DROP FUNCTION IF EXISTS pgbouncer.get_auth(p_usename text);
DROP FUNCTION IF EXISTS extensions.set_graphql_placeholder();
DROP FUNCTION IF EXISTS extensions.pgrst_drop_watch();
DROP FUNCTION IF EXISTS extensions.pgrst_ddl_watch();
DROP FUNCTION IF EXISTS extensions.grant_pg_net_access();
DROP FUNCTION IF EXISTS extensions.grant_pg_graphql_access();
DROP FUNCTION IF EXISTS extensions.grant_pg_cron_access();
DROP FUNCTION IF EXISTS auth.uid();
DROP FUNCTION IF EXISTS auth.role();
DROP FUNCTION IF EXISTS auth.jwt();
DROP FUNCTION IF EXISTS auth.email();
DROP TYPE IF EXISTS storage.buckettype;
DROP TYPE IF EXISTS realtime.wal_rls;
DROP TYPE IF EXISTS realtime.wal_column;
DROP TYPE IF EXISTS realtime.user_defined_filter;
DROP TYPE IF EXISTS realtime.equality_op;
DROP TYPE IF EXISTS realtime.action;
DROP TYPE IF EXISTS public.session_status;
DROP TYPE IF EXISTS public.role;
DROP TYPE IF EXISTS public.reservation_status;
DROP TYPE IF EXISTS public."SessionState";
DROP TYPE IF EXISTS public."SessionSource";
DROP TYPE IF EXISTS auth.one_time_token_type;
DROP TYPE IF EXISTS auth.oauth_response_type;
DROP TYPE IF EXISTS auth.oauth_registration_type;
DROP TYPE IF EXISTS auth.oauth_client_type;
DROP TYPE IF EXISTS auth.oauth_authorization_status;
DROP TYPE IF EXISTS auth.factor_type;
DROP TYPE IF EXISTS auth.factor_status;
DROP TYPE IF EXISTS auth.code_challenge_method;
DROP TYPE IF EXISTS auth.aal_level;
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS supabase_vault;
DROP EXTENSION IF EXISTS pgcrypto;
DROP EXTENSION IF EXISTS pg_stat_statements;
DROP EXTENSION IF EXISTS pg_graphql;
DROP SCHEMA IF EXISTS vault;
DROP SCHEMA IF EXISTS supabase_migrations;
DROP SCHEMA IF EXISTS supabase_functions;
DROP SCHEMA IF EXISTS storage;
DROP SCHEMA IF EXISTS realtime;
DROP SCHEMA IF EXISTS pgbouncer;
DROP EXTENSION IF EXISTS pg_net;
DROP SCHEMA IF EXISTS graphql_public;
DROP SCHEMA IF EXISTS graphql;
DROP SCHEMA IF EXISTS extensions;
DROP SCHEMA IF EXISTS auth;
--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_net; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_net IS 'Async HTTP';


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: supabase_functions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_functions;


--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_migrations;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: SessionSource; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SessionSource" AS ENUM (
    'QR',
    'RESERVE',
    'WALK_IN',
    'LEGACY_POS'
);


--
-- Name: SessionState; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SessionState" AS ENUM (
    'PENDING',
    'ACTIVE',
    'PAUSED',
    'CLOSED',
    'CANCELED'
);


--
-- Name: reservation_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.reservation_status AS ENUM (
    'HOLD',
    'ARRIVED',
    'NO_SHOW',
    'CANCELLED'
);


--
-- Name: role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.role AS ENUM (
    'owner',
    'admin',
    'staff',
    'viewer'
);


--
-- Name: TYPE role; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TYPE public.role IS 'User roles: owner (full control), admin (management), staff (operations), viewer (read-only)';


--
-- Name: session_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.session_status AS ENUM (
    'PENDING',
    'ACTIVE',
    'PAUSED',
    'COMPLETE',
    'STAFF_HOLD',
    'STOCK_BLOCKED'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM pg_event_trigger_ddl_commands() AS ev
      JOIN pg_extension AS ext
      ON ev.objid = ext.oid
      WHERE ext.extname = 'pg_net'
    )
    THEN
      GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

      IF EXISTS (
        SELECT FROM pg_extension
        WHERE extname = 'pg_net'
        -- all versions in use on existing projects as of 2025-02-20
        -- version 0.12.0 onwards don't need these applied
        AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
      ) THEN
        ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
        ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

        ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
        ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

        REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
        REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

        GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
        GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      END IF;
    END IF;
  END;
  $$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


--
-- Name: get_current_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_current_role() RETURNS text
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  SELECT auth.jwt() ->> 'role'
$$;


--
-- Name: FUNCTION get_current_role(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_current_role() IS 'Get current user role for active tenant from JWT claims';


--
-- Name: get_current_tenant_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_current_tenant_id() RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  SELECT ((auth.jwt() ->> 'tenant_id')::uuid)
$$;


--
-- Name: FUNCTION get_current_tenant_id(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_current_tenant_id() IS 'Get current active tenant ID from JWT claims';


--
-- Name: get_current_user_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_current_user_id() RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  SELECT (SELECT auth.uid())
$$;


--
-- Name: FUNCTION get_current_user_id(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_current_user_id() IS 'Get current authenticated user ID (wrapper for auth.uid())';


--
-- Name: get_jwt_claims(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_jwt_claims() RETURNS jsonb
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  SELECT coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb,
    '{}'::jsonb
  )
$$;


--
-- Name: FUNCTION get_jwt_claims(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_jwt_claims() IS 'Safely read JWT claims from request context (wrapper for auth.jwt())';


--
-- Name: taxonomy_unknown_upsert(text, text, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.taxonomy_unknown_upsert(p_enum_type text, p_raw_label text, p_example_event_id text DEFAULT NULL::text, p_example_payload jsonb DEFAULT NULL::jsonb) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  INSERT INTO public."TaxonomyUnknown" (enum_type, raw_label, example_event_id, example_payload)
  VALUES (p_enum_type, p_raw_label, p_example_event_id, p_example_payload)
  ON CONFLICT (enum_type, raw_label) DO UPDATE
  SET
    count = public."TaxonomyUnknown".count + 1,
    last_seen = NOW(),
    updated_at = NOW(),
    example_event_id = COALESCE(public."TaxonomyUnknown".example_event_id, EXCLUDED.example_event_id),
    example_payload = COALESCE(public."TaxonomyUnknown".example_payload, EXCLUDED.example_payload);
END;
$$;


--
-- Name: FUNCTION taxonomy_unknown_upsert(p_enum_type text, p_raw_label text, p_example_event_id text, p_example_payload jsonb); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.taxonomy_unknown_upsert(p_enum_type text, p_raw_label text, p_example_event_id text, p_example_payload jsonb) IS 'Securely upserts unknown taxonomy values. Uses SET search_path = '' to prevent search_path injection attacks.';


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: delete_leaf_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


--
-- Name: lock_top_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket text;
    v_top text;
BEGIN
    FOR v_bucket, v_top IN
        SELECT DISTINCT t.bucket_id,
            split_part(t.name, '/', 1) AS top
        FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        WHERE t.name <> ''
        ORDER BY 1, 2
        LOOP
            PERFORM pg_advisory_xact_lock(hashtextextended(v_bucket || '/' || v_top, 0));
        END LOOP;
END;
$$;


--
-- Name: objects_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: objects_update_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    -- NEW - OLD (destinations to create prefixes for)
    v_add_bucket_ids text[];
    v_add_names      text[];

    -- OLD - NEW (sources to prune)
    v_src_bucket_ids text[];
    v_src_names      text[];
BEGIN
    IF TG_OP <> 'UPDATE' THEN
        RETURN NULL;
    END IF;

    -- 1) Compute NEW−OLD (added paths) and OLD−NEW (moved-away paths)
    WITH added AS (
        SELECT n.bucket_id, n.name
        FROM new_rows n
        WHERE n.name <> '' AND position('/' in n.name) > 0
        EXCEPT
        SELECT o.bucket_id, o.name FROM old_rows o WHERE o.name <> ''
    ),
    moved AS (
         SELECT o.bucket_id, o.name
         FROM old_rows o
         WHERE o.name <> ''
         EXCEPT
         SELECT n.bucket_id, n.name FROM new_rows n WHERE n.name <> ''
    )
    SELECT
        -- arrays for ADDED (dest) in stable order
        COALESCE( (SELECT array_agg(a.bucket_id ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        COALESCE( (SELECT array_agg(a.name      ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        -- arrays for MOVED (src) in stable order
        COALESCE( (SELECT array_agg(m.bucket_id ORDER BY m.bucket_id, m.name) FROM moved m), '{}' ),
        COALESCE( (SELECT array_agg(m.name      ORDER BY m.bucket_id, m.name) FROM moved m), '{}' )
    INTO v_add_bucket_ids, v_add_names, v_src_bucket_ids, v_src_names;

    -- Nothing to do?
    IF (array_length(v_add_bucket_ids, 1) IS NULL) AND (array_length(v_src_bucket_ids, 1) IS NULL) THEN
        RETURN NULL;
    END IF;

    -- 2) Take per-(bucket, top) locks: ALL prefixes in consistent global order to prevent deadlocks
    DECLARE
        v_all_bucket_ids text[];
        v_all_names text[];
    BEGIN
        -- Combine source and destination arrays for consistent lock ordering
        v_all_bucket_ids := COALESCE(v_src_bucket_ids, '{}') || COALESCE(v_add_bucket_ids, '{}');
        v_all_names := COALESCE(v_src_names, '{}') || COALESCE(v_add_names, '{}');

        -- Single lock call ensures consistent global ordering across all transactions
        IF array_length(v_all_bucket_ids, 1) IS NOT NULL THEN
            PERFORM storage.lock_top_prefixes(v_all_bucket_ids, v_all_names);
        END IF;
    END;

    -- 3) Create destination prefixes (NEW−OLD) BEFORE pruning sources
    IF array_length(v_add_bucket_ids, 1) IS NOT NULL THEN
        WITH candidates AS (
            SELECT DISTINCT t.bucket_id, unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(v_add_bucket_ids, v_add_names) AS t(bucket_id, name)
            WHERE name <> ''
        )
        INSERT INTO storage.prefixes (bucket_id, name)
        SELECT c.bucket_id, c.name
        FROM candidates c
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4) Prune source prefixes bottom-up for OLD−NEW
    IF array_length(v_src_bucket_ids, 1) IS NOT NULL THEN
        -- re-entrancy guard so DELETE on prefixes won't recurse
        IF current_setting('storage.gc.prefixes', true) <> '1' THEN
            PERFORM set_config('storage.gc.prefixes', '1', true);
        END IF;

        PERFORM storage.delete_leaf_prefixes(v_src_bucket_ids, v_src_names);
    END IF;

    RETURN NULL;
END;
$$;


--
-- Name: objects_update_level_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_level_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Set the new level
        NEW."level" := "storage"."get_level"(NEW."name");
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: prefixes_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    sort_col text;
    sort_ord text;
    cursor_op text;
    cursor_expr text;
    sort_expr text;
BEGIN
    -- Validate sort_order
    sort_ord := lower(sort_order);
    IF sort_ord NOT IN ('asc', 'desc') THEN
        sort_ord := 'asc';
    END IF;

    -- Determine cursor comparison operator
    IF sort_ord = 'asc' THEN
        cursor_op := '>';
    ELSE
        cursor_op := '<';
    END IF;
    
    sort_col := lower(sort_column);
    -- Validate sort column  
    IF sort_col IN ('updated_at', 'created_at') THEN
        cursor_expr := format(
            '($5 = '''' OR ROW(date_trunc(''milliseconds'', %I), name COLLATE "C") %s ROW(COALESCE(NULLIF($6, '''')::timestamptz, ''epoch''::timestamptz), $5))',
            sort_col, cursor_op
        );
        sort_expr := format(
            'COALESCE(date_trunc(''milliseconds'', %I), ''epoch''::timestamptz) %s, name COLLATE "C" %s',
            sort_col, sort_ord, sort_ord
        );
    ELSE
        cursor_expr := format('($5 = '''' OR name COLLATE "C" %s $5)', cursor_op);
        sort_expr := format('name COLLATE "C" %s', sort_ord);
    END IF;

    RETURN QUERY EXECUTE format(
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    NULL::uuid AS id,
                    updated_at,
                    created_at,
                    NULL::timestamptz AS last_accessed_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
            UNION ALL
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    id,
                    updated_at,
                    created_at,
                    last_accessed_at,
                    metadata
                FROM storage.objects
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
        ) obj
        ORDER BY %s
        LIMIT $3
        $sql$,
        cursor_expr,    -- prefixes WHERE
        sort_expr,      -- prefixes ORDER BY
        cursor_expr,    -- objects WHERE
        sort_expr,      -- objects ORDER BY
        sort_expr       -- final ORDER BY
    )
    USING prefix, bucket_name, limits, levels, start_after, sort_column_after;
END;
$_$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


--
-- Name: http_request(); Type: FUNCTION; Schema: supabase_functions; Owner: -
--

CREATE FUNCTION supabase_functions.http_request() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'supabase_functions'
    AS $$
    DECLARE
      request_id bigint;
      payload jsonb;
      url text := TG_ARGV[0]::text;
      method text := TG_ARGV[1]::text;
      headers jsonb DEFAULT '{}'::jsonb;
      params jsonb DEFAULT '{}'::jsonb;
      timeout_ms integer DEFAULT 1000;
    BEGIN
      IF url IS NULL OR url = 'null' THEN
        RAISE EXCEPTION 'url argument is missing';
      END IF;

      IF method IS NULL OR method = 'null' THEN
        RAISE EXCEPTION 'method argument is missing';
      END IF;

      IF TG_ARGV[2] IS NULL OR TG_ARGV[2] = 'null' THEN
        headers = '{"Content-Type": "application/json"}'::jsonb;
      ELSE
        headers = TG_ARGV[2]::jsonb;
      END IF;

      IF TG_ARGV[3] IS NULL OR TG_ARGV[3] = 'null' THEN
        params = '{}'::jsonb;
      ELSE
        params = TG_ARGV[3]::jsonb;
      END IF;

      IF TG_ARGV[4] IS NULL OR TG_ARGV[4] = 'null' THEN
        timeout_ms = 1000;
      ELSE
        timeout_ms = TG_ARGV[4]::integer;
      END IF;

      CASE
        WHEN method = 'GET' THEN
          SELECT http_get INTO request_id FROM net.http_get(
            url,
            params,
            headers,
            timeout_ms
          );
        WHEN method = 'POST' THEN
          payload = jsonb_build_object(
            'old_record', OLD,
            'record', NEW,
            'type', TG_OP,
            'table', TG_TABLE_NAME,
            'schema', TG_TABLE_SCHEMA
          );

          SELECT http_post INTO request_id FROM net.http_post(
            url,
            payload,
            params,
            headers,
            timeout_ms
          );
        ELSE
          RAISE EXCEPTION 'method argument % is invalid', method;
      END CASE;

      INSERT INTO supabase_functions.hooks
        (hook_table_id, hook_name, request_id)
      VALUES
        (TG_RELID, TG_NAME, request_id);

      RETURN NEW;
    END
  $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: Award; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Award" (
    id text NOT NULL,
    "profileId" text NOT NULL,
    "badgeId" text NOT NULL,
    "venueId" text,
    progress integer DEFAULT 100 NOT NULL,
    "awardedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "awardedBy" text,
    revoked boolean DEFAULT false NOT NULL
);


--
-- Name: Badge; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Badge" (
    id text NOT NULL,
    label text NOT NULL,
    scope text NOT NULL,
    rule jsonb NOT NULL,
    active boolean DEFAULT true NOT NULL
);


--
-- Name: DriftEvent; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DriftEvent" (
    id text NOT NULL,
    session_id text,
    drift_reason_v1 text,
    severity text,
    details jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT "DriftEvent_severity_check" CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))),
    CONSTRAINT drift_reason_v1_chk CHECK (((drift_reason_v1 IS NULL) OR (drift_reason_v1 = ANY (ARRAY['slow_handoff'::text, 'long_dwell'::text, 'payment_retry'::text, 'missing_notes'::text, 'queue_backlog'::text, 'no_show'::text]))))
);


--
-- Name: COLUMN "DriftEvent".drift_reason_v1; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."DriftEvent".drift_reason_v1 IS 'Taxonomy v1: slow_handoff | long_dwell | payment_retry | missing_notes | queue_backlog | no_show';


--
-- Name: Event; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Event" (
    id text NOT NULL,
    ts timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    type text NOT NULL,
    "profileId" text NOT NULL,
    "venueId" text,
    "comboHash" text,
    "staffId" text
);


--
-- Name: Session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "externalRef" text,
    source public."SessionSource" NOT NULL,
    "trustSignature" text NOT NULL,
    state public."SessionState" DEFAULT 'PENDING'::public."SessionState" NOT NULL,
    "customerPhone" text,
    "flavorMix" jsonb,
    "loungeId" text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "tableId" text,
    "customerRef" text,
    flavor text,
    "priceCents" integer DEFAULT 3000,
    "edgeCase" text,
    "edgeNote" text,
    "assignedBOHId" text,
    "assignedFOHId" text,
    "startedAt" timestamp with time zone,
    "endedAt" timestamp with time zone,
    "durationSecs" integer,
    "paymentIntent" text,
    "paymentStatus" text,
    "orderItems" text,
    "posMode" text,
    "timerDuration" integer,
    "timerStartedAt" timestamp with time zone,
    "timerPausedAt" timestamp with time zone,
    "timerPausedDuration" integer,
    "timerStatus" text,
    zone text,
    "fohUserId" text,
    "specialRequests" text,
    "tableNotes" text,
    "qrCodeUrl" text,
    session_state_v1 text,
    paused boolean DEFAULT false,
    tenant_id uuid,
    preorder_id text,
    lounge_config_version integer,
    seat_id text,
    zone_id text,
    CONSTRAINT session_state_v1_chk CHECK (((session_state_v1 IS NULL) OR (session_state_v1 = ANY (ARRAY['queued'::text, 'prep'::text, 'handoff'::text, 'delivering'::text, 'delivered'::text, 'checkout'::text, 'closed'::text, 'canceled'::text]))))
);


--
-- Name: TABLE "Session"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public."Session" IS 'Session table with all required columns for Fire Session Dashboard';


--
-- Name: COLUMN "Session".session_state_v1; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."Session".session_state_v1 IS 'Taxonomy v1: queued | prep | handoff | delivering | delivered | checkout | closed | canceled';


--
-- Name: COLUMN "Session".paused; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."Session".paused IS 'PAUSED is a modifier flag, not a state. True when session is paused.';


--
-- Name: COLUMN "Session".tenant_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."Session".tenant_id IS 'Tenant/organization that owns this session';


--
-- Name: SessionEvent; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SessionEvent" (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    type text NOT NULL,
    "payloadSeal" text NOT NULL,
    data jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TaxonomyUnknown; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TaxonomyUnknown" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    enum_type text NOT NULL,
    raw_label text NOT NULL,
    suggested_mapping text,
    count integer DEFAULT 1,
    example_event_id text,
    example_payload jsonb,
    first_seen timestamp with time zone DEFAULT now(),
    last_seen timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT "TaxonomyUnknown_enum_type_check" CHECK ((enum_type = ANY (ARRAY['SessionState'::text, 'TrustEventType'::text, 'DriftReason'::text])))
);


--
-- Name: TABLE "TaxonomyUnknown"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public."TaxonomyUnknown" IS 'Tracks unknown enum values for taxonomy review and promotion';


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    lounge_id text,
    user_id text,
    action text NOT NULL,
    entity_type text,
    entity_id text,
    changes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: deliveries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deliveries (
    id text NOT NULL,
    session_id text NOT NULL,
    order_id text NOT NULL,
    delivered_by text NOT NULL,
    delivered_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text
);


--
-- Name: flavors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flavors (
    id text NOT NULL,
    lounge_id text,
    name text NOT NULL,
    description text,
    tags text,
    is_premium boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ghostlog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ghostlog (
    id bigint NOT NULL,
    venue_id uuid,
    session_id uuid,
    actor text,
    event text NOT NULL,
    meta jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: ghostlog_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ghostlog_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ghostlog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ghostlog_id_seq OWNED BY public.ghostlog.id;


--
-- Name: lounge_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lounge_configs (
    id text NOT NULL,
    lounge_id text NOT NULL,
    config_data text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    effective_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: loyalty_note_bindings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loyalty_note_bindings (
    id text NOT NULL,
    loyalty_profile_id text NOT NULL,
    session_note_id text NOT NULL
);


--
-- Name: loyalty_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loyalty_profiles (
    id text NOT NULL,
    lounge_id text NOT NULL,
    guest_key text NOT NULL,
    cumulative_spend integer DEFAULT 0 NOT NULL,
    visit_count integer DEFAULT 0 NOT NULL,
    last_visit_at timestamp(3) without time zone,
    preference_summary text,
    trust_score integer DEFAULT 50 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.memberships (
    user_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    role public.role DEFAULT 'viewer'::public.role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE memberships; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.memberships IS 'User-tenant relationships with role-based access control';


--
-- Name: COLUMN memberships.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.memberships.user_id IS 'References auth.users(id)';


--
-- Name: COLUMN memberships.tenant_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.memberships.tenant_id IS 'References public.tenants(id)';


--
-- Name: COLUMN memberships.role; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.memberships.role IS 'User role within this tenant';


--
-- Name: menu_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menu_files (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lead_id text,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_type text NOT NULL,
    file_size integer NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone,
    status text DEFAULT 'pending'::text NOT NULL,
    extracted_data jsonb,
    tenant_id uuid,
    deleted_at timestamp with time zone
);


--
-- Name: mix_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mix_templates (
    id text NOT NULL,
    lounge_id text NOT NULL,
    name text NOT NULL,
    flavor_ids text NOT NULL,
    price_cents integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: order_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_events (
    id text NOT NULL,
    order_id text NOT NULL,
    event_type text NOT NULL,
    staff_id text,
    metadata text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    order_id text NOT NULL,
    item_type text NOT NULL,
    item_id text,
    name text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    price_cents integer NOT NULL,
    metadata text
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id text NOT NULL,
    session_id text NOT NULL,
    type text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    price_snapshot text,
    special_instructions text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    served_at timestamp(3) without time zone
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    session_id text,
    stripe_charge_id text,
    amount_cents integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE payments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.payments IS 'Payment records for sessions (replaces legacy Session.paymentIntent)';


--
-- Name: COLUMN payments.tenant_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.payments.tenant_id IS 'Tenant/organization that owns this payment';


--
-- Name: COLUMN payments.session_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.payments.session_id IS 'Associated session (nullable for standalone payments)';


--
-- Name: COLUMN payments.stripe_charge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.payments.stripe_charge_id IS 'Stripe charge ID (unique)';


--
-- Name: COLUMN payments.amount_cents; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.payments.amount_cents IS 'Payment amount in cents';


--
-- Name: COLUMN payments.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.payments.status IS 'Payment status: pending, succeeded, failed, refunded';


--
-- Name: preorders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.preorders (
    id text NOT NULL,
    lounge_id text NOT NULL,
    guest_handle text,
    qr_code text,
    status text DEFAULT 'PENDING'::text NOT NULL,
    scheduled_time timestamp(3) without time zone,
    party_size integer NOT NULL,
    flavor_mix_json text,
    base_price integer NOT NULL,
    locked_price integer,
    metadata text,
    session_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    converted_at timestamp(3) without time zone,
    expires_at timestamp(3) without time zone
);


--
-- Name: pricing_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pricing_rules (
    id text NOT NULL,
    lounge_id text NOT NULL,
    rule_type text NOT NULL,
    rule_config text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    effective_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: refills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refills (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    venue_id uuid NOT NULL,
    requested_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone
);


--
-- Name: reflex_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reflex_events (
    id text NOT NULL,
    type text NOT NULL,
    source text DEFAULT 'ui'::text NOT NULL,
    "sessionId" text,
    "paymentIntent" text,
    payload text,
    "payloadHash" text,
    "userAgent" text,
    ip text,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "ctaSource" text,
    "ctaType" text,
    referrer text,
    "campaignId" text,
    metadata text,
    trust_event_type_v1 text,
    tenant_id uuid,
    "trustEventTypeV1" text,
    CONSTRAINT reflex_events_source_check CHECK ((source = ANY (ARRAY['ui'::text, 'server'::text, 'cron'::text, 'webhook'::text, 'backend'::text, 'agent'::text]))),
    CONSTRAINT trust_event_type_v1_chk CHECK (((trust_event_type_v1 IS NULL) OR (trust_event_type_v1 = ANY (ARRAY['on_time_delivery'::text, 'fav_used'::text, 'fast_checkout'::text, 'corrected_issue'::text, 'staff_greeting'::text, 'loyalty_redeemed'::text]))))
);


--
-- Name: TABLE reflex_events; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.reflex_events IS 'Tracks Reflex events including CTA clicks, onboarding signups, and other system events';


--
-- Name: COLUMN reflex_events.trust_event_type_v1; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reflex_events.trust_event_type_v1 IS 'Taxonomy v1: on_time_delivery | fav_used | fast_checkout | corrected_issue | staff_greeting | loyalty_redeemed';


--
-- Name: COLUMN reflex_events.tenant_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reflex_events.tenant_id IS 'Tenant/organization that owns this event';


--
-- Name: reservations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reservations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    venue_id uuid NOT NULL,
    table_id text NOT NULL,
    status public.reservation_status DEFAULT 'HOLD'::public.reservation_status,
    payment_intent_id text,
    hold_amount_cents integer DEFAULT 1000,
    window_minutes integer DEFAULT 15,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: seats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seats (
    id text NOT NULL,
    lounge_id text NOT NULL,
    zone_id text NOT NULL,
    table_id text NOT NULL,
    name text,
    capacity integer NOT NULL,
    coordinates text,
    qr_enabled boolean DEFAULT true NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    price_multiplier double precision DEFAULT 1.0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: session_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session_notes (
    id text NOT NULL,
    session_id text NOT NULL,
    note_type text NOT NULL,
    text text NOT NULL,
    sentiment text,
    loyalty_impact integer,
    behavioral_tags text,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    venue_id uuid NOT NULL,
    table_id text NOT NULL,
    tier text NOT NULL,
    flavors text[] DEFAULT '{}'::text[],
    status public.session_status DEFAULT 'PENDING'::public.session_status,
    started_at timestamp with time zone,
    ends_at timestamp with time zone,
    price_lookup_key text,
    payment_intent_id text,
    checkout_session_id text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


--
-- Name: staff; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    venue_id uuid NOT NULL,
    role text NOT NULL,
    email text,
    phone text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    CONSTRAINT staff_role_check CHECK ((role = ANY (ARRAY['FOH'::text, 'BOH'::text, 'MANAGER'::text, 'ADMIN'::text])))
);


--
-- Name: stations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stations (
    id text NOT NULL,
    lounge_id text NOT NULL,
    name text NOT NULL,
    station_type text NOT NULL,
    zone_id text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: stripe_webhook_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stripe_webhook_events (
    id text NOT NULL,
    type text NOT NULL,
    received_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sync_backlog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sync_backlog (
    id text NOT NULL,
    device_id text NOT NULL,
    lounge_id text NOT NULL,
    operation text NOT NULL,
    payload text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    retry_count integer DEFAULT 0 NOT NULL,
    last_attempt timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    synced_at timestamp(3) without time zone
);


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE tenants; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.tenants IS 'Multi-tenant organizations (lounges)';


--
-- Name: COLUMN tenants.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tenants.id IS 'Unique tenant identifier (UUID)';


--
-- Name: COLUMN tenants.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tenants.name IS 'Tenant/lounge name';


--
-- Name: venues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.venues (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    address text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


--
-- Name: zones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.zones (
    id text NOT NULL,
    lounge_id text NOT NULL,
    name text NOT NULL,
    zone_type text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    metadata text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: hooks; Type: TABLE; Schema: supabase_functions; Owner: -
--

CREATE TABLE supabase_functions.hooks (
    id bigint NOT NULL,
    hook_table_id integer NOT NULL,
    hook_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    request_id bigint
);


--
-- Name: TABLE hooks; Type: COMMENT; Schema: supabase_functions; Owner: -
--

COMMENT ON TABLE supabase_functions.hooks IS 'Supabase Functions Hooks: Audit trail for triggered hooks.';


--
-- Name: hooks_id_seq; Type: SEQUENCE; Schema: supabase_functions; Owner: -
--

CREATE SEQUENCE supabase_functions.hooks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hooks_id_seq; Type: SEQUENCE OWNED BY; Schema: supabase_functions; Owner: -
--

ALTER SEQUENCE supabase_functions.hooks_id_seq OWNED BY supabase_functions.hooks.id;


--
-- Name: migrations; Type: TABLE; Schema: supabase_functions; Owner: -
--

CREATE TABLE supabase_functions.migrations (
    version text NOT NULL,
    inserted_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


--
-- Name: seed_files; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.seed_files (
    path text NOT NULL,
    hash text NOT NULL
);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: ghostlog id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ghostlog ALTER COLUMN id SET DEFAULT nextval('public.ghostlog_id_seq'::regclass);


--
-- Name: hooks id; Type: DEFAULT; Schema: supabase_functions; Owner: -
--

ALTER TABLE ONLY supabase_functions.hooks ALTER COLUMN id SET DEFAULT nextval('supabase_functions.hooks_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	4cd519e8-5042-4200-828d-b1b4b665081c	{"action":"user_confirmation_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-19 22:18:00.53323+00	
00000000-0000-0000-0000-000000000000	16e80c45-1c51-4187-94d3-9bce965da2e3	{"action":"user_confirmation_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-19 22:36:32.566222+00	
00000000-0000-0000-0000-000000000000	54b57b5d-4c73-4160-aa51-eb2317c9362b	{"action":"user_confirmation_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-19 22:38:44.6784+00	
00000000-0000-0000-0000-000000000000	d0f5bbee-74da-42e3-a69f-246737196869	{"action":"user_confirmation_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-19 22:42:27.200566+00	
00000000-0000-0000-0000-000000000000	6cbf7228-45ed-4bbb-9f1b-75166f950491	{"action":"user_signedup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-11-19 22:43:04.256145+00	
00000000-0000-0000-0000-000000000000	64ba5a10-da3d-4a77-b7b6-6bcff8cefbfa	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-19 22:43:43.25935+00	
00000000-0000-0000-0000-000000000000	5a53f73c-8dab-4401-98cb-91439ab9e8ec	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-19 22:43:44.125133+00	
00000000-0000-0000-0000-000000000000	35c3507d-c406-4a66-8f4b-cc88d081ccc0	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-19 22:43:53.723923+00	
00000000-0000-0000-0000-000000000000	f12e8b16-d7e1-49c3-b033-c1b720030f8d	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-19 22:44:02.63829+00	
00000000-0000-0000-0000-000000000000	57f4cdbc-4b69-456d-8462-8b1546b1343c	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-19 23:25:56.059773+00	
00000000-0000-0000-0000-000000000000	c17d8896-1486-46d3-b99a-07ad196dbdfb	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-19 23:25:56.794912+00	
00000000-0000-0000-0000-000000000000	9d3e3f87-2b85-49c5-bda0-fc75dd4ad577	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-19 23:26:10.604008+00	
00000000-0000-0000-0000-000000000000	f332b46b-211e-4bfc-9072-a24502ac617e	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-19 23:26:10.885382+00	
00000000-0000-0000-0000-000000000000	921454bd-7bc6-4b88-8d5b-f05a0e8e4154	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-19 23:26:23.444777+00	
00000000-0000-0000-0000-000000000000	70276300-f3c2-479a-bb6d-43d2ade98963	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-19 23:26:23.696327+00	
00000000-0000-0000-0000-000000000000	277225bf-70c6-4155-b9be-0569144ee083	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-19 23:26:26.323201+00	
00000000-0000-0000-0000-000000000000	44ae0d86-8d2f-46fd-87e1-23cc97e15ec8	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-19 23:26:26.56295+00	
00000000-0000-0000-0000-000000000000	436ed823-f237-4c56-bd0b-1343049b01b3	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-20 12:50:35.264599+00	
00000000-0000-0000-0000-000000000000	14604584-543c-46d6-aad0-499e1e430b6c	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-20 12:50:35.284085+00	
00000000-0000-0000-0000-000000000000	f3acd169-dc12-4885-baf4-24ef143c1aca	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-20 12:50:35.307035+00	
00000000-0000-0000-0000-000000000000	8e87ba6c-acd7-4304-a50d-2448a430b067	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-20 12:50:36.217811+00	
00000000-0000-0000-0000-000000000000	b90522ee-9ff4-4d30-901a-5f7628b57b6c	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-20 12:50:55.651328+00	
00000000-0000-0000-0000-000000000000	cd45069a-8f98-4b0c-9f84-492bb93f0e40	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-20 12:50:55.9464+00	
00000000-0000-0000-0000-000000000000	b3576b8e-caf0-47d8-998f-ec72dc0aef1a	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-20 12:57:44.216292+00	
00000000-0000-0000-0000-000000000000	9ceda4e2-4e2d-4595-b471-f3be16b34f42	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-20 12:57:55.647816+00	
00000000-0000-0000-0000-000000000000	4b73719b-ddfa-4d9a-b2a2-017ef8dae828	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-20 12:57:55.964635+00	
00000000-0000-0000-0000-000000000000	7724cb92-57c0-40a4-b929-7c6066e8e86b	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-20 12:58:01.100445+00	
00000000-0000-0000-0000-000000000000	7aa88944-7251-4842-9be9-7cba4ed627d5	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-20 12:58:16.177179+00	
00000000-0000-0000-0000-000000000000	07b02e8b-115d-4e3b-a531-aad04dc7e289	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-20 12:59:27.315852+00	
00000000-0000-0000-0000-000000000000	a937ead6-2c05-4e97-8cde-682a208a269e	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-20 15:32:54.280592+00	
00000000-0000-0000-0000-000000000000	219e5f48-ed5e-4a8f-9446-11cca06b1f3c	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-20 15:32:54.303046+00	
00000000-0000-0000-0000-000000000000	d31c033c-4ed4-4aa3-b9c1-e667def3fc0e	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-20 16:39:27.33375+00	
00000000-0000-0000-0000-000000000000	c4bb36bd-8e1b-4510-9365-0ddef7543268	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-20 16:39:27.366616+00	
00000000-0000-0000-0000-000000000000	6fef0efb-d384-486b-a32c-6933bd58aed0	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-20 16:39:27.370198+00	
00000000-0000-0000-0000-000000000000	0ef2cc2c-3dc9-4dac-a3b1-d56e1966030a	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-20 16:42:27.534145+00	
00000000-0000-0000-0000-000000000000	0142f999-2229-4efd-bb29-90049f7b02fe	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-20 16:42:36.689915+00	
00000000-0000-0000-0000-000000000000	cd6b204b-3157-430d-bc9d-2b1619820d9c	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-20 16:43:04.65015+00	
00000000-0000-0000-0000-000000000000	53ff2026-5b79-4808-b3d1-c8b9f7afe0ed	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-20 16:43:05.163305+00	
00000000-0000-0000-0000-000000000000	eadd05ad-402f-4922-a995-ab93b8005c90	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-20 16:43:12.738675+00	
00000000-0000-0000-0000-000000000000	2e52f900-706b-46a6-95a3-15754125119b	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-20 16:43:13.056793+00	
00000000-0000-0000-0000-000000000000	6e93fea3-db53-45af-b3d9-ef7afe2d2586	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-20 16:43:30.202656+00	
00000000-0000-0000-0000-000000000000	c037c0d4-5cf5-4683-a165-a23eee3ef4ae	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-20 16:43:30.561712+00	
00000000-0000-0000-0000-000000000000	8539a4c8-bbc2-457b-abf2-b145df5afa0a	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-20 16:45:18.214522+00	
00000000-0000-0000-0000-000000000000	5d52e45b-8c64-477f-81a5-544cc3e32559	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-20 16:47:41.636633+00	
00000000-0000-0000-0000-000000000000	2d65c3e6-93d1-4ae1-8041-6aa84881991b	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-20 17:07:07.980291+00	
00000000-0000-0000-0000-000000000000	68eda847-c020-4d48-ab53-5ce38b54b09e	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-20 17:07:42.528086+00	
00000000-0000-0000-0000-000000000000	7d117e69-8c0f-456f-a9cb-c736e047433b	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-20 17:07:42.892749+00	
00000000-0000-0000-0000-000000000000	c75285fb-86b2-4464-b6c5-e5526edab74a	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-20 17:08:02.560878+00	
00000000-0000-0000-0000-000000000000	d3def65b-ad19-43ba-871c-373b82630ea1	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-20 17:08:08.928891+00	
00000000-0000-0000-0000-000000000000	7b30208f-89da-4c19-8f47-d195786b922b	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-20 17:12:36.646009+00	
00000000-0000-0000-0000-000000000000	f5b5701f-9c7d-4af7-a956-267af64de8c1	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-20 17:12:37.218523+00	
00000000-0000-0000-0000-000000000000	52b17062-5131-4a06-be45-6d093cd66722	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-20 17:12:52.643162+00	
00000000-0000-0000-0000-000000000000	173a7dc6-ad37-46d4-9fbe-73055c8daf3d	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-20 17:13:27.469769+00	
00000000-0000-0000-0000-000000000000	6798d8e6-863f-4f79-94a7-d5fa16c81021	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-20 17:13:56.027478+00	
00000000-0000-0000-0000-000000000000	0cc39bbe-6b2f-47e4-838a-58035e2d050e	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-20 17:14:07.646489+00	
00000000-0000-0000-0000-000000000000	62bd16af-0628-412d-98c3-c0a07da4a357	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-20 17:15:02.681252+00	
00000000-0000-0000-0000-000000000000	cf1a1614-c56a-46cf-8e77-9d606db03c4e	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-20 17:15:03.02306+00	
00000000-0000-0000-0000-000000000000	83c0393b-4178-484f-9398-1153a4a424f4	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-20 17:15:13.263797+00	
00000000-0000-0000-0000-000000000000	03fcbebf-1374-4747-8da8-777941c33e9e	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-20 17:15:47.514263+00	
00000000-0000-0000-0000-000000000000	c5b73947-e8da-4b9d-91eb-99b3b7a5da20	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-20 17:15:50.745786+00	
00000000-0000-0000-0000-000000000000	ef409757-eb12-4c02-9af8-97b27ec16fce	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-20 17:19:55.729417+00	
00000000-0000-0000-0000-000000000000	6a803d73-ebb3-4630-b15d-650c85ec0e4e	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-20 17:20:04.171997+00	
00000000-0000-0000-0000-000000000000	eb00216b-c788-47e4-a8a7-37cfe0e9cc7f	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-20 17:23:28.071168+00	
00000000-0000-0000-0000-000000000000	ee2709ad-d4d1-401f-a9b3-149f271a9c13	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-20 17:23:35.546961+00	
00000000-0000-0000-0000-000000000000	630b9d9f-01d3-45af-a2e8-4605368fa3d4	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-20 19:27:13.081801+00	
00000000-0000-0000-0000-000000000000	bfadc101-381d-40ca-8d28-98c838a6498d	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-20 19:27:28.349682+00	
00000000-0000-0000-0000-000000000000	f4081742-2e35-4634-a769-3e5dfa50eaef	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-20 19:28:08.838964+00	
00000000-0000-0000-0000-000000000000	abf70e54-f77a-469d-89c6-1a07ae1fa55c	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-20 19:31:58.108181+00	
00000000-0000-0000-0000-000000000000	21abeec9-ccac-4546-971d-5f39c7d0babc	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-20 19:32:05.09434+00	
00000000-0000-0000-0000-000000000000	90c2adde-695a-481f-8f5c-602f001d2732	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-21 16:46:08.485371+00	
00000000-0000-0000-0000-000000000000	db949c0b-af3f-4863-b454-b8fc3756e1c6	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-21 16:46:08.519626+00	
00000000-0000-0000-0000-000000000000	f1095622-92ab-4c01-9dca-f52f82b5974a	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-21 16:46:08.526356+00	
00000000-0000-0000-0000-000000000000	7cbb33ae-3cea-486a-9ed1-2e342e8b51eb	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-21 17:01:46.089344+00	
00000000-0000-0000-0000-000000000000	29715fa7-9ca5-4991-8470-b7c4a73f4503	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-21 17:03:21.835132+00	
00000000-0000-0000-0000-000000000000	9645cd2b-d66e-41ca-896d-bbee6dbe6c38	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-21 19:48:37.486896+00	
00000000-0000-0000-0000-000000000000	269fddd3-4264-4d31-97f9-f114f0b00816	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-21 19:48:37.542285+00	
00000000-0000-0000-0000-000000000000	8afec3d7-8177-4a70-acce-9aba0faf7790	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-21 19:48:37.552925+00	
00000000-0000-0000-0000-000000000000	eee1408e-a4d6-46e7-9738-883bc4bedaef	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-21 19:48:49.888054+00	
00000000-0000-0000-0000-000000000000	04c1ef69-a9bc-4901-a50f-dd0a1cf84a5a	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-21 19:48:50.336129+00	
00000000-0000-0000-0000-000000000000	7d21b351-8a76-49f7-a56f-232671f70026	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-21 19:49:14.034855+00	
00000000-0000-0000-0000-000000000000	8c638f00-0851-4c29-ad55-c99e683c5668	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-21 19:49:14.257625+00	
00000000-0000-0000-0000-000000000000	f1a94a38-f5e2-47fd-a942-a45d08598c87	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-21 19:54:07.085457+00	
00000000-0000-0000-0000-000000000000	7ba8acab-b17b-4abc-bffe-38851a663163	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-21 20:00:36.072961+00	
00000000-0000-0000-0000-000000000000	50b7f906-c1b7-494b-9655-5351de3f2747	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-21 20:06:54.389447+00	
00000000-0000-0000-0000-000000000000	88ee170e-d98b-4aef-ae8f-295b4bcbf594	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-21 20:06:55.602445+00	
00000000-0000-0000-0000-000000000000	859a4b9c-12a8-4f23-b349-c72a786a524e	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-21 20:08:33.441982+00	
00000000-0000-0000-0000-000000000000	5664463a-6f68-490e-ae57-3b7b3f91f348	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-21 20:08:33.81139+00	
00000000-0000-0000-0000-000000000000	68592390-151f-4a01-9018-e29b5d7fd1c9	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-21 20:09:17.656453+00	
00000000-0000-0000-0000-000000000000	818e4ffb-b7d6-4824-8b0e-df7359b6c9bc	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-21 20:09:18.515465+00	
00000000-0000-0000-0000-000000000000	b6126ffc-2da1-48d9-aaa2-574fc42a024c	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-21 20:09:43.026763+00	
00000000-0000-0000-0000-000000000000	81b07bf2-182b-48ce-a37c-9cf6499aa7eb	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-21 20:09:43.342147+00	
00000000-0000-0000-0000-000000000000	36452e88-8f83-4943-a656-42b3706f58a6	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-21 20:11:00.882917+00	
00000000-0000-0000-0000-000000000000	63265ccc-fde5-4323-bf4e-127705a2c93a	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-21 20:11:01.942776+00	
00000000-0000-0000-0000-000000000000	a1b3ee32-8927-4de0-be6d-6befead90486	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-21 20:11:35.769961+00	
00000000-0000-0000-0000-000000000000	4ae0f493-f463-441b-94bd-0839788e8b7b	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-21 20:11:49.545765+00	
00000000-0000-0000-0000-000000000000	f74df423-0faa-4a53-bfb2-719d229bdf4f	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-22 17:44:53.439982+00	
00000000-0000-0000-0000-000000000000	f57d4a31-374e-4829-9cbe-74771c1a8853	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-22 17:44:53.468434+00	
00000000-0000-0000-0000-000000000000	cefecd49-5796-43bb-ae90-9c40d2a1a2c6	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-23 18:03:12.132612+00	
00000000-0000-0000-0000-000000000000	eaa81e25-2714-4c7a-836c-b964e924adaa	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-23 18:03:12.154063+00	
00000000-0000-0000-0000-000000000000	70ff0d3d-c493-4f9a-8d7c-8c559d79c711	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-23 18:03:13.045256+00	
00000000-0000-0000-0000-000000000000	6f38e750-4083-4f6c-b669-9548047b8587	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-23 18:03:31.769696+00	
00000000-0000-0000-0000-000000000000	294014a7-09e7-4711-b945-72299c14ac11	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-23 18:03:32.943622+00	
00000000-0000-0000-0000-000000000000	e71abe13-f2c5-4700-9906-98f177a44fc3	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 16:01:15.401439+00	
00000000-0000-0000-0000-000000000000	1decbbe9-279b-4fb5-90c9-d4569c63adac	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 16:01:15.41977+00	
00000000-0000-0000-0000-000000000000	c2d8c437-c77e-4c2f-8b46-f24620833cfd	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-24 16:01:15.434022+00	
00000000-0000-0000-0000-000000000000	f348952b-4dfd-45e6-91c0-929eaf179c3a	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 16:01:16.321009+00	
00000000-0000-0000-0000-000000000000	16f99a56-750d-45ac-a3c0-e3e6ab7c9e2e	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-24 16:01:24.906065+00	
00000000-0000-0000-0000-000000000000	cabf729e-c302-4798-a4d8-5badd1ac9cf0	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 16:01:26.206318+00	
00000000-0000-0000-0000-000000000000	1729dbcc-da20-4dcc-b828-e3d5bc1d0574	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 16:02:43.02257+00	
00000000-0000-0000-0000-000000000000	86d3740d-b634-4416-90cc-0d1930349a05	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-24 16:03:07.410861+00	
00000000-0000-0000-0000-000000000000	891ddefc-277b-4ec6-945a-815a0aef77a5	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-24 16:04:11.899627+00	
00000000-0000-0000-0000-000000000000	79626dd3-cc34-4778-85db-281a8776fd50	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 16:04:12.320805+00	
00000000-0000-0000-0000-000000000000	9ad0b766-e6ad-4f14-97a1-16939b53b806	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-24 16:04:28.457671+00	
00000000-0000-0000-0000-000000000000	a5e6a099-a357-4c53-9677-5660ada8b5b1	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 16:04:29.26173+00	
00000000-0000-0000-0000-000000000000	97fe0a69-0649-4fcb-b702-1b4d614d4f76	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 16:06:30.868947+00	
00000000-0000-0000-0000-000000000000	e6ef837f-aa1e-4319-af45-3333ede38df0	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-24 16:06:48.951244+00	
00000000-0000-0000-0000-000000000000	7940f36f-3516-4fd2-9a64-217e5d6a2a06	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 16:12:58.298072+00	
00000000-0000-0000-0000-000000000000	5940f065-6f7b-47ee-9072-6ffadc77d095	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-24 16:13:08.979173+00	
00000000-0000-0000-0000-000000000000	f307c75b-9c42-4e31-a8bf-96dafe4022ff	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-24 16:15:38.484173+00	
00000000-0000-0000-0000-000000000000	53d21a41-8c9f-40c4-b66d-67335b548661	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 16:15:39.125064+00	
00000000-0000-0000-0000-000000000000	b40a5ce2-517a-41c0-be69-30330905ee7e	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 16:15:47.220817+00	
00000000-0000-0000-0000-000000000000	d3d978d5-848c-4e9f-bb83-c890d6b1d5f4	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-24 16:15:58.201478+00	
00000000-0000-0000-0000-000000000000	2a4a8e17-108b-4823-99a5-3c0438116eda	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 16:23:55.027828+00	
00000000-0000-0000-0000-000000000000	56136fcb-c520-4e2a-8ba1-3a25f5e0d3c5	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-24 16:24:11.00819+00	
00000000-0000-0000-0000-000000000000	a040bcf1-38c0-428c-900f-c03db801b228	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 17:00:10.756652+00	
00000000-0000-0000-0000-000000000000	62520fa9-b82b-42aa-b70e-342d72ce7ea3	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 17:00:10.779566+00	
00000000-0000-0000-0000-000000000000	f9c369a6-599a-429c-b86f-f924c1076434	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 17:28:16.081661+00	
00000000-0000-0000-0000-000000000000	249b403c-607d-4c76-9d52-c42e3125c80b	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-24 17:28:25.670319+00	
00000000-0000-0000-0000-000000000000	e11c585a-600e-4113-8375-85078a616874	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 17:30:52.240907+00	
00000000-0000-0000-0000-000000000000	9edb3dc8-60c8-44f4-8be1-c3fc96022e62	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-24 17:31:03.559438+00	
00000000-0000-0000-0000-000000000000	b08ea2d3-9371-47b0-8f49-acd88cc44ab3	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 17:32:14.797869+00	
00000000-0000-0000-0000-000000000000	084959a1-c5ef-48ae-9d80-eb3fbd2e5b8f	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-24 17:32:30.883472+00	
00000000-0000-0000-0000-000000000000	80932f8c-2a34-4939-a9be-39c344eed3d3	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 17:33:39.963136+00	
00000000-0000-0000-0000-000000000000	9adf6c08-9373-415f-b7ae-c42793edc72f	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-24 17:33:49.554069+00	
00000000-0000-0000-0000-000000000000	5dfa2992-6eda-4e80-8796-ac49b8c067d9	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-24 17:41:01.249506+00	
00000000-0000-0000-0000-000000000000	c5ed5dc9-068a-4f39-9dc8-2cdd9e645acc	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 17:41:01.741944+00	
00000000-0000-0000-0000-000000000000	78d265d2-df80-4974-bf1b-01d21f92ca26	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-24 17:41:38.331807+00	
00000000-0000-0000-0000-000000000000	1e5bf9b2-9592-4f36-992d-a98a08e3c93b	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 17:41:38.553921+00	
00000000-0000-0000-0000-000000000000	a0595400-ff46-4722-bfe8-9088a90819ce	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 17:42:56.799407+00	
00000000-0000-0000-0000-000000000000	30a18d2b-d8dc-42be-b29a-5b4e381cf09a	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-24 17:43:05.587311+00	
00000000-0000-0000-0000-000000000000	1ea91421-6555-40af-9086-a23efdbb0b5e	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 17:43:57.499551+00	
00000000-0000-0000-0000-000000000000	c33527d4-9d70-49f7-ad0d-a2c2cef061c6	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-24 17:44:05.760986+00	
00000000-0000-0000-0000-000000000000	69ec8ef2-8c72-48ff-94d8-090eb1202c5b	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 17:53:24.21169+00	
00000000-0000-0000-0000-000000000000	d416ea80-2bbd-4fdb-8535-5ff7f76f2ed9	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-24 17:54:01.119444+00	
00000000-0000-0000-0000-000000000000	12783b79-d7ed-456d-882d-a30e61bb2405	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-24 17:57:40.90678+00	
00000000-0000-0000-0000-000000000000	9956a50a-f622-4a74-befd-3ec5662365bc	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 17:57:41.402677+00	
00000000-0000-0000-0000-000000000000	7faf1e3e-224b-444b-bb60-b5dcb9402026	{"action":"user_repeated_signup","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-24 17:57:58.069008+00	
00000000-0000-0000-0000-000000000000	a8f50a14-5906-47a9-a809-7fe04a61215f	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 17:57:59.011784+00	
00000000-0000-0000-0000-000000000000	af4eb526-dfeb-46a9-901a-0b4dd43c6e1c	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 17:58:37.953274+00	
00000000-0000-0000-0000-000000000000	ebdca63d-14d3-460b-a925-0c07c391bd1f	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-24 17:58:48.915334+00	
00000000-0000-0000-0000-000000000000	0e8aae9d-4f48-4719-92bf-c8a2261c3592	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-24 18:06:50.405704+00	
00000000-0000-0000-0000-000000000000	7f77b358-ea22-4607-b1d3-9b092e78b2d2	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 18:06:50.783526+00	
00000000-0000-0000-0000-000000000000	918b8e7e-8359-48f0-8956-8e4e6a4a0a88	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 18:07:29.509153+00	
00000000-0000-0000-0000-000000000000	7b4e4015-c522-4c5d-8225-4263c3ba4625	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-24 18:07:43.14442+00	
00000000-0000-0000-0000-000000000000	063aae13-e31f-4869-8dd7-ba5d2cab0263	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-24 18:21:39.605415+00	
00000000-0000-0000-0000-000000000000	82312c41-7c84-4f8b-9e79-dc58bebeee73	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 18:21:39.832242+00	
00000000-0000-0000-0000-000000000000	1fc134f5-1076-4ab6-9c31-f452c4a07b20	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 18:21:57.774275+00	
00000000-0000-0000-0000-000000000000	0bcc44ee-33d7-4395-ae41-20490f89da0f	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-24 18:22:12.283463+00	
00000000-0000-0000-0000-000000000000	14bc6ac1-ebd3-45d5-b979-12ed2098bbe6	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-24 18:23:37.26478+00	
00000000-0000-0000-0000-000000000000	31581ce5-3844-4518-8ec5-bd55bc95b0b2	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 18:23:37.610822+00	
00000000-0000-0000-0000-000000000000	757483a6-3e0a-4647-b758-166076916cf8	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 18:34:58.491707+00	
00000000-0000-0000-0000-000000000000	2bc5ab5d-2066-4122-aebc-8343e5aed7bb	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-24 18:35:09.035171+00	
00000000-0000-0000-0000-000000000000	2a9546ff-c851-4281-b962-608c9bcbd6c4	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-24 18:41:20.396088+00	
00000000-0000-0000-0000-000000000000	c4e5b46e-5e98-42aa-a610-61dbe0e27031	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 18:41:20.791184+00	
00000000-0000-0000-0000-000000000000	f7d50678-3323-4084-b3eb-766f0daa6609	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-24 18:42:22.381213+00	
00000000-0000-0000-0000-000000000000	db2ae55a-24ac-44ef-9f5d-7f726f44bc92	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 18:42:22.660327+00	
00000000-0000-0000-0000-000000000000	7ae1f3bd-854a-4db2-8ee9-f1db8a70775f	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-24 18:42:31.65127+00	
00000000-0000-0000-0000-000000000000	fc87bb67-d4c6-41c3-94e9-66672905fa9b	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-24 18:42:31.918042+00	
00000000-0000-0000-0000-000000000000	fc942dd0-1bc2-44dc-8a7d-9de4a54b8664	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 19:40:54.113949+00	
00000000-0000-0000-0000-000000000000	dee546d0-6d92-4877-95d4-dab16b0d4475	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 19:40:54.15531+00	
00000000-0000-0000-0000-000000000000	08a0142a-51e2-47f7-b29c-6c2825bcf3c7	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 20:39:24.031564+00	
00000000-0000-0000-0000-000000000000	d5d45b5c-4830-4e23-9d41-d9c301b4a7fa	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 20:39:24.059009+00	
00000000-0000-0000-0000-000000000000	98f1260a-f9b3-42dd-99ee-5321e3087219	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 21:38:10.89803+00	
00000000-0000-0000-0000-000000000000	4d1896bb-2eb5-49c2-b4c1-515372f61652	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 21:38:10.927175+00	
00000000-0000-0000-0000-000000000000	38b213b5-5277-45ab-88f3-8ce5e8a2387c	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 22:37:10.86911+00	
00000000-0000-0000-0000-000000000000	9a7dbbef-ea2b-45b5-b002-9cacb90cf3ee	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 22:37:10.906236+00	
00000000-0000-0000-0000-000000000000	6fe6b03b-8ca1-482c-93d5-5499832acbb4	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 23:35:30.905089+00	
00000000-0000-0000-0000-000000000000	c77db753-23de-4ddf-88b9-7160681c413d	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 23:35:30.936267+00	
00000000-0000-0000-0000-000000000000	1357b3bb-fcb7-4644-b88b-0b5e966c1385	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-25 01:01:05.906887+00	
00000000-0000-0000-0000-000000000000	4c6fa5eb-4030-4e0b-a1c0-f1940e0bc1d9	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-25 01:01:05.930723+00	
00000000-0000-0000-0000-000000000000	c29e8d2f-6d7f-4007-bdd8-009bbb7c1841	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-25 02:00:11.047193+00	
00000000-0000-0000-0000-000000000000	fb29cf8c-66aa-44b8-a0f9-c496e4c91b87	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-25 02:00:11.07553+00	
00000000-0000-0000-0000-000000000000	e3491bfd-962b-4c81-9342-8c09915e6fa8	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-25 02:59:11.122526+00	
00000000-0000-0000-0000-000000000000	36489594-a0cf-48b0-9ec8-e20a2242ee2e	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-25 02:59:11.141516+00	
00000000-0000-0000-0000-000000000000	e9a4f8d2-27ce-41a0-a0b5-7c96aae419d1	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-25 08:12:37.327492+00	
00000000-0000-0000-0000-000000000000	d362d9e0-7131-4478-a5c2-1b31458461ee	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-25 08:12:37.354101+00	
00000000-0000-0000-0000-000000000000	da8f61b0-b59b-4869-8b85-192af36c48fa	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-25 14:22:14.07862+00	
00000000-0000-0000-0000-000000000000	bea12699-e32c-46ba-aed1-313bd7d46776	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-25 14:22:14.10049+00	
00000000-0000-0000-0000-000000000000	3d02f426-dd67-4fda-b189-6616727d8e5b	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-25 19:50:12.773052+00	
00000000-0000-0000-0000-000000000000	074b987e-2f05-47be-a1d6-64d4bcfe7651	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-25 19:50:12.797132+00	
00000000-0000-0000-0000-000000000000	a1137ce4-ef8e-42d1-bfe4-0dad47dcb1b8	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-26 13:24:36.264337+00	
00000000-0000-0000-0000-000000000000	660c3556-a67a-41bf-8353-8730441b4f2b	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-26 13:24:36.290992+00	
00000000-0000-0000-0000-000000000000	6917428e-0c97-4971-9a31-e08ffa94b8b2	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-26 14:49:58.728287+00	
00000000-0000-0000-0000-000000000000	9a43e430-0d57-4f67-873d-ea226ffc18ad	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-26 14:49:58.746826+00	
00000000-0000-0000-0000-000000000000	ce75bff8-cd29-4007-97d5-a3771588bb74	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-26 15:48:17.551664+00	
00000000-0000-0000-0000-000000000000	e09e0f3e-acfc-4e88-81f9-91cdaa838690	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-26 15:48:17.583569+00	
00000000-0000-0000-0000-000000000000	dd6cbae6-5c3e-4816-b729-5bf1aceb1127	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-26 19:04:09.804642+00	
00000000-0000-0000-0000-000000000000	064e0bc5-f0e8-4874-a23d-50b85e5bd306	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-26 19:04:09.826198+00	
00000000-0000-0000-0000-000000000000	98386bff-f590-4755-953f-2147fc50d441	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-26 20:02:14.108857+00	
00000000-0000-0000-0000-000000000000	18d3e53d-587a-4154-afd7-8f9662156b08	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-26 20:02:14.151695+00	
00000000-0000-0000-0000-000000000000	61d78bb2-d3d4-4e57-b589-419290f37d1b	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-26 21:00:44.27081+00	
00000000-0000-0000-0000-000000000000	a9bf85e1-4cce-465a-a8f6-cea04c0452bb	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-26 21:00:44.298547+00	
00000000-0000-0000-0000-000000000000	70936814-5dbf-45fe-bfef-94162eae7176	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-26 21:59:14.219237+00	
00000000-0000-0000-0000-000000000000	f4f0ac0a-8f41-4608-b2d1-60089db38054	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-26 21:59:14.238358+00	
00000000-0000-0000-0000-000000000000	153c4e85-0265-4aea-a86f-24eed643d994	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-26 22:57:44.205598+00	
00000000-0000-0000-0000-000000000000	f96b7fe2-2551-4e82-ac74-74b64fcbd25a	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-26 22:57:44.230744+00	
00000000-0000-0000-0000-000000000000	9861016b-99cf-4e03-9dda-38d6431308b7	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-26 23:56:14.185283+00	
00000000-0000-0000-0000-000000000000	b6cb23aa-2f01-445e-b98c-734ca83dc97c	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-26 23:56:14.216659+00	
00000000-0000-0000-0000-000000000000	17e31b79-f212-412c-83dd-b8f7d2e4785c	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-27 00:54:44.37258+00	
00000000-0000-0000-0000-000000000000	2bfc110f-9b5c-4f81-ab90-a0580034bebd	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-27 00:54:44.395057+00	
00000000-0000-0000-0000-000000000000	ae6b76a4-4802-4837-a8a0-e8450a95cc52	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-30 15:28:33.07515+00	
00000000-0000-0000-0000-000000000000	62f6889a-60ed-4add-b706-60ae09225c4a	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-30 15:28:33.101576+00	
00000000-0000-0000-0000-000000000000	a11bee72-2e64-4b79-8736-6e8293508462	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-30 16:27:06.885596+00	
00000000-0000-0000-0000-000000000000	605d27b8-55f0-4d14-93c6-dba6ec49b584	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-30 16:27:06.911138+00	
00000000-0000-0000-0000-000000000000	0c261f47-0dba-4dd0-a3b4-6749afce4c8e	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-30 17:25:11.618858+00	
00000000-0000-0000-0000-000000000000	ca070235-ebdf-41ac-ac06-6fe332683088	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-30 17:25:11.650435+00	
00000000-0000-0000-0000-000000000000	93294298-c864-4ab7-bf03-83e41d6e33c1	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-30 18:23:41.565146+00	
00000000-0000-0000-0000-000000000000	35723ea8-ad50-4a20-afdd-1310982bda1e	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-30 18:23:41.593197+00	
00000000-0000-0000-0000-000000000000	7e5b7e61-01b3-441c-9846-e7379cb6ea7f	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-30 19:22:11.627893+00	
00000000-0000-0000-0000-000000000000	68fc886c-3f56-46e8-8079-fcc9d55b06d7	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-30 19:22:11.650866+00	
00000000-0000-0000-0000-000000000000	bb458147-abdd-44de-af72-3c51c0865081	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-30 20:20:41.710987+00	
00000000-0000-0000-0000-000000000000	03c4c641-8b43-4789-ad32-90b5a4ad1970	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-30 20:20:41.740135+00	
00000000-0000-0000-0000-000000000000	a34a137b-978f-426e-9844-27b48d20b439	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-30 21:20:07.40362+00	
00000000-0000-0000-0000-000000000000	2241f1fe-13cc-4d53-85fe-fba28c39d217	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-30 21:20:07.422622+00	
00000000-0000-0000-0000-000000000000	5eb67b21-8122-4e70-9ccb-9ca50a65adb3	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-30 22:19:07.126272+00	
00000000-0000-0000-0000-000000000000	6d1edd41-b444-45e5-9268-f8cac356a932	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-30 22:19:07.14498+00	
00000000-0000-0000-0000-000000000000	fcbc23d8-f433-4460-ae35-e4a8f6524a1c	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-30 23:17:35.841446+00	
00000000-0000-0000-0000-000000000000	0276c7f4-9add-45cd-baad-5f7cca3d36b5	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-30 23:17:35.884114+00	
00000000-0000-0000-0000-000000000000	c7891260-7649-4b76-a7ef-8eb572bb37fd	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 00:16:07.03663+00	
00000000-0000-0000-0000-000000000000	a2f69dbf-fe22-4be8-a0f8-833d1007286b	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 00:16:07.074601+00	
00000000-0000-0000-0000-000000000000	16aca713-f950-4ed6-af46-447af97d02a6	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 01:15:07.26713+00	
00000000-0000-0000-0000-000000000000	e14e2b0f-9bd8-423a-9662-2e5f5e45f278	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 01:15:07.304603+00	
00000000-0000-0000-0000-000000000000	2c7af32d-bd6a-4c05-89b5-3c1fab577ec5	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 02:14:07.560766+00	
00000000-0000-0000-0000-000000000000	bce9608b-7e45-4b21-b706-bc4bfb52f289	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 02:14:07.582213+00	
00000000-0000-0000-0000-000000000000	519e7c12-f795-4684-8f29-0e7c9732106b	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 03:13:07.597524+00	
00000000-0000-0000-0000-000000000000	73565de5-d965-4ea2-b9c0-24651176b74a	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 03:13:07.619465+00	
00000000-0000-0000-0000-000000000000	88b36b78-0dc5-4b5e-a101-bb30d4241635	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 16:10:47.1059+00	
00000000-0000-0000-0000-000000000000	7fd6087b-1297-4a17-8611-0e7df1a86e1d	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 16:10:47.120885+00	
00000000-0000-0000-0000-000000000000	34efba71-3c2d-46e2-a81b-0e680a787542	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-12-01 16:27:14.245864+00	
00000000-0000-0000-0000-000000000000	32de404d-2974-4607-8f74-028e37ccb79b	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-12-01 16:27:34.791512+00	
00000000-0000-0000-0000-000000000000	ca167643-4fd4-4631-92e7-b0dc5d2db735	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 16:27:38.966134+00	
00000000-0000-0000-0000-000000000000	437b7971-5bc7-4fec-b596-64931509a5c6	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 16:27:38.966786+00	
00000000-0000-0000-0000-000000000000	91a9135d-6946-4cff-b094-069f1e911195	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 17:11:03.539279+00	
00000000-0000-0000-0000-000000000000	25c812a1-dd12-4ab1-8cac-a628ca72ba3b	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 17:11:03.560029+00	
00000000-0000-0000-0000-000000000000	525a1e0b-b782-415d-9068-57dbbbb60ab3	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 18:10:05.319182+00	
00000000-0000-0000-0000-000000000000	af2acff0-c8e0-45a5-9eaf-6288a9b227d7	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 18:10:05.344403+00	
00000000-0000-0000-0000-000000000000	27d291f4-e8f2-4087-9d29-b67b36d2fc6e	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 19:23:59.232175+00	
00000000-0000-0000-0000-000000000000	4572ead5-6b73-4942-9439-9d17d6c982ca	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 19:23:59.255199+00	
00000000-0000-0000-0000-000000000000	253f0129-0d84-4f4d-8f52-6416d1246b15	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-01 19:33:53.150638+00	
00000000-0000-0000-0000-000000000000	60cd43d3-a9a2-495e-b65d-7825d3f28479	{"action":"user_modified","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-12-01 19:33:53.489432+00	
00000000-0000-0000-0000-000000000000	2f52714b-fbb6-4ab5-baee-e06c57cba97d	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-12-01 19:33:59.352256+00	
00000000-0000-0000-0000-000000000000	7f9e515b-2544-464d-a2c0-1d0ad4e89d84	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-12-01 19:35:25.709532+00	
00000000-0000-0000-0000-000000000000	ade23641-22f3-4076-b19d-e7fca4d45330	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 20:23:05.468953+00	
00000000-0000-0000-0000-000000000000	51eecc20-71ef-4b99-b2dd-aa2c39d85f42	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 20:23:05.503425+00	
00000000-0000-0000-0000-000000000000	ad58d03f-3e46-4e19-9226-07832fb8fd7c	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 21:22:05.464358+00	
00000000-0000-0000-0000-000000000000	eac3612a-7fd8-49b2-897b-28ab7800cf82	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 21:22:05.49088+00	
00000000-0000-0000-0000-000000000000	e3068de6-d55f-4893-a023-82abce4668a2	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 22:21:05.407859+00	
00000000-0000-0000-0000-000000000000	ab1b8096-dcc2-4bb4-8f75-3561888b6674	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 22:21:05.442598+00	
00000000-0000-0000-0000-000000000000	28e8756a-6bf3-4001-906f-826cc4dbe8d0	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 23:20:05.631892+00	
00000000-0000-0000-0000-000000000000	293d2d24-bdff-4e29-800e-f4cb3eb4ef75	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-01 23:20:05.651412+00	
00000000-0000-0000-0000-000000000000	cbbe7a45-9994-4c0d-a68b-e2657f7932a7	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 00:19:05.646205+00	
00000000-0000-0000-0000-000000000000	fff342d0-b7cb-4429-9cf5-b7f0688ce644	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 00:19:05.687186+00	
00000000-0000-0000-0000-000000000000	5f980b95-1db9-44e3-8951-585efb6b9a32	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 01:18:06.470026+00	
00000000-0000-0000-0000-000000000000	c7f89193-2945-4f7e-83dc-ba1a79b49553	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 01:18:06.493575+00	
00000000-0000-0000-0000-000000000000	6ef033ef-2107-4015-932a-34b85af79597	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 02:17:05.600875+00	
00000000-0000-0000-0000-000000000000	85792724-aa3a-4372-b2a5-10ba1ec4b7c3	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 02:17:05.633009+00	
00000000-0000-0000-0000-000000000000	615b71d3-0cf7-4c3d-964f-edef519bd2eb	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 03:16:05.752093+00	
00000000-0000-0000-0000-000000000000	23482707-9d67-4f7c-93e8-9c9600e45131	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 03:16:05.780187+00	
00000000-0000-0000-0000-000000000000	556cf15d-cb72-44fd-a323-873395fbc761	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 04:15:05.641861+00	
00000000-0000-0000-0000-000000000000	6f6bd221-8a7c-40fe-b0d1-faea83e21e8c	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 04:15:05.671435+00	
00000000-0000-0000-0000-000000000000	e5667d05-c395-4909-ac47-0d6da7062b37	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 05:14:05.715598+00	
00000000-0000-0000-0000-000000000000	7c7746b9-02ae-4732-a902-4d921fc1f3f6	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 05:14:05.740561+00	
00000000-0000-0000-0000-000000000000	f5b4dec3-72ad-47cb-af22-1f891182bc65	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 06:13:05.775855+00	
00000000-0000-0000-0000-000000000000	f6b33744-d1ee-4478-8e2e-ece904c8fb41	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 06:13:05.80375+00	
00000000-0000-0000-0000-000000000000	a9e30b89-c957-47fa-94b3-b97ae0c2399e	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 07:12:05.825509+00	
00000000-0000-0000-0000-000000000000	2dd908e4-7291-4bba-ad4f-8cdfd02b88c6	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 07:12:05.851141+00	
00000000-0000-0000-0000-000000000000	05ca662b-4a6d-4359-a734-5085afa5457f	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 08:11:05.669769+00	
00000000-0000-0000-0000-000000000000	42a4031a-fa6f-473a-9305-3f2d58295b1b	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 08:11:05.695245+00	
00000000-0000-0000-0000-000000000000	6a5f9829-a251-43f3-97b8-852723de6691	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 09:10:05.805136+00	
00000000-0000-0000-0000-000000000000	0a409fae-b94b-4170-8d70-1667a4127238	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 09:10:05.836823+00	
00000000-0000-0000-0000-000000000000	70528822-3d3a-4af1-9122-38b061d69f2f	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 10:09:05.832768+00	
00000000-0000-0000-0000-000000000000	5c582d26-77de-4d8b-a01e-c75dd0ab7b46	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 10:09:05.862439+00	
00000000-0000-0000-0000-000000000000	f32f5e21-44e6-4244-a8f5-3378da5542ef	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 11:08:05.988141+00	
00000000-0000-0000-0000-000000000000	8b310512-e8af-4b79-8281-5ab89beebfc1	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 11:08:06.021441+00	
00000000-0000-0000-0000-000000000000	99f62fa5-81b6-4348-b6fe-f0c996830e13	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 12:07:05.779516+00	
00000000-0000-0000-0000-000000000000	01cf2d45-9e89-4456-aa17-06abb564b65c	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 12:07:05.808851+00	
00000000-0000-0000-0000-000000000000	7dae73c6-4373-4133-ab0c-062f774b0b21	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 13:06:05.917362+00	
00000000-0000-0000-0000-000000000000	254a2045-d401-443c-a4ea-8a78e273ab9c	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 13:06:05.947778+00	
00000000-0000-0000-0000-000000000000	b4d19df2-0ced-4d91-9705-b2d3ec8a4040	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 14:17:59.108152+00	
00000000-0000-0000-0000-000000000000	89c155ca-342d-4d48-b242-dc9821edafe6	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 14:17:59.131947+00	
00000000-0000-0000-0000-000000000000	614b2aa7-5dcb-4a54-8031-5fc430bbfe37	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 19:05:13.48258+00	
00000000-0000-0000-0000-000000000000	77b53e3f-4ca8-475b-9c81-70afdf986e54	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 19:05:13.505561+00	
00000000-0000-0000-0000-000000000000	7b076ab3-37da-4492-9ebf-bc1f640b0bc4	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 20:04:05.933629+00	
00000000-0000-0000-0000-000000000000	f6101280-453d-46c3-8103-a22f386b3e7b	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-02 20:04:05.963423+00	
00000000-0000-0000-0000-000000000000	dd945e1d-2967-43b2-b7b7-89d7768e8668	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-03 13:37:26.586652+00	
00000000-0000-0000-0000-000000000000	94014acb-c91a-4616-91d7-31454935a18b	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-03 13:37:26.612144+00	
00000000-0000-0000-0000-000000000000	983d9607-3811-45bd-bb92-f7315b953d41	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-03 14:35:50.087266+00	
00000000-0000-0000-0000-000000000000	58c4ee5c-d2c9-42cc-a474-a1b4a62c075e	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-03 14:35:50.107438+00	
00000000-0000-0000-0000-000000000000	e66f20ef-68ff-46bf-ab2d-3a53bd18c1ef	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-03 15:35:04.582214+00	
00000000-0000-0000-0000-000000000000	c2e5ece8-bfbe-4f2d-8974-692bbaade3a4	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-03 15:35:04.619401+00	
00000000-0000-0000-0000-000000000000	d8bfc7d9-302e-4557-a980-64dc69ffe540	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-03 16:34:04.548819+00	
00000000-0000-0000-0000-000000000000	bc4ffc67-4257-4158-9b37-363a812b59ea	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-03 16:34:04.577335+00	
00000000-0000-0000-0000-000000000000	e0e2e3c7-d378-4eef-a458-20084294c4d3	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-04 00:10:49.552638+00	
00000000-0000-0000-0000-000000000000	b6a12579-5322-4221-8071-fe8677788a76	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-04 00:10:49.577985+00	
00000000-0000-0000-0000-000000000000	fcab122a-d3a3-403a-85a6-264f67ab95a8	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-04 08:54:24.793521+00	
00000000-0000-0000-0000-000000000000	073ec255-ecfd-42a8-a0b3-9a610edbb895	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-04 08:54:24.817929+00	
00000000-0000-0000-0000-000000000000	e2db5f1a-149f-4f46-a6cf-7af02433ba2b	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-04 18:50:14.885465+00	
00000000-0000-0000-0000-000000000000	feea5001-fe74-41a1-ac23-3af70f076bae	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-04 18:50:14.909541+00	
00000000-0000-0000-0000-000000000000	d507813d-ccd7-4efd-a330-02bc9685be51	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-04 19:49:14.621547+00	
00000000-0000-0000-0000-000000000000	85be329a-1f13-4ea2-ac1c-523e0e0c3b6d	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-04 19:49:14.658401+00	
00000000-0000-0000-0000-000000000000	b3abea11-8a6e-4192-ab77-3e7ed6ff8836	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-04 20:48:14.837087+00	
00000000-0000-0000-0000-000000000000	110b3648-9497-4cff-9854-7dd017a91f23	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-04 20:48:14.873071+00	
00000000-0000-0000-0000-000000000000	9cab4c79-b867-4b39-8747-c937e1bf4686	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-04 21:46:56.342865+00	
00000000-0000-0000-0000-000000000000	d414e777-ac62-4ea5-b3bc-c5fd5c40cb62	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-04 21:46:56.366219+00	
00000000-0000-0000-0000-000000000000	76cc1584-6646-4851-a60f-687ae58ef777	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 01:25:19.727426+00	
00000000-0000-0000-0000-000000000000	3fbe1ee5-30c7-40f7-a3b8-507d881b0e9a	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 01:25:19.747498+00	
00000000-0000-0000-0000-000000000000	103b032d-5597-4f77-ba82-3a0e3803d589	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 02:24:14.81076+00	
00000000-0000-0000-0000-000000000000	bc49c84a-dfc7-40e6-9ce8-bfc2077354c4	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 02:24:14.838137+00	
00000000-0000-0000-0000-000000000000	8a41b9cc-35ff-42ee-9e24-525b65757611	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 03:23:15.232927+00	
00000000-0000-0000-0000-000000000000	4e6c087b-3a71-4cc3-aff7-bb21978328bb	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 03:23:15.260905+00	
00000000-0000-0000-0000-000000000000	e6ecf1b8-590e-4644-8896-b2aae1932a44	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 04:22:14.823506+00	
00000000-0000-0000-0000-000000000000	cf3971aa-2368-4f1f-8397-4ee0c96663b8	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 04:22:14.838503+00	
00000000-0000-0000-0000-000000000000	5178b66c-9cbd-42a1-a9b5-2a4a5aa9cbbd	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 05:21:14.8763+00	
00000000-0000-0000-0000-000000000000	901e8361-b804-4e9c-add2-5dbe87e6756d	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 05:21:14.91443+00	
00000000-0000-0000-0000-000000000000	e54022cd-d66a-40a4-bffa-9624331b0e38	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 06:20:14.922829+00	
00000000-0000-0000-0000-000000000000	0da7bf96-92a9-455c-918f-3a3f7bcc1c0d	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 06:20:14.958102+00	
00000000-0000-0000-0000-000000000000	bb4649d9-8ddf-40ab-8218-f6cbd507ccf4	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 07:19:14.733547+00	
00000000-0000-0000-0000-000000000000	c5c0f0ed-c1b1-4212-ae85-492e2de97343	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 07:19:14.758144+00	
00000000-0000-0000-0000-000000000000	35262b5f-7b9d-482c-97b2-e005ff8cfe78	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 08:18:15.288436+00	
00000000-0000-0000-0000-000000000000	e5460c0d-8fc7-4c9d-8153-455dc207a388	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 08:18:15.315175+00	
00000000-0000-0000-0000-000000000000	b09b1c35-9286-4459-a1a1-5951747ef3bf	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 09:17:14.892644+00	
00000000-0000-0000-0000-000000000000	cc39a77c-da7f-45db-8a25-f55e06d689dc	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 09:17:14.921944+00	
00000000-0000-0000-0000-000000000000	7933de45-5456-4819-8407-5b5fcdf07731	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 10:16:14.803953+00	
00000000-0000-0000-0000-000000000000	a96c645d-e1b8-4f15-a10c-51b6ebc5e229	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 10:16:14.831028+00	
00000000-0000-0000-0000-000000000000	4fd74b18-9771-4047-9a2e-ef36deee103a	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 11:15:14.9926+00	
00000000-0000-0000-0000-000000000000	485cf17d-28ab-4974-b0ca-3ea64931c7c2	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 11:15:15.008891+00	
00000000-0000-0000-0000-000000000000	851e86fd-b8ab-4834-bac9-7fdf3bcd6a4b	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 12:14:15.31823+00	
00000000-0000-0000-0000-000000000000	df83833f-f8f4-4e9b-af13-6678f0bed1e8	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 12:14:15.34407+00	
00000000-0000-0000-0000-000000000000	4a6fc82f-cb24-4946-92c2-2261ec86e3a6	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 13:13:15.052046+00	
00000000-0000-0000-0000-000000000000	4acc62a4-c698-4f82-822d-e2188b96145f	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 13:13:15.078869+00	
00000000-0000-0000-0000-000000000000	3a16d765-1736-4b62-91c2-e397e1fe13e8	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 14:25:58.817908+00	
00000000-0000-0000-0000-000000000000	6db8bc91-4fef-4b19-b1fe-78995bd2a93a	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 14:25:58.840495+00	
00000000-0000-0000-0000-000000000000	3d4ffd16-829c-44a4-b782-dedf35561e4a	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 15:25:14.974622+00	
00000000-0000-0000-0000-000000000000	1c320ef8-5542-4135-9e38-8063203077ae	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 15:25:14.988897+00	
00000000-0000-0000-0000-000000000000	a03dc24a-14d6-47e5-bbfb-58175b303437	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 16:24:15.208509+00	
00000000-0000-0000-0000-000000000000	b4881045-ecbc-4f21-9d5f-77061635f656	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 16:24:15.226056+00	
00000000-0000-0000-0000-000000000000	3c2a8529-2b26-4915-b6d9-69ca5c5ea0e3	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 17:23:15.653886+00	
00000000-0000-0000-0000-000000000000	9384694f-32d9-458c-b496-df212a9d4bba	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 17:23:15.69103+00	
00000000-0000-0000-0000-000000000000	fa82faa4-4337-43cc-83a2-7bd331bdbb17	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 18:22:15.127802+00	
00000000-0000-0000-0000-000000000000	3cf297da-9476-43ee-a81f-d40ed06bf6dc	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 18:22:15.143636+00	
00000000-0000-0000-0000-000000000000	7421e532-036d-45a0-9435-ea6083b631ed	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 19:21:16.821814+00	
00000000-0000-0000-0000-000000000000	bd290da5-5e26-4aaa-872b-ba8dca555b93	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 19:21:16.842355+00	
00000000-0000-0000-0000-000000000000	fedb8572-b665-4a43-ba11-5342bef66f39	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 20:20:15.282947+00	
00000000-0000-0000-0000-000000000000	18f9a0a4-38a4-4a44-811b-fcbe0027cebe	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 20:20:15.304526+00	
00000000-0000-0000-0000-000000000000	1c43cf29-1d7b-47d0-a3e8-e944766acd56	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 21:19:15.578393+00	
00000000-0000-0000-0000-000000000000	95cb8e0a-c1e4-4388-938b-48b20a622181	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 21:19:15.605917+00	
00000000-0000-0000-0000-000000000000	a9c43734-7902-423a-a996-9e637a7ebed1	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 22:31:35.424957+00	
00000000-0000-0000-0000-000000000000	f52f33c1-03b5-452e-a73c-d83ba851b360	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-05 22:31:35.451388+00	
00000000-0000-0000-0000-000000000000	24f623b1-24d2-42e5-9285-b9672ec30df8	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-06 17:24:05.293157+00	
00000000-0000-0000-0000-000000000000	ba805abc-2c84-40fb-bcb8-6582128e4cf1	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-06 17:24:05.318431+00	
00000000-0000-0000-0000-000000000000	f55df0a3-4fbb-4d6e-b63d-7f9771c44010	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-06 18:22:30.173272+00	
00000000-0000-0000-0000-000000000000	354dbbc8-85d3-42f1-bbc8-c6084109a0d5	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-06 18:22:30.200226+00	
00000000-0000-0000-0000-000000000000	6153f106-a445-4de5-abda-abb4548e1e4d	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-06 19:20:53.884553+00	
00000000-0000-0000-0000-000000000000	e1c5a664-40ae-481b-ba1b-e0f1468986a8	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-06 19:20:53.904214+00	
00000000-0000-0000-0000-000000000000	919beb31-bbb9-449a-b1d1-43c3a27dcc2f	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-06 20:20:14.228724+00	
00000000-0000-0000-0000-000000000000	79cb3ccd-5737-4ea9-b02b-6f71b93ada9f	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-06 20:20:14.251234+00	
00000000-0000-0000-0000-000000000000	8318a654-9f0c-4fe1-92e9-f1c5ca6ef828	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-06 21:19:14.33015+00	
00000000-0000-0000-0000-000000000000	3b8f4a8e-796a-47f8-b705-9d40b7c43bae	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-06 21:19:14.357303+00	
00000000-0000-0000-0000-000000000000	452360c5-d52f-40b6-9607-c67c4d3ea096	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-06 22:17:32.963021+00	
00000000-0000-0000-0000-000000000000	5ce6d2a5-8961-43fc-a82e-429a40b83abb	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-06 22:17:33.004497+00	
00000000-0000-0000-0000-000000000000	e315ab1d-c8bc-48e5-967e-5f22f22f6de2	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-06 23:15:37.261321+00	
00000000-0000-0000-0000-000000000000	d5021317-764c-4212-9d2a-7b4d66056687	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-06 23:15:37.290881+00	
00000000-0000-0000-0000-000000000000	c0c952e1-816e-4d4a-a1c5-f53096f5d9be	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 00:14:14.26631+00	
00000000-0000-0000-0000-000000000000	14a6bdad-d88c-4ade-884b-2588a39cf94b	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 00:14:14.281357+00	
00000000-0000-0000-0000-000000000000	26f9ef22-64db-434f-b3c6-aa3bacc43f70	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 01:12:28.140303+00	
00000000-0000-0000-0000-000000000000	bf57de1e-1b96-442a-b90e-c741dcdf3568	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 01:12:28.175048+00	
00000000-0000-0000-0000-000000000000	c0902034-e867-4a8f-9a1d-7bc1f4d33f82	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 02:10:58.578656+00	
00000000-0000-0000-0000-000000000000	5e83945b-a10a-4208-b9ee-12c5cdb8aa30	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 02:10:58.604272+00	
00000000-0000-0000-0000-000000000000	048e9b2e-6502-46c7-bc00-5ce69b115084	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 03:09:28.101551+00	
00000000-0000-0000-0000-000000000000	4ad244ea-a475-4b35-9254-95d8223345ce	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 03:09:28.128668+00	
00000000-0000-0000-0000-000000000000	4b4c68ae-935e-48c0-98f7-696178c72504	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 04:08:14.441411+00	
00000000-0000-0000-0000-000000000000	d5e04e0f-b835-4870-b221-2bd3cfd8c750	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 04:08:14.478095+00	
00000000-0000-0000-0000-000000000000	c0e13ec2-0983-4777-bd59-9b78dc00b48b	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 05:07:14.463075+00	
00000000-0000-0000-0000-000000000000	b8fd9001-72c6-4c14-87ed-cdcb5ecc119c	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 05:07:14.488393+00	
00000000-0000-0000-0000-000000000000	8dd1c4c7-23e0-48fe-ab39-bfa20ae99b7c	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 06:06:14.481003+00	
00000000-0000-0000-0000-000000000000	b60f4112-1592-48b1-96d2-a5c5a235cf26	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 06:06:14.505255+00	
00000000-0000-0000-0000-000000000000	d6c35ddd-2082-4759-a5e5-26a1b82987fc	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 07:05:14.500506+00	
00000000-0000-0000-0000-000000000000	fe3433cd-33ee-4ea9-b290-c021b7d5a0e4	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 07:05:14.52176+00	
00000000-0000-0000-0000-000000000000	7bab6615-fbc9-4f35-9400-a4bc370e7211	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 08:04:14.720899+00	
00000000-0000-0000-0000-000000000000	85689c63-3458-4813-b5da-b64d3960de28	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 08:04:14.765097+00	
00000000-0000-0000-0000-000000000000	fd27482b-36b2-4bda-9fc7-a6df58ad9f63	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 09:03:14.673177+00	
00000000-0000-0000-0000-000000000000	b1dc40ec-6bdc-456d-94c9-79fa75bf541a	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 09:03:14.690958+00	
00000000-0000-0000-0000-000000000000	d5d5bf93-8d60-47a2-9688-2663310a0720	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 10:02:14.567575+00	
00000000-0000-0000-0000-000000000000	840d898d-145b-4bd4-ab43-ff689ce17006	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 10:02:14.586918+00	
00000000-0000-0000-0000-000000000000	ac4da02e-de76-4f6e-bb11-fdc89392d568	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 11:01:14.595441+00	
00000000-0000-0000-0000-000000000000	5133b23a-4e98-4bbc-9784-141d329e4979	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 11:01:14.617175+00	
00000000-0000-0000-0000-000000000000	d4f61448-4432-4b14-b978-c2c29d6f49c1	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 12:00:14.976167+00	
00000000-0000-0000-0000-000000000000	20179b76-2fe8-4352-ad97-2106de1fb03c	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 12:00:14.999571+00	
00000000-0000-0000-0000-000000000000	dc0b4c54-5046-4120-b8d7-81a232bc1945	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 12:59:14.642828+00	
00000000-0000-0000-0000-000000000000	7474b313-a0ef-4e4e-ba4c-8e690e55957a	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 12:59:14.668816+00	
00000000-0000-0000-0000-000000000000	0ef4d781-f45d-4293-834d-290e2f339e8a	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 13:58:14.7411+00	
00000000-0000-0000-0000-000000000000	aba3f221-8453-4178-b8bb-934e67867b1b	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 13:58:14.768651+00	
00000000-0000-0000-0000-000000000000	28cb38d0-2202-49d6-b805-e19f9a912c64	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 14:57:14.713413+00	
00000000-0000-0000-0000-000000000000	9f4d393a-996f-46d2-bcd7-594e0ff7dd8b	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 14:57:14.738771+00	
00000000-0000-0000-0000-000000000000	c8233aa9-34e5-41d6-b6a0-6e694b96172d	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 15:56:14.665466+00	
00000000-0000-0000-0000-000000000000	ee2f058f-9473-4522-8913-d3c3529ecb2d	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 15:56:14.68958+00	
00000000-0000-0000-0000-000000000000	c044ee85-1024-4cbb-b588-6f1630b963d8	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 16:55:15.165604+00	
00000000-0000-0000-0000-000000000000	e21edc51-145d-48ed-9cc3-aff56d1984c8	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 16:55:15.189908+00	
00000000-0000-0000-0000-000000000000	5f1c1e0a-3cdd-4795-a16f-4952679ca8c9	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 17:54:14.653431+00	
00000000-0000-0000-0000-000000000000	071cc721-a1c3-41a4-9bd2-fc1290832edc	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 17:54:14.671664+00	
00000000-0000-0000-0000-000000000000	ca162203-b9cd-4c32-9eef-4c597538e50b	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 18:53:14.815695+00	
00000000-0000-0000-0000-000000000000	face9d03-6b9a-4eee-8f50-0b6d04864944	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 18:53:14.840591+00	
00000000-0000-0000-0000-000000000000	9a63eb1a-0ffb-4e36-8481-d23dceff1d96	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 19:52:15.184214+00	
00000000-0000-0000-0000-000000000000	6ea89c34-7eba-4501-b4fa-9324a20d0178	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 19:52:15.206123+00	
00000000-0000-0000-0000-000000000000	85a64675-6fe6-41f4-a227-5cecb91dfd73	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 20:51:15.030883+00	
00000000-0000-0000-0000-000000000000	eb84cb20-a54c-46cd-9abe-eb75e2ca9aab	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 20:51:15.056269+00	
00000000-0000-0000-0000-000000000000	a68b8032-5ac2-48b4-8dfc-bf2a7a089c35	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 21:50:15.162728+00	
00000000-0000-0000-0000-000000000000	edfd0afa-816e-44c4-8e17-b3494d7148ff	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 21:50:15.194351+00	
00000000-0000-0000-0000-000000000000	f67bcdab-4e2f-4a6c-9633-52b9d02ee0c2	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 22:49:15.166521+00	
00000000-0000-0000-0000-000000000000	903fc2d6-c6e8-404e-8e62-6df02062da00	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 22:49:15.192153+00	
00000000-0000-0000-0000-000000000000	22f24497-ca25-4a4d-ab04-cd0b607ec5dc	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 23:48:14.841042+00	
00000000-0000-0000-0000-000000000000	52f27288-c4ae-46c9-9b38-620d0210ccd3	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-07 23:48:14.869486+00	
00000000-0000-0000-0000-000000000000	f8204013-50f1-48a3-a994-a2681ca958ca	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-08 00:54:21.469986+00	
00000000-0000-0000-0000-000000000000	cd25f51d-f782-4e66-ab6d-45e7ed555a2b	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-08 00:54:21.490889+00	
00000000-0000-0000-0000-000000000000	de9872e9-dc80-4cc2-ada0-77a703188b36	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-08 01:53:01.984655+00	
00000000-0000-0000-0000-000000000000	55af51b1-10bc-419a-82a0-05fea6a6a478	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-08 01:53:02.010434+00	
00000000-0000-0000-0000-000000000000	dbdf0da6-a1d8-41c5-b7a0-b2bfbbf9443f	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-08 02:52:15.437633+00	
00000000-0000-0000-0000-000000000000	d737e1b1-0347-4add-a988-a6c0e1b477ba	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-08 02:52:15.465995+00	
00000000-0000-0000-0000-000000000000	40808556-3b7c-4b4e-918a-c24cb26b6925	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-08 08:06:22.72083+00	
00000000-0000-0000-0000-000000000000	3fd9d6ca-f06c-4eca-9a64-798174e1496c	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-08 08:06:22.744282+00	
00000000-0000-0000-0000-000000000000	8aeca375-773b-4821-9755-fa944a7b5774	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-08 16:59:24.266005+00	
00000000-0000-0000-0000-000000000000	7fa6024b-92ad-4e01-ba34-3128ce984aaf	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-08 16:59:24.281107+00	
00000000-0000-0000-0000-000000000000	f9129c4d-367e-410e-8def-709db6df08e1	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-08 17:57:37.45717+00	
00000000-0000-0000-0000-000000000000	13966990-dd21-48cc-a22a-19bd283b60bb	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-08 17:57:37.484507+00	
00000000-0000-0000-0000-000000000000	a9bd8ddd-5844-43a4-8ee3-617d1221e178	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-08 18:55:42.167826+00	
00000000-0000-0000-0000-000000000000	b8e992ea-1043-44ec-9ab1-de42178000a0	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-08 18:55:42.192165+00	
00000000-0000-0000-0000-000000000000	dc49d675-2e40-458a-9c48-fc539c8c6e3d	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-09 00:12:16.708256+00	
00000000-0000-0000-0000-000000000000	a52cd3c4-34b5-4b4d-aca2-4cc34a2a651a	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-09 00:12:16.72115+00	
00000000-0000-0000-0000-000000000000	297ffbcf-d46b-42d4-b223-bfbc7f4a72aa	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-09 01:10:28.387695+00	
00000000-0000-0000-0000-000000000000	9a60155e-32a4-4bc3-8fec-3ca5ade6c9a2	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-09 01:10:28.403065+00	
00000000-0000-0000-0000-000000000000	f32dd37e-783b-47c2-8ba8-29adf7081671	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-09 01:53:07.648552+00	
00000000-0000-0000-0000-000000000000	b86f3a38-3c47-4a4d-8765-d57a3b5b9d44	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-09 01:53:07.664961+00	
00000000-0000-0000-0000-000000000000	0b6003ac-d0cc-4169-9232-3c5d0c5279ac	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-09 02:09:14.960333+00	
00000000-0000-0000-0000-000000000000	fe76bf0d-a520-4ecf-ba21-6d5289944962	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-09 02:09:14.977104+00	
00000000-0000-0000-0000-000000000000	4467b075-a3f1-4db0-9dfa-30788ffaa6e6	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-09 03:07:29.573724+00	
00000000-0000-0000-0000-000000000000	b19a5c9d-ac96-449f-a4f7-57528318e041	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-09 03:07:29.608369+00	
00000000-0000-0000-0000-000000000000	04f54fbe-3b03-4504-a3bc-58d5502b5d6e	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-09 03:42:05.348524+00	
00000000-0000-0000-0000-000000000000	a7c0086d-3957-4ce6-8f55-02cd7588e119	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-09 03:42:05.368066+00	
00000000-0000-0000-0000-000000000000	4f784d86-1356-47c8-aa71-592695f7b6a0	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-09 14:15:37.384582+00	
00000000-0000-0000-0000-000000000000	2baac505-457d-4e45-9b69-8b82eac120d6	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-09 14:15:37.409072+00	
00000000-0000-0000-0000-000000000000	5e5b104e-940c-4d9a-9717-b2a556c2c3c4	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-09 15:14:14.677439+00	
00000000-0000-0000-0000-000000000000	2740ea56-9551-426c-9dcf-17df80f03ff3	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-09 15:14:14.690111+00	
00000000-0000-0000-0000-000000000000	9deff64b-14eb-428a-8884-e8d5de035932	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-09 22:40:37.146446+00	
00000000-0000-0000-0000-000000000000	87458557-7864-49c1-9af2-51911fa337cf	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-09 22:40:37.173329+00	
00000000-0000-0000-0000-000000000000	4405326a-4750-48df-b8b6-feae9e13b814	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-09 23:39:18.524883+00	
00000000-0000-0000-0000-000000000000	792d5d7a-2b67-495b-bc41-19dcb413c399	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-09 23:39:18.55119+00	
00000000-0000-0000-0000-000000000000	c0b36e61-cea7-4549-bdd6-2285514d0727	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-10 00:38:15.028319+00	
00000000-0000-0000-0000-000000000000	fe30e39c-cd7c-4dbf-bdec-e8cf8367732e	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-10 00:38:15.050712+00	
00000000-0000-0000-0000-000000000000	6cc780c8-93e1-4e11-95b6-646e7cda1427	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-10 01:37:14.935945+00	
00000000-0000-0000-0000-000000000000	95f4e0ba-0e19-4033-8dbd-b08e30fee5d4	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-10 01:37:14.963218+00	
00000000-0000-0000-0000-000000000000	8dcff294-764e-43fc-ae1f-aee8cc7f9b19	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-10 02:36:15.010817+00	
00000000-0000-0000-0000-000000000000	1b2fd1b8-22e7-4245-861f-0ecb78f5d1cf	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-10 02:36:15.033306+00	
00000000-0000-0000-0000-000000000000	78d6cbb1-9541-4832-a452-41f4875c9425	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-10 17:02:49.004739+00	
00000000-0000-0000-0000-000000000000	e996dba5-fbea-4f33-bdb5-b044597c85e3	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-10 17:02:49.027866+00	
00000000-0000-0000-0000-000000000000	960302d2-0d2d-4dbe-94f9-f7d3b16013ff	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-10 17:22:19.432535+00	
00000000-0000-0000-0000-000000000000	fb58d2c4-a008-4c0c-9697-749fdd1c672e	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-10 17:22:19.446697+00	
00000000-0000-0000-0000-000000000000	a7257adf-dba2-4d36-b775-9f88d3a903aa	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-10 18:01:38.639079+00	
00000000-0000-0000-0000-000000000000	79d4a312-481f-4889-bf01-5a1eb23930c0	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-10 18:01:38.661483+00	
00000000-0000-0000-0000-000000000000	61f70043-8566-4a34-9b7f-12f9b49f2ad7	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-10 19:00:38.823583+00	
00000000-0000-0000-0000-000000000000	3db82303-662b-4d59-838f-e8c2ea646c24	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-10 19:00:38.846997+00	
00000000-0000-0000-0000-000000000000	d31ed413-6fd2-42aa-a487-e9b69366f65f	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-11 17:38:02.620734+00	
00000000-0000-0000-0000-000000000000	c6bb366c-871c-4cf0-803d-bb9531c5ab7c	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-11 17:38:02.640418+00	
00000000-0000-0000-0000-000000000000	2f005a98-dfa3-4316-87a8-d8859908173b	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-11 22:37:45.90997+00	
00000000-0000-0000-0000-000000000000	14144e32-e8f1-47bf-b919-6296377448b5	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-11 22:37:45.932497+00	
00000000-0000-0000-0000-000000000000	462e6869-ccfe-4f96-9dbd-b2df960a5ddf	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-11 22:44:51.600897+00	
00000000-0000-0000-0000-000000000000	e76d6b36-7e8a-4b6f-809b-b02a94aee97e	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-11 22:44:51.613718+00	
00000000-0000-0000-0000-000000000000	65f3cabe-30d0-4ee1-804c-fcb8df29de30	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-11 23:35:58.293155+00	
00000000-0000-0000-0000-000000000000	de1ed4f5-fff8-4a72-bbc0-f1d4d155c0ac	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-11 23:35:58.321826+00	
00000000-0000-0000-0000-000000000000	6f757323-7ca7-4943-8e8c-c75f985e8caf	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-11 23:59:09.351497+00	
00000000-0000-0000-0000-000000000000	d59447af-ba6f-4759-885e-0217b0d17967	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-11 23:59:09.371868+00	
00000000-0000-0000-0000-000000000000	bddf9113-04eb-4655-9991-7fd47d3c5e64	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-12 00:34:29.873219+00	
00000000-0000-0000-0000-000000000000	87a7ba61-4afe-45d8-8052-8448f11db8ac	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-12 00:34:29.891241+00	
00000000-0000-0000-0000-000000000000	cfe9f7a9-579a-43da-8a96-e0c80b2bb98f	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-12 01:33:30.273596+00	
00000000-0000-0000-0000-000000000000	19e44bdc-3c79-46a4-8f1d-358557b773ba	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-12 01:33:30.295955+00	
00000000-0000-0000-0000-000000000000	cd7e3694-45ef-47c4-8e4b-66e4455f91ba	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-12 02:14:16.071883+00	
00000000-0000-0000-0000-000000000000	3389cb59-9b58-43f1-90ad-100645bb5319	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-12 02:14:16.093454+00	
00000000-0000-0000-0000-000000000000	d5b71117-daab-46cc-89cc-9f35e3e5be04	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-12 02:32:30.23271+00	
00000000-0000-0000-0000-000000000000	2db50ad6-9261-473f-81f5-06adb929794e	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-12 02:32:30.244014+00	
00000000-0000-0000-0000-000000000000	73180199-4517-43ca-a211-fb0759f86390	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-12 03:31:30.071846+00	
00000000-0000-0000-0000-000000000000	a9a6df68-9e30-4d64-beab-a0db998ef583	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-12 03:31:30.102617+00	
00000000-0000-0000-0000-000000000000	8cb8ddea-d84f-4c27-8331-b48f4a2137ed	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-12 04:30:29.91593+00	
00000000-0000-0000-0000-000000000000	91e52c08-b8ad-4f9c-8f4d-cd3876680db0	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-12 04:30:29.937275+00	
00000000-0000-0000-0000-000000000000	b774bf42-e34a-4a19-a7cc-bd388e3b5bfe	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-12 05:29:29.821989+00	
00000000-0000-0000-0000-000000000000	fde46468-3fcf-456d-919a-a24fb617164d	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-12 05:29:29.852827+00	
00000000-0000-0000-0000-000000000000	ba960fa5-5cde-46ff-8784-8e1c34c7272b	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-12 06:28:30.432856+00	
00000000-0000-0000-0000-000000000000	7e3eb5b7-f10e-45e9-ac62-f75d56cfd9bb	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-12 06:28:30.464273+00	
00000000-0000-0000-0000-000000000000	9227df0b-ee69-40df-abc5-b1e4a4f54dfc	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-12 07:27:29.890383+00	
00000000-0000-0000-0000-000000000000	5343b62e-f139-487b-a048-5165a3299b19	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-12 07:27:29.914086+00	
00000000-0000-0000-0000-000000000000	16c9e474-e4c6-4032-9616-756667e15ae5	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-12 08:26:30.012663+00	
00000000-0000-0000-0000-000000000000	4546e0be-c88c-4be1-b02b-178f2cc39142	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-12 08:26:30.042615+00	
00000000-0000-0000-0000-000000000000	8d718b8f-84d5-45fa-85a4-087c94561154	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-12 09:25:29.951245+00	
00000000-0000-0000-0000-000000000000	cb4d4220-5121-4b6c-bcf6-b83e49b2c2fd	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-12 09:25:29.965535+00	
00000000-0000-0000-0000-000000000000	703fb263-0f48-4320-93cc-96645b934657	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-12 12:14:19.338986+00	
00000000-0000-0000-0000-000000000000	0067e0fc-aa09-4699-bd12-d84c3b1faef3	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-12 12:14:19.365718+00	
00000000-0000-0000-0000-000000000000	28cd8de8-37bb-4ef4-9ace-0c624c53259a	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-15 13:17:54.64037+00	
00000000-0000-0000-0000-000000000000	b930652d-d706-4d5c-862b-3a60536a59f3	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-15 13:17:54.667645+00	
00000000-0000-0000-0000-000000000000	c06ceb21-7b9c-474d-a639-5a49777fe755	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-15 14:16:30.712364+00	
00000000-0000-0000-0000-000000000000	0eab21a3-ef40-4107-a453-d076a38abd01	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-15 14:16:30.739337+00	
00000000-0000-0000-0000-000000000000	caff43b1-2f66-4746-bc92-e0c00f9a1d98	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-15 15:15:30.393659+00	
00000000-0000-0000-0000-000000000000	ce58f342-72ba-4ccf-9b34-de382a136d6d	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-15 15:15:30.422721+00	
00000000-0000-0000-0000-000000000000	2d75d32b-8381-4933-bad5-b7ba1cf1a23f	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-15 16:14:23.307858+00	
00000000-0000-0000-0000-000000000000	28368a01-30a5-41e7-9e8b-9429e0b55ce7	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-15 16:14:23.334517+00	
00000000-0000-0000-0000-000000000000	004c7b23-6265-4d2c-9ad7-468dbaff45bc	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-15 17:13:30.413206+00	
00000000-0000-0000-0000-000000000000	07ce2cac-64b3-4a34-8d3a-358c2c67dc52	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-15 17:13:30.438228+00	
00000000-0000-0000-0000-000000000000	03bdf791-1281-4d6c-8b30-6d992fae8496	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-15 18:15:10.198035+00	
00000000-0000-0000-0000-000000000000	9d8b1610-555f-4022-9c91-fbd3f1b4ce93	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-15 18:15:10.224958+00	
00000000-0000-0000-0000-000000000000	83b6d1c3-4045-42d4-b5cc-12423d4fb364	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-15 19:13:24.587922+00	
00000000-0000-0000-0000-000000000000	e1f79367-5982-407e-b979-5a3769e36254	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-15 19:13:24.626249+00	
00000000-0000-0000-0000-000000000000	2ed4cd73-f3c7-44b6-8d37-989125e2cdaf	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-15 20:12:30.527787+00	
00000000-0000-0000-0000-000000000000	5c4bc039-ff31-4867-9160-386f79990ff3	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-15 20:12:30.551879+00	
00000000-0000-0000-0000-000000000000	3f0afa3a-6833-44f0-a7d1-7079cd8173bb	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-15 21:11:30.794043+00	
00000000-0000-0000-0000-000000000000	ec42680e-480d-4956-975a-144c8a9f9482	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-15 21:11:30.82263+00	
00000000-0000-0000-0000-000000000000	be4c0929-2738-4a01-9bb5-3a3e70a7b310	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-15 22:10:30.971776+00	
00000000-0000-0000-0000-000000000000	06063885-2277-4242-8e72-011c93bc9975	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-15 22:10:30.992746+00	
00000000-0000-0000-0000-000000000000	8b3501e0-08b9-4e30-8edc-133713a05b71	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-15 23:09:30.402583+00	
00000000-0000-0000-0000-000000000000	a9eb1267-932d-4a38-a7af-0e093ab3d70d	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-15 23:09:30.417206+00	
00000000-0000-0000-0000-000000000000	8794b843-815a-4b41-9102-2f595736090b	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 00:08:31.031355+00	
00000000-0000-0000-0000-000000000000	917562cb-7d3d-48e7-b9af-86ebfd57b16b	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 00:08:31.057038+00	
00000000-0000-0000-0000-000000000000	113727a6-697e-4e6b-9a99-bd86b3561b15	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 01:07:30.459056+00	
00000000-0000-0000-0000-000000000000	e7716cee-5a52-4d24-9138-633a2531d9c7	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 01:07:30.481778+00	
00000000-0000-0000-0000-000000000000	d74e7683-d150-4888-81c3-c58a3194cc88	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 13:09:47.509623+00	
00000000-0000-0000-0000-000000000000	b1cdb8f9-e031-4775-84f7-151512864287	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 13:09:47.540412+00	
00000000-0000-0000-0000-000000000000	a05ed336-75da-486d-8132-93fe2e25d472	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 15:08:15.557499+00	
00000000-0000-0000-0000-000000000000	7ee9da69-9f7c-4084-b123-706f5daec820	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 15:08:15.579439+00	
00000000-0000-0000-0000-000000000000	f92b742a-0042-4d2e-9ae6-caecd8e41f8a	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 19:38:56.725906+00	
00000000-0000-0000-0000-000000000000	65525f8a-db31-4f8b-a862-a65fcee08d01	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 19:38:56.748635+00	
00000000-0000-0000-0000-000000000000	f8326cdc-befa-4168-9636-fad13ebd733c	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-17 14:12:41.65973+00	
00000000-0000-0000-0000-000000000000	4bba2767-cd3a-43be-8f49-27633fa0c632	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-17 14:12:41.687444+00	
00000000-0000-0000-0000-000000000000	1bc6b70a-3962-45bf-a2c7-3f89cdadfd29	{"action":"user_recovery_requested","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-12-17 14:13:48.337656+00	
00000000-0000-0000-0000-000000000000	93bf34f2-4d68-4599-a84d-594dcbcbcf35	{"action":"login","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-12-17 14:14:05.859846+00	
00000000-0000-0000-0000-000000000000	e059be50-7b99-4e99-a4cb-00a3ea1eba04	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-17 14:14:28.694257+00	
00000000-0000-0000-0000-000000000000	b31d3fc7-71df-4c57-88ef-0ecbc14e699a	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-17 14:14:28.695261+00	
00000000-0000-0000-0000-000000000000	9dd59bff-7384-4c73-8854-8bb4b22ad881	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-17 15:11:50.502051+00	
00000000-0000-0000-0000-000000000000	5f62e61f-9bb4-408b-848a-a38645feb7d0	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-17 15:11:50.521468+00	
00000000-0000-0000-0000-000000000000	4f1abc16-f936-41ba-8d53-fc36d45488d2	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-17 16:10:34.499425+00	
00000000-0000-0000-0000-000000000000	1c2e1985-6fd8-4183-b519-3117fb6e61ae	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-17 16:10:34.519148+00	
00000000-0000-0000-0000-000000000000	3e2f4ef0-4fc7-4de5-8142-d60a0d61361b	{"action":"token_refreshed","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-17 17:41:07.271168+00	
00000000-0000-0000-0000-000000000000	30e0a9f4-5161-45bc-a9a0-cf6546932321	{"action":"token_revoked","actor_id":"dd617cd5-2370-49b5-aee2-675ab6c6841d","actor_username":"clark.dwayne@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-17 17:41:07.29996+00	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
dd617cd5-2370-49b5-aee2-675ab6c6841d	dd617cd5-2370-49b5-aee2-675ab6c6841d	{"sub": "dd617cd5-2370-49b5-aee2-675ab6c6841d", "email": "clark.dwayne@gmail.com", "email_verified": true, "phone_verified": false}	email	2025-11-19 22:18:00.499644+00	2025-11-19 22:18:00.499694+00	2025-11-19 22:18:00.499694+00	58a3a7ae-37f0-43b2-be57-dfed13a29e6c
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
c9a5286f-93d0-400b-b977-c544984ea1ba	2025-11-19 22:43:04.300323+00	2025-11-19 22:43:04.300323+00	otp	a6b13329-e2cb-4b84-b0b1-2bb6c6523318
9062f95e-2071-48ca-b0ab-a0a8ad3fa9a6	2025-11-19 22:43:43.335371+00	2025-11-19 22:43:43.335371+00	password	ba786be8-df97-4904-8226-915748fc280d
a48b1fcc-31cb-4867-a4b6-7c14a24e4763	2025-11-19 22:44:02.650678+00	2025-11-19 22:44:02.650678+00	otp	041e8c21-7bf2-4217-b9cf-83c4c14ae3a1
74c54320-eb22-4263-8e82-04599f52f62f	2025-11-19 23:25:56.102405+00	2025-11-19 23:25:56.102405+00	password	b750e143-4b00-4b21-b2b8-e59ecf29a096
144da480-1546-4017-833e-879039ae3e64	2025-11-19 23:26:10.610011+00	2025-11-19 23:26:10.610011+00	password	78cf9a24-5f15-4816-b51b-4a47573a68da
533fdacc-7226-4197-ad41-5410f78ffcc2	2025-11-19 23:26:23.450738+00	2025-11-19 23:26:23.450738+00	password	1958504a-28e2-4b5d-974d-07e5eed5a850
6c0ab737-a859-41ac-8d0e-f782d5953f9d	2025-11-19 23:26:26.326337+00	2025-11-19 23:26:26.326337+00	password	58bcb762-6f11-4f48-8454-99d9c6c1a127
4533be06-bc10-4659-9843-dafa0082af00	2025-11-20 12:50:35.327405+00	2025-11-20 12:50:35.327405+00	password	1f03eb44-f768-4616-b9d2-d6d288aca09f
18ea0def-662b-43a1-8a9b-9311840b5888	2025-11-20 12:50:55.660146+00	2025-11-20 12:50:55.660146+00	password	bfdf5d69-8563-47f4-acf8-294715ee819a
1fdb4cc2-0719-40bb-9927-275a8604003e	2025-11-20 12:57:55.667714+00	2025-11-20 12:57:55.667714+00	password	3642fed1-4a8d-4353-a962-a7dc8d24cd48
ad101060-b7a2-4e3d-8947-eb78eb571f9a	2025-11-20 12:58:16.185223+00	2025-11-20 12:58:16.185223+00	otp	34a2b3c5-adba-4506-bc32-c272dfe8138b
45974117-8ad5-474b-95f4-71d4cefddefa	2025-11-20 16:43:04.669093+00	2025-11-20 16:43:04.669093+00	password	5a5d3fd9-bdc6-4185-967e-71bd69b23ba0
66f47fbb-cd7b-49bf-9997-4da6d4aa3293	2025-11-20 16:43:12.745348+00	2025-11-20 16:43:12.745348+00	password	220eaf82-002d-4afe-a2f6-550536afa52a
84297508-ee69-4e53-a879-46daed5ab5be	2025-11-20 16:43:30.206024+00	2025-11-20 16:43:30.206024+00	password	8d961849-fc66-42e3-9d35-d4d35a042887
3fc6d3e9-83f4-4e7d-9ec0-94a303af74f7	2025-11-20 17:07:42.566951+00	2025-11-20 17:07:42.566951+00	password	c5f12311-065a-4ea6-bf9c-44a76f97497d
205115c2-053a-461b-a448-e9f2e776dda7	2025-11-20 17:12:36.68361+00	2025-11-20 17:12:36.68361+00	password	6437f698-0ad1-4c32-93c1-0998a386d09b
23b76731-da10-42ae-86c1-e9d4129653e2	2025-11-20 17:13:27.480227+00	2025-11-20 17:13:27.480227+00	otp	cae67764-e6dd-4112-b9b9-0c551b49239d
5568e040-198b-4cb9-89ac-30b66862e37a	2025-11-20 17:14:07.650535+00	2025-11-20 17:14:07.650535+00	otp	f12c2c98-c6f0-49a6-b7ee-1c8c47b05f09
f4ef9122-4532-4043-b5a2-74325637dea2	2025-11-20 17:15:02.684494+00	2025-11-20 17:15:02.684494+00	password	efd962c2-7ad4-4180-95e5-ef272b165d57
b206d842-8870-4dcf-907b-76c8cce827f7	2025-11-20 17:20:04.177471+00	2025-11-20 17:20:04.177471+00	otp	97cea125-88b4-4015-8b0c-3ae4c754127c
0f584b07-5afd-47bf-9e4b-82b918802b7e	2025-11-20 17:23:35.565169+00	2025-11-20 17:23:35.565169+00	otp	65f4f694-ea39-4446-922f-17ef9a7ce208
3e35b7d8-288a-4ace-9e80-4ea7566827eb	2025-11-20 19:27:28.376965+00	2025-11-20 19:27:28.376965+00	otp	55d43894-db45-4b74-b42a-75910676a781
03c03f60-6243-49a8-b09a-36d954fb10e7	2025-11-20 19:32:05.101098+00	2025-11-20 19:32:05.101098+00	otp	a0d2dd3b-eab7-4f3e-a28e-6cfbcdebc9c2
c519edea-c1d5-4028-90b2-1bdfa0c8901b	2025-11-21 19:48:49.897781+00	2025-11-21 19:48:49.897781+00	password	d9feae2e-42b5-4acf-946d-f9406225ce95
c00af208-ec02-4223-83c9-8e8703b339cd	2025-11-21 19:49:14.03913+00	2025-11-21 19:49:14.03913+00	password	68501bca-36fc-4df7-a6d3-a5d7397e42a2
92600db8-c501-4b52-9ab2-0e3777a678b0	2025-11-21 20:08:33.461662+00	2025-11-21 20:08:33.461662+00	password	122e4ba3-325b-46bd-8817-dc1e37ed83d1
a8a3c516-f484-4740-8827-cbdb580161ab	2025-11-21 20:09:43.03113+00	2025-11-21 20:09:43.03113+00	password	c72dbad0-ccde-4ad3-a350-bcf4d1dc65e0
4b4b6732-0e07-40ac-9920-471704eb0d45	2025-11-21 20:11:49.554219+00	2025-11-21 20:11:49.554219+00	otp	65cee88a-72e5-4e66-9244-ae30792ae749
c0cc0f45-5555-45a4-a4c2-5c15810d8ebf	2025-11-23 18:03:12.187746+00	2025-11-23 18:03:12.187746+00	password	c1a6051e-a4ae-47be-95fd-866f9ba5fb63
e374c36e-c8be-47b8-95e9-d73fac6609f6	2025-11-24 16:01:15.457123+00	2025-11-24 16:01:15.457123+00	password	752ca551-33bf-4c1e-90c3-284d7e462f9b
e8cbe865-9fd0-4893-905c-f261924eb5c1	2025-11-24 16:03:07.419686+00	2025-11-24 16:03:07.419686+00	otp	623a6fd0-c5cb-467e-9cb7-ee446c542eb3
fbebdc80-42db-4c98-acf9-8370cf0cb952	2025-11-24 16:04:11.905052+00	2025-11-24 16:04:11.905052+00	password	73294888-0a01-41d9-b181-49996bd64c44
7968c48e-f01c-4eed-b1dc-ae4ae1523862	2025-11-24 16:06:48.970078+00	2025-11-24 16:06:48.970078+00	otp	254551da-fcfb-4a48-88bf-eeaef7214058
2e5a97cb-9ce3-4f0b-b880-9e574fddc339	2025-11-24 16:13:09.030557+00	2025-11-24 16:13:09.030557+00	otp	645f9131-c2f0-499a-8a8d-a4c82bec57b8
1eb3e9ed-11d9-40b9-88cc-06a227a242e5	2025-11-24 16:15:38.490111+00	2025-11-24 16:15:38.490111+00	password	3c25b60d-391f-47d1-80e9-bbbefd4b9b0e
493ec0c6-c409-49e4-83d0-7af8a5268e7a	2025-11-24 16:15:58.208198+00	2025-11-24 16:15:58.208198+00	otp	baab549b-7f82-450d-b8b0-dee37f8ce5a0
c21a188b-c60e-480d-8028-ec4ef54803bd	2025-11-24 16:24:11.021408+00	2025-11-24 16:24:11.021408+00	otp	def5a49f-0f0e-476a-b141-43bad13344df
25aebd38-321c-477a-9b14-0c423109372c	2025-11-24 17:28:25.705558+00	2025-11-24 17:28:25.705558+00	otp	9a2a70b0-af62-4084-b8e0-340e86e00638
58dfd4f2-61f4-4f4e-92cb-2fb28db50de9	2025-11-24 17:31:03.570386+00	2025-11-24 17:31:03.570386+00	otp	18bd8668-0f18-4613-9ab8-1eb6efb15469
4003266b-b794-4dc7-beb6-f3fe2ab6a9e2	2025-11-24 17:32:30.893284+00	2025-11-24 17:32:30.893284+00	otp	3a6682a2-b90a-4d6a-980f-bef76ce41e75
77214eee-97d5-4389-9ddb-1120160d6762	2025-11-24 17:33:49.562948+00	2025-11-24 17:33:49.562948+00	otp	94557c6a-e6f7-4fa7-9852-96033f8c53fe
71199c4b-12ba-4f2c-b649-e4f8b65bfb53	2025-11-24 17:41:01.274177+00	2025-11-24 17:41:01.274177+00	password	1c1acf22-f0ab-4989-9ee4-4a90551fa2bb
9d36a5c2-ecfc-4daa-831e-b600be1c42c5	2025-11-24 17:41:38.334931+00	2025-11-24 17:41:38.334931+00	password	325b0d39-5700-4702-862e-40b3eff95dff
baa1c677-b431-4869-ab4d-12c69d7b4dd3	2025-11-24 17:43:05.612067+00	2025-11-24 17:43:05.612067+00	otp	7f0f08ed-f427-4e4b-8db7-c89dcf70e977
81400c58-75a4-4b68-9556-d365280feeb6	2025-11-24 17:44:05.766075+00	2025-11-24 17:44:05.766075+00	otp	7d0cff51-3bb5-458c-a36d-55d224e07ded
d129be9f-6e78-49b0-b629-988592f9f17d	2025-11-24 17:54:01.137773+00	2025-11-24 17:54:01.137773+00	otp	8372cf8f-c46c-4c56-8cf4-bd47f79a37c8
5f123bbe-c7c7-4972-a673-df0aa793737e	2025-11-24 17:57:40.95015+00	2025-11-24 17:57:40.95015+00	password	eac487ac-d024-47a4-a2ff-97a19a0d38f3
9350fa7e-360a-436d-85a6-1d606db0b65f	2025-11-24 17:58:48.924138+00	2025-11-24 17:58:48.924138+00	otp	d2291509-7f91-4752-bd61-af65523dd8b3
24d12a59-cfc4-4d1e-b859-f56d4008cfc4	2025-11-24 18:06:50.467378+00	2025-11-24 18:06:50.467378+00	password	932db3f9-d2f7-4bb6-9e94-9d821f59699b
40fccbf1-bd8f-43ee-a875-b316b0de7f40	2025-11-24 18:07:43.153849+00	2025-11-24 18:07:43.153849+00	otp	f713805b-cd29-483e-810b-d37b20b49f91
483d783d-9b7f-4516-89fc-7a995579b823	2025-11-24 18:21:39.636872+00	2025-11-24 18:21:39.636872+00	password	5e02ef52-1533-460c-be54-1099731051ea
bca92948-699f-4615-8ccd-b86ed5adeec8	2025-11-24 18:22:12.291806+00	2025-11-24 18:22:12.291806+00	otp	38104341-054f-4b67-b9cb-7960811d0bac
4e09cee2-4e87-4c3c-b6f7-805298281cd4	2025-11-24 18:23:37.329808+00	2025-11-24 18:23:37.329808+00	password	978f4538-ad35-428e-82a7-a8cb1a90bb8a
fb40a083-d53b-40df-8476-6422428ee2f9	2025-11-24 18:35:09.064267+00	2025-11-24 18:35:09.064267+00	otp	0f8604b0-2b25-42a3-91c6-b86bb5b5a037
b052ec6e-b8e7-462b-84e1-b0c98ac953c4	2025-11-24 18:41:20.437164+00	2025-11-24 18:41:20.437164+00	password	e3ba1c79-522b-44e1-944a-6e7f7756be3f
79a84320-023c-491d-8d2a-b1c94d62fd01	2025-11-24 18:42:22.385381+00	2025-11-24 18:42:22.385381+00	password	fa2046ba-058f-45d4-bcee-e91461c78a87
e00cde59-fd06-4fc2-b1b6-5997bdb9e102	2025-11-24 18:42:31.655782+00	2025-11-24 18:42:31.655782+00	password	00213772-aee4-403e-8c28-451d4137e221
03ed2096-ad0a-47c8-8172-c670a11d1bb1	2025-12-01 16:27:34.814865+00	2025-12-01 16:27:34.814865+00	otp	aa75c8b0-e856-43fd-aba7-977a4e276821
7021374f-f724-4aed-8ad8-4995373477df	2025-12-01 19:33:53.184708+00	2025-12-01 19:33:53.184708+00	password	be83795d-900e-47a6-adf5-b793f7256996
58cd795c-02c1-488f-a436-9f615b170442	2025-12-01 19:35:25.71869+00	2025-12-01 19:35:25.71869+00	otp	8fcd3b3b-8983-4cde-b316-77d44baccd86
e98cf96d-338b-4770-b70a-ee8427ee549e	2025-12-17 14:14:05.871827+00	2025-12-17 14:14:05.871827+00	otp	3263af65-fc1b-4361-9360-5d1320dfe20f
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	1	bfuvbz6ckhti	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-19 22:43:04.28288+00	2025-11-19 22:43:04.28288+00	\N	c9a5286f-93d0-400b-b977-c544984ea1ba
00000000-0000-0000-0000-000000000000	2	yjz4no52hnkg	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-19 22:43:43.305194+00	2025-11-19 22:43:43.305194+00	\N	9062f95e-2071-48ca-b0ab-a0a8ad3fa9a6
00000000-0000-0000-0000-000000000000	3	xfumjnbq5rg2	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-19 22:44:02.64547+00	2025-11-19 22:44:02.64547+00	\N	a48b1fcc-31cb-4867-a4b6-7c14a24e4763
00000000-0000-0000-0000-000000000000	4	3dxqwaooipce	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-19 23:25:56.087487+00	2025-11-19 23:25:56.087487+00	\N	74c54320-eb22-4263-8e82-04599f52f62f
00000000-0000-0000-0000-000000000000	5	zkx7gti6b5sp	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-19 23:26:10.608093+00	2025-11-19 23:26:10.608093+00	\N	144da480-1546-4017-833e-879039ae3e64
00000000-0000-0000-0000-000000000000	6	jpx5eg7jwoyo	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-19 23:26:23.448189+00	2025-11-19 23:26:23.448189+00	\N	533fdacc-7226-4197-ad41-5410f78ffcc2
00000000-0000-0000-0000-000000000000	7	vegsvqhhlwat	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-19 23:26:26.325149+00	2025-11-20 12:50:35.284673+00	\N	6c0ab737-a859-41ac-8d0e-f782d5953f9d
00000000-0000-0000-0000-000000000000	8	z3hjm6vgqyjz	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-20 12:50:35.303663+00	2025-11-20 12:50:35.303663+00	vegsvqhhlwat	6c0ab737-a859-41ac-8d0e-f782d5953f9d
00000000-0000-0000-0000-000000000000	9	4t7umwjmtvok	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-20 12:50:35.322505+00	2025-11-20 12:50:35.322505+00	\N	4533be06-bc10-4659-9843-dafa0082af00
00000000-0000-0000-0000-000000000000	10	vlqcogdjvpx6	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-20 12:50:55.65526+00	2025-11-20 12:50:55.65526+00	\N	18ea0def-662b-43a1-8a9b-9311840b5888
00000000-0000-0000-0000-000000000000	12	2ch6sohe67pk	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-20 12:58:16.183354+00	2025-11-20 12:58:16.183354+00	\N	ad101060-b7a2-4e3d-8947-eb78eb571f9a
00000000-0000-0000-0000-000000000000	11	nvvalxkevreq	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-20 12:57:55.655936+00	2025-11-20 15:32:54.303747+00	\N	1fdb4cc2-0719-40bb-9927-275a8604003e
00000000-0000-0000-0000-000000000000	13	mlf5cedi4top	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-20 15:32:54.316182+00	2025-11-20 16:39:27.370808+00	nvvalxkevreq	1fdb4cc2-0719-40bb-9927-275a8604003e
00000000-0000-0000-0000-000000000000	14	nk4s4nzz4sk6	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-20 16:39:27.38482+00	2025-11-20 16:39:27.38482+00	mlf5cedi4top	1fdb4cc2-0719-40bb-9927-275a8604003e
00000000-0000-0000-0000-000000000000	15	kpmfu3z2hhdf	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-20 16:43:04.661307+00	2025-11-20 16:43:04.661307+00	\N	45974117-8ad5-474b-95f4-71d4cefddefa
00000000-0000-0000-0000-000000000000	16	xbrcm6issrxw	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-20 16:43:12.742118+00	2025-11-20 16:43:12.742118+00	\N	66f47fbb-cd7b-49bf-9997-4da6d4aa3293
00000000-0000-0000-0000-000000000000	17	3ee5dbttxq5d	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-20 16:43:30.20468+00	2025-11-20 16:43:30.20468+00	\N	84297508-ee69-4e53-a879-46daed5ab5be
00000000-0000-0000-0000-000000000000	18	tcbntuxbqhhg	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-20 17:07:42.54619+00	2025-11-20 17:07:42.54619+00	\N	3fc6d3e9-83f4-4e7d-9ec0-94a303af74f7
00000000-0000-0000-0000-000000000000	19	sjzrclpdqxst	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-20 17:12:36.670998+00	2025-11-20 17:12:36.670998+00	\N	205115c2-053a-461b-a448-e9f2e776dda7
00000000-0000-0000-0000-000000000000	20	r3zesgy2ihqa	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-20 17:13:27.478309+00	2025-11-20 17:13:27.478309+00	\N	23b76731-da10-42ae-86c1-e9d4129653e2
00000000-0000-0000-0000-000000000000	21	5sf3466vfw2b	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-20 17:14:07.64943+00	2025-11-20 17:14:07.64943+00	\N	5568e040-198b-4cb9-89ac-30b66862e37a
00000000-0000-0000-0000-000000000000	23	4eo652tv43l5	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-20 17:20:04.175715+00	2025-11-20 17:20:04.175715+00	\N	b206d842-8870-4dcf-907b-76c8cce827f7
00000000-0000-0000-0000-000000000000	24	oidpmvg3bmyr	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-20 17:23:35.556554+00	2025-11-20 17:23:35.556554+00	\N	0f584b07-5afd-47bf-9e4b-82b918802b7e
00000000-0000-0000-0000-000000000000	25	wyo3hmbkxlgd	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-20 19:27:28.36768+00	2025-11-20 19:27:28.36768+00	\N	3e35b7d8-288a-4ace-9e80-4ea7566827eb
00000000-0000-0000-0000-000000000000	26	uutea5vfuri7	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-20 19:32:05.098719+00	2025-11-20 19:32:05.098719+00	\N	03c03f60-6243-49a8-b09a-36d954fb10e7
00000000-0000-0000-0000-000000000000	22	g6bpakzf34zg	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-20 17:15:02.683249+00	2025-11-21 16:46:08.528266+00	\N	f4ef9122-4532-4043-b5a2-74325637dea2
00000000-0000-0000-0000-000000000000	27	ilxyitxvkuy3	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-21 16:46:08.549246+00	2025-11-21 19:48:37.554113+00	g6bpakzf34zg	f4ef9122-4532-4043-b5a2-74325637dea2
00000000-0000-0000-0000-000000000000	28	abh5jhdntvhe	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-21 19:48:37.572657+00	2025-11-21 19:48:37.572657+00	ilxyitxvkuy3	f4ef9122-4532-4043-b5a2-74325637dea2
00000000-0000-0000-0000-000000000000	29	zhfdbvlrpitb	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-21 19:48:49.895522+00	2025-11-21 19:48:49.895522+00	\N	c519edea-c1d5-4028-90b2-1bdfa0c8901b
00000000-0000-0000-0000-000000000000	30	7b6ncadww7wz	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-21 19:49:14.037878+00	2025-11-21 19:49:14.037878+00	\N	c00af208-ec02-4223-83c9-8e8703b339cd
00000000-0000-0000-0000-000000000000	31	yq3oggd7m5b3	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-21 20:08:33.451438+00	2025-11-21 20:08:33.451438+00	\N	92600db8-c501-4b52-9ab2-0e3777a678b0
00000000-0000-0000-0000-000000000000	33	wco2iwwtw7ay	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-21 20:11:49.551794+00	2025-11-21 20:11:49.551794+00	\N	4b4b6732-0e07-40ac-9920-471704eb0d45
00000000-0000-0000-0000-000000000000	32	fvbxinu5ngvv	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-21 20:09:43.028742+00	2025-11-22 17:44:53.470562+00	\N	a8a3c516-f484-4740-8827-cbdb580161ab
00000000-0000-0000-0000-000000000000	35	gahrwzh6ytnj	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-23 18:03:12.170768+00	2025-11-23 18:03:12.170768+00	\N	c0cc0f45-5555-45a4-a4c2-5c15810d8ebf
00000000-0000-0000-0000-000000000000	34	gvkjryfmh6hp	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-22 17:44:53.492329+00	2025-11-24 16:01:15.420301+00	fvbxinu5ngvv	a8a3c516-f484-4740-8827-cbdb580161ab
00000000-0000-0000-0000-000000000000	37	gvo4y2f2lyeh	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 16:01:15.446243+00	2025-11-24 16:01:15.446243+00	\N	e374c36e-c8be-47b8-95e9-d73fac6609f6
00000000-0000-0000-0000-000000000000	38	v2v27nypymvg	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 16:03:07.416253+00	2025-11-24 16:03:07.416253+00	\N	e8cbe865-9fd0-4893-905c-f261924eb5c1
00000000-0000-0000-0000-000000000000	39	npurf3bb2wbw	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 16:04:11.903113+00	2025-11-24 16:04:11.903113+00	\N	fbebdc80-42db-4c98-acf9-8370cf0cb952
00000000-0000-0000-0000-000000000000	40	iij5whzxzwon	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 16:06:48.963534+00	2025-11-24 16:06:48.963534+00	\N	7968c48e-f01c-4eed-b1dc-ae4ae1523862
00000000-0000-0000-0000-000000000000	41	ip6q76t3qnpc	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 16:13:09.009502+00	2025-11-24 16:13:09.009502+00	\N	2e5a97cb-9ce3-4f0b-b880-9e574fddc339
00000000-0000-0000-0000-000000000000	43	7v4mc6vj52xb	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 16:15:58.206382+00	2025-11-24 16:15:58.206382+00	\N	493ec0c6-c409-49e4-83d0-7af8a5268e7a
00000000-0000-0000-0000-000000000000	44	hwi74hwkkwnd	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 16:24:11.015073+00	2025-11-24 16:24:11.015073+00	\N	c21a188b-c60e-480d-8028-ec4ef54803bd
00000000-0000-0000-0000-000000000000	36	s4g24qtf3ov3	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-24 16:01:15.432953+00	2025-11-24 17:00:10.784802+00	gvkjryfmh6hp	a8a3c516-f484-4740-8827-cbdb580161ab
00000000-0000-0000-0000-000000000000	45	kvyicxrartfl	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 17:00:10.803954+00	2025-11-24 17:00:10.803954+00	s4g24qtf3ov3	a8a3c516-f484-4740-8827-cbdb580161ab
00000000-0000-0000-0000-000000000000	46	dpmonltqlf7n	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 17:28:25.681804+00	2025-11-24 17:28:25.681804+00	\N	25aebd38-321c-477a-9b14-0c423109372c
00000000-0000-0000-0000-000000000000	47	5m67i3rzcm75	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 17:31:03.569119+00	2025-11-24 17:31:03.569119+00	\N	58dfd4f2-61f4-4f4e-92cb-2fb28db50de9
00000000-0000-0000-0000-000000000000	48	2plvoh4bliuk	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 17:32:30.89017+00	2025-11-24 17:32:30.89017+00	\N	4003266b-b794-4dc7-beb6-f3fe2ab6a9e2
00000000-0000-0000-0000-000000000000	49	arfazy3zaj2z	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 17:33:49.561007+00	2025-11-24 17:33:49.561007+00	\N	77214eee-97d5-4389-9ddb-1120160d6762
00000000-0000-0000-0000-000000000000	50	5yc4z7m33avz	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 17:41:01.268405+00	2025-11-24 17:41:01.268405+00	\N	71199c4b-12ba-4f2c-b649-e4f8b65bfb53
00000000-0000-0000-0000-000000000000	51	axi2huwdlci2	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 17:41:38.333646+00	2025-11-24 17:41:38.333646+00	\N	9d36a5c2-ecfc-4daa-831e-b600be1c42c5
00000000-0000-0000-0000-000000000000	52	kfdcq3a3mo72	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 17:43:05.599342+00	2025-11-24 17:43:05.599342+00	\N	baa1c677-b431-4869-ab4d-12c69d7b4dd3
00000000-0000-0000-0000-000000000000	53	epmfq66ymkku	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 17:44:05.764835+00	2025-11-24 17:44:05.764835+00	\N	81400c58-75a4-4b68-9556-d365280feeb6
00000000-0000-0000-0000-000000000000	42	e7xpzd3vmskj	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-24 16:15:38.488044+00	2025-12-01 16:27:38.967337+00	\N	1eb3e9ed-11d9-40b9-88cc-06a227a242e5
00000000-0000-0000-0000-000000000000	54	fjxp7odzsyhi	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 17:54:01.127386+00	2025-11-24 17:54:01.127386+00	\N	d129be9f-6e78-49b0-b629-988592f9f17d
00000000-0000-0000-0000-000000000000	55	jpcvaumbjbwi	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 17:57:40.933636+00	2025-11-24 17:57:40.933636+00	\N	5f123bbe-c7c7-4972-a673-df0aa793737e
00000000-0000-0000-0000-000000000000	56	yqklijfgayhq	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 17:58:48.921051+00	2025-11-24 17:58:48.921051+00	\N	9350fa7e-360a-436d-85a6-1d606db0b65f
00000000-0000-0000-0000-000000000000	57	qyt5c2t2vaxd	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 18:06:50.445186+00	2025-11-24 18:06:50.445186+00	\N	24d12a59-cfc4-4d1e-b859-f56d4008cfc4
00000000-0000-0000-0000-000000000000	58	a2j7m354dkcu	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 18:07:43.150897+00	2025-11-24 18:07:43.150897+00	\N	40fccbf1-bd8f-43ee-a875-b316b0de7f40
00000000-0000-0000-0000-000000000000	59	pnt746c2notg	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 18:21:39.624445+00	2025-11-24 18:21:39.624445+00	\N	483d783d-9b7f-4516-89fc-7a995579b823
00000000-0000-0000-0000-000000000000	60	jnft4itpkpn4	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 18:22:12.289434+00	2025-11-24 18:22:12.289434+00	\N	bca92948-699f-4615-8ccd-b86ed5adeec8
00000000-0000-0000-0000-000000000000	61	xkj2ifcw65qg	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 18:23:37.301624+00	2025-11-24 18:23:37.301624+00	\N	4e09cee2-4e87-4c3c-b6f7-805298281cd4
00000000-0000-0000-0000-000000000000	62	x2lvw5kyxujh	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 18:35:09.051373+00	2025-11-24 18:35:09.051373+00	\N	fb40a083-d53b-40df-8476-6422428ee2f9
00000000-0000-0000-0000-000000000000	63	m43kyxxvpog3	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 18:41:20.422222+00	2025-11-24 18:41:20.422222+00	\N	b052ec6e-b8e7-462b-84e1-b0c98ac953c4
00000000-0000-0000-0000-000000000000	64	zhsoo26pz5cx	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-11-24 18:42:22.384147+00	2025-11-24 18:42:22.384147+00	\N	79a84320-023c-491d-8d2a-b1c94d62fd01
00000000-0000-0000-0000-000000000000	134	omhctukcch4r	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-04 08:54:24.83792+00	2025-12-04 18:50:14.910771+00	nyzbkvrftczm	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	65	5ylk2bl752ib	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-24 18:42:31.65443+00	2025-11-24 19:40:54.156692+00	\N	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	66	b37i5nv3hvhx	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-24 19:40:54.182738+00	2025-11-24 20:39:24.059637+00	5ylk2bl752ib	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	67	smflqo5ozjtr	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-24 20:39:24.080319+00	2025-11-24 21:38:10.929191+00	b37i5nv3hvhx	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	68	3asjjp3ouwu3	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-24 21:38:10.950681+00	2025-11-24 22:37:10.909985+00	smflqo5ozjtr	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	69	4yxayg2uzd5s	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-24 22:37:10.927675+00	2025-11-24 23:35:30.936891+00	3asjjp3ouwu3	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	70	72javvpw7mbt	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-24 23:35:30.956658+00	2025-11-25 01:01:05.932131+00	4yxayg2uzd5s	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	71	xwunm57yswqr	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-25 01:01:05.944517+00	2025-11-25 02:00:11.076174+00	72javvpw7mbt	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	72	dyfyeuqkrieb	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-25 02:00:11.096771+00	2025-11-25 02:59:11.142135+00	xwunm57yswqr	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	73	575ruppncnq5	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-25 02:59:11.161947+00	2025-11-25 08:12:37.356564+00	dyfyeuqkrieb	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	74	zjkrjcsjpers	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-25 08:12:37.380541+00	2025-11-25 14:22:14.10305+00	575ruppncnq5	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	75	doddhjodx64n	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-25 14:22:14.127607+00	2025-11-25 19:50:12.800417+00	zjkrjcsjpers	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	76	qwdhvqck62ig	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-25 19:50:12.818039+00	2025-11-26 13:24:36.292751+00	doddhjodx64n	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	77	dwt4cdyqjnk7	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-26 13:24:36.307854+00	2025-11-26 14:49:58.74818+00	qwdhvqck62ig	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	78	xmd74k3vkjge	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-26 14:49:58.760689+00	2025-11-26 15:48:17.584789+00	dwt4cdyqjnk7	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	79	cay2uhth5n46	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-26 15:48:17.608616+00	2025-11-26 19:04:09.826972+00	xmd74k3vkjge	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	80	b5ijkfyozyt5	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-26 19:04:09.83868+00	2025-11-26 20:02:14.153012+00	cay2uhth5n46	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	81	4zs3yr2xylo4	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-26 20:02:14.176044+00	2025-11-26 21:00:44.299966+00	b5ijkfyozyt5	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	82	leesxovyohpn	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-26 21:00:44.317029+00	2025-11-26 21:59:14.238977+00	4zs3yr2xylo4	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	83	6gwzlswbrg5n	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-26 21:59:14.251629+00	2025-11-26 22:57:44.232129+00	leesxovyohpn	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	84	paxbytby7wuy	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-26 22:57:44.251142+00	2025-11-26 23:56:14.217944+00	6gwzlswbrg5n	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	85	ri4ifsee3yrh	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-26 23:56:14.236242+00	2025-11-27 00:54:44.395789+00	paxbytby7wuy	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	86	3qmozrcjqpwl	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-27 00:54:44.413618+00	2025-11-30 15:28:33.10467+00	ri4ifsee3yrh	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	87	7vtx6ob5hmpd	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-30 15:28:33.124644+00	2025-11-30 16:27:06.911784+00	3qmozrcjqpwl	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	88	hlk4m4u47ska	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-30 16:27:06.936111+00	2025-11-30 17:25:11.651695+00	7vtx6ob5hmpd	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	89	azcpcszu4n5g	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-30 17:25:11.6736+00	2025-11-30 18:23:41.593927+00	hlk4m4u47ska	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	90	54bamohegwte	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-30 18:23:41.614924+00	2025-11-30 19:22:11.651495+00	azcpcszu4n5g	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	91	ool2hzuuygrx	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-30 19:22:11.672607+00	2025-11-30 20:20:41.741419+00	54bamohegwte	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	92	iduxl4244sfn	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-30 20:20:41.760261+00	2025-11-30 21:20:07.429109+00	ool2hzuuygrx	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	93	7ajvf2w2vuno	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-30 21:20:07.444589+00	2025-11-30 22:19:07.14633+00	iduxl4244sfn	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	94	li5o27l64gun	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-30 22:19:07.164607+00	2025-11-30 23:17:35.885472+00	7ajvf2w2vuno	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	95	lur763egdwzo	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-11-30 23:17:35.916722+00	2025-12-01 00:16:07.075326+00	li5o27l64gun	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	96	hvds37qnu2i2	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-01 00:16:07.09781+00	2025-12-01 01:15:07.305242+00	lur763egdwzo	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	97	qcyyrpicq4rd	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-01 01:15:07.32752+00	2025-12-01 02:14:07.583612+00	hvds37qnu2i2	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	98	bprr7lgnqh5k	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-01 02:14:07.596563+00	2025-12-01 03:13:07.620133+00	qcyyrpicq4rd	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	99	tdke7ofcgczl	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-01 03:13:07.640715+00	2025-12-01 16:10:47.121913+00	bprr7lgnqh5k	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	101	2yqp656jcvgg	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-12-01 16:27:34.80752+00	2025-12-01 16:27:34.80752+00	\N	03ed2096-ad0a-47c8-8172-c670a11d1bb1
00000000-0000-0000-0000-000000000000	100	ttfjeakbsbpj	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-01 16:10:47.134532+00	2025-12-01 17:11:03.56077+00	tdke7ofcgczl	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	103	majqracmcksf	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-01 17:11:03.579437+00	2025-12-01 18:10:05.34503+00	ttfjeakbsbpj	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	104	j56vb465x2c6	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-01 18:10:05.36211+00	2025-12-01 19:23:59.255926+00	majqracmcksf	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	133	nyzbkvrftczm	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-04 00:10:49.597984+00	2025-12-04 08:54:24.820379+00	ybzff26ngil5	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	227	ufewgw5k2lxu	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-12 04:30:29.951875+00	2025-12-12 05:29:29.855267+00	zzljirzwdzut	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	107	qkf2grnfvqbu	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-12-01 19:35:25.71689+00	2025-12-01 19:35:25.71689+00	\N	58cd795c-02c1-488f-a436-9f615b170442
00000000-0000-0000-0000-000000000000	105	e7hecxxdbky7	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-01 19:23:59.274755+00	2025-12-01 20:23:05.504137+00	j56vb465x2c6	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	108	7lkkdzwkeswe	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-01 20:23:05.532148+00	2025-12-01 21:22:05.491655+00	e7hecxxdbky7	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	135	vhbluee7ywpz	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-04 18:50:14.929729+00	2025-12-04 19:49:14.659055+00	omhctukcch4r	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	109	lwnqhnrbsndg	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-01 21:22:05.512366+00	2025-12-01 22:21:05.443325+00	7lkkdzwkeswe	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	110	4d37nk77sdzs	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-01 22:21:05.457255+00	2025-12-01 23:20:05.652757+00	lwnqhnrbsndg	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	136	wi3cpff33thm	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-04 19:49:14.680449+00	2025-12-04 20:48:14.873892+00	vhbluee7ywpz	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	111	qjlfmgetcxrb	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-01 23:20:05.672849+00	2025-12-02 00:19:05.687897+00	4d37nk77sdzs	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	112	obhxw5uh6uzq	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-02 00:19:05.711492+00	2025-12-02 01:18:06.494236+00	qjlfmgetcxrb	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	137	lcwgzmewul4d	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-04 20:48:14.90165+00	2025-12-04 21:46:56.366811+00	wi3cpff33thm	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	113	57pmiik3gmdm	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-02 01:18:06.514385+00	2025-12-02 02:17:05.634581+00	obhxw5uh6uzq	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	114	s42sznbn4hub	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-02 02:17:05.659353+00	2025-12-02 03:16:05.781429+00	57pmiik3gmdm	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	138	2mvfs6bvoqao	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-04 21:46:56.386756+00	2025-12-05 01:25:19.749349+00	lcwgzmewul4d	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	115	cba2taufj7kw	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-02 03:16:05.802638+00	2025-12-02 04:15:05.67216+00	s42sznbn4hub	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	116	n7idhqx2ht6p	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-02 04:15:05.689974+00	2025-12-02 05:14:05.741336+00	cba2taufj7kw	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	139	ze3icmvnrons	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-05 01:25:19.773084+00	2025-12-05 02:24:14.838803+00	2mvfs6bvoqao	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	117	2fvbc7rgz2cf	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-02 05:14:05.757824+00	2025-12-02 06:13:05.80551+00	n7idhqx2ht6p	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	118	bjckvdjak5gg	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-02 06:13:05.820457+00	2025-12-02 07:12:05.851898+00	2fvbc7rgz2cf	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	140	mhbvxwtt7zvo	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-05 02:24:14.856038+00	2025-12-05 03:23:15.262204+00	ze3icmvnrons	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	119	lsiabgqvygbd	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-02 07:12:05.862579+00	2025-12-02 08:11:05.696563+00	bjckvdjak5gg	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	120	xfi6jwmw7vwi	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-02 08:11:05.716113+00	2025-12-02 09:10:05.838265+00	lsiabgqvygbd	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	141	jwbxbjilhzrr	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-05 03:23:15.280526+00	2025-12-05 04:22:14.839833+00	mhbvxwtt7zvo	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	121	5mlz6j2ddqwx	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-02 09:10:05.863075+00	2025-12-02 10:09:05.863109+00	xfi6jwmw7vwi	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	122	xg5n5qn5oudw	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-02 10:09:05.882857+00	2025-12-02 11:08:06.022851+00	5mlz6j2ddqwx	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	142	7ca5vwzmeed7	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-05 04:22:14.855009+00	2025-12-05 05:21:14.915133+00	jwbxbjilhzrr	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	123	dbxmixcrogjt	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-02 11:08:06.040393+00	2025-12-02 12:07:05.810259+00	xg5n5qn5oudw	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	124	67dm5fejhlbx	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-02 12:07:05.832333+00	2025-12-02 13:06:05.94915+00	dbxmixcrogjt	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	143	7alrttns3iuo	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-05 05:21:14.93812+00	2025-12-05 06:20:14.958754+00	7ca5vwzmeed7	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	125	z4byi54vonth	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-02 13:06:05.967605+00	2025-12-02 14:17:59.137892+00	67dm5fejhlbx	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	126	viwcovubtz6u	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-02 14:17:59.151196+00	2025-12-02 19:05:13.513181+00	z4byi54vonth	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	144	rnz22fteq6pi	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-05 06:20:14.974365+00	2025-12-05 07:19:14.759614+00	7alrttns3iuo	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	127	zr5ado3t7a43	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-02 19:05:13.528544+00	2025-12-02 20:04:05.965904+00	viwcovubtz6u	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	128	miophj3tmkam	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-02 20:04:05.987005+00	2025-12-03 13:37:26.612849+00	zr5ado3t7a43	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	145	jlnfy2ka2xdy	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-05 07:19:14.777713+00	2025-12-05 08:18:15.316561+00	rnz22fteq6pi	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	129	3e6vvr52ja2m	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-03 13:37:26.630888+00	2025-12-03 14:35:50.108766+00	miophj3tmkam	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	130	vrf4j42g6hhm	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-03 14:35:50.128752+00	2025-12-03 15:35:04.620181+00	3e6vvr52ja2m	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	146	7ywe6yboqvk2	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-05 08:18:15.336016+00	2025-12-05 09:17:14.923174+00	jlnfy2ka2xdy	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	131	6z4f7wqkhpto	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-03 15:35:04.642895+00	2025-12-03 16:34:04.578028+00	vrf4j42g6hhm	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	132	ybzff26ngil5	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-03 16:34:04.600821+00	2025-12-04 00:10:49.578749+00	6z4f7wqkhpto	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	147	ertwc5iobk2f	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-05 09:17:14.939597+00	2025-12-05 10:16:14.83366+00	7ywe6yboqvk2	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	148	6w4kwayk7a3n	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-05 10:16:14.852295+00	2025-12-05 11:15:15.009544+00	ertwc5iobk2f	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	149	ushffou44sdm	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-05 11:15:15.021872+00	2025-12-05 12:14:15.344666+00	6w4kwayk7a3n	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	150	lvln4qkmpq4d	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-05 12:14:15.366954+00	2025-12-05 13:13:15.080173+00	ushffou44sdm	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	151	q4lak62jcp6g	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-05 13:13:15.098994+00	2025-12-05 14:25:58.841805+00	lvln4qkmpq4d	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	152	djrgqsbuhjqf	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-05 14:25:58.86037+00	2025-12-05 15:25:14.989581+00	q4lak62jcp6g	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	153	r2xn5r5cuy4d	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-05 15:25:15.001343+00	2025-12-05 16:24:15.22729+00	djrgqsbuhjqf	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	154	fbr374saqrbh	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-05 16:24:15.238257+00	2025-12-05 17:23:15.693507+00	r2xn5r5cuy4d	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	155	yoljjdgvwsc5	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-05 17:23:15.718667+00	2025-12-05 18:22:15.144513+00	fbr374saqrbh	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	106	4fz63npgckjz	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-01 19:33:53.177527+00	2025-12-09 01:53:07.667376+00	\N	7021374f-f724-4aed-8ad8-4995373477df
00000000-0000-0000-0000-000000000000	156	notzouvb2tl5	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-05 18:22:15.153857+00	2025-12-05 19:21:16.84481+00	yoljjdgvwsc5	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	157	i4wikfbydqdj	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-05 19:21:16.859097+00	2025-12-05 20:20:15.306619+00	notzouvb2tl5	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	158	yqacc6tny7jw	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-05 20:20:15.323113+00	2025-12-05 21:19:15.61471+00	i4wikfbydqdj	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	159	3r2lafucmg4k	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-05 21:19:15.629721+00	2025-12-05 22:31:35.455106+00	yqacc6tny7jw	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	160	b7krcgtsxnr7	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-05 22:31:35.474159+00	2025-12-06 17:24:05.323296+00	3r2lafucmg4k	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	161	ix5xpw5ikvau	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-06 17:24:05.346224+00	2025-12-06 18:22:30.201485+00	b7krcgtsxnr7	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	162	o2rz46x46qwx	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-06 18:22:30.223285+00	2025-12-06 19:20:53.906445+00	ix5xpw5ikvau	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	163	pkwlevemiic4	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-06 19:20:53.929557+00	2025-12-06 20:20:14.252827+00	o2rz46x46qwx	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	164	jokdzj6twcgu	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-06 20:20:14.26975+00	2025-12-06 21:19:14.359241+00	pkwlevemiic4	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	165	rlsjq3agelj7	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-06 21:19:14.381492+00	2025-12-06 22:17:33.005803+00	jokdzj6twcgu	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	166	scnjbk2ik5g5	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-06 22:17:33.031168+00	2025-12-06 23:15:37.291509+00	rlsjq3agelj7	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	167	t3yntpvfidzx	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-06 23:15:37.317242+00	2025-12-07 00:14:14.282815+00	scnjbk2ik5g5	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	168	ft2pkokrmusq	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 00:14:14.29236+00	2025-12-07 01:12:28.177533+00	t3yntpvfidzx	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	169	fudoek4cxvjp	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 01:12:28.206065+00	2025-12-07 02:10:58.607579+00	ft2pkokrmusq	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	170	ua7devyab7vn	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 02:10:58.628615+00	2025-12-07 03:09:28.129434+00	fudoek4cxvjp	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	171	m5k4vlwz4vfj	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 03:09:28.146091+00	2025-12-07 04:08:14.480679+00	ua7devyab7vn	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	172	dmx3btjobhkk	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 04:08:14.507657+00	2025-12-07 05:07:14.489063+00	m5k4vlwz4vfj	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	173	hge3eibfgimb	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 05:07:14.509527+00	2025-12-07 06:06:14.505964+00	dmx3btjobhkk	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	174	dxwlg5vhfh5i	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 06:06:14.52644+00	2025-12-07 07:05:14.523906+00	hge3eibfgimb	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	175	lpbzndpvvvhl	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 07:05:14.542137+00	2025-12-07 08:04:14.766704+00	dxwlg5vhfh5i	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	176	te6ljdfkhcsv	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 08:04:14.782395+00	2025-12-07 09:03:14.692392+00	lpbzndpvvvhl	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	177	gf2557afoxkl	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 09:03:14.707979+00	2025-12-07 10:02:14.587591+00	te6ljdfkhcsv	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	178	5pzyq2d62rzm	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 10:02:14.606287+00	2025-12-07 11:01:14.619448+00	gf2557afoxkl	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	179	djqwoz6qnxty	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 11:01:14.642215+00	2025-12-07 12:00:15.001391+00	5pzyq2d62rzm	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	180	s5a2jif7n7qj	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 12:00:15.021087+00	2025-12-07 12:59:14.671362+00	djqwoz6qnxty	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	181	34b6sbggyfxq	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 12:59:14.696187+00	2025-12-07 13:58:14.772078+00	s5a2jif7n7qj	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	182	tp2tguvsv7jq	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 13:58:14.79374+00	2025-12-07 14:57:14.740115+00	34b6sbggyfxq	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	183	chaxrnvp77iv	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 14:57:14.755273+00	2025-12-07 15:56:14.691663+00	tp2tguvsv7jq	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	184	w2umrpnclmep	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 15:56:14.70847+00	2025-12-07 16:55:15.190575+00	chaxrnvp77iv	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	185	3rztbfwdd6a7	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 16:55:15.212287+00	2025-12-07 17:54:14.672409+00	w2umrpnclmep	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	186	lpvqdprg5rby	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 17:54:14.690796+00	2025-12-07 18:53:14.842606+00	3rztbfwdd6a7	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	187	sgjm5asg5fw4	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 18:53:14.861273+00	2025-12-07 19:52:15.20836+00	lpvqdprg5rby	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	188	citssrnlcxqu	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 19:52:15.22608+00	2025-12-07 20:51:15.057626+00	sgjm5asg5fw4	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	189	zudkglxazmmz	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 20:51:15.077202+00	2025-12-07 21:50:15.196925+00	citssrnlcxqu	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	190	jl6mktv2g3cs	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 21:50:15.218387+00	2025-12-07 22:49:15.194784+00	zudkglxazmmz	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	191	m2zbailtwzoc	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 22:49:15.214458+00	2025-12-07 23:48:14.875154+00	jl6mktv2g3cs	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	192	vea3jfifj5ni	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-07 23:48:14.891436+00	2025-12-08 00:54:21.494022+00	m2zbailtwzoc	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	193	tpreogptgsjy	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-08 00:54:21.506799+00	2025-12-08 01:53:02.011632+00	vea3jfifj5ni	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	194	42xadsmwe2oj	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-08 01:53:02.026539+00	2025-12-08 02:52:15.466703+00	tpreogptgsjy	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	195	pvew4nr6ase2	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-08 02:52:15.486423+00	2025-12-08 08:06:22.744913+00	42xadsmwe2oj	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	196	jydjugop6owe	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-08 08:06:22.764767+00	2025-12-08 16:59:24.284074+00	pvew4nr6ase2	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	197	7e2lz4i4rnzs	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-08 16:59:24.296014+00	2025-12-08 17:57:37.485792+00	jydjugop6owe	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	198	54ujzkcqnmj7	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-08 17:57:37.502498+00	2025-12-08 18:55:42.192811+00	7e2lz4i4rnzs	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	199	3iiigwmp7oqn	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-08 18:55:42.21298+00	2025-12-09 00:12:16.722224+00	54ujzkcqnmj7	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	200	l7h4rncwpqag	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-09 00:12:16.731419+00	2025-12-09 01:10:28.403818+00	3iiigwmp7oqn	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	201	muzg6ov4lyaq	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-09 01:10:28.416657+00	2025-12-09 02:09:14.977825+00	l7h4rncwpqag	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	203	olhx5h4el7uv	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-09 02:09:14.996352+00	2025-12-09 03:07:29.610901+00	muzg6ov4lyaq	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	202	i3cssdpvfnhd	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-09 01:53:07.687319+00	2025-12-09 03:42:05.369464+00	4fz63npgckjz	7021374f-f724-4aed-8ad8-4995373477df
00000000-0000-0000-0000-000000000000	204	qzwudb65tuf3	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-09 03:07:29.639758+00	2025-12-09 14:15:37.410285+00	olhx5h4el7uv	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	205	f4nrrbtca3zn	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-09 03:42:05.385083+00	2025-12-10 17:22:19.44958+00	i3cssdpvfnhd	7021374f-f724-4aed-8ad8-4995373477df
00000000-0000-0000-0000-000000000000	226	zzljirzwdzut	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-12 03:31:30.128941+00	2025-12-12 04:30:29.938597+00	5curaeuhpzoy	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	206	fmjhlbjytegr	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-09 14:15:37.428069+00	2025-12-09 15:14:14.69078+00	qzwudb65tuf3	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	228	2nj7vgja3a66	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-12 05:29:29.887179+00	2025-12-12 06:28:30.465648+00	ufewgw5k2lxu	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	207	d6i56e37bwmd	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-09 15:14:14.701185+00	2025-12-09 22:40:37.174078+00	fmjhlbjytegr	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	208	phztlosadnz5	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-09 22:40:37.193812+00	2025-12-09 23:39:18.551937+00	d6i56e37bwmd	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	229	cg2jwce3x4mm	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-12 06:28:30.488652+00	2025-12-12 07:27:29.916978+00	2nj7vgja3a66	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	209	wq22thiecn67	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-09 23:39:18.574459+00	2025-12-10 00:38:15.053287+00	phztlosadnz5	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	210	tfseqz4rxjds	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-10 00:38:15.068118+00	2025-12-10 01:37:14.966832+00	wq22thiecn67	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	230	7xrn6jn4fa6e	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-12 07:27:29.940169+00	2025-12-12 08:26:30.043302+00	cg2jwce3x4mm	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	211	qm6wvaezk6oc	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-10 01:37:14.988916+00	2025-12-10 02:36:15.034647+00	tfseqz4rxjds	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	212	7n2vbms7i5rz	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-10 02:36:15.050589+00	2025-12-10 17:02:49.031066+00	qm6wvaezk6oc	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	231	h7qkapbtv4w3	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-12 08:26:30.067581+00	2025-12-12 09:25:29.969363+00	7xrn6jn4fa6e	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	213	7c3vwuyyazpo	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-10 17:02:49.053762+00	2025-12-10 18:01:38.66348+00	7n2vbms7i5rz	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	232	2ep7iotytq2o	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-12 09:25:29.987519+00	2025-12-12 12:14:19.366551+00	h7qkapbtv4w3	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	215	6e7evayzj76b	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-10 18:01:38.676134+00	2025-12-10 19:00:38.84841+00	7c3vwuyyazpo	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	214	t2famlo54vjb	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-10 17:22:19.457919+00	2025-12-11 17:38:02.64163+00	f4nrrbtca3zn	7021374f-f724-4aed-8ad8-4995373477df
00000000-0000-0000-0000-000000000000	233	a3mphjvtkiez	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-12 12:14:19.387401+00	2025-12-15 13:17:54.67146+00	2ep7iotytq2o	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	216	ebxgd3gujjtp	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-10 19:00:38.859943+00	2025-12-11 22:37:45.933263+00	6e7evayzj76b	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	217	g4xgp6ug5fk7	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-11 17:38:02.664082+00	2025-12-11 22:44:51.616194+00	t2famlo54vjb	7021374f-f724-4aed-8ad8-4995373477df
00000000-0000-0000-0000-000000000000	234	dldhlz7rfckt	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-15 13:17:54.698934+00	2025-12-15 14:16:30.740798+00	a3mphjvtkiez	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	218	lnlvgnzch7z2	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-11 22:37:45.954969+00	2025-12-11 23:35:58.324261+00	ebxgd3gujjtp	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	219	veux6itivhg7	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-11 22:44:51.624261+00	2025-12-11 23:59:09.374283+00	g4xgp6ug5fk7	7021374f-f724-4aed-8ad8-4995373477df
00000000-0000-0000-0000-000000000000	235	r7pqewp3g446	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-15 14:16:30.759751+00	2025-12-15 15:15:30.42458+00	dldhlz7rfckt	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	220	k57b4x3k22ku	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-11 23:35:58.347692+00	2025-12-12 00:34:29.891993+00	lnlvgnzch7z2	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	222	bpptktst7tzk	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-12 00:34:29.906234+00	2025-12-12 01:33:30.298612+00	k57b4x3k22ku	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	236	ojjcgknwzf2v	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-15 15:15:30.45055+00	2025-12-15 16:14:23.335279+00	r7pqewp3g446	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	221	wpuhgaz2euv5	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-11 23:59:09.393416+00	2025-12-12 02:14:16.094755+00	veux6itivhg7	7021374f-f724-4aed-8ad8-4995373477df
00000000-0000-0000-0000-000000000000	224	c6hs26bqy27u	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-12-12 02:14:16.111892+00	2025-12-12 02:14:16.111892+00	wpuhgaz2euv5	7021374f-f724-4aed-8ad8-4995373477df
00000000-0000-0000-0000-000000000000	223	2td6rh6kzo23	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-12 01:33:30.316795+00	2025-12-12 02:32:30.249195+00	bpptktst7tzk	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	225	5curaeuhpzoy	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-12 02:32:30.264808+00	2025-12-12 03:31:30.104796+00	2td6rh6kzo23	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	237	ukvtrhxphtn3	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-15 16:14:23.358228+00	2025-12-15 17:13:30.439496+00	ojjcgknwzf2v	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	238	3vqvq5gqoxw2	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-15 17:13:30.461684+00	2025-12-15 18:15:10.228785+00	ukvtrhxphtn3	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	239	oqwyspmi7sqf	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-15 18:15:10.253254+00	2025-12-15 19:13:24.629184+00	3vqvq5gqoxw2	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	240	6raqa3cvmqro	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-15 19:13:24.653732+00	2025-12-15 20:12:30.553861+00	oqwyspmi7sqf	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	241	447u7hs3uspl	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-15 20:12:30.566972+00	2025-12-15 21:11:30.824726+00	6raqa3cvmqro	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	242	onaap3c3fmom	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-15 21:11:30.850019+00	2025-12-15 22:10:30.993507+00	447u7hs3uspl	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	243	jsctohn4vgnc	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-15 22:10:31.011545+00	2025-12-15 23:09:30.418586+00	onaap3c3fmom	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	244	p7v6df2xaj5g	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-15 23:09:30.427393+00	2025-12-16 00:08:31.058429+00	jsctohn4vgnc	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	245	sidyv3puc3hy	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-16 00:08:31.080887+00	2025-12-16 01:07:30.484683+00	p7v6df2xaj5g	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	246	e5joststsjng	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-16 01:07:30.497422+00	2025-12-16 13:09:47.542202+00	sidyv3puc3hy	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	247	32nn2vctvskf	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-16 13:09:47.56648+00	2025-12-16 15:08:15.581221+00	e5joststsjng	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	248	sb77idvg6pmh	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-16 15:08:15.599531+00	2025-12-16 19:38:56.75063+00	32nn2vctvskf	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	249	he6jimk65lms	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-16 19:38:56.770792+00	2025-12-17 14:12:41.690016+00	sb77idvg6pmh	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	251	frjfml73ceoz	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-12-17 14:14:05.870541+00	2025-12-17 14:14:05.870541+00	\N	e98cf96d-338b-4770-b70a-ee8427ee549e
00000000-0000-0000-0000-000000000000	102	x72xfgmb4dkv	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-01 16:27:38.9699+00	2025-12-17 14:14:28.695883+00	e7xpzd3vmskj	1eb3e9ed-11d9-40b9-88cc-06a227a242e5
00000000-0000-0000-0000-000000000000	252	i2vhr5s3toko	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-12-17 14:14:28.696249+00	2025-12-17 14:14:28.696249+00	x72xfgmb4dkv	1eb3e9ed-11d9-40b9-88cc-06a227a242e5
00000000-0000-0000-0000-000000000000	250	xpg54g4jpdr4	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-17 14:12:41.709165+00	2025-12-17 15:11:50.522799+00	he6jimk65lms	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	253	6testflxxa6h	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-17 15:11:50.54141+00	2025-12-17 16:10:34.519952+00	xpg54g4jpdr4	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	254	vabna64p37dl	dd617cd5-2370-49b5-aee2-675ab6c6841d	t	2025-12-17 16:10:34.539319+00	2025-12-17 17:41:07.30239+00	6testflxxa6h	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
00000000-0000-0000-0000-000000000000	255	tags3xlvoqny	dd617cd5-2370-49b5-aee2-675ab6c6841d	f	2025-12-17 17:41:07.319914+00	2025-12-17 17:41:07.319914+00	vabna64p37dl	e00cde59-fd06-4fc2-b1b6-5997bdb9e102
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
c9a5286f-93d0-400b-b977-c544984ea1ba	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-19 22:43:04.268414+00	2025-11-19 22:43:04.268414+00	\N	aal1	\N	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/140.0.7339.101 Mobile/15E148 Safari/604.1	24.99.194.139	\N	\N	\N	\N	\N
9062f95e-2071-48ca-b0ab-a0a8ad3fa9a6	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-19 22:43:43.283562+00	2025-11-19 22:43:43.283562+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
a48b1fcc-31cb-4867-a4b6-7c14a24e4763	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-19 22:44:02.644653+00	2025-11-19 22:44:02.644653+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
74c54320-eb22-4263-8e82-04599f52f62f	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-19 23:25:56.078143+00	2025-11-19 23:25:56.078143+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
144da480-1546-4017-833e-879039ae3e64	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-19 23:26:10.605871+00	2025-11-19 23:26:10.605871+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
533fdacc-7226-4197-ad41-5410f78ffcc2	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-19 23:26:23.4468+00	2025-11-19 23:26:23.4468+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
4533be06-bc10-4659-9843-dafa0082af00	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-20 12:50:35.312205+00	2025-11-20 12:50:35.312205+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
6c0ab737-a859-41ac-8d0e-f782d5953f9d	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-19 23:26:26.324396+00	2025-11-20 12:50:35.324926+00	\N	aal1	\N	2025-11-20 12:50:35.324106	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
18ea0def-662b-43a1-8a9b-9311840b5888	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-20 12:50:55.653936+00	2025-11-20 12:50:55.653936+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
ad101060-b7a2-4e3d-8947-eb78eb571f9a	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-20 12:58:16.182523+00	2025-11-20 12:58:16.182523+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
2e5a97cb-9ce3-4f0b-b880-9e574fddc339	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 16:13:08.998529+00	2025-11-24 16:13:08.998529+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
1fdb4cc2-0719-40bb-9927-275a8604003e	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-20 12:57:55.651113+00	2025-11-20 16:39:27.410567+00	\N	aal1	\N	2025-11-20 16:39:27.409445	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
45974117-8ad5-474b-95f4-71d4cefddefa	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-20 16:43:04.651023+00	2025-11-20 16:43:04.651023+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
66f47fbb-cd7b-49bf-9997-4da6d4aa3293	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-20 16:43:12.739904+00	2025-11-20 16:43:12.739904+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
84297508-ee69-4e53-a879-46daed5ab5be	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-20 16:43:30.20395+00	2025-11-20 16:43:30.20395+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
3fc6d3e9-83f4-4e7d-9ec0-94a303af74f7	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-20 17:07:42.530395+00	2025-11-20 17:07:42.530395+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
205115c2-053a-461b-a448-e9f2e776dda7	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-20 17:12:36.656273+00	2025-11-20 17:12:36.656273+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
23b76731-da10-42ae-86c1-e9d4129653e2	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-20 17:13:27.47747+00	2025-11-20 17:13:27.47747+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
5568e040-198b-4cb9-89ac-30b66862e37a	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-20 17:14:07.648691+00	2025-11-20 17:14:07.648691+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
b206d842-8870-4dcf-907b-76c8cce827f7	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-20 17:20:04.174564+00	2025-11-20 17:20:04.174564+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
0f584b07-5afd-47bf-9e4b-82b918802b7e	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-20 17:23:35.551056+00	2025-11-20 17:23:35.551056+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
3e35b7d8-288a-4ace-9e80-4ea7566827eb	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-20 19:27:28.356732+00	2025-11-20 19:27:28.356732+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
03c03f60-6243-49a8-b09a-36d954fb10e7	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-20 19:32:05.097394+00	2025-11-20 19:32:05.097394+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
e374c36e-c8be-47b8-95e9-d73fac6609f6	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 16:01:15.437653+00	2025-11-24 16:01:15.437653+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
f4ef9122-4532-4043-b5a2-74325637dea2	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-20 17:15:02.682407+00	2025-11-21 19:48:37.59615+00	\N	aal1	\N	2025-11-21 19:48:37.594388	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
c519edea-c1d5-4028-90b2-1bdfa0c8901b	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-21 19:48:49.891177+00	2025-11-21 19:48:49.891177+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
c00af208-ec02-4223-83c9-8e8703b339cd	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-21 19:49:14.036055+00	2025-11-21 19:49:14.036055+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
92600db8-c501-4b52-9ab2-0e3777a678b0	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-21 20:08:33.446141+00	2025-11-21 20:08:33.446141+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
4b4b6732-0e07-40ac-9920-471704eb0d45	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-21 20:11:49.550076+00	2025-11-21 20:11:49.550076+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
c0cc0f45-5555-45a4-a4c2-5c15810d8ebf	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-23 18:03:12.15839+00	2025-11-23 18:03:12.15839+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
25aebd38-321c-477a-9b14-0c423109372c	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 17:28:25.675192+00	2025-11-24 17:28:25.675192+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
e8cbe865-9fd0-4893-905c-f261924eb5c1	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 16:03:07.414936+00	2025-11-24 16:03:07.414936+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
fbebdc80-42db-4c98-acf9-8370cf0cb952	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 16:04:11.901459+00	2025-11-24 16:04:11.901459+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
7968c48e-f01c-4eed-b1dc-ae4ae1523862	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 16:06:48.957385+00	2025-11-24 16:06:48.957385+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
493ec0c6-c409-49e4-83d0-7af8a5268e7a	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 16:15:58.205605+00	2025-11-24 16:15:58.205605+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
c21a188b-c60e-480d-8028-ec4ef54803bd	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 16:24:11.012431+00	2025-11-24 16:24:11.012431+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
a8a3c516-f484-4740-8827-cbdb580161ab	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-21 20:09:43.027921+00	2025-11-24 17:00:10.822662+00	\N	aal1	\N	2025-11-24 17:00:10.822568	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
58dfd4f2-61f4-4f4e-92cb-2fb28db50de9	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 17:31:03.561897+00	2025-11-24 17:31:03.561897+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
4003266b-b794-4dc7-beb6-f3fe2ab6a9e2	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 17:32:30.889359+00	2025-11-24 17:32:30.889359+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
77214eee-97d5-4389-9ddb-1120160d6762	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 17:33:49.557742+00	2025-11-24 17:33:49.557742+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
71199c4b-12ba-4f2c-b649-e4f8b65bfb53	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 17:41:01.264958+00	2025-11-24 17:41:01.264958+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
9d36a5c2-ecfc-4daa-831e-b600be1c42c5	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 17:41:38.332825+00	2025-11-24 17:41:38.332825+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
baa1c677-b431-4869-ab4d-12c69d7b4dd3	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 17:43:05.593989+00	2025-11-24 17:43:05.593989+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
81400c58-75a4-4b68-9556-d365280feeb6	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 17:44:05.763314+00	2025-11-24 17:44:05.763314+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
d129be9f-6e78-49b0-b629-988592f9f17d	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 17:54:01.125855+00	2025-11-24 17:54:01.125855+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
5f123bbe-c7c7-4972-a673-df0aa793737e	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 17:57:40.923887+00	2025-11-24 17:57:40.923887+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
9350fa7e-360a-436d-85a6-1d606db0b65f	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 17:58:48.920301+00	2025-11-24 17:58:48.920301+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
24d12a59-cfc4-4d1e-b859-f56d4008cfc4	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 18:06:50.429115+00	2025-11-24 18:06:50.429115+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
40fccbf1-bd8f-43ee-a875-b316b0de7f40	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 18:07:43.150095+00	2025-11-24 18:07:43.150095+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
483d783d-9b7f-4516-89fc-7a995579b823	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 18:21:39.619531+00	2025-11-24 18:21:39.619531+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
bca92948-699f-4615-8ccd-b86ed5adeec8	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 18:22:12.288617+00	2025-11-24 18:22:12.288617+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
4e09cee2-4e87-4c3c-b6f7-805298281cd4	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 18:23:37.289437+00	2025-11-24 18:23:37.289437+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
fb40a083-d53b-40df-8476-6422428ee2f9	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 18:35:09.041202+00	2025-11-24 18:35:09.041202+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
b052ec6e-b8e7-462b-84e1-b0c98ac953c4	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 18:41:20.4138+00	2025-11-24 18:41:20.4138+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
79a84320-023c-491d-8d2a-b1c94d62fd01	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 18:42:22.382162+00	2025-11-24 18:42:22.382162+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
7021374f-f724-4aed-8ad8-4995373477df	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-12-01 19:33:53.158441+00	2025-12-12 02:14:16.126363+00	\N	aal1	\N	2025-12-12 02:14:16.125651	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/140.0.7339.101 Mobile/15E148 Safari/604.1	24.99.194.139	\N	\N	\N	\N	\N
03ed2096-ad0a-47c8-8172-c670a11d1bb1	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-12-01 16:27:34.799081+00	2025-12-01 16:27:34.799081+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	162.232.197.33	\N	\N	\N	\N	\N
58cd795c-02c1-488f-a436-9f615b170442	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-12-01 19:35:25.715094+00	2025-12-01 19:35:25.715094+00	\N	aal1	\N	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/140.0.7339.101 Mobile/15E148 Safari/604.1	76.242.54.231	\N	\N	\N	\N	\N
e98cf96d-338b-4770-b70a-ee8427ee549e	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-12-17 14:14:05.865631+00	2025-12-17 14:14:05.865631+00	\N	aal1	\N	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/140.0.7339.101 Mobile/15E148 Safari/604.1	24.99.194.139	\N	\N	\N	\N	\N
1eb3e9ed-11d9-40b9-88cc-06a227a242e5	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 16:15:38.486046+00	2025-12-17 14:14:28.698214+00	\N	aal1	\N	2025-12-17 14:14:28.698097	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
e00cde59-fd06-4fc2-b1b6-5997bdb9e102	dd617cd5-2370-49b5-aee2-675ab6c6841d	2025-11-24 18:42:31.652451+00	2025-12-17 17:41:07.349454+00	\N	aal1	\N	2025-12-17 17:41:07.347209	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	24.99.194.139	\N	\N	\N	\N	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	dd617cd5-2370-49b5-aee2-675ab6c6841d	authenticated	authenticated	clark.dwayne@gmail.com	$2a$10$2doU3M4yMKyRNYOlLoPRlePqtmsbB3CeYFz8c3wV71xHddMXV3ztW	2025-11-19 22:43:04.258095+00	\N		2025-11-19 22:42:27.201546+00		2025-12-17 14:13:48.339699+00			\N	2025-12-17 14:14:05.865531+00	{"provider": "email", "providers": ["email"]}	{"sub": "dd617cd5-2370-49b5-aee2-675ab6c6841d", "role": "owner", "email": "clark.dwayne@gmail.com", "tenant_id": "42143785-b951-4f18-9bfb-11209345c9e9", "active_role": "admin", "admin_verified": true, "email_verified": true, "phone_verified": false, "role_verified_at": "2025-12-01T19:33:53.334Z"}	\N	2025-11-19 22:18:00.440982+00	2025-12-17 17:41:07.333036+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: Award; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Award" (id, "profileId", "badgeId", "venueId", progress, "awardedAt", "awardedBy", revoked) FROM stdin;
\.


--
-- Data for Name: Badge; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Badge" (id, label, scope, rule, active) FROM stdin;
\.


--
-- Data for Name: DriftEvent; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DriftEvent" (id, session_id, drift_reason_v1, severity, details, created_at) FROM stdin;
\.


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Event" (id, ts, type, "profileId", "venueId", "comboHash", "staffId") FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Session" (id, "externalRef", source, "trustSignature", state, "customerPhone", "flavorMix", "loungeId", version, "createdAt", "updatedAt", "tableId", "customerRef", flavor, "priceCents", "edgeCase", "edgeNote", "assignedBOHId", "assignedFOHId", "startedAt", "endedAt", "durationSecs", "paymentIntent", "paymentStatus", "orderItems", "posMode", "timerDuration", "timerStartedAt", "timerPausedAt", "timerPausedDuration", "timerStatus", zone, "fohUserId", "specialRequests", "tableNotes", "qrCodeUrl", session_state_v1, paused, tenant_id, preorder_id, lounge_config_version, seat_id, zone_id) FROM stdin;
6eebe339-82b8-4325-96d0-ec9c6b115fb5	table-booth-002-1765244882471	WALK_IN	c878f72c8de61411532094044b3ad1184e82902459a3a452511f3120b2ee54b8	PENDING	+1 (555) 123-4567	["mint + watermelon"]	fire-session-lounge	1	2025-12-09 01:48:03.796	2025-12-09 01:48:03.796	booth-002	Gima Jones	mint + watermelon	3750	\N	\N	\N	\N	\N	\N	3600	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N
test_1765983784911_dis89lgxr	test_cs_test_1765983784911_dis89lgxr	QR	082bcca9fec92e3db73f67c9d467643caa9a5162fdc8edba088240f0aa3e4985	ACTIVE	\N	["Mint", "Grape"]	test-lounge	1	2025-12-17 15:03:06.117	2025-12-17 15:24:26.179	table-14	Test Customer 87	Mint	3000	\N	\N	user-manager	\N	\N	\N	2700	test_pi_test_1765983784911_dis89lgxr	succeeded	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Action START_ACTIVE executed by MANAGER	\N	\N	f	\N	\N	\N	\N	\N
test_1765492685208_rf441avag	test_cs_test_1765492685208_rf441avag	QR	a31a5108a22acbfe4f60a16761474d2d71091f0122191330fc16e238126e204d	ACTIVE	\N	["Mint", "Grape"]	test-lounge	1	2025-12-11 22:38:06.629	2025-12-17 15:25:35.773	table-60	Test Customer 90	Mint	3000	\N	\N	user-manager	\N	\N	\N	2700	test_pi_test_1765492685208_rf441avag	succeeded	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Action START_ACTIVE executed by MANAGER	\N	\N	f	\N	\N	\N	\N	\N
7726acbb-dc9f-41cb-882f-0c416a04be95	guest-session_1765494375981_jj2sroxey	QR	fb1202bf838bb37e2a4cfe64a6470a8fb685aa754031ccdada25566fea54e8ad	PENDING	+1234567890	["Mango + Lemon"]	guest-lounge	1	2025-12-11 23:06:16.729	2025-12-11 23:06:16.729	T-001	Guest Customer	Mango + Lemon	3400	\N	\N	\N	\N	\N	\N	2700	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Guest session started from guest build via QR scan	\N	\N	f	\N	\N	\N	\N	\N
test_1765290378620_6obne31hk	test_cs_test_1765290378620_6obne31hk	QR	0715880ef01751632e5a4fb2bbf39484aacb24546402b4dcabe7e9fff1bff4fa	ACTIVE	\N	["Mint", "Grape"]	test-lounge	1	2025-12-09 14:26:20.747	2025-12-17 15:26:36.806	table-96	Test Customer 31	Mint	3000	\N	\N	user-manager	\N	\N	\N	2700	test_pi_test_1765290378620_6obne31hk	succeeded	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Action START_ACTIVE executed by MANAGER	\N	\N	f	\N	\N	\N	\N	\N
99ed2142-ca37-451f-bbb7-dcfd4686d877	table-vip-001-1765838299669	WALK_IN	641f515453b5e862414943834ccb0bf0dd21cf681cdfd651dc1f9335fc0424b4	PENDING	+1 (555) 123-4567	["jasmine + cinnamon + lavender"]	fire-session-lounge	1	2025-12-15 22:38:20.556	2025-12-15 22:38:20.556	vip-001	John Smith	jasmine + cinnamon + lavender	5300	\N	\N	\N	\N	\N	\N	3600	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N
2088a8ae-a931-42b0-8e1c-c90308ca1038	walk_in-1765326921651	WALK_IN	3d8212dcfbddf64e462839934894ea0383350d100b92f0d455d9bd9546628da6	PENDING	+1234567890	["Demo Flavor Mix"]	demo-lounge	1	2025-12-10 00:35:24.726	2025-12-10 00:35:24.726	T-520	Demo Customer	Demo Flavor Mix	3000	\N	\N	\N	\N	\N	\N	2700	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N
test_1765981045986_66srx0awz	test_cs_test_1765981045986_66srx0awz	QR	39ec2f603afc11f22378549f655360f4b01dccfb15dc17ae2b78708861c6ea96	ACTIVE	\N	["Mint", "Grape"]	test-lounge	1	2025-12-17 14:17:26.057	2025-12-17 15:25:22.642	table-35	Test Customer 96	Mint	3000	\N	\N	user-manager	\N	\N	\N	2700	test_pi_test_1765981045986_66srx0awz	succeeded	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Action START_ACTIVE executed by MANAGER	\N	\N	f	\N	\N	\N	\N	\N
510d359e-c4cc-4a80-b6a6-f7dc588cb582	table-booth-001-1765493019815	WALK_IN	47f0ecfec9a8b3d7c915d957b93f606f2fec43920e8ed903a86f73f04f135505	PENDING	+1 (555) 123-4567	["watermelon + chocolate"]	fire-session-lounge	1	2025-12-11 22:43:41.913	2025-12-11 22:43:41.913	booth-001	John Max	watermelon + chocolate	3850	\N	\N	Alex Johnson	Lisa Brown	\N	\N	3600	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N
af237667-db81-4962-891d-77b49df14c43	walk_in-1765544485632	WALK_IN	d2ad9c5efc01d729ef72305604ed6ff02ac8a4c2a8ed24d2b2abf9002efa4f0b	PENDING	\N	["mint"]	default-lounge	1	2025-12-12 13:01:26.589	2025-12-12 13:01:26.589	T-004	Creator	mint	3250	\N	\N	\N	\N	\N	\N	2700	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Walk-in customer	\N	\N	f	\N	\N	\N	\N	\N
test_1765247427938_hg5yqpwy1	test_cs_test_1765247427938_hg5yqpwy1	QR	65ca787d51f51b71294c26a586305b70ff85fe4a58c68e468f798925f76f84d1	ACTIVE	\N	["Mint", "Grape"]	test-lounge	1	2025-12-09 02:30:28.779	2025-12-17 15:27:12.745	table-50	Test Customer 98	Mint	3000	\N	\N	user-manager	\N	\N	\N	2700	test_pi_test_1765247427938_hg5yqpwy1	succeeded	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Action START_ACTIVE executed by MANAGER	\N	\N	f	\N	\N	\N	\N	\N
\.


--
-- Data for Name: SessionEvent; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SessionEvent" (id, "sessionId", type, "payloadSeal", data, "createdAt") FROM stdin;
\.


--
-- Data for Name: TaxonomyUnknown; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TaxonomyUnknown" (id, enum_type, raw_label, suggested_mapping, count, example_event_id, example_payload, first_seen, last_seen, created_at, updated_at) FROM stdin;
791808fe-adb7-411f-936f-f12266abf076	TrustEventType	ui.roi.render	\N	2	cmhy0e4z20018f2vhis9x9scd	{"eventId": "cmhy0e4z20018f2vhis9x9scd", "legacyType": "ui.roi.render"}	2025-11-14 14:06:29.737337+00	2025-11-14 14:06:29.983937+00	2025-11-14 14:06:29.737337+00	2025-11-14 14:06:29.983937+00
f06ffe0f-afc2-4a73-8516-db51c846f73e	TrustEventType	admin.operator_onboarding.update	\N	6	cmhtlqpgg000cpmp20q8t15xe	{"eventId": "cmhtlqpgg000cpmp20q8t15xe", "legacyType": "admin.operator_onboarding.update"}	2025-11-14 14:06:29.792199+00	2025-11-14 14:06:30.124535+00	2025-11-14 14:06:29.792199+00	2025-11-14 14:06:30.124535+00
6324e80d-a568-4069-8c79-8a0494bbff59	TrustEventType	onboarding.signup	\N	2	cmhuyn3uo000kpmp2jdrbv262	{"eventId": "cmhuyn3uo000kpmp2jdrbv262", "legacyType": "onboarding.signup"}	2025-11-14 14:06:29.638104+00	2025-11-14 14:06:30.18544+00	2025-11-14 14:06:29.638104+00	2025-11-14 14:06:30.18544+00
a1e01648-88c0-4999-acef-22f060d6faac	TrustEventType	ui.pricing.render	\N	2	cmhy0e57e001af2vh81q7sdbp	{"eventId": "cmhy0e57e001af2vh81q7sdbp", "legacyType": "ui.pricing.render"}	2025-11-14 14:06:30.078299+00	2025-11-14 14:06:30.230089+00	2025-11-14 14:06:30.078299+00	2025-11-14 14:06:30.230089+00
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, lounge_id, user_id, action, entity_type, entity_id, changes, created_at) FROM stdin;
\.


--
-- Data for Name: deliveries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.deliveries (id, session_id, order_id, delivered_by, delivered_at, notes) FROM stdin;
\.


--
-- Data for Name: flavors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.flavors (id, lounge_id, name, description, tags, is_premium, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: ghostlog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ghostlog (id, venue_id, session_id, actor, event, meta, created_at) FROM stdin;
\.


--
-- Data for Name: lounge_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lounge_configs (id, lounge_id, config_data, version, effective_at, created_at) FROM stdin;
\.


--
-- Data for Name: loyalty_note_bindings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.loyalty_note_bindings (id, loyalty_profile_id, session_note_id) FROM stdin;
\.


--
-- Data for Name: loyalty_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.loyalty_profiles (id, lounge_id, guest_key, cumulative_spend, visit_count, last_visit_at, preference_summary, trust_score, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: memberships; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.memberships (user_id, tenant_id, role, created_at) FROM stdin;
dd617cd5-2370-49b5-aee2-675ab6c6841d	42143785-b951-4f18-9bfb-11209345c9e9	owner	2025-11-19 22:38:46.540712+00
0cd3902b-419f-4eb8-9190-42b97d7115b6	9e5bd91f-bdc3-4dc3-b1d7-f724123edacd	owner	2025-11-21 20:06:55.401075+00
7aa5b8d4-2703-4070-8f50-55009ccaef85	63ef218f-1cd0-4380-90b8-1b05b5072690	owner	2025-11-21 20:09:18.396242+00
5a7c1e37-feb1-4646-8a19-aac668d4fcc3	e84e4ba7-fda1-4335-9682-f8527a99dc05	owner	2025-11-21 20:11:01.796861+00
9d63c84a-7d13-4686-80f0-773a35d1801d	136eabe6-71dc-41af-b122-76a55127f734	owner	2025-11-23 18:03:32.825791+00
f2587807-5a99-43ca-937a-45254bd65777	af6388af-f190-4d13-b5da-1bc64535c13b	owner	2025-11-24 16:01:26.115271+00
30ec7428-46ba-455d-ba1b-8f1d396c6d05	caa98749-3d1c-472b-82a4-76b9d7974143	owner	2025-11-24 16:04:29.146484+00
e07316be-eff6-4590-ae0e-658169cd792b	49d82d08-ce5c-42ca-ad23-5fdd73c7a800	owner	2025-11-24 17:57:58.889106+00
\.


--
-- Data for Name: menu_files; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.menu_files (id, lead_id, file_name, file_url, file_type, file_size, uploaded_at, processed_at, status, extracted_data, tenant_id, deleted_at) FROM stdin;
\.


--
-- Data for Name: mix_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mix_templates (id, lounge_id, name, flavor_ids, price_cents, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: order_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_events (id, order_id, event_type, staff_id, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, item_type, item_id, name, quantity, price_cents, metadata) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, session_id, type, status, price_snapshot, special_instructions, created_at, updated_at, served_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, tenant_id, session_id, stripe_charge_id, amount_cents, status, paid_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: preorders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.preorders (id, lounge_id, guest_handle, qr_code, status, scheduled_time, party_size, flavor_mix_json, base_price, locked_price, metadata, session_id, created_at, converted_at, expires_at) FROM stdin;
\.


--
-- Data for Name: pricing_rules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pricing_rules (id, lounge_id, rule_type, rule_config, version, is_active, effective_at, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: refills; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.refills (id, session_id, venue_id, requested_at, completed_at) FROM stdin;
\.


--
-- Data for Name: reflex_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reflex_events (id, type, source, "sessionId", "paymentIntent", payload, "payloadHash", "userAgent", ip, "createdAt", "ctaSource", "ctaType", referrer, "campaignId", metadata, trust_event_type_v1, tenant_id, "trustEventTypeV1") FROM stdin;
cmj7jdg1j0003xlg6itgs6fvx	onboarding.signup	ui	\N	\N	{"id":"TE-2025-277674","ts_utc":"2025-12-15T19:17:57.674Z","type":"fast_checkout","actor":{"anon_hash":"sha256:68cdb9595ba2ea252317d3aa5687544434bb3ecfc91974236ce2462dfa30fd58","device_id":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36"},"context":{"vertical":"hookah","time_local":"14:17"},"behavior":{"action":"onboarding.signup","payload":{"businessName":"idsnsmh_atlanta_mobile_","ownerName":"Antonio Walker","email":"idontseenosmoke@gmail.com","phone":"4706984005","location":"Atlanta, Ga","stage":"new-leads","source":"manual","seatingTypes":[],"totalCapacity":"","numberOfTables":"","averageSessionDuration":"","currentPOS":"","pricingModel":"time-based","preferredFeatures":[],"createdAt":"2025-12-15T19:17:57.117Z","notes":[{"id":"note_1765826279383","content":"📱 Instagram DM Message:\\n\\nHey Antonio Walker! 👋\\n\\nI'd love to show you how Hookah+ can help idsnsmh_atlanta_mobile_:\\n\\n✨ Increase table turnover\\n📊 Track session times & revenue\\n💳 Accept payments seamlessly\\n📱 Give guests a modern ordering experience\\n\\nI've set up a personalized demo for you:\\nhttps://app.hookahplus.net/demo/idsnsmh-atlanta-mobile\\n\\nCheck it out when you have a moment - it's customized for idsnsmh_atlanta_mobile_!\\n\\nLet me know what works best for you! 🙌","author":"system","createdAt":"2025-12-15T19:17:59.383Z","noteType":"dm_template"}],"menuLink":"https://www.instagram.com/idsnsmh_atlanta_mobile_/","baseHookahPrice":"","refillPrice":"","menuFiles":[],"instagramUrl":"https://www.instagram.com/idsnsmh_atlanta_mobile_/","facebookUrl":"https://www.facebook.com/antonio.walker.381093/","websiteUrl":"","instagramScrapedData":{"menuItems":[],"flavors":[],"extractedAt":"2025-12-15T19:17:57.670Z","source":"instagram"},"demoLink":"https://app.hookahplus.net/demo/idsnsmh-atlanta-mobile","demoSlug":"idsnsmh-atlanta-mobile","demoTenantId":"e49233de-1d22-4373-bcb0-60cdcf19a2c1","demoCreatedAt":"2025-12-15T19:17:58.693Z"}},"effect":{"loyalty_delta":0,"credit_type":"HPLUS_CREDIT"},"security":{"signature":"ed25519:da84b79004d9db930647ed56a2ad3094cfd577c93567ac400871cf9427f2adff","device_id":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36","ip_hash":"sha256:eff8e7ca506627fe15dda5e0e512fcaad70b6d520f37cc76597fdb4f2d83a1a3"}}	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	::1	2025-12-15 19:17:57.697+00	manual	onboarding_signup	\N	\N	\N	\N	e49233de-1d22-4373-bcb0-60cdcf19a2c1	fast_checkout
cmj7jv7f90005xlg6vdykpxxq	onboarding.signup	ui	\N	\N	{"id":"TE-2025-106293","ts_utc":"2025-12-15T19:31:46.293Z","type":"fast_checkout","actor":{"anon_hash":"sha256:2f44d9d0a44fa838c98f7bebee2f941ac0106993092acb92ec6b910dd6bf7592","device_id":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36"},"context":{"vertical":"hookah","time_local":"14:31"},"behavior":{"action":"onboarding.signup","payload":{"businessName":"premierhookah","ownerName":"","email":"No email","phone":"484-809-9436","location":"Philadelphia, PA","stage":"new-leads","source":"manual","seatingTypes":[],"totalCapacity":"","numberOfTables":"","averageSessionDuration":"","currentPOS":"","pricingModel":"time-based","preferredFeatures":[],"createdAt":"2025-12-15T19:31:45.995Z","notes":[{"id":"note_1765827107398","content":"📱 Instagram DM Message:\\n\\nHey there! 👋\\n\\nI'd love to show you how Hookah+ can help premierhookah:\\n\\n✨ Increase table turnover\\n📊 Track session times & revenue\\n💳 Accept payments seamlessly\\n📱 Give guests a modern ordering experience\\n\\nI've set up a personalized demo for you:\\nhttps://app.hookahplus.net/demo/premierhookah\\n\\nCheck it out when you have a moment - it's customized for premierhookah!\\n\\nLet me know what works best for you! 🙌","author":"system","createdAt":"2025-12-15T19:31:47.398Z","noteType":"dm_template"},{"id":"note_1765827161319","content":"📱 Instagram DM Message:\\n\\nHey Unknown! 👋\\n\\nI'd love to show you how Hookah+ can help premierhookah:\\n\\n✨ Increase table turnover\\n📊 Track session times & revenue\\n💳 Accept payments seamlessly\\n📱 Give guests a modern ordering experience\\n\\nI've set up a personalized demo for you:\\nhttps://app.hookahplus.net/demo/premierhookah\\n\\nCheck it out when you have a moment - it's customized for premierhookah!\\n\\nLet me know what works best for you! 🙌","author":"system","createdAt":"2025-12-15T19:32:41.319Z","type":"dm_template"}],"menuLink":"https://www.instagram.com/premierhookah/","baseHookahPrice":"","refillPrice":"","menuFiles":[],"instagramUrl":"https://www.instagram.com/premierhookah/","facebookUrl":"","websiteUrl":"www.premierhookahcatering.com","instagramScrapedData":{"menuItems":[],"flavors":[],"extractedAt":"2025-12-15T19:31:46.290Z","source":"instagram"},"demoLink":"https://app.hookahplus.net/demo/premierhookah","demoSlug":"premierhookah","demoTenantId":"9de28784-eb9c-4d36-85af-50c10740d852","demoCreatedAt":"2025-12-15T19:31:47.170Z"}},"effect":{"loyalty_delta":0,"credit_type":"HPLUS_CREDIT"},"security":{"signature":"ed25519:d7061cb56a2bbca20a7a9c8678536db391410d20d97589cc89c19d09abd24fd6","device_id":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36","ip_hash":"sha256:eff8e7ca506627fe15dda5e0e512fcaad70b6d520f37cc76597fdb4f2d83a1a3"}}	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	::1	2025-12-15 19:31:46.331+00	manual	onboarding_signup	\N	\N	\N	\N	9de28784-eb9c-4d36-85af-50c10740d852	fast_checkout
cmiz7vcq00003dwjdiky67f7y	onboarding.signup	ui	\N	\N	{"id":"TE-2025-228406","ts_utc":"2025-12-09T23:33:48.406Z","type":"fast_checkout","actor":{"anon_hash":"sha256:f4e5303497bf695d03d1b198ae1e08df12686fa14925843ee8b72b284c308c5b","device_id":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"},"context":{"vertical":"hookah","time_local":"18:33"},"behavior":{"action":"onboarding.signup","payload":{"businessName":"Illusionloungeatl","ownerName":"Dwayne","email":"clark.dwayne@gmail.com","phone":"4702269219","location":"Atlanta","stage":"new-leads","source":"manual","seatingTypes":[],"totalCapacity":"","numberOfTables":"","averageSessionDuration":"","currentPOS":"","pricingModel":"time-based","preferredFeatures":[],"createdAt":"2025-12-09T23:33:47.717Z","notes":[],"menuLink":"https://www.instagram.com/illusionloungeatl/","baseHookahPrice":"","refillPrice":"","menuFiles":[],"instagramUrl":"https://www.instagram.com/illusionloungeatl/","facebookUrl":"","websiteUrl":"https://www.instagram.com/illusionloungeatl/","instagramScrapedData":{"menuItems":[],"flavors":[],"extractedAt":"2025-12-09T23:33:48.404Z","source":"instagram"},"demoLink":"https://app.hookahplus.net/demo/illusionloungeatl","demoSlug":"illusionloungeatl","demoTenantId":"084972b3-fc7a-4822-9051-06d65680f3e1","demoCreatedAt":"2025-12-09T23:34:19.187Z"}},"effect":{"loyalty_delta":0,"credit_type":"HPLUS_CREDIT"},"security":{"signature":"ed25519:1db415908a5d517bd83813a5febce6611867ecfceaaabde03f7eb7fc08273908","device_id":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36","ip_hash":"sha256:eff8e7ca506627fe15dda5e0e512fcaad70b6d520f37cc76597fdb4f2d83a1a3"}}	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	::1	2025-12-09 23:33:48.447+00	manual	onboarding_signup	\N	\N	\N	\N	084972b3-fc7a-4822-9051-06d65680f3e1	fast_checkout
cmj7jwdzj0006xlg68trty2q5	admin.operator_onboarding.update	ui	\N	\N	{"leadId":"cmj7jv7f90005xlg6vdykpxxq","action":"add_note","updates":{"note":"📱 Instagram DM Message:\\n\\nHey Unknown! 👋\\n\\nI'd love to show you how Hookah+ can help premierhookah:\\n\\n✨ Increase table turnover\\n📊 Track session times & revenue\\n💳 Accept payments seamlessly\\n📱 Give guests a modern ordering experience\\n\\nI've set up a personalized demo for you:\\nhttps://app.hookahplus.net/demo/premierhookah\\n\\nCheck it out when you have a moment - it's customized for premierhookah!\\n\\nLet me know what works best for you! 🙌","author":"system","noteType":"dm_template"},"timestamp":"2025-12-15T19:32:41.550Z"}	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	::1	2025-12-15 19:32:41.551+00	\N	\N	\N	\N	\N	\N	\N	\N
cmiz9euj10007dwjd9giypytn	onboarding.signup	ui	\N	\N	{"id":"TE-2025-817583","ts_utc":"2025-12-10T00:16:57.583Z","type":"fast_checkout","actor":{"anon_hash":"sha256:2f44d9d0a44fa838c98f7bebee2f941ac0106993092acb92ec6b910dd6bf7592","device_id":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"},"context":{"vertical":"hookah","time_local":"19:16"},"behavior":{"action":"onboarding.signup","payload":{"businessName":"Serenityjaxbeach","ownerName":"","email":"No email","phone":"17493100416","location":"","stage":"new-leads","source":"manual","seatingTypes":[],"totalCapacity":"","numberOfTables":"","averageSessionDuration":"","currentPOS":"","pricingModel":"time-based","preferredFeatures":[],"createdAt":"2025-12-10T00:16:57.437Z","notes":[{"id":"note_1765325936353","content":"📱 Instagram DM Message:\\n\\nHey Unknown! 👋\\n\\nI'd love to show you how Hookah+ can help Serenityjaxbeach:\\n\\n✨ Increase table turnover\\n📊 Track session times & revenue\\n💳 Accept payments seamlessly\\n📱 Give guests a modern ordering experience\\n\\nWould you be open to a quick 15-min demo? I can show you exactly how it works for your setup.\\n\\nLet me know what works best for you! 🙌","author":"system","createdAt":"2025-12-10T00:18:56.353Z","type":"dm_template"}],"menuLink":"https://www.instagram.com/serenityjaxbeach/","baseHookahPrice":"","refillPrice":"","menuFiles":[],"instagramUrl":"https://www.instagram.com/serenityjaxbeach/","facebookUrl":"","websiteUrl":"https://www.serenityjaxbeach.com/","instagramScrapedData":{"menuItems":[],"flavors":[],"extractedAt":"2025-12-10T00:16:57.582Z","source":"instagram"}}},"effect":{"loyalty_delta":0,"credit_type":"HPLUS_CREDIT"},"security":{"signature":"ed25519:ffe515930a27f66088f2eac1b4b0ae71333cd575d6760aceedb9b0577f664892","device_id":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36","ip_hash":"sha256:eff8e7ca506627fe15dda5e0e512fcaad70b6d520f37cc76597fdb4f2d83a1a3"}}	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	::1	2025-12-10 00:16:57.608+00	manual	onboarding_signup	\N	\N	\N	\N	\N	fast_checkout
cmiz9hec60008dwjdc7fhw7cc	admin.operator_onboarding.update	ui	\N	\N	{"leadId":"cmiz9euj10007dwjd9giypytn","action":"add_note","updates":{"note":"📱 Instagram DM Message:\\n\\nHey Unknown! 👋\\n\\nI'd love to show you how Hookah+ can help Serenityjaxbeach:\\n\\n✨ Increase table turnover\\n📊 Track session times & revenue\\n💳 Accept payments seamlessly\\n📱 Give guests a modern ordering experience\\n\\nWould you be open to a quick 15-min demo? I can show you exactly how it works for your setup.\\n\\nLet me know what works best for you! 🙌","author":"system","noteType":"dm_template"},"timestamp":"2025-12-10T00:18:56.596Z"}	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	::1	2025-12-10 00:18:56.599+00	\N	\N	\N	\N	\N	\N	\N	\N
cmj2vrhrb0005mvhr8agpqr62	onboarding.signup	ui	\N	\N	{"id":"TE-2025-757519","ts_utc":"2025-12-12T13:05:57.520Z","type":"fast_checkout","actor":{"anon_hash":"sha256:2f44d9d0a44fa838c98f7bebee2f941ac0106993092acb92ec6b910dd6bf7592","device_id":"node"},"context":{"vertical":"hookah","time_local":"08:05"},"behavior":{"action":"onboarding.signup","payload":{"businessName":"From Social Media","ownerName":"","email":"No email","phone":"","location":"","stage":"new-leads","source":"website","seatingTypes":[],"totalCapacity":"","numberOfTables":"","averageSessionDuration":"","currentPOS":"","pricingModel":"time-based","preferredFeatures":[],"createdAt":"2025-12-12T13:05:55.566Z","notes":[{"id":"note_1765544759049","content":"📱 Instagram DM Message:\\n\\nHey there! 👋\\n\\nI'd love to show you how Hookah+ can help From Social Media:\\n\\n✨ Increase table turnover\\n📊 Track session times & revenue\\n💳 Accept payments seamlessly\\n📱 Give guests a modern ordering experience\\n\\nI've set up a personalized demo for you:\\nhttps://app.hookahplus.net/demo/from-social-media\\n\\nCheck it out when you have a moment - it's customized for From Social Media!\\n\\nLet me know what works best for you! 🙌","author":"system","createdAt":"2025-12-12T13:05:59.049Z","noteType":"dm_template"}],"menuLink":"https://www.instagram.com/hookahplusnet/","baseHookahPrice":"","refillPrice":"","menuFiles":[],"instagramUrl":"https://www.instagram.com/hookahplusnet/","facebookUrl":"","websiteUrl":"https://hookahplus.net/","instagramScrapedData":{"menuItems":[],"flavors":[],"extractedAt":"2025-12-12T13:05:57.519Z","source":"instagram"},"demoLink":"https://app.hookahplus.net/demo/from-social-media","demoSlug":"from-social-media","demoTenantId":"a5e60077-7d64-424a-9851-c7571b38fab7","demoCreatedAt":"2025-12-12T13:05:58.832Z"}},"effect":{"loyalty_delta":0,"credit_type":"HPLUS_CREDIT"},"security":{"signature":"ed25519:caa17a8c69bd3a04e7b9f03f612e53cc5ca390cf0645c01afbe9f2f5c41c40c5","device_id":"node","ip_hash":"sha256:eff8e7ca506627fe15dda5e0e512fcaad70b6d520f37cc76597fdb4f2d83a1a3"}}	\N	node	::1	2025-12-12 13:05:57.626+00	website	onboarding_signup	\N	\N	\N	\N	a5e60077-7d64-424a-9851-c7571b38fab7	fast_checkout
cmj7j984i0001xlg6puv13ige	onboarding.signup	ui	\N	\N	{"id":"TE-2025-080738","ts_utc":"2025-12-15T19:14:40.738Z","type":"fast_checkout","actor":{"anon_hash":"sha256:2e1576a98c2ea6f4faf9eda01e30e3fc6f5e839e3659af03c92d27f52e037786","device_id":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36"},"context":{"vertical":"hookah","time_local":"14:14"},"behavior":{"action":"onboarding.signup","payload":{"businessName":"Lekeleee","ownerName":"Oki Adeleke","email":"info@deluxehookah.ng","phone":"1031083193","location":"Nigeria","stage":"new-leads","source":"manual","seatingTypes":[],"totalCapacity":"","numberOfTables":"","averageSessionDuration":"","currentPOS":"","pricingModel":"time-based","preferredFeatures":[],"createdAt":"2025-12-15T19:14:39.558Z","notes":[{"id":"note_1765826081881","content":"📱 Instagram DM Message:\\n\\nHey Oki Adeleke! 👋\\n\\nI'd love to show you how Hookah+ can help Lekeleee:\\n\\n✨ Increase table turnover\\n📊 Track session times & revenue\\n💳 Accept payments seamlessly\\n📱 Give guests a modern ordering experience\\n\\nI've set up a personalized demo for you:\\nhttps://app.hookahplus.net/demo/lekeleee\\n\\nCheck it out when you have a moment - it's customized for Lekeleee!\\n\\nLet me know what works best for you! 🙌","author":"system","createdAt":"2025-12-15T19:14:41.881Z","noteType":"dm_template"}],"menuLink":"https://www.instagram.com/lekeleee/","baseHookahPrice":"","refillPrice":"","menuFiles":[],"instagramUrl":"https://www.instagram.com/lekeleee/","facebookUrl":"","websiteUrl":"https://l.instagram.com/?u=https%3A%2F%2Fyoutube.com%2F%40deluxehookah%3Fsi%3DMcOkRxaV7U5vn8sM%26fbclid%3DPAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnRqldbYnNcxwCtocA4Z60vsl5kNyO3hOyicgeHH0KAPeRl9HvfnV2PKG69Jc_aem_0lQAXdL1P2Jv8i2ubI0KaQ&e=AT0tZeVSjfURT3i7zGWdvmzNaDFWNRaTYCinz599KeHOjZ0LEyE8nMnfVPQH59W9V3XlDbzdz0hxxLV9n8ekli6BXiiJr-_eKNNxepUK9w","instagramScrapedData":{"menuItems":[],"flavors":[],"extractedAt":"2025-12-15T19:14:40.736Z","source":"instagram"},"demoLink":"https://app.hookahplus.net/demo/lekeleee","demoSlug":"lekeleee","demoTenantId":"99e35522-0c74-4a53-a03c-31f196a351e8","demoCreatedAt":"2025-12-15T19:14:41.632Z"}},"effect":{"loyalty_delta":0,"credit_type":"HPLUS_CREDIT"},"security":{"signature":"ed25519:e25cdc2d4e908dfc86e1196aa61892f7f8dc7199aad2d3babac745bb14f6b5c5","device_id":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36","ip_hash":"sha256:eff8e7ca506627fe15dda5e0e512fcaad70b6d520f37cc76597fdb4f2d83a1a3"}}	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	::1	2025-12-15 19:14:40.86+00	manual	onboarding_signup	\N	\N	\N	\N	99e35522-0c74-4a53-a03c-31f196a351e8	fast_checkout
\.


--
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reservations (id, venue_id, table_id, status, payment_intent_id, hold_amount_cents, window_minutes, created_at) FROM stdin;
\.


--
-- Data for Name: seats; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seats (id, lounge_id, zone_id, table_id, name, capacity, coordinates, qr_enabled, status, price_multiplier, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: session_notes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session_notes (id, session_id, note_type, text, sentiment, loyalty_impact, behavioral_tags, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (id, venue_id, table_id, tier, flavors, status, started_at, ends_at, price_lookup_key, payment_intent_id, checkout_session_id, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staff (id, user_id, venue_id, role, email, phone, metadata, created_at, updated_at) FROM stdin;
743d9721-4b01-48f4-b453-f4f02bdbf0f3	a25a1afc-cc24-4b1f-b19f-ed66062fe8ac	2fd12b1f-3713-4834-8ff3-80b5da0b7d1c	MANAGER	manager@example.com	\N	\N	2025-09-16 17:21:30.737532+00	\N
\.


--
-- Data for Name: stations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stations (id, lounge_id, name, station_type, zone_id, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: stripe_webhook_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stripe_webhook_events (id, type, received_at) FROM stdin;
\.


--
-- Data for Name: sync_backlog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sync_backlog (id, device_id, lounge_id, operation, payload, status, retry_count, last_attempt, created_at, synced_at) FROM stdin;
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tenants (id, name, created_at) FROM stdin;
c2ff0827-e0d4-433a-8034-cffcc827b22d	default-lounge	2025-11-19 14:49:48.388+00
b5c0c102-a4ab-4a92-8047-a8f9fd12468e	Hookah+	2025-11-19 22:36:34.403041+00
42143785-b951-4f18-9bfb-11209345c9e9	Hookah+	2025-11-19 22:38:46.132028+00
c3b63c69-e121-4971-a4c0-b9e64071ac2f	Hookah+	2025-11-20 12:57:45.485197+00
11657026-c935-468a-a0d7-7e1edd0f8070	Yipes	2025-11-20 12:59:27.640568+00
f9f659cf-2723-4b16-8761-aeada90562a6	Hookah+	2025-11-20 16:39:29.100718+00
4250dee6-77e3-4262-98fc-99665546743d	Hookah+	2025-11-20 16:42:28.375064+00
6951d281-9730-4105-bc67-0b12918f8a1b	Hookah+	2025-11-20 16:42:37.037005+00
55750c3a-cb80-470e-88e9-75b8bf81136e	Hookah+	2025-11-20 16:45:18.999126+00
75ca66f0-41e4-45db-9ae5-10ef6938a26f	Hookah+	2025-11-20 16:47:42.036492+00
7efc061a-f691-4ab9-9256-571849185b0d	Hookah+	2025-11-20 17:07:08.726793+00
5e8b4270-f2e3-4a3d-bd58-5d824b3716e6	Hookah+	2025-11-20 17:08:02.791833+00
8e68ca6d-f41e-4f07-b9c9-294ad650c125	Hookah+	2025-11-20 17:15:14.136603+00
0e5fac7e-36c5-453b-a508-45092a2afd6f	Hookah+	2025-11-20 17:15:47.757902+00
032618ec-6b61-4d4c-946b-9e5391933d6e	Hookah+	2025-11-20 17:15:50.896639+00
3927789d-210e-43c1-ae9a-3a8c488c6721	Hookah+	2025-11-20 19:28:09.705532+00
aac09ac7-183e-4d38-a5d5-23fe2e42124c	Hookah+	2025-11-21 16:46:09.427568+00
ea061003-998b-4dfd-84bc-0be18c395930	Hookah+	2025-11-21 17:01:47.629925+00
65180551-64eb-4373-a174-bdc42cf6ab9d	Hookah+	2025-11-21 17:03:22.332557+00
c96d8c8c-ebfa-42af-a085-e92cdb7446ee	Hookah+	2025-11-21 19:48:38.554058+00
eea88cbf-46be-4598-af89-b5078fded302	Hookah+	2025-11-21 19:54:08.249512+00
2c49274d-208f-4825-a6fa-26150400a62e	Hookah+	2025-11-21 20:00:37.647214+00
9e5bd91f-bdc3-4dc3-b1d7-f724123edacd	Hookah+	2025-11-21 20:06:55.020739+00
63ef218f-1cd0-4380-90b8-1b05b5072690	Hookah+	2025-11-21 20:09:18.077584+00
e84e4ba7-fda1-4335-9682-f8527a99dc05	Hookah+	2025-11-21 20:11:01.57079+00
136eabe6-71dc-41af-b122-76a55127f734	Hookah+	2025-11-23 18:03:32.426868+00
af6388af-f190-4d13-b5da-1bc64535c13b	Hookah+	2025-11-24 16:01:25.673991+00
caa98749-3d1c-472b-82a4-76b9d7974143	Hookah+	2025-11-24 16:04:28.819719+00
49d82d08-ce5c-42ca-ad23-5fdd73c7a800	Hookah+	2025-11-24 17:57:58.564748+00
ef876854-eaff-486f-98f5-88da654410fa	Portland Smoke shop	2025-11-24 18:52:26.961+00
e6b2630e-759a-4594-9d68-e001ef136b3b	pureloungeatl	2025-11-24 19:06:42.512+00
37b535d0-6a2b-4ff4-bca6-6ce738ea439c	The 2727	2025-11-30 17:04:55.147+00
f6727579-bb2d-4113-9fb6-96c73b2a4233	Mousiache	2025-12-01 01:00:44.498+00
1e8865d4-2883-4dd6-9fb9-926ee4427a67	Hope Global Forum Contact	2025-12-01 19:44:53.155+00
ba996bf4-6857-4fe5-860c-f2f14fdbd11e	axishookahlounge	2025-12-08 17:51:40.075+00
6e3c5d87-1ae1-48fa-b28b-8189a93e7635	Hookahplus	2025-12-09 00:17:09.348+00
084972b3-fc7a-4822-9051-06d65680f3e1	Illusionloungeatl	2025-12-09 23:34:18.979+00
29fef37c-eb18-4f63-86eb-13c8d4c16320	Serenityjaxbeach	2025-12-10 00:11:38.924+00
a5e60077-7d64-424a-9851-c7571b38fab7	From Social Media	2025-12-12 13:05:58.635+00
99e35522-0c74-4a53-a03c-31f196a351e8	Lekeleee	2025-12-15 19:14:41.404+00
e49233de-1d22-4373-bcb0-60cdcf19a2c1	idsnsmh_atlanta_mobile_	2025-12-15 19:17:58.407+00
9de28784-eb9c-4d36-85af-50c10740d852	premierhookah	2025-12-15 19:31:46.945+00
\.


--
-- Data for Name: venues; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.venues (id, name, address, metadata, created_at, updated_at) FROM stdin;
2fd12b1f-3713-4834-8ff3-80b5da0b7d1c	Demo Venue	123 Main St	{"note": "auto-created"}	2025-09-16 17:21:30.737532+00	\N
\.


--
-- Data for Name: zones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.zones (id, lounge_id, name, zone_type, display_order, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-06-15 04:08:06
20211116045059	2025-06-15 04:08:09
20211116050929	2025-06-15 04:08:11
20211116051442	2025-06-15 04:08:13
20211116212300	2025-06-15 04:08:16
20211116213355	2025-06-15 04:08:18
20211116213934	2025-06-15 04:08:20
20211116214523	2025-06-15 04:08:22
20211122062447	2025-06-15 04:08:24
20211124070109	2025-06-15 04:08:26
20211202204204	2025-06-15 04:08:28
20211202204605	2025-06-15 04:08:30
20211210212804	2025-06-15 04:08:37
20211228014915	2025-06-15 04:08:39
20220107221237	2025-06-15 04:08:41
20220228202821	2025-06-15 04:08:43
20220312004840	2025-06-15 04:08:45
20220603231003	2025-06-15 04:08:48
20220603232444	2025-06-15 04:08:50
20220615214548	2025-06-15 04:08:53
20220712093339	2025-06-15 04:08:55
20220908172859	2025-06-15 04:08:57
20220916233421	2025-06-15 04:08:59
20230119133233	2025-06-15 04:09:01
20230128025114	2025-06-15 04:09:04
20230128025212	2025-06-15 04:09:06
20230227211149	2025-06-15 04:09:08
20230228184745	2025-06-15 04:09:10
20230308225145	2025-06-15 04:09:12
20230328144023	2025-06-15 04:09:14
20231018144023	2025-06-15 04:09:16
20231204144023	2025-06-15 04:09:19
20231204144024	2025-06-15 04:09:21
20231204144025	2025-06-15 04:09:23
20240108234812	2025-06-15 04:09:25
20240109165339	2025-06-15 04:09:27
20240227174441	2025-06-15 04:09:31
20240311171622	2025-06-15 04:09:34
20240321100241	2025-06-15 04:09:38
20240401105812	2025-06-15 04:09:44
20240418121054	2025-06-15 04:09:47
20240523004032	2025-06-15 04:09:54
20240618124746	2025-06-15 04:09:56
20240801235015	2025-06-15 04:09:58
20240805133720	2025-06-15 04:10:00
20240827160934	2025-06-15 04:10:02
20240919163303	2025-06-15 04:10:05
20240919163305	2025-06-15 04:10:07
20241019105805	2025-06-15 04:10:09
20241030150047	2025-06-15 04:10:17
20241108114728	2025-06-15 04:10:19
20241121104152	2025-06-15 04:10:21
20241130184212	2025-06-15 04:10:24
20241220035512	2025-06-15 04:10:26
20241220123912	2025-06-15 04:10:28
20241224161212	2025-06-15 04:10:30
20250107150512	2025-06-15 04:10:32
20250110162412	2025-06-15 04:10:34
20250123174212	2025-06-15 04:10:36
20250128220012	2025-06-15 04:10:38
20250506224012	2025-06-15 04:10:40
20250523164012	2025-06-15 04:10:42
20250714121412	2025-09-13 04:00:08
20250905041441	2025-11-11 20:53:01
20251103001201	2025-11-11 20:53:01
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
menu-files	menu-files	\N	2025-11-24 23:09:33.933723+00	2025-11-24 23:09:33.933723+00	f	f	10485760	{application/pdf,image/jpeg,image/png,image/jpg}	\N	STANDARD
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-06-15 04:08:03.912711
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-06-15 04:08:03.915699
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-06-15 04:08:03.917804
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-06-15 04:08:03.934486
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-06-15 04:08:03.958397
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-06-15 04:08:03.960797
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-06-15 04:08:03.963987
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-06-15 04:08:03.967191
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-06-15 04:08:03.969749
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-06-15 04:08:03.973421
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-06-15 04:08:03.976548
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-06-15 04:08:03.980208
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-06-15 04:08:03.987217
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-06-15 04:08:03.990212
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-06-15 04:08:03.99314
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-06-15 04:08:04.02243
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-06-15 04:08:04.025477
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-06-15 04:08:04.028187
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-06-15 04:08:04.031723
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-06-15 04:08:04.037438
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-06-15 04:08:04.040386
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-06-15 04:08:04.049424
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-06-15 04:08:04.080063
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-06-15 04:08:04.103937
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-06-15 04:08:04.106607
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-06-15 04:08:04.109208
26	objects-prefixes	ef3f7871121cdc47a65308e6702519e853422ae2	2025-09-20 19:07:15.607109
27	search-v2	33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2	2025-09-20 19:07:16.513518
28	object-bucket-name-sorting	ba85ec41b62c6a30a3f136788227ee47f311c436	2025-09-20 19:07:18.097932
29	create-prefixes	a7b1a22c0dc3ab630e3055bfec7ce7d2045c5b7b	2025-09-20 19:07:18.396113
30	update-object-levels	6c6f6cc9430d570f26284a24cf7b210599032db7	2025-09-20 19:07:18.597988
31	objects-level-index	33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8	2025-09-20 19:07:18.709481
32	backward-compatible-index-on-objects	2d51eeb437a96868b36fcdfb1ddefdf13bef1647	2025-09-20 19:07:18.90856
33	backward-compatible-index-on-prefixes	fe473390e1b8c407434c0e470655945b110507bf	2025-09-20 19:07:19.098625
34	optimize-search-function-v1	82b0e469a00e8ebce495e29bfa70a0797f7ebd2c	2025-09-20 19:07:19.205161
35	add-insert-trigger-prefixes	63bb9fd05deb3dc5e9fa66c83e82b152f0caf589	2025-09-20 19:07:19.695722
36	optimise-existing-functions	81cf92eb0c36612865a18016a38496c530443899	2025-09-20 19:07:20.602937
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2025-09-20 19:07:23.107405
38	iceberg-catalog-flag-on-buckets	19a8bd89d5dfa69af7f222a46c726b7c41e462c5	2025-09-20 19:07:24.110238
39	add-search-v2-sort-support	39cf7d1e6bf515f4b02e41237aba845a7b492853	2025-11-05 15:47:54.608813
40	fix-prefix-race-conditions-optimized	fd02297e1c67df25a9fc110bf8c8a9af7fb06d1f	2025-11-05 15:47:54.683679
41	add-object-level-update-trigger	44c22478bf01744b2129efc480cd2edc9a7d60e9	2025-11-05 15:47:54.733798
42	rollback-prefix-triggers	f2ab4f526ab7f979541082992593938c05ee4b47	2025-11-05 15:47:54.743612
43	fix-object-level	ab837ad8f1c7d00cc0b7310e989a23388ff29fc6	2025-11-05 15:47:54.752003
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2025-11-19 21:55:27.454599
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2025-11-19 21:55:27.476315
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2025-11-19 21:55:27.529274
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2025-11-19 21:55:27.533966
48	iceberg-catalog-ids	2666dff93346e5d04e0a878416be1d5fec345d6f	2025-11-19 21:55:27.537121
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, level) FROM stdin;
\.


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.prefixes (bucket_id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: -
--

COPY supabase_functions.hooks (id, hook_table_id, hook_name, created_at, request_id) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: supabase_functions; Owner: -
--

COPY supabase_functions.migrations (version, inserted_at) FROM stdin;
initial	2025-11-05 18:06:04.187808+00
20210809183423_update_grants	2025-11-05 18:06:04.187808+00
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: supabase_migrations; Owner: -
--

COPY supabase_migrations.schema_migrations (version, statements, name) FROM stdin;
20250917000000	{"-- Stripe webhook idempotency table\r\n-- Run this in Supabase SQL Editor\r\n\r\ncreate table if not exists public.stripe_webhook_events (\r\n  id text primary key,           -- Stripe event id (evt_...)\r\n  type text not null,\r\n  received_at timestamptz not null default now()\r\n)","-- Add index for cleanup queries\r\ncreate index if not exists idx_stripe_webhook_events_received_at \r\non public.stripe_webhook_events(received_at)","-- RLS policy (allow service role to insert)\r\nalter table public.stripe_webhook_events enable row level security","create policy \\"Service role can manage webhook events\\"\r\non public.stripe_webhook_events\r\nfor all\r\nusing (auth.role() = 'service_role')"}	stripe_webhook_events
\.


--
-- Data for Name: seed_files; Type: TABLE DATA; Schema: supabase_migrations; Owner: -
--

COPY supabase_migrations.seed_files (path, hash) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 255, true);


--
-- Name: ghostlog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ghostlog_id_seq', 1, false);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: -
--

SELECT pg_catalog.setval('supabase_functions.hooks_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: Award Award_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Award"
    ADD CONSTRAINT "Award_pkey" PRIMARY KEY (id);


--
-- Name: Badge Badge_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Badge"
    ADD CONSTRAINT "Badge_pkey" PRIMARY KEY (id);


--
-- Name: DriftEvent DriftEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DriftEvent"
    ADD CONSTRAINT "DriftEvent_pkey" PRIMARY KEY (id);


--
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (id);


--
-- Name: SessionEvent SessionEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SessionEvent"
    ADD CONSTRAINT "SessionEvent_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: TaxonomyUnknown TaxonomyUnknown_enum_type_raw_label_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TaxonomyUnknown"
    ADD CONSTRAINT "TaxonomyUnknown_enum_type_raw_label_key" UNIQUE (enum_type, raw_label);


--
-- Name: TaxonomyUnknown TaxonomyUnknown_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TaxonomyUnknown"
    ADD CONSTRAINT "TaxonomyUnknown_pkey" PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: deliveries deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_pkey PRIMARY KEY (id);


--
-- Name: flavors flavors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flavors
    ADD CONSTRAINT flavors_pkey PRIMARY KEY (id);


--
-- Name: ghostlog ghostlog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ghostlog
    ADD CONSTRAINT ghostlog_pkey PRIMARY KEY (id);


--
-- Name: lounge_configs lounge_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lounge_configs
    ADD CONSTRAINT lounge_configs_pkey PRIMARY KEY (id);


--
-- Name: loyalty_note_bindings loyalty_note_bindings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_note_bindings
    ADD CONSTRAINT loyalty_note_bindings_pkey PRIMARY KEY (id);


--
-- Name: loyalty_profiles loyalty_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_profiles
    ADD CONSTRAINT loyalty_profiles_pkey PRIMARY KEY (id);


--
-- Name: memberships memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_pkey PRIMARY KEY (user_id, tenant_id);


--
-- Name: menu_files menu_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_files
    ADD CONSTRAINT menu_files_pkey PRIMARY KEY (id);


--
-- Name: mix_templates mix_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mix_templates
    ADD CONSTRAINT mix_templates_pkey PRIMARY KEY (id);


--
-- Name: order_events order_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_events
    ADD CONSTRAINT order_events_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_stripe_charge_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_stripe_charge_id_key UNIQUE (stripe_charge_id);


--
-- Name: preorders preorders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preorders
    ADD CONSTRAINT preorders_pkey PRIMARY KEY (id);


--
-- Name: pricing_rules pricing_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_rules
    ADD CONSTRAINT pricing_rules_pkey PRIMARY KEY (id);


--
-- Name: refills refills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refills
    ADD CONSTRAINT refills_pkey PRIMARY KEY (id);


--
-- Name: reflex_events reflex_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reflex_events
    ADD CONSTRAINT reflex_events_pkey PRIMARY KEY (id);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- Name: seats seats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seats
    ADD CONSTRAINT seats_pkey PRIMARY KEY (id);


--
-- Name: session_notes session_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_notes
    ADD CONSTRAINT session_notes_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: stations stations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stations
    ADD CONSTRAINT stations_pkey PRIMARY KEY (id);


--
-- Name: stripe_webhook_events stripe_webhook_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stripe_webhook_events
    ADD CONSTRAINT stripe_webhook_events_pkey PRIMARY KEY (id);


--
-- Name: sync_backlog sync_backlog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sync_backlog
    ADD CONSTRAINT sync_backlog_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: venues venues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venues
    ADD CONSTRAINT venues_pkey PRIMARY KEY (id);


--
-- Name: zones zones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: hooks hooks_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: -
--

ALTER TABLE ONLY supabase_functions.hooks
    ADD CONSTRAINT hooks_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: -
--

ALTER TABLE ONLY supabase_functions.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (version);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: seed_files seed_files_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.seed_files
    ADD CONSTRAINT seed_files_pkey PRIMARY KEY (path);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: SessionEvent_sessionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SessionEvent_sessionId_idx" ON public."SessionEvent" USING btree ("sessionId");


--
-- Name: Session_loungeId_externalRef_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Session_loungeId_externalRef_key" ON public."Session" USING btree ("loungeId", "externalRef");


--
-- Name: Session_loungeId_state_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Session_loungeId_state_idx" ON public."Session" USING btree ("loungeId", state);


--
-- Name: Session_lounge_config_version_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Session_lounge_config_version_idx" ON public."Session" USING btree (lounge_config_version);


--
-- Name: Session_preorder_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Session_preorder_id_idx" ON public."Session" USING btree (preorder_id);


--
-- Name: Session_seat_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Session_seat_id_idx" ON public."Session" USING btree (seat_id);


--
-- Name: Session_zone_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Session_zone_id_idx" ON public."Session" USING btree (zone_id);


--
-- Name: audit_logs_lounge_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_lounge_id_created_at_idx ON public.audit_logs USING btree (lounge_id, created_at);


--
-- Name: audit_logs_user_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_user_id_created_at_idx ON public.audit_logs USING btree (user_id, created_at);


--
-- Name: deliveries_delivered_by_delivered_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX deliveries_delivered_by_delivered_at_idx ON public.deliveries USING btree (delivered_by, delivered_at);


--
-- Name: deliveries_order_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX deliveries_order_id_key ON public.deliveries USING btree (order_id);


--
-- Name: deliveries_session_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX deliveries_session_id_idx ON public.deliveries USING btree (session_id);


--
-- Name: flavors_lounge_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX flavors_lounge_id_idx ON public.flavors USING btree (lounge_id);


--
-- Name: idx_award_badge_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_award_badge_id ON public."Award" USING btree ("badgeId");


--
-- Name: idx_drift_event_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_drift_event_created ON public."DriftEvent" USING btree (created_at);


--
-- Name: idx_drift_event_reason_v1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_drift_event_reason_v1 ON public."DriftEvent" USING btree (drift_reason_v1);


--
-- Name: idx_drift_event_reason_v1_notnull; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_drift_event_reason_v1_notnull ON public."DriftEvent" USING btree (drift_reason_v1) WHERE (drift_reason_v1 IS NOT NULL);


--
-- Name: idx_drift_event_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_drift_event_session ON public."DriftEvent" USING btree (session_id);


--
-- Name: idx_memberships_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_memberships_role ON public.memberships USING btree (role);


--
-- Name: idx_memberships_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_memberships_tenant_id ON public.memberships USING btree (tenant_id);


--
-- Name: idx_memberships_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_memberships_user_id ON public.memberships USING btree (user_id);


--
-- Name: idx_memberships_user_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_memberships_user_tenant ON public.memberships USING btree (user_id, tenant_id);


--
-- Name: idx_menu_files_lead_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menu_files_lead_id ON public.menu_files USING btree (lead_id);


--
-- Name: idx_menu_files_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menu_files_status ON public.menu_files USING btree (status);


--
-- Name: idx_menu_files_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menu_files_tenant_id ON public.menu_files USING btree (tenant_id);


--
-- Name: idx_menu_files_uploaded_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menu_files_uploaded_at ON public.menu_files USING btree (uploaded_at);


--
-- Name: idx_orders_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_created ON public.orders USING btree (created_at DESC);


--
-- Name: idx_orders_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_session ON public.orders USING btree (session_id) WHERE (session_id IS NOT NULL);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status) WHERE (status IS NOT NULL);


--
-- Name: idx_payments_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_created_at ON public.payments USING btree (created_at);


--
-- Name: idx_payments_paid_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_paid_at ON public.payments USING btree (paid_at) WHERE (paid_at IS NOT NULL);


--
-- Name: idx_payments_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_session_id ON public.payments USING btree (session_id) WHERE (session_id IS NOT NULL);


--
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_status ON public.payments USING btree (status);


--
-- Name: idx_payments_stripe_charge_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_stripe_charge_id ON public.payments USING btree (stripe_charge_id) WHERE (stripe_charge_id IS NOT NULL);


--
-- Name: idx_payments_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_tenant_id ON public.payments USING btree (tenant_id);


--
-- Name: idx_pricing_rules_lounge_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pricing_rules_lounge_active ON public.pricing_rules USING btree (lounge_id, is_active, effective_at DESC) WHERE (is_active = true);


--
-- Name: idx_pricing_rules_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pricing_rules_type ON public.pricing_rules USING btree (rule_type) WHERE (rule_type IS NOT NULL);


--
-- Name: idx_reflex_event_created_at_refill_types; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reflex_event_created_at_refill_types ON public.reflex_events USING btree ("createdAt", type) WHERE (type = ANY (ARRAY['session.refill_requested'::text, 'session.refill_completed'::text]));


--
-- Name: idx_reflex_event_created_at_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reflex_event_created_at_type ON public.reflex_events USING btree ("createdAt", type);


--
-- Name: idx_reflex_event_trust_type_v1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reflex_event_trust_type_v1 ON public.reflex_events USING btree (trust_event_type_v1);


--
-- Name: idx_reflex_event_trust_type_v1_notnull; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reflex_event_trust_type_v1_notnull ON public.reflex_events USING btree (trust_event_type_v1) WHERE (trust_event_type_v1 IS NOT NULL);


--
-- Name: idx_reflex_events_campaignid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reflex_events_campaignid ON public.reflex_events USING btree ("campaignId") WHERE ("campaignId" IS NOT NULL);


--
-- Name: idx_reflex_events_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reflex_events_created ON public.reflex_events USING btree ("createdAt" DESC);


--
-- Name: idx_reflex_events_ctasource; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reflex_events_ctasource ON public.reflex_events USING btree ("ctaSource") WHERE ("ctaSource" IS NOT NULL);


--
-- Name: idx_reflex_events_ctatype; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reflex_events_ctatype ON public.reflex_events USING btree ("ctaType") WHERE ("ctaType" IS NOT NULL);


--
-- Name: idx_reflex_events_payloadhash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reflex_events_payloadhash ON public.reflex_events USING btree ("payloadHash") WHERE ("payloadHash" IS NOT NULL);


--
-- Name: idx_reflex_events_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reflex_events_session ON public.reflex_events USING btree ("sessionId") WHERE ("sessionId" IS NOT NULL);


--
-- Name: idx_reflex_events_sessionid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reflex_events_sessionid ON public.reflex_events USING btree ("sessionId") WHERE ("sessionId" IS NOT NULL);


--
-- Name: idx_reflex_events_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reflex_events_tenant_id ON public.reflex_events USING btree (tenant_id) WHERE (tenant_id IS NOT NULL);


--
-- Name: idx_reflex_events_trusteventtypev1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reflex_events_trusteventtypev1 ON public.reflex_events USING btree ("trustEventTypeV1") WHERE ("trustEventTypeV1" IS NOT NULL);


--
-- Name: idx_reflex_events_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reflex_events_type ON public.reflex_events USING btree (type) WHERE (type IS NOT NULL);


--
-- Name: idx_reflex_events_type_createdat; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reflex_events_type_createdat ON public.reflex_events USING btree (type, "createdAt");


--
-- Name: idx_session_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_created_at ON public."Session" USING btree ("createdAt");


--
-- Name: idx_session_created_at_lounge_payment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_created_at_lounge_payment ON public."Session" USING btree ("createdAt", "loungeId", "paymentStatus") WHERE ("paymentStatus" = 'succeeded'::text);


--
-- Name: idx_session_created_at_payment_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_created_at_payment_status ON public."Session" USING btree ("createdAt", "paymentStatus") WHERE ("paymentStatus" = 'succeeded'::text);


--
-- Name: idx_session_created_at_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_created_at_source ON public."Session" USING btree ("createdAt", source);


--
-- Name: idx_session_created_at_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_created_at_state ON public."Session" USING btree ("createdAt", state);


--
-- Name: idx_session_created_at_state_duration; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_created_at_state_duration ON public."Session" USING btree ("createdAt", state, "durationSecs") WHERE ((state = 'CLOSED'::public."SessionState") AND ("durationSecs" IS NOT NULL));


--
-- Name: idx_session_customer_ref; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_customer_ref ON public."Session" USING btree ("customerRef");


--
-- Name: idx_session_external_ref; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_external_ref ON public."Session" USING btree ("externalRef");


--
-- Name: idx_session_lounge_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_lounge_id ON public."Session" USING btree ("loungeId");


--
-- Name: idx_session_paused; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_paused ON public."Session" USING btree (paused);


--
-- Name: idx_session_payment_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_payment_status ON public."Session" USING btree ("paymentStatus") WHERE ("paymentStatus" IS NOT NULL);


--
-- Name: idx_session_started_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_started_at ON public."Session" USING btree ("startedAt") WHERE ("startedAt" IS NOT NULL);


--
-- Name: idx_session_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_state ON public."Session" USING btree (state);


--
-- Name: idx_session_state_v1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_state_v1 ON public."Session" USING btree (session_state_v1);


--
-- Name: idx_session_state_v1_notnull; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_state_v1_notnull ON public."Session" USING btree (session_state_v1) WHERE (session_state_v1 IS NOT NULL);


--
-- Name: idx_session_table; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_table ON public."Session" USING btree ("tableId") WHERE ("tableId" IS NOT NULL);


--
-- Name: idx_session_table_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_table_id ON public."Session" USING btree ("tableId");


--
-- Name: idx_session_tenant_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_tenant_created ON public."Session" USING btree (tenant_id, "createdAt" DESC) WHERE (tenant_id IS NOT NULL);


--
-- Name: idx_session_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_tenant_id ON public."Session" USING btree (tenant_id) WHERE (tenant_id IS NOT NULL);


--
-- Name: idx_session_tenant_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_tenant_state ON public."Session" USING btree (tenant_id, state) WHERE (tenant_id IS NOT NULL);


--
-- Name: idx_session_timer_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_timer_status ON public."Session" USING btree ("timerStatus") WHERE ("timerStatus" IS NOT NULL);


--
-- Name: idx_sessions_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_created_by ON public.sessions USING btree (created_by);


--
-- Name: idx_taxonomy_unknown_count; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_taxonomy_unknown_count ON public."TaxonomyUnknown" USING btree (count DESC);


--
-- Name: idx_taxonomy_unknown_last_seen; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_taxonomy_unknown_last_seen ON public."TaxonomyUnknown" USING btree (last_seen DESC);


--
-- Name: idx_taxonomy_unknown_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_taxonomy_unknown_type ON public."TaxonomyUnknown" USING btree (enum_type);


--
-- Name: idx_tenants_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenants_created_at ON public.tenants USING btree (created_at);


--
-- Name: idx_tenants_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenants_name ON public.tenants USING btree (name);


--
-- Name: lounge_configs_lounge_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX lounge_configs_lounge_id_key ON public.lounge_configs USING btree (lounge_id);


--
-- Name: lounge_configs_lounge_id_version_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lounge_configs_lounge_id_version_idx ON public.lounge_configs USING btree (lounge_id, version);


--
-- Name: loyalty_note_bindings_loyalty_profile_id_session_note_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX loyalty_note_bindings_loyalty_profile_id_session_note_id_key ON public.loyalty_note_bindings USING btree (loyalty_profile_id, session_note_id);


--
-- Name: loyalty_profiles_lounge_id_guest_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX loyalty_profiles_lounge_id_guest_key_key ON public.loyalty_profiles USING btree (lounge_id, guest_key);


--
-- Name: loyalty_profiles_lounge_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX loyalty_profiles_lounge_id_idx ON public.loyalty_profiles USING btree (lounge_id);


--
-- Name: mix_templates_lounge_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mix_templates_lounge_id_idx ON public.mix_templates USING btree (lounge_id);


--
-- Name: order_events_order_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_events_order_id_created_at_idx ON public.order_events USING btree (order_id, created_at);


--
-- Name: order_items_order_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_items_order_id_idx ON public.order_items USING btree (order_id);


--
-- Name: orders_session_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_session_id_idx ON public.orders USING btree (session_id);


--
-- Name: orders_status_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_status_created_at_idx ON public.orders USING btree (status, created_at);


--
-- Name: preorders_lounge_id_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX preorders_lounge_id_status_idx ON public.preorders USING btree (lounge_id, status);


--
-- Name: preorders_qr_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX preorders_qr_code_key ON public.preorders USING btree (qr_code) WHERE (qr_code IS NOT NULL);


--
-- Name: preorders_session_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX preorders_session_id_key ON public.preorders USING btree (session_id) WHERE (session_id IS NOT NULL);


--
-- Name: pricing_rules_lounge_id_is_active_effective_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pricing_rules_lounge_id_is_active_effective_at_idx ON public.pricing_rules USING btree (lounge_id, is_active, effective_at);


--
-- Name: seats_lounge_id_zone_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX seats_lounge_id_zone_id_idx ON public.seats USING btree (lounge_id, zone_id);


--
-- Name: seats_table_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX seats_table_id_key ON public.seats USING btree (table_id);


--
-- Name: session_notes_note_type_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX session_notes_note_type_created_at_idx ON public.session_notes USING btree (note_type, created_at);


--
-- Name: session_notes_session_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX session_notes_session_id_idx ON public.session_notes USING btree (session_id);


--
-- Name: stations_lounge_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stations_lounge_id_idx ON public.stations USING btree (lounge_id);


--
-- Name: sync_backlog_device_id_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sync_backlog_device_id_status_idx ON public.sync_backlog USING btree (device_id, status);


--
-- Name: sync_backlog_lounge_id_status_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sync_backlog_lounge_id_status_created_at_idx ON public.sync_backlog USING btree (lounge_id, status, created_at);


--
-- Name: zones_lounge_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX zones_lounge_id_idx ON public.zones USING btree (lounge_id);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: supabase_functions_hooks_h_table_id_h_name_idx; Type: INDEX; Schema: supabase_functions; Owner: -
--

CREATE INDEX supabase_functions_hooks_h_table_id_h_name_idx ON supabase_functions.hooks USING btree (hook_table_id, hook_name);


--
-- Name: supabase_functions_hooks_request_id_idx; Type: INDEX; Schema: supabase_functions; Owner: -
--

CREATE INDEX supabase_functions_hooks_request_id_idx ON supabase_functions.hooks USING btree (request_id);


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: Award Award_badgeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Award"
    ADD CONSTRAINT "Award_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES public."Badge"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SessionEvent SessionEvent_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SessionEvent"
    ADD CONSTRAINT "SessionEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public."Session"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Session Session_preorder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_preorder_id_fkey" FOREIGN KEY (preorder_id) REFERENCES public.preorders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Session Session_seat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_seat_id_fkey" FOREIGN KEY (seat_id) REFERENCES public.seats(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Session Session_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_tenant_id_fkey" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;


--
-- Name: Session Session_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_zone_id_fkey" FOREIGN KEY (zone_id) REFERENCES public.zones(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: deliveries deliveries_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: deliveries deliveries_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_session_id_fkey FOREIGN KEY (session_id) REFERENCES public."Session"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: loyalty_note_bindings loyalty_note_bindings_loyalty_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_note_bindings
    ADD CONSTRAINT loyalty_note_bindings_loyalty_profile_id_fkey FOREIGN KEY (loyalty_profile_id) REFERENCES public.loyalty_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: loyalty_note_bindings loyalty_note_bindings_session_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_note_bindings
    ADD CONSTRAINT loyalty_note_bindings_session_note_id_fkey FOREIGN KEY (session_note_id) REFERENCES public.session_notes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: memberships memberships_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: menu_files menu_files_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_files
    ADD CONSTRAINT menu_files_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;


--
-- Name: order_events order_events_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_events
    ADD CONSTRAINT order_events_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: orders orders_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_session_id_fkey FOREIGN KEY (session_id) REFERENCES public."Session"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_session_id_fkey FOREIGN KEY (session_id) REFERENCES public."Session"(id) ON DELETE SET NULL;


--
-- Name: payments payments_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: refills refills_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refills
    ADD CONSTRAINT refills_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- Name: refills refills_venue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refills
    ADD CONSTRAINT refills_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id) ON DELETE CASCADE;


--
-- Name: reflex_events reflex_events_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reflex_events
    ADD CONSTRAINT reflex_events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;


--
-- Name: reservations reservations_venue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id) ON DELETE CASCADE;


--
-- Name: seats seats_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seats
    ADD CONSTRAINT seats_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.zones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: session_notes session_notes_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_notes
    ADD CONSTRAINT session_notes_session_id_fkey FOREIGN KEY (session_id) REFERENCES public."Session"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.staff(id);


--
-- Name: sessions sessions_venue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id) ON DELETE CASCADE;


--
-- Name: staff staff_venue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: menu_files Admin can delete menu files; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can delete menu files" ON public.menu_files FOR DELETE TO authenticated USING ((( SELECT m.role
   FROM (auth.users u
     JOIN public.memberships m ON ((m.user_id = u.id)))
  WHERE ((u.id = ( SELECT auth.uid() AS uid)) AND (m.role = ANY (ARRAY['admin'::public.role, 'owner'::public.role])))) IS NOT NULL));


--
-- Name: menu_files Admin can insert menu files; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can insert menu files" ON public.menu_files FOR INSERT TO authenticated WITH CHECK ((( SELECT m.role
   FROM (auth.users u
     JOIN public.memberships m ON ((m.user_id = u.id)))
  WHERE ((u.id = ( SELECT auth.uid() AS uid)) AND (m.role = ANY (ARRAY['admin'::public.role, 'owner'::public.role])))) IS NOT NULL));


--
-- Name: menu_files Admin can read menu files; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can read menu files" ON public.menu_files FOR SELECT TO authenticated USING ((( SELECT m.role
   FROM (auth.users u
     JOIN public.memberships m ON ((m.user_id = u.id)))
  WHERE ((u.id = ( SELECT auth.uid() AS uid)) AND (m.role = ANY (ARRAY['admin'::public.role, 'owner'::public.role])))) IS NOT NULL));


--
-- Name: menu_files Admin can update menu files; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can update menu files" ON public.menu_files FOR UPDATE TO authenticated USING ((( SELECT m.role
   FROM (auth.users u
     JOIN public.memberships m ON ((m.user_id = u.id)))
  WHERE ((u.id = ( SELECT auth.uid() AS uid)) AND (m.role = ANY (ARRAY['admin'::public.role, 'owner'::public.role])))) IS NOT NULL));


--
-- Name: DriftEvent Authenticated users can insert drift events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert drift events" ON public."DriftEvent" FOR INSERT WITH CHECK ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: TaxonomyUnknown Authenticated users can insert taxonomy unknowns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert taxonomy unknowns" ON public."TaxonomyUnknown" FOR INSERT WITH CHECK ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: DriftEvent Authenticated users can read drift events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read drift events" ON public."DriftEvent" FOR SELECT USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: TaxonomyUnknown Authenticated users can read taxonomy unknowns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read taxonomy unknowns" ON public."TaxonomyUnknown" FOR SELECT USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: TaxonomyUnknown Authenticated users can update taxonomy unknowns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update taxonomy unknowns" ON public."TaxonomyUnknown" FOR UPDATE USING ((( SELECT auth.role() AS role) = 'authenticated'::text)) WITH CHECK ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: Award; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Award" ENABLE ROW LEVEL SECURITY;

--
-- Name: Badge; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Badge" ENABLE ROW LEVEL SECURITY;

--
-- Name: DriftEvent; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."DriftEvent" ENABLE ROW LEVEL SECURITY;

--
-- Name: Event; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Event" ENABLE ROW LEVEL SECURITY;

--
-- Name: Award Service role can manage awards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage awards" ON public."Award" USING ((( SELECT auth.role() AS role) = 'service_role'::text)) WITH CHECK ((( SELECT auth.role() AS role) = 'service_role'::text));


--
-- Name: Badge Service role can manage badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage badges" ON public."Badge" USING ((( SELECT auth.role() AS role) = 'service_role'::text)) WITH CHECK ((( SELECT auth.role() AS role) = 'service_role'::text));


--
-- Name: DriftEvent Service role can manage drift events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage drift events" ON public."DriftEvent" USING ((( SELECT auth.role() AS role) = 'service_role'::text)) WITH CHECK ((( SELECT auth.role() AS role) = 'service_role'::text));


--
-- Name: Event Service role can manage events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage events" ON public."Event" USING ((( SELECT auth.role() AS role) = 'service_role'::text)) WITH CHECK ((( SELECT auth.role() AS role) = 'service_role'::text));


--
-- Name: memberships Service role can manage memberships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage memberships" ON public.memberships USING (((( SELECT auth.jwt() AS jwt) ->> 'role'::text) = 'service_role'::text)) WITH CHECK (((( SELECT auth.jwt() AS jwt) ->> 'role'::text) = 'service_role'::text));


--
-- Name: SessionEvent Service role can manage session events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage session events" ON public."SessionEvent" USING ((( SELECT auth.role() AS role) = 'service_role'::text)) WITH CHECK ((( SELECT auth.role() AS role) = 'service_role'::text));


--
-- Name: sessions Service role can manage sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage sessions" ON public.sessions USING ((( SELECT auth.role() AS role) = 'service_role'::text)) WITH CHECK ((( SELECT auth.role() AS role) = 'service_role'::text));


--
-- Name: TaxonomyUnknown Service role can manage taxonomy unknowns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage taxonomy unknowns" ON public."TaxonomyUnknown" USING ((( SELECT auth.role() AS role) = 'service_role'::text)) WITH CHECK ((( SELECT auth.role() AS role) = 'service_role'::text));


--
-- Name: stripe_webhook_events Service role can manage webhook events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage webhook events" ON public.stripe_webhook_events USING ((( SELECT auth.role() AS role) = 'service_role'::text)) WITH CHECK ((( SELECT auth.role() AS role) = 'service_role'::text));


--
-- Name: Session; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Session" ENABLE ROW LEVEL SECURITY;

--
-- Name: SessionEvent; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."SessionEvent" ENABLE ROW LEVEL SECURITY;

--
-- Name: TaxonomyUnknown; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."TaxonomyUnknown" ENABLE ROW LEVEL SECURITY;

--
-- Name: Badge Users can read active badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read active badges" ON public."Badge" FOR SELECT USING (((( SELECT auth.role() AS role) = 'authenticated'::text) AND (active = true)));


--
-- Name: Award Users can read own awards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own awards" ON public."Award" FOR SELECT USING (((( SELECT auth.role() AS role) = 'authenticated'::text) AND ("profileId" = (( SELECT auth.uid() AS uid))::text)));


--
-- Name: Event Users can read own events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own events" ON public."Event" FOR SELECT USING (((( SELECT auth.role() AS role) = 'authenticated'::text) AND ("profileId" = (( SELECT auth.uid() AS uid))::text)));


--
-- Name: memberships Users can read own memberships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own memberships" ON public.memberships FOR SELECT USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: sessions Users can read own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own sessions" ON public.sessions FOR SELECT USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: SessionEvent Users can read session events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read session events" ON public."SessionEvent" FOR SELECT USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: deliveries authenticated_read_deliveries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_deliveries ON public.deliveries FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: flavors authenticated_read_flavors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_flavors ON public.flavors FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: lounge_configs authenticated_read_lounge_configs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_lounge_configs ON public.lounge_configs FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: loyalty_note_bindings authenticated_read_loyalty_note_bindings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_loyalty_note_bindings ON public.loyalty_note_bindings FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: loyalty_profiles authenticated_read_loyalty_profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_loyalty_profiles ON public.loyalty_profiles FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: mix_templates authenticated_read_mix_templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_mix_templates ON public.mix_templates FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: order_events authenticated_read_order_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_order_events ON public.order_events FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: order_items authenticated_read_order_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_order_items ON public.order_items FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: orders authenticated_read_orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_orders ON public.orders FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: preorders authenticated_read_preorders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_preorders ON public.preorders FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: pricing_rules authenticated_read_pricing_rules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_pricing_rules ON public.pricing_rules FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: seats authenticated_read_seats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_seats ON public.seats FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: session_notes authenticated_read_session_notes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_session_notes ON public.session_notes FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: stations authenticated_read_stations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_stations ON public.stations FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: sync_backlog authenticated_read_sync_backlog; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_sync_backlog ON public.sync_backlog FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: zones authenticated_read_zones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_zones ON public.zones FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: deliveries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

--
-- Name: flavors; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.flavors ENABLE ROW LEVEL SECURITY;

--
-- Name: ghostlog; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ghostlog ENABLE ROW LEVEL SECURITY;

--
-- Name: ghostlog ghostlog_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ghostlog_insert ON public.ghostlog FOR INSERT WITH CHECK (((( SELECT auth.role() AS role) = 'service_role'::text) OR (( SELECT auth.role() AS role) = 'authenticated'::text)));


--
-- Name: ghostlog ghostlog_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ghostlog_read ON public.ghostlog FOR SELECT USING (((( SELECT auth.role() AS role) = 'service_role'::text) OR (( SELECT auth.role() AS role) = 'authenticated'::text)));


--
-- Name: lounge_configs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lounge_configs ENABLE ROW LEVEL SECURITY;

--
-- Name: loyalty_note_bindings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.loyalty_note_bindings ENABLE ROW LEVEL SECURITY;

--
-- Name: loyalty_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.loyalty_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: memberships; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

--
-- Name: menu_files; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.menu_files ENABLE ROW LEVEL SECURITY;

--
-- Name: mix_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mix_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: order_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

--
-- Name: order_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: preorders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.preorders ENABLE ROW LEVEL SECURITY;

--
-- Name: pricing_rules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

--
-- Name: refills; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.refills ENABLE ROW LEVEL SECURITY;

--
-- Name: refills refills_rw; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY refills_rw ON public.refills USING (((( SELECT auth.role() AS role) = 'service_role'::text) OR (( SELECT auth.role() AS role) = 'authenticated'::text))) WITH CHECK (((( SELECT auth.role() AS role) = 'service_role'::text) OR (( SELECT auth.role() AS role) = 'authenticated'::text)));


--
-- Name: reflex_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reflex_events ENABLE ROW LEVEL SECURITY;

--
-- Name: reservations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

--
-- Name: reservations reservations_rw; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY reservations_rw ON public.reservations USING (((( SELECT auth.role() AS role) = 'service_role'::text) OR (( SELECT auth.role() AS role) = 'authenticated'::text))) WITH CHECK (((( SELECT auth.role() AS role) = 'service_role'::text) OR (( SELECT auth.role() AS role) = 'authenticated'::text)));


--
-- Name: seats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_logs service_role_manage_audit_logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_manage_audit_logs ON public.audit_logs USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: deliveries service_role_manage_deliveries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_manage_deliveries ON public.deliveries USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: flavors service_role_manage_flavors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_manage_flavors ON public.flavors USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: lounge_configs service_role_manage_lounge_configs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_manage_lounge_configs ON public.lounge_configs USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: loyalty_note_bindings service_role_manage_loyalty_note_bindings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_manage_loyalty_note_bindings ON public.loyalty_note_bindings USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: loyalty_profiles service_role_manage_loyalty_profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_manage_loyalty_profiles ON public.loyalty_profiles USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: mix_templates service_role_manage_mix_templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_manage_mix_templates ON public.mix_templates USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: order_events service_role_manage_order_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_manage_order_events ON public.order_events USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: order_items service_role_manage_order_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_manage_order_items ON public.order_items USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: orders service_role_manage_orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_manage_orders ON public.orders USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: preorders service_role_manage_preorders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_manage_preorders ON public.preorders USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: pricing_rules service_role_manage_pricing_rules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_manage_pricing_rules ON public.pricing_rules USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: seats service_role_manage_seats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_manage_seats ON public.seats USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: session_notes service_role_manage_session_notes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_manage_session_notes ON public.session_notes USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: stations service_role_manage_stations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_manage_stations ON public.stations USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: sync_backlog service_role_manage_sync_backlog; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_manage_sync_backlog ON public.sync_backlog USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: zones service_role_manage_zones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_manage_zones ON public.zones USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: audit_logs service_role_read_audit_logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_read_audit_logs ON public.audit_logs FOR SELECT USING ((auth.role() = 'service_role'::text));


--
-- Name: session_notes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions sessions_rw; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sessions_rw ON public.sessions USING (((( SELECT auth.role() AS role) = 'service_role'::text) OR (( SELECT auth.role() AS role) = 'authenticated'::text))) WITH CHECK (((( SELECT auth.role() AS role) = 'service_role'::text) OR (( SELECT auth.role() AS role) = 'authenticated'::text)));


--
-- Name: staff; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

--
-- Name: staff staff_rw; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY staff_rw ON public.staff USING (((( SELECT auth.role() AS role) = 'service_role'::text) OR (( SELECT auth.role() AS role) = 'authenticated'::text))) WITH CHECK (((( SELECT auth.role() AS role) = 'service_role'::text) OR (( SELECT auth.role() AS role) = 'authenticated'::text)));


--
-- Name: stations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;

--
-- Name: stripe_webhook_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

--
-- Name: sync_backlog; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sync_backlog ENABLE ROW LEVEL SECURITY;

--
-- Name: reflex_events tenant_delete_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_delete_events ON public.reflex_events FOR DELETE USING (((tenant_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.memberships m
  WHERE ((m.user_id = ( SELECT auth.uid() AS uid)) AND (m.tenant_id = ((( SELECT auth.jwt() AS jwt) ->> 'tenant_id'::text))::uuid) AND (m.tenant_id = reflex_events.tenant_id) AND (m.role = ANY (ARRAY['owner'::public.role, 'admin'::public.role])))))));


--
-- Name: tenants tenant_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_delete_own ON public.tenants FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.memberships m
  WHERE ((m.user_id = ( SELECT auth.uid() AS uid)) AND (m.tenant_id = tenants.id) AND (m.role = 'owner'::public.role)))));


--
-- Name: payments tenant_delete_payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_delete_payments ON public.payments FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.memberships m
  WHERE ((m.user_id = ( SELECT auth.uid() AS uid)) AND (m.tenant_id = ((( SELECT auth.jwt() AS jwt) ->> 'tenant_id'::text))::uuid) AND (m.tenant_id = payments.tenant_id) AND (m.role = ANY (ARRAY['owner'::public.role, 'admin'::public.role]))))));


--
-- Name: Session tenant_delete_sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_delete_sessions ON public."Session" FOR DELETE USING (((tenant_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.memberships m
  WHERE ((m.user_id = ( SELECT auth.uid() AS uid)) AND (m.tenant_id = ((( SELECT auth.jwt() AS jwt) ->> 'tenant_id'::text))::uuid) AND (m.tenant_id = "Session".tenant_id) AND (m.role = ANY (ARRAY['owner'::public.role, 'admin'::public.role])))))));


--
-- Name: tenants tenant_no_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_no_insert ON public.tenants FOR INSERT WITH CHECK (false);


--
-- Name: reflex_events tenant_read_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_read_events ON public.reflex_events FOR SELECT USING (((tenant_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.memberships m
  WHERE ((m.user_id = ( SELECT auth.uid() AS uid)) AND (m.tenant_id = ((( SELECT auth.jwt() AS jwt) ->> 'tenant_id'::text))::uuid) AND (m.tenant_id = reflex_events.tenant_id))))));


--
-- Name: tenants tenant_read_own_tenants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_read_own_tenants ON public.tenants FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.memberships m
  WHERE ((m.user_id = ( SELECT auth.uid() AS uid)) AND (m.tenant_id = tenants.id)))));


--
-- Name: POLICY tenant_read_own_tenants ON tenants; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON POLICY tenant_read_own_tenants ON public.tenants IS 'RLS policy: Users can read tenants they are members of. Service role bypasses RLS.';


--
-- Name: payments tenant_read_payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_read_payments ON public.payments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.memberships m
  WHERE ((m.user_id = ( SELECT auth.uid() AS uid)) AND (m.tenant_id = ((( SELECT auth.jwt() AS jwt) ->> 'tenant_id'::text))::uuid) AND (m.tenant_id = payments.tenant_id)))));


--
-- Name: Session tenant_read_sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_read_sessions ON public."Session" FOR SELECT USING (((tenant_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.memberships m
  WHERE ((m.user_id = ( SELECT auth.uid() AS uid)) AND (m.tenant_id = ((( SELECT auth.jwt() AS jwt) ->> 'tenant_id'::text))::uuid) AND (m.tenant_id = "Session".tenant_id))))));


--
-- Name: reflex_events tenant_update_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_update_events ON public.reflex_events FOR UPDATE USING (((tenant_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.memberships m
  WHERE ((m.user_id = ( SELECT auth.uid() AS uid)) AND (m.tenant_id = ((( SELECT auth.jwt() AS jwt) ->> 'tenant_id'::text))::uuid) AND (m.tenant_id = reflex_events.tenant_id) AND (m.role = ANY (ARRAY['owner'::public.role, 'admin'::public.role, 'staff'::public.role]))))))) WITH CHECK (true);


--
-- Name: tenants tenant_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_update_own ON public.tenants FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.memberships m
  WHERE ((m.user_id = ( SELECT auth.uid() AS uid)) AND (m.tenant_id = tenants.id) AND (m.role = ANY (ARRAY['owner'::public.role, 'admin'::public.role])))))) WITH CHECK (true);


--
-- Name: payments tenant_update_payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_update_payments ON public.payments FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.memberships m
  WHERE ((m.user_id = ( SELECT auth.uid() AS uid)) AND (m.tenant_id = ((( SELECT auth.jwt() AS jwt) ->> 'tenant_id'::text))::uuid) AND (m.tenant_id = payments.tenant_id) AND (m.role = ANY (ARRAY['owner'::public.role, 'admin'::public.role, 'staff'::public.role])))))) WITH CHECK (true);


--
-- Name: Session tenant_update_sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_update_sessions ON public."Session" FOR UPDATE USING (((tenant_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.memberships m
  WHERE ((m.user_id = ( SELECT auth.uid() AS uid)) AND (m.tenant_id = ((( SELECT auth.jwt() AS jwt) ->> 'tenant_id'::text))::uuid) AND (m.tenant_id = "Session".tenant_id) AND (m.role = ANY (ARRAY['owner'::public.role, 'admin'::public.role, 'staff'::public.role]))))))) WITH CHECK (true);


--
-- Name: reflex_events tenant_write_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_write_events ON public.reflex_events FOR INSERT WITH CHECK (((tenant_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.memberships m
  WHERE ((m.user_id = ( SELECT auth.uid() AS uid)) AND (m.tenant_id = ((( SELECT auth.jwt() AS jwt) ->> 'tenant_id'::text))::uuid) AND (m.tenant_id = reflex_events.tenant_id) AND (m.role = ANY (ARRAY['owner'::public.role, 'admin'::public.role, 'staff'::public.role])))))));


--
-- Name: payments tenant_write_payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_write_payments ON public.payments FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.memberships m
  WHERE ((m.user_id = ( SELECT auth.uid() AS uid)) AND (m.tenant_id = ((( SELECT auth.jwt() AS jwt) ->> 'tenant_id'::text))::uuid) AND (m.tenant_id = payments.tenant_id) AND (m.role = ANY (ARRAY['owner'::public.role, 'admin'::public.role, 'staff'::public.role]))))));


--
-- Name: Session tenant_write_sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_write_sessions ON public."Session" FOR INSERT WITH CHECK (((tenant_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.memberships m
  WHERE ((m.user_id = ( SELECT auth.uid() AS uid)) AND (m.tenant_id = ((( SELECT auth.jwt() AS jwt) ->> 'tenant_id'::text))::uuid) AND (m.tenant_id = "Session".tenant_id) AND (m.role = ANY (ARRAY['owner'::public.role, 'admin'::public.role, 'staff'::public.role])))))));


--
-- Name: tenants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

--
-- Name: venues venue_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY venue_read ON public.venues FOR SELECT USING (((( SELECT auth.role() AS role) = 'service_role'::text) OR ((( SELECT auth.role() AS role) = 'authenticated'::text) AND (EXISTS ( SELECT 1
   FROM public.staff
  WHERE ((staff.user_id = ( SELECT auth.uid() AS uid)) AND (staff.venue_id = venues.id) AND (staff.role = 'ADMIN'::text)))))));


--
-- Name: venues venue_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY venue_write ON public.venues USING (((( SELECT auth.role() AS role) = 'service_role'::text) OR ((( SELECT auth.role() AS role) = 'authenticated'::text) AND (EXISTS ( SELECT 1
   FROM public.staff
  WHERE ((staff.user_id = ( SELECT auth.uid() AS uid)) AND (staff.venue_id = venues.id) AND (staff.role = 'ADMIN'::text))))))) WITH CHECK (((( SELECT auth.role() AS role) = 'service_role'::text) OR ((( SELECT auth.role() AS role) = 'authenticated'::text) AND (EXISTS ( SELECT 1
   FROM public.staff
  WHERE ((staff.user_id = ( SELECT auth.uid() AS uid)) AND (staff.venue_id = venues.id) AND (staff.role = 'ADMIN'::text)))))));


--
-- Name: venues; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

--
-- Name: zones; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: objects Admin can delete menu files; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Admin can delete menu files" ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'menu-files'::text) AND (( SELECT m.role
   FROM (auth.users u
     JOIN public.memberships m ON ((m.user_id = u.id)))
  WHERE ((u.id = auth.uid()) AND (m.role = ANY (ARRAY['admin'::public.role, 'owner'::public.role])))) IS NOT NULL)));


--
-- Name: objects Admin can read menu files; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Admin can read menu files" ON storage.objects FOR SELECT TO authenticated USING (((bucket_id = 'menu-files'::text) AND (( SELECT m.role
   FROM (auth.users u
     JOIN public.memberships m ON ((m.user_id = u.id)))
  WHERE ((u.id = auth.uid()) AND (m.role = ANY (ARRAY['admin'::public.role, 'owner'::public.role])))) IS NOT NULL)));


--
-- Name: objects Admin can upload menu files; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Admin can upload menu files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'menu-files'::text) AND (( SELECT m.role
   FROM (auth.users u
     JOIN public.memberships m ON ((m.user_id = u.id)))
  WHERE ((u.id = auth.uid()) AND (m.role = ANY (ARRAY['admin'::public.role, 'owner'::public.role])))) IS NOT NULL)));


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict a4Uz0yPnDUsT0Ftsqdc48GQJUNEsLGJnDNHq1GqyXm3MVflUbfVJcPxGarjcinO

