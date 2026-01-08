'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { updateUser } from '@/lib/firestore';
import { Button, Input, Textarea } from '@/components/ui';
import { BackLink } from '@/components/layout/back-link';
import { Camera, DollarSign, Video, CheckCircle } from 'lucide-react';

export default function FilmerSetupPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [gear, setGear] = useState('');
  const [sampleWorkUrls, setSampleWorkUrls] = useState<string[]>(['', '', '']);
  const [sessionRate, setSessionRate] = useState('60');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setGear(user.gear || '');
      setSampleWorkUrls([
        user.sampleWorkUrls[0] || '',
        user.sampleWorkUrls[1] || '',
        user.sampleWorkUrls[2] || '',
      ]);
      setSessionRate(user.sessionRate?.toString() || '60');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;

    setSubmitting(true);
    try {
      await updateUser(user.id, {
        isFilmer: true,
        gear: gear || null,
        sampleWorkUrls: sampleWorkUrls.filter((url) => url.trim() !== ''),
        sessionRate: sessionRate ? parseInt(sessionRate, 10) : 60,
        bio,
      });

      await refreshUser();
      router.push('/dashboard');
    } catch (err) {
      console.error('Error setting up filmer profile:', err);
      alert('Failed to set up profile. Please try again.');
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

  if (user.isFilmer) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackLink href="/dashboard" label="Back to Dashboard" />

        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re all set!</h1>
          <p className="text-gray-600 mb-6">Your filmer profile is active. Start posting sessions!</p>
          <Button onClick={() => router.push('/dashboard/post')}>Post a Session</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BackLink href="/dashboard" label="Back to Dashboard" />

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Become a Filmer</h1>
      <p className="text-gray-600 mb-8">Set up your profile to start earning by filming other riders.</p>

      {/* Progress */}
      <div className="flex items-center mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s}
            </div>
            {s < 3 && <div className={`w-12 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Gear */}
      {step === 1 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Camera className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Your Gear</h2>
          </div>
          <p className="text-gray-600 mb-4">
            What equipment do you use to film? Riders want to know what kind of footage they&apos;ll get.
          </p>
          <Input
            value={gear}
            onChange={(e) => setGear(e.target.value)}
            placeholder="e.g., GoPro 12, DJI OM6 gimbal, iPhone 15 Pro"
          />
          <Button className="w-full mt-6" onClick={() => setStep(2)}>
            Continue
          </Button>
        </div>
      )}

      {/* Step 2: Sample Work */}
      {step === 2 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Video className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Sample Work</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Share links to your best ski/snowboard footage. YouTube or Instagram links work great.
          </p>
          <div className="space-y-3">
            {sampleWorkUrls.map((url, idx) => (
              <Input
                key={idx}
                value={url}
                onChange={(e) => {
                  const newUrls = [...sampleWorkUrls];
                  newUrls[idx] = e.target.value;
                  setSampleWorkUrls(newUrls);
                }}
                placeholder={`Video URL ${idx + 1} (optional)`}
              />
            ))}
          </div>
          <div className="flex gap-4 mt-6">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button className="flex-1" onClick={() => setStep(3)}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Rate & Bio */}
      {step === 3 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Rate & Bio</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Input
                label="Default Session Rate ($)"
                type="number"
                value={sessionRate}
                onChange={(e) => setSessionRate(e.target.value)}
                min="20"
                max="200"
              />
              <p className="text-sm text-gray-500 mt-1">Most filmers charge $40-80 per session</p>
            </div>

            <Textarea
              label="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell riders about yourself - your experience, riding style, and what makes your footage stand out..."
              rows={4}
            />
          </div>

          <div className="flex gap-4 mt-6">
            <Button variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button className="flex-1" onClick={handleSubmit} loading={submitting}>
              Complete Setup
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
