-- Cleanup: Remove test fixtures for network memory RPCs
-- Safe to run multiple times

BEGIN;

DELETE FROM public.network_session_notes WHERE note_id = 'note_test_001';
DELETE FROM public.network_sessions WHERE session_id = 'sess_test_001';
DELETE FROM public.network_profiles WHERE hid = 'HID-TEST-0001';
DELETE FROM public.square_merchants WHERE lounge_id = 'LOUNGE_TEST_001';

COMMIT;

