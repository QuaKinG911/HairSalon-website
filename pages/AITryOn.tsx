import React, { useState, useRef } from 'react';
import { Camera, Upload, RefreshCw, Download, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

// Reliable transparent PNG assets for hairstyles
const HAIR_STYLES = [
  {
    id: 'modern-quiff',
    name: 'Modern Quiff',
    // Updated to reliable sources with no-referrer policy
    src: 'https://pngimg.com/uploads/hair/hair_PNG5623.png', 
    scale: 1.2, // Scale relative to face width estimate
    yOffset: -10   // Percentage offset from estimated hairline
  },
  {
    id: 'pompadour',
    name: 'Classic Pompadour',
    src: 'https://www.pngarts.com/files/3/Man-Hair-PNG-High-Quality-Image.png',
    scale: 1.3,
    yOffset: -15
  },
  {
    id: 'side-part',
    name: 'Executive Side Part',
    src: 'https://pngimg.com/uploads/hair/hair_PNG5641.png',
    scale: 1.2,
    yOffset: -5
  },
  {
    id: 'messy-crop',
    name: 'Textured Crop',
    src: 'https://www.pngarts.com/files/3/Men-Hair-PNG-Transparent-Image.png',
    scale: 1.25,
    yOffset: -12
  }
];

type AppState = 'initial' | 'processing' | 'results';

const AITryOn: React.FC = () => {
  const [state, setState] = useState<AppState>('initial');
  const [userImage, setUserImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startGeneration = () => {
    if (!userImage) return;
    setState('processing');
    
    // Simulate AI Processing time
    setTimeout(() => {
      setState('results');
    }, 3000);
  };

  const reset = () => {
    setUserImage(null);
    setState('initial');
  };

  return (
    <div className="bg-white min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-amber-50 rounded-full mb-4">
            <Sparkles className="text-amber-600 w-6 h-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">AI Style Lab</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload a selfie and let our AI automatically fit our signature cuts to your face.
            <br />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 mt-2 block">
              Tip: Pull your hair back and look straight at the camera.
            </span>
          </p>
        </div>

        {/* INITIAL STATE: UPLOAD */}
        {state === 'initial' && (
          <div className="max-w-xl mx-auto bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-10 text-center hover:border-amber-500 transition-colors">
            {userImage ? (
              <div className="space-y-8">
                <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden shadow-xl border-4 border-white">
                  <img src={userImage} alt="Upload" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={startGeneration}
                    className="w-full py-4 bg-amber-600 text-white font-bold uppercase tracking-widest rounded-sm hover:bg-amber-500 shadow-lg transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="animate-none" /> Generate Styles
                  </button>
                  <button 
                    onClick={() => setUserImage(null)}
                    className="text-gray-500 text-sm font-bold hover:text-gray-900"
                  >
                    Change Photo
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 py-8">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Camera size={48} className="text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Upload Your Photo</h3>
                  <p className="text-gray-500 mt-2 text-sm">JPG or PNG. Good lighting works best.</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-3 bg-gray-900 text-white font-bold uppercase tracking-wider rounded-sm hover:bg-gray-800 transition-all"
                >
                  Select Image
                </button>
              </div>
            )}
          </div>
        )}

        {/* PROCESSING STATE */}
        {state === 'processing' && (
          <div className="max-w-xl mx-auto text-center py-20 space-y-8">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
              <img 
                src={userImage!} 
                className="absolute inset-2 rounded-full object-cover w-[calc(100%-16px)] h-[calc(100%-16px)] opacity-50" 
                alt="Processing"
              />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Analyzing Facial Structure...</h3>
              <p className="text-gray-500 animate-pulse">Mapping landmarks • Removing background • Fitting styles</p>
            </div>
          </div>
        )}

        {/* RESULTS STATE */}
        {state === 'results' && userImage && (
          <div className="space-y-12">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-gray-900">Recommended Styles</h2>
               <button 
                 onClick={reset}
                 className="px-6 py-2 border border-gray-300 rounded-sm text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
               >
                 Start Over
               </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {HAIR_STYLES.map((style) => (
                <div key={style.id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow border border-gray-100 group">
                  {/* 
                    COMPOSITE VIEW 
                    We use absolute positioning to overlay the hair on top of the user image.
                    This bypasses CORS canvas issues and ensures the user sees the result immediately.
                  */}
                  <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                    {/* User Image (Base) */}
                    <img 
                      src={userImage} 
                      alt="User" 
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Hair Overlay */}
                    <div 
                      className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none"
                      style={{
                        top: `${style.yOffset}%`, // Auto-positioned based on typical hairline
                        width: `${style.scale * 100}%`, // Scaled to fit typical head width relative to frame
                      }}
                    >
                      <img 
                        src={style.src} 
                        alt={style.name}
                        className="w-full h-auto drop-shadow-2xl filter contrast-110 brightness-95"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          // If image fails, hide it so we don't see ugly alt text
                          // In a real app, we might show a fallback placeholder
                          e.currentTarget.style.opacity = '0';
                        }}
                      />
                    </div>

                    {/* Gradient Overlay for "Professional" Look */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white/95 backdrop-blur-sm p-3 rounded-sm">
                        <h4 className="font-bold text-gray-900 text-sm">{style.name}</h4>
                        <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                          <CheckCircle2 size={12} />
                          <span className="font-bold uppercase tracking-wider">98% Match</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                     <span className="text-xs font-bold text-gray-500 uppercase">AI Recommendation</span>
                     <button className="text-amber-600 hover:text-amber-700">
                       <Download size={20} />
                     </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 flex items-start gap-4 max-w-3xl mx-auto mt-12">
              <AlertCircle className="text-amber-600 shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-amber-900 mb-1">Stylist Note</h4>
                <p className="text-sm text-amber-800 leading-relaxed">
                  These AI generations are approximations. Our master barbers can adapt these styles to perfectly suit your unique hair texture and growth patterns during your appointment.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AITryOn;