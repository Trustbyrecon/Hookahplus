import React, { useState } from 'react';

interface CustomerProfile {
  id: string;
  name: string;
  preferences: {
    favoriteFlavors: string[];
    sessionDuration: number;
    addOnPreferences: string[];
    notes: string;
  };
  previousSessions: string[];
}

interface CustomerProfileManagerProps {
  onProfileUpdate?: (profile: CustomerProfile) => void;
}

export default function CustomerProfileManager({ onProfileUpdate }: CustomerProfileManagerProps) {
  const [profiles, setProfiles] = useState<CustomerProfile[]>([
    {
      id: 'cust_001',
      name: 'Alex Johnson',
      preferences: {
        favoriteFlavors: ['Peach + Mint', 'Strawberry + Mint'],
        sessionDuration: 90,
        addOnPreferences: ['Mint', 'Grape'],
        notes: 'Prefers strong mint flavors, regular customer'
      },
      previousSessions: ['prev_001', 'prev_002']
    },
    {
      id: 'cust_002',
      name: 'Sarah Chen',
      preferences: {
        favoriteFlavors: ['Blue Mist + Mint', 'Lavender + Mint'],
        sessionDuration: 60,
        addOnPreferences: ['Rose', 'Lavender'],
        notes: 'Likes floral notes, moderate session length'
      },
      previousSessions: ['prev_003', 'prev_004']
    }
  ]);

  const [editingProfile, setEditingProfile] = useState<CustomerProfile | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleEditProfile = (profile: CustomerProfile) => {
    setEditingProfile(profile);
  };

  const handleSaveProfile = (profile: CustomerProfile) => {
    setProfiles(prev => prev.map(p => p.id === profile.id ? profile : p));
    setEditingProfile(null);
    onProfileUpdate?.(profile);
  };

  const handleAddProfile = (profile: CustomerProfile) => {
    setProfiles(prev => [...prev, profile]);
    setShowAddForm(false);
  };

  const handleDeleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-teal-300">Customer Profile Manager</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Add Profile
        </button>
      </div>

      <div className="space-y-4">
        {profiles.map((profile) => (
          <div key={profile.id} className="bg-zinc-800 border border-zinc-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-medium text-white">{profile.name}</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditProfile(profile)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProfile(profile.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-400">ID: </span>
                <span className="text-teal-400 font-mono">{profile.id}</span>
              </div>
              <div>
                <span className="text-zinc-400">Session Duration: </span>
                <span className="text-white">{profile.preferences.sessionDuration} min</span>
              </div>
              <div>
                <span className="text-zinc-400">Favorite Flavors: </span>
                <span className="text-white">{profile.preferences.favoriteFlavors.join(', ')}</span>
              </div>
              <div>
                <span className="text-zinc-400">Add-on Preferences: </span>
                <span className="text-white">{profile.preferences.addOnPreferences.join(', ')}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-zinc-400">Notes: </span>
                <span className="text-yellow-400">{profile.preferences.notes}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-zinc-400">Previous Sessions: </span>
                <span className="text-blue-400">{profile.previousSessions.length} sessions</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Profile Modal */}
      {editingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-teal-400 mb-4">Edit Profile</h3>
            <ProfileForm
              profile={editingProfile}
              onSave={handleSaveProfile}
              onCancel={() => setEditingProfile(null)}
            />
          </div>
        </div>
      )}

      {/* Add Profile Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-teal-400 mb-4">Add New Profile</h3>
            <ProfileForm
              profile={{
                id: `cust_${Date.now()}`,
                name: '',
                preferences: {
                  favoriteFlavors: [],
                  sessionDuration: 60,
                  addOnPreferences: [],
                  notes: ''
                },
                previousSessions: []
              }}
              onSave={handleAddProfile}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface ProfileFormProps {
  profile: CustomerProfile;
  onSave: (profile: CustomerProfile) => void;
  onCancel: () => void;
}

function ProfileForm({ profile, onSave, onCancel }: ProfileFormProps) {
  const [formData, setFormData] = useState(profile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-zinc-400 mb-1">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:border-teal-500 focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Favorite Flavors (comma-separated)</label>
        <input
          type="text"
          value={formData.preferences.favoriteFlavors.join(', ')}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            preferences: {
              ...prev.preferences,
              favoriteFlavors: e.target.value.split(',').map(f => f.trim()).filter(Boolean)
            }
          }))}
          className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:border-teal-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Session Duration (minutes)</label>
        <input
          type="number"
          value={formData.preferences.sessionDuration}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            preferences: {
              ...prev.preferences,
              sessionDuration: parseInt(e.target.value) || 60
            }
          }))}
          className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:border-teal-500 focus:outline-none"
          min="30"
          max="180"
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Add-on Preferences (comma-separated)</label>
        <input
          type="text"
          value={formData.preferences.addOnPreferences.join(', ')}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            preferences: {
              ...prev.preferences,
              addOnPreferences: e.target.value.split(',').map(f => f.trim()).filter(Boolean)
            }
          }))}
          className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:border-teal-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Notes</label>
        <textarea
          value={formData.preferences.notes}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            preferences: {
              ...prev.preferences,
              notes: e.target.value
            }
          }))}
          className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:border-teal-500 focus:outline-none"
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-zinc-600 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
