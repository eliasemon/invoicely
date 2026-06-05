'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileNav } from '@/components/profile/ProfileNav';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { 
  BusinessInfoSection, 
  RegionalSettingsSection, 
  ContactDetailsSection, 
  SignatureSection, 
  BankDetailsSection,
  QrCodeSection
} from '@/components/profile/ProfileSections';
import { getProfile, updateProfile, uploadCompanyLogo, deleteCompanyLogo, uploadSignature } from '@/app/actions/profileActions';
import { UserProfile } from '@/hooks/useProfile';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Cropper states
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile();
        if (data) {
          setProfile(data);
        }
      } catch (err: any) {
        console.error('Failed to load profile:', err);
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  // Initialize tour if user hasn't onboarded
  useEffect(() => {
    if (loading) return;

    // Check if it's a new user (no data yet) or onboarding is explicitly false
    const isNewUser = Object.keys(profile).length === 0;
    const needsOnboarding = profile.onboarding_completed === false || isNewUser;
    
    // Also check URL params just in case they were redirected
    const urlParams = new URLSearchParams(window.location.search);
    const isTourRequested = urlParams.get('tour') === 'true';

    if (needsOnboarding || isTourRequested) {
      // Clean up the URL
      if (isTourRequested) {
        window.history.replaceState({}, '', '/profile');
      }

      const tour = driver({
        showProgress: true,
        allowClose: false,
        allowKeyboardControl: false,
        onDestroyed: () => {
          if (needsOnboarding) {
            // Mark onboarding as completed silently when the user clicks 'Done'
            // at the final step, so it doesn't trigger again.
            updateProfile({ onboarding_completed: true }).catch(console.error);
            setProfile(prev => ({ ...prev, onboarding_completed: true }));
          }
        },
        steps: [
          { 
            element: '#profile-header', 
            popover: { 
              title: 'Welcome to Invorio!', 
              description: 'Let\'s get your profile set up so you can start generating beautiful invoices. We\'ll walk you through the key sections.', 
              side: "bottom", 
              align: 'start' 
            }
          },
          { 
            element: '#business-section', 
            popover: { 
              title: 'Business Info', 
              description: 'Enter your company name, address, and optionally business registration and tax details. These will appear on your invoices.', 
              side: "top", 
              align: 'start' 
            }
          },
          { 
            element: '#regional-section', 
            popover: { 
              title: 'Regional Settings', 
              description: 'Set your default currency. You can still change it per invoice, but this saves time!', 
              side: "top", 
              align: 'start' 
            }
          },
          { 
            element: '#contact-section', 
            popover: { 
              title: 'Contact Details', 
              description: 'Provide the email, phone, and billing address you want your clients to use.', 
              side: "top", 
              align: 'start' 
            }
          },
          { 
            element: '#bank-details-section', 
            popover: { 
              title: 'Bank Details', 
              description: 'Add your bank details so clients know how to pay you. You can turn this on or off anytime.', 
              side: "top", 
              align: 'start' 
            }
          },
          { 
            element: '#save-profile-btn', 
            popover: { 
              title: 'Save Profile', 
              description: 'Once you\'ve filled out everything, click here to save. You\'re all set to start billing!', 
              side: "top", 
              align: 'end' 
            }
          }
        ]
      });
      
      // Delay to ensure DOM components are fully rendered
      setTimeout(() => {
        tour.drive();
      }, 500);
    }
  }, [loading, profile]);

  const handleProfileChange = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      let finalProfile = { ...profile };

      // Ensure onboarding is marked completed if they save their profile
      if (finalProfile.onboarding_completed === false || finalProfile.onboarding_completed === undefined) {
        finalProfile.onboarding_completed = true;
      }

      // If signature is a newly drawn base64 string, upload it first
      if (finalProfile.signature_url?.startsWith('data:image/')) {
        const publicUrl = await uploadSignature(finalProfile.signature_url);
        finalProfile.signature_url = publicUrl;
        setProfile(prev => ({ ...prev, signature_url: publicUrl }));
      }

      await updateProfile(finalProfile);
      // Optional: show success toast here
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      setError('Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setCropImageSrc(src);
        setIsCropping(true);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
        setAspect(img.width / img.height);
      };
    };
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    if (!cropImageSrc || !croppedAreaPixels) return;

    setUploading(true);
    setError(null);
    setIsCropping(false);

    try {
      const croppedBlob = await getCroppedImg(cropImageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error('Failed to crop image');

      const file = new File([croppedBlob], 'logo.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('logo', file);
      
      const publicUrl = await uploadCompanyLogo(formData);

      if (profile.company_logo && profile.company_logo !== publicUrl) {
        try {
          await deleteCompanyLogo(profile.company_logo);
        } catch (e) {
          console.error("Failed to delete old company logo:", e);
        }
      }

      setProfile(prev => ({ ...prev, company_logo: publicUrl }));
    } catch (err: any) {
      console.error('Failed to upload cropped logo:', err);
      setError(err.message || 'Failed to upload logo.');
    } finally {
      setUploading(false);
      setCropImageSrc(null);
    }
  };

  const handleDeleteLogo = async () => {
    if (!profile.company_logo) return;
    
    setUploading(true);
    setError(null);
    try {
      await deleteCompanyLogo(profile.company_logo);
      setProfile(prev => ({ ...prev, company_logo: null }));
    } catch (err: any) {
      console.error('Failed to delete logo:', err);
      setError(err.message || 'Failed to delete logo.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ProfileNav />
      
      <div className="max-w-[800px] mx-auto py-8 md:py-12">
        <div className="mb-8" id="profile-header">
          <div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2 font-bold">Company Profile</h1>
            <p className="text-on-surface-variant font-body-md text-body-md">Manage your business details and branding.</p>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-error-container text-on-error-container rounded-lg font-body-sm">
              {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Logo Section */}
          <div className="md:col-span-4 relative">
            <div className="sticky top-[160px] bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm flex flex-col items-center justify-center gap-6 text-center overflow-hidden group hover:shadow-md transition-all duration-300">
              {uploading && (
                <div className="absolute inset-0 bg-surface/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl transition-opacity">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              )}
              
              <div 
                className="w-full max-w-[240px] h-32 rounded-xl bg-surface-container-high flex items-center justify-center text-primary mb-2 overflow-hidden border-2 border-outline-variant border-dashed relative cursor-pointer group-hover:border-primary transition-colors duration-300 shadow-inner"
                onClick={() => fileInputRef.current?.click()}
              >
                {profile.company_logo ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={profile.company_logo} alt="Company Logo" className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <MaterialIcon icon="edit" className="text-white text-3xl drop-shadow-md" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-on-surface-variant group-hover:text-primary transition-colors">
                    <MaterialIcon icon="add_photo_alternate" className="text-4xl mb-1" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Upload</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-center">
                <h3 className="font-label-md text-label-md text-on-surface mb-1 uppercase tracking-widest font-semibold">Company Logo</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">PNG, JPG up to 5MB.</p>
              </div>
              
              <div className="flex gap-3 mt-2 w-full">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/jpeg,image/png,image/webp" 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 border border-outline-variant text-on-surface font-label-sm text-label-sm px-4 py-2.5 rounded-xl hover:bg-surface-container hover:border-outline transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <MaterialIcon icon={profile.company_logo ? "sync" : "upload"} className="text-[18px]" />
                  {profile.company_logo ? 'Change' : 'Upload'}
                </button>
                {profile.company_logo && (
                  <button 
                    onClick={handleDeleteLogo}
                    disabled={uploading}
                    className="border border-error/50 text-error font-label-sm text-label-sm p-2.5 rounded-xl hover:bg-error-container hover:text-on-error-container hover:border-error transition-all active:scale-[0.98] disabled:opacity-50"
                    title="Remove Logo"
                  >
                    <MaterialIcon icon="delete" className="text-[18px]" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="md:col-span-8 flex flex-col gap-8 pb-[100px]">
            <BusinessInfoSection profile={profile} onChange={handleProfileChange} />
            <RegionalSettingsSection profile={profile} onChange={handleProfileChange} />
            <ContactDetailsSection profile={profile} onChange={handleProfileChange} />
            <SignatureSection profile={profile} onChange={handleProfileChange} />
            <BankDetailsSection profile={profile} onChange={handleProfileChange} />
            <QrCodeSection profile={profile} onChange={handleProfileChange} />
          </div>
        </div>
      </div>
      
      {/* Fixed Bottom Action Area */}
      <div className="fixed bottom-16 md:bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant p-margin-mobile md:px-margin-desktop z-[40] shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:mb-0">
        <div className="max-w-[800px] mx-auto">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-full border border-outline text-on-surface font-label-sm text-label-sm px-6 py-4 rounded-xl hover:bg-surface-container-low transition-all active:scale-[0.98] duration-150 uppercase tracking-widest"
            >
              Close
            </button>
            <button 
              id="save-profile-btn"
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-primary text-on-primary font-label-sm text-label-sm px-6 py-4 rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md active:scale-[0.98] duration-150 uppercase tracking-widest disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
      {/* Cropper Modal */}
      {isCropping && cropImageSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all duration-300">
          <div className="bg-surface rounded-3xl w-[95vw] md:w-[70vw] lg:w-[50vw] xl:w-[40vw] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Adjust Logo</h3>
              <button 
                onClick={() => {
                  setIsCropping(false);
                  setCropImageSrc(null);
                }}
                className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-container"
              >
                <MaterialIcon icon="close" />
              </button>
            </div>
            
            <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] bg-surface-container-high">
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                showGrid={false}
                objectFit="contain"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                style={{
                  containerStyle: { width: '100%', height: '100%' }
                }}
              />
            </div>
            
            <div className="p-6 bg-surface-container-lowest flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <MaterialIcon icon="zoom_out" className="text-on-surface-variant text-[20px]" />
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-surface-container rounded-lg appearance-none cursor-pointer"
                />
                <MaterialIcon icon="zoom_in" className="text-on-surface-variant text-[20px]" />
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setIsCropping(false);
                    setCropImageSrc(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border border-outline-variant text-on-surface font-label-md hover:bg-surface-container hover:border-outline transition-colors active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropSave}
                  className="flex-1 px-4 py-3 rounded-xl bg-primary text-on-primary font-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm active:scale-[0.98]"
                >
                  Apply & Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
