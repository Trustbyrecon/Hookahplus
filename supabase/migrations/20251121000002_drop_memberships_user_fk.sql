-- Drop the foreign key constraint from memberships.user_id to auth.users(id)
-- This removes the hard coupling so we can create memberships even if
-- the auth.users row was created in a different flow or restored later.
-- Application logic still relies on Supabase Auth for identity.

ALTER TABLE public."memberships"
DROP CONSTRAINT IF EXISTS "memberships_user_id_fkey";


