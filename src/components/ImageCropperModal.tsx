import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop';
import { X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ImageCropperProps {
  imageSrc: string;
  onCancel: () => void;
  onCropComplete: (croppedAreaPixels: Area) => void;
}

const ImageCropperModal: React.FC<ImageCropperProps> = ({ imageSrc, onCancel, onCropComplete }) => {
  const { t } = useTranslation();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteEvent = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApply = () => {
    if (croppedAreaPixels) {
      onCropComplete(croppedAreaPixels);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1c120d] border border-zinc-800 rounded-3xl overflow-hidden w-full max-w-lg shadow-2xl flex flex-col h-[80vh] max-h-[600px]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-[#0f0a08]">
          <h3 className="text-zinc-100 font-bold uppercase tracking-widest text-sm">
            {t('common.edit') || 'Edit Picture'}
          </h3>
          <button 
            onClick={onCancel}
            className="text-zinc-500 hover:text-red-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative flex-1 bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} // 1:1 for Avatars
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteEvent}
            onZoomChange={onZoomChange}
          />
        </div>

        {/* Zoom Slider & Actions */}
        <div className="p-6 bg-[#0f0a08] border-t border-zinc-800 space-y-6">
          <div className="flex items-center gap-4">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={onCancel}
              className="px-6 py-2.5 text-zinc-400 font-bold uppercase text-[10px] tracking-widest hover:text-zinc-200 transition-colors"
            >
              {t('common.cancel') || 'Cancel'}
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-amber-50 font-bold uppercase text-[10px] tracking-widest rounded-lg shadow-lg shadow-amber-900/20 transition-all"
            >
              <Check className="w-4 h-4" />
              {t('common.save') || 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
