'use client';
import { useState } from 'react';
import Cropper from 'react-easy-crop';

export default function TestCropper() {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const cropImageSrc = "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=500&h=500&fit=crop";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl">Adjust Logo</h3>
        </div>
        
        <div className="relative w-full h-[500px] bg-gray-100">
          <Cropper
            image={cropImageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
          />
        </div>
      </div>
    </div>
  );
}
