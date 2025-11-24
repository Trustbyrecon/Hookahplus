'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Shield, Mail, Loader2 } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

interface SecureRoleSelectorProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export function SecureRoleSelector({ currentRole, onRoleChange }: SecureRoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showMagicLinkModal, setShowMagicLinkModal] = useState(false);
  const [email, setEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get current user email
    const getCurrentUser = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setUserEmail(user.email);
          setEmail(user.email);
        }
      } catch (error) {
        console.error('Error getting user email:', error);
      }
    };

    getCurrentUser();
  }, []);

  const handleRoleChange = async (newRole: string) => {
    // If changing to ADMIN, require magic link verification
    if (newRole.toLowerCase() === 'admin' && currentRole.toLowerCase() !== 'admin') {
      setSelectedRole(newRole);
      setShowMagicLinkModal(true);
      return;
    }

    // For other roles, allow immediate change
    setSelectedRole(newRole);
    onRoleChange(newRole);
  };

  const sendMagicLink = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setIsVerifying(true);
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      
      // Use standard auth callback route (must be in Supabase allowed redirect URLs)
      // Store role verification intent in localStorage to check after auth
      if (typeof window !== 'undefined') {
        localStorage.setItem('pending_role_verification', JSON.stringify({
          role: selectedRole,
          redirect: window.location.pathname,
          timestamp: Date.now()
        }));
      }
      
      // Send magic link using standard callback route
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${appUrl}/auth/callback?verify_role=${selectedRole}&redirect=${encodeURIComponent(window.location.pathname)}`,
        },
      });

      if (error) throw error;

      setMagicLinkSent(true);
    } catch (error: any) {
      console.error('Error sending magic link:', error);
      // Clean up localStorage on error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pending_role_verification');
      }
      alert(error.message || 'Failed to send magic link. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-zinc-400">Role:</span>
        <select
          value={selectedRole}
          onChange={(e) => handleRoleChange(e.target.value)}
          className="bg-zinc-800 border border-zinc-600 rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="manager">MANAGER</option>
          <option value="foh">FOH</option>
          <option value="boh">BOH</option>
          <option value="admin">ADMIN</option>
        </select>
        <span className="text-xs text-zinc-500">
          ({selectedRole === 'admin' ? 'ADMIN' : selectedRole === 'foh' ? 'FOH' : selectedRole === 'boh' ? 'BOH' : 'MANAGER'} View)
        </span>
      </div>

      {/* Magic Link Verification Modal */}
      {showMagicLinkModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-teal-400" />
              <h2 className="text-lg font-semibold text-white">Admin Access Verification</h2>
            </div>
            
            <p className="text-sm text-zinc-400 mb-6">
              Changing to ADMIN role requires email verification for security. We'll send a magic link to verify your identity.
            </p>

            {!magicLinkSent ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={sendMagicLink}
                    disabled={isVerifying || !email}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Send Magic Link</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowMagicLinkModal(false);
                      setSelectedRole(currentRole);
                      setMagicLinkSent(false);
                    }}
                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <Mail className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                <p className="text-sm text-zinc-300 mb-2">
                  Magic link sent to <span className="font-medium text-white">{email}</span>
                </p>
                <p className="text-xs text-zinc-500 mb-6">
                  Click the link in your email to verify and switch to ADMIN role. This window will close automatically.
                </p>
                <button
                  onClick={() => {
                    setShowMagicLinkModal(false);
                    setMagicLinkSent(false);
                    setSelectedRole(currentRole);
                  }}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

