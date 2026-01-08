'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Pass, TerrainTag } from '@/types';
import { mountains } from '@/data/mountains';
import { updateUser } from '@/lib/firestore';
import { Button, Input, Textarea, Checkbox, Select } from '@/components/ui';
import { BackLink } from '@/components/layout/back-link';

export default function ProfileEditPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [passes, setPasses] = useState<Pass[]>([]);
  const [homeMountains, setHomeMountains] = useState<string[]>([]);
  const [terrainTags, setTerrainTags] = useState<TerrainTag[]>([]);

  // Filmer fields
  const [isFilmer, setIsFilmer] = useState(false);
  const [gear, setGear] = useState('');
  const [sampleWorkUrls, setSampleWorkUrls] = useState<string[]>(['', '', '']);
  const [sessionRate, setSessionRate] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setBio(user.bio || '');
      setPasses(user.passes);
      setHomeMountains(user.homeMountains);
      setTerrainTags(user.terrainTags);
      setIsFilmer(user.isFilmer);
      setGear(user.gear || '');
      setSampleWorkUrls([
        user.sampleWorkUrls[0] || '',
        user.sampleWorkUrls[1] || '',
        user.sampleWorkUrls[2] || '',
      ]);
      setSessionRate(user.sessionRate?.toString() || '');
    }
  }, [user]);

  const handlePassToggle = (pass: Pass) => {
    setPasses((prev) => (prev.includes(pass) ? prev.filter((p) => p !== pass) : [...prev, pass]));
  };

  const handleTerrainToggle = (tag: TerrainTag) => {
    setTerrainTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setSuccess(false);

    try {
      await updateUser(user.id, {
        displayName,
        bio,
        passes,
        homeMountains,
        terrainTags,
        isFilmer,
        gear: gear || null,
        sampleWorkUrls: sampleWorkUrls.filter((url) => url.trim() !== ''),
        sessionRate: sessionRate ? parseInt(sessionRate, 10) : null,
      });

      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BackLink href="/dashboard" label="Back to Dashboard" />

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Info</h2>
          <div className="space-y-4">
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
            <Textarea
              label="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself and your riding style..."
              rows={3}
            />
          </div>
        </div>

        {/* Passes & Mountains */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Passes & Mountains</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Season Passes</label>
              <div className="flex flex-wrap gap-4">
                {(['ikon', 'epic', 'indy', 'local', 'other'] as Pass[]).map((pass) => (
                  <Checkbox
                    key={pass}
                    label={pass.charAt(0).toUpperCase() + pass.slice(1)}
                    checked={passes.includes(pass)}
                    onChange={() => handlePassToggle(pass)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Home Mountains</label>
              <div className="grid grid-cols-2 gap-2">
                {mountains.slice(0, 8).map((mountain) => (
                  <Checkbox
                    key={mountain.id}
                    label={mountain.name}
                    checked={homeMountains.includes(mountain.id)}
                    onChange={() =>
                      setHomeMountains((prev) =>
                        prev.includes(mountain.id)
                          ? prev.filter((m) => m !== mountain.id)
                          : [...prev, mountain.id]
                      )
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Terrain */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Terrain</h2>
          <div className="flex flex-wrap gap-4">
            <Checkbox
              label="Park"
              checked={terrainTags.includes('park')}
              onChange={() => handleTerrainToggle('park')}
            />
            <Checkbox
              label="All-Mountain"
              checked={terrainTags.includes('all-mountain')}
              onChange={() => handleTerrainToggle('all-mountain')}
            />
            <Checkbox
              label="Groomers"
              checked={terrainTags.includes('groomers')}
              onChange={() => handleTerrainToggle('groomers')}
            />
          </div>
        </div>

        {/* Filmer Settings */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filmer Settings</h2>
            <Checkbox label="I want to film" checked={isFilmer} onChange={() => setIsFilmer(!isFilmer)} />
          </div>

          {isFilmer && (
            <div className="space-y-4">
              <Input
                label="Gear"
                value={gear}
                onChange={(e) => setGear(e.target.value)}
                placeholder="e.g., GoPro 12, DJI OM6 gimbal"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sample Work URLs (YouTube/Instagram)
                </label>
                {sampleWorkUrls.map((url, idx) => (
                  <Input
                    key={idx}
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...sampleWorkUrls];
                      newUrls[idx] = e.target.value;
                      setSampleWorkUrls(newUrls);
                    }}
                    placeholder={`Video URL ${idx + 1}`}
                    className="mb-2"
                  />
                ))}
              </div>

              <Input
                label="Default Session Rate ($)"
                type="number"
                value={sessionRate}
                onChange={(e) => setSessionRate(e.target.value)}
                placeholder="60"
              />
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1" loading={submitting}>
            Save Changes
          </Button>
        </div>

        {success && (
          <p className="text-sm text-emerald-600 text-center">Profile updated successfully!</p>
        )}
      </form>
    </div>
  );
}
