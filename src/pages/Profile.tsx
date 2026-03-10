import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; // Added Link for navigation
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { getUserDossier, updateUserDossier, UserProfile } from '../services/userService';
import { User as UserIcon, Shield, Map, MessageSquare, Save, Loader2, CheckCircle, Package, Camera } from 'lucide-react';
import { RoutePath } from '../types';
import ImageCropperModal from '../components/ImageCropperModal';
import { Area } from 'react-easy-crop';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      getUserDossier(user.id).then(data => {
        setProfile(data);
        setLoading(false);
      });
    }
  }, [user]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Cropper State
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImageStr, setSelectedImageStr] = useState<string | null>(null);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read file for cropping
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setSelectedImageStr(reader.result as string);
      setShowCropper(true);
    };
    
    // Reset input so the same file can be selected again if canceled
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropComplete = async (croppedAreaPixels: Area) => {
    setShowCropper(false);
    if (!selectedImageStr || !user) return;
    
    setIsUploading(true);
    try {
      const processCroppedImage = (): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = selectedImageStr;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            // Fixed output size for avatars (e.g. 256x256)
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
              // Draw the cropped portion of the original image onto the canvas
              ctx.drawImage(
                img,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                256,
                256
              );
              resolve(canvas.toDataURL('image/jpeg', 0.85));
            } else {
              reject(new Error("Canvas context null"));
            }
          };
          img.onerror = (err) => reject(err);
        });
      };

      const base64Url = await processCroppedImage();
      await updateUserDossier(user.id, { avatar_url: base64Url });
      updateUser({ avatar_url: base64Url });
      if (profile) setProfile({ ...profile, avatar_url: base64Url });
      
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      alert("Failed to process image.");
    } finally {
      setIsUploading(false);
      setSelectedImageStr(null);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedImageStr(null);
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    setIsSaving(true);
    try {
      await updateUserDossier(user.id, { bio: profile.bio });
      updateUser({ bio: profile.bio });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("The ink has run dry. Could not save.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0a08]">
      <Loader2 className="animate-spin text-amber-500 w-10 h-10" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="bg-[#1c120d] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Profile Header */}
        <div className="h-32 bg-gradient-to-r from-red-900/20 to-amber-900/20 border-b border-zinc-800 flex items-end p-8">
           <div 
             onClick={handleAvatarClick}
             className="relative w-24 h-24 rounded-2xl bg-[#0f0a08] border-4 border-[#1c120d] flex items-center justify-center -mb-12 shadow-xl cursor-pointer group overflow-hidden"
           >
             {isUploading ? (
               <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
             ) : user?.avatar_url || profile?.avatar_url ? (
               <img src={user?.avatar_url || profile?.avatar_url || ""} alt="Avatar" className="w-full h-full object-cover" />
             ) : (
               <UserIcon className="w-12 h-12 text-zinc-700" />
             )}
             
             {/* Hover Overlay */}
             {!isUploading && (
               <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Camera className="w-6 h-6 text-zinc-200" />
               </div>
             )}
             
             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleFileChange} 
               accept="image/*" 
               className="hidden" 
             />
           </div>
        </div>

        <div className="p-8 pt-16">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-bold medieval-font text-zinc-100 uppercase tracking-tight">
                {user?.username}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-amber-500">
                <Shield className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {user?.role === 'admin' ? t('common.hand_of_the_king') : t('common.knight')}
                </span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold uppercase text-[10px] tracking-widest rounded-lg transition-all"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (success ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Save className="w-4 h-4" />)}
                {success ? t('profile.save_success') : t('profile.save_button')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-8">
              <div>
                <label className="block text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
                  {t('profile.bio_label')}
                </label>
                <textarea 
                  value={profile?.bio}
                  onChange={(e) => setProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
                  className="w-full bg-[#0f0a08] border border-zinc-800 rounded-xl p-6 text-zinc-300 italic focus:border-amber-600/50 outline-none transition-all h-40 resize-none"
                  placeholder="Scribe your history here..."
                />
              </div>

              {/* NEW: Prominent Link to Inventory */}
              <Link 
                to={RoutePath.Orders} 
                className="group flex items-center justify-between p-6 bg-[#0f0a08] border border-zinc-800 rounded-2xl hover:border-amber-500/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-900/20 rounded-xl group-hover:bg-amber-500 transition-colors">
                    <Package className="w-6 h-6 text-amber-500 group-hover:text-[#0f0a08]" />
                  </div>
                  <div>
                    <h3 className="text-zinc-100 font-bold uppercase text-xs tracking-widest">
                      {t('profile.view_inventory')}
                    </h3>
                    <p className="text-zinc-600 text-[10px] mt-1 italic">View thy claimed artifacts and ledger status</p>
                  </div>
                </div>
                <div className="text-zinc-800 group-hover:text-amber-500 transition-colors">
                  <Shield className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>

            <div className="space-y-6">
               <div className="bg-[#0f0a08] border border-zinc-900 rounded-xl p-6">
                 <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">
                   {t('profile.stats_title')}
                 </h4>
                 <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 text-zinc-400 text-xs"><Map className="w-3 h-3" /> <span>Region</span></div>
                     <span className="text-zinc-200 text-xs font-bold uppercase tracking-widest">Global</span>
                   </div>
                   <div className="flex items-center justify-between border-t border-zinc-900 pt-4">
                     <div className="flex items-center gap-2 text-zinc-400 text-xs"><MessageSquare className="w-3 h-3" /> <span>Rank</span></div>
                     <span className="text-amber-500 text-xs font-bold uppercase tracking-widest">Noble</span>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render Cropper Modal */}
      {showCropper && selectedImageStr && (
        <ImageCropperModal 
          imageSrc={selectedImageStr}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
};

export default Profile;