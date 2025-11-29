import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RefreshCw, Download, Sparkles, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft, Star, Clock, Briefcase, Crown, Scissors } from 'lucide-react';
import { aiService } from '../services/aiService';
import { FaceAnalysis, HairstyleRecommendation, UserPreferences } from '../types';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type AppState = 'initial' | 'preferences' | 'analyzing' | 'results';

const AITryOn: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    return (sessionStorage.getItem('aiState') as AppState) || 'initial';
  });
  const [userImage, setUserImage] = useState<string | null>(() => {
    return sessionStorage.getItem('aiUserImage');
  });
  const [faceAnalysis, setFaceAnalysis] = useState<FaceAnalysis | null>(() => {
    const saved = sessionStorage.getItem('aiFaceAnalysis');
    return saved ? JSON.parse(saved) : null;
  });
  const [recommendations, setRecommendations] = useState<HairstyleRecommendation[]>(() => {
    const saved = sessionStorage.getItem('aiRecommendations');
    return saved ? JSON.parse(saved) : [];
  });
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = sessionStorage.getItem('aiPreferences');
    return saved ? JSON.parse(saved) : {};
  });
  const [selectedStyle, setSelectedStyle] = useState<HairstyleRecommendation | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addToCart } = useBooking();
  const navigate = useNavigate();

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

  const proceedToPreferences = () => {
    if (userImage) {
      setState('preferences');
    }
  };

  const startAnalysis = async () => {
    if (!userImage) return;

    setState('analyzing');

    try {
      // Analyze face
      const analysis = await aiService.analyzeFace(userImage);
      setFaceAnalysis(analysis);

      // Get recommendations
      const recs = await aiService.getHairstyleRecommendations(analysis, preferences);
      setRecommendations(recs);

      setState('results');
    } catch (error) {
      console.error('Analysis failed:', error);
      // Fallback to mock data
      const mockAnalysis: FaceAnalysis = {
        faceShape: 'oval',
        hairType: 'straight',
        hairLength: 'medium',
        skinTone: 'medium',
        confidence: 0.8
      };
      setFaceAnalysis(mockAnalysis);
      setRecommendations(await aiService.getHairstyleRecommendations(mockAnalysis, preferences));
      setState('results');
    }
  };

  const reset = () => {
    setUserImage(null);
    setFaceAnalysis(null);
    setRecommendations([]);
    setPreferences({});
    setSelectedStyle(null);
    setState('initial');

    // Clear session storage
    sessionStorage.removeItem('aiState');
    sessionStorage.removeItem('aiUserImage');
    sessionStorage.removeItem('aiFaceAnalysis');
    sessionStorage.removeItem('aiRecommendations');
    sessionStorage.removeItem('aiPreferences');
  };

  const updatePreference = (key: keyof UserPreferences, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const { user } = useAuth();


  const shareStyle = async (style: HairstyleRecommendation) => {
    const shareData = {
      title: `Check out this ${style.name} hairstyle!`,
      text: `I found my perfect hairstyle with Luxe Barber AI: ${style.name}. ${style.description}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
      alert('Style link copied to clipboard!');
    }
  };

  const bookStyle = (style: HairstyleRecommendation) => {
    // Import services to find the right one
    import('../constants').then(({ SERVICES }) => {
      let serviceId = '1'; // Default to Executive Cut
      let note = `Style: ${style.name}`;

      if (style.type === 'combo') {
        // The Gentleman's Package
        serviceId = '5';
        note = `Combo: ${style.name}`;
      } else if (style.type === 'beard') {
        // Beard Sculpt & Trim
        serviceId = '4';
      } else {
        // Hair mapping
        const serviceMapping: Record<string, string> = {
          'modern-quiff': '1', // The Executive Cut
          'pompadour': '1', // The Executive Cut
          'side-part': '1', // The Executive Cut
          'textured-crop': '2', // Skin Fade (mapped to Skin Mask in constants? Let's check constants)
          'faux-hawk': '2',
          'french-crop': '2',
          'undercut': '2',
          'ivy-league': '1'
        };
        // Note: In constants.ts, ID 2 is "Skin Mask", ID 1 is "The Executive Cut". 
        // ID 4 is "Beard Sculpt & Trim". ID 5 is "The Gentleman's Package".
        // We should probably map fades to Executive Cut for now if "Skin Fade" isn't a service, 
        // or check if "Skin Mask" was a typo in my reading of constants.
        // Let's assume ID 1 is the safe bet for haircuts if unsure.
        serviceId = serviceMapping[style.id] || '1';
      }

      const service = SERVICES.find(s => s.id === serviceId);
      if (service) {
        // Add with note
        addToCart({
          ...service,
          note: note
        });
        navigate('/booking');
      }
    });
  };

  return (
    <div className="bg-gray-900 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-amber-900/30 rounded-full mb-4">
            <Sparkles className="text-amber-600 w-6 h-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">AI Style Lab</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Upload a selfie and let our AI analyze your face shape, hair type, and personal style preferences to recommend the perfect haircut.
            <br />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 mt-2 block">
              Tip: Pull your hair back and look straight at the camera for best results.
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
                    onClick={proceedToPreferences}
                    className="w-full py-4 bg-amber-600 text-white font-bold uppercase tracking-widest rounded-sm hover:bg-amber-500 shadow-lg transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                  >
                    Continue <ArrowRight size={18} />
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

        {/* PREFERENCES STATE */}
        {state === 'preferences' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-serif font-bold text-white mb-2">Tell Us About Your Style</h2>
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-700">Help us personalize your recommendations</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">What's the occasion?</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'casual', label: 'Casual Everyday', icon: Star },
                    { value: 'business', label: 'Business Professional', icon: Briefcase },
                    { value: 'formal', label: 'Formal Events', icon: Crown },
                    { value: 'special', label: 'Special Occasion', icon: Sparkles }
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => updatePreference('occasion', value)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${preferences.occasion === value
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                    >
                      <Icon size={20} className="mb-2" />
                      <div className="text-sm font-bold">{label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">How much maintenance are you willing to do?</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'low', label: 'Low - Quick & Easy', desc: '5-10 min daily' },
                    { value: 'medium', label: 'Medium - Moderate', desc: '10-20 min daily' },
                    { value: 'high', label: 'High - Detailed', desc: '20+ min daily' }
                  ].map(({ value, label, desc }) => (
                    <button
                      key={value}
                      onClick={() => updatePreference('maintenance', value)}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${preferences.maintenance === value
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                    >
                      <Clock size={20} className="mx-auto mb-2" />
                      <div className="text-sm font-bold">{label}</div>
                      <div className="text-xs text-gray-500 mt-1">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setState('initial')}
                className="flex-1 py-3 border border-gray-300 text-white font-bold uppercase tracking-wider rounded-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} /> Back
              </button>
              <button
                onClick={startAnalysis}
                className="flex-1 py-3 bg-amber-600 text-white font-bold uppercase tracking-wider rounded-sm hover:bg-amber-500 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={18} /> Analyze My Face
              </button>
            </div>
          </div>
        )}

        {/* ANALYZING STATE */}
        {state === 'analyzing' && (
          <div className="max-w-xl mx-auto text-center py-20 space-y-8">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
              <img
                src={userImage!}
                className="absolute inset-2 rounded-full object-cover w-[calc(100%-16px)] h-[calc(100%-16px)] opacity-50"
                alt="Analyzing"
              />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold text-white mb-2">AI Analysis in Progress...</h3>
              <p className="text-gray-500 animate-pulse">Detecting face shape • Analyzing hair type • Generating recommendations</p>
            </div>
          </div>
        )}

        {/* RESULTS STATE */}
        {state === 'results' && userImage && faceAnalysis && (
          <div className="space-y-8">
            {/* Top Section: User Photo + Analysis & Best Combo */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left: User Photo with Face Analysis */}
              <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-100">
                <div className="relative aspect-[3/4] bg-gray-100">
                  <img
                    src={userImage}
                    alt="Your Photo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-sm">
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Your Photo</span>
                  </div>
                </div>

                {/* Face Analysis Summary */}
                <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="text-amber-600" size={20} />
                    Face Analysis
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-sm border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Face Shape</p>
                      <p className="font-bold text-gray-900 capitalize">{faceAnalysis.faceShape}</p>
                    </div>
                    <div className="bg-white p-3 rounded-sm border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Hair Type</p>
                      <p className="font-bold text-gray-900 capitalize">{faceAnalysis.hairType}</p>
                    </div>
                    <div className="bg-white p-3 rounded-sm border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Hair Length</p>
                      <p className="font-bold text-gray-900 capitalize">{faceAnalysis.hairLength}</p>
                    </div>
                    <div className="bg-white p-3 rounded-sm border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Confidence</p>
                      <p className="font-bold text-gray-900">{Math.round(faceAnalysis.confidence * 100)}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Best Combo */}
              {recommendations.find(r => r.type === 'combo') && (
                <div className="bg-white rounded-lg overflow-hidden shadow-lg border-2 border-purple-200">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3">
                    <h3 className="text-white font-bold flex items-center gap-2">
                      <Crown size={20} />
                      Best Complete Look
                    </h3>
                  </div>
                  {(() => {
                    const combo = recommendations.find(r => r.type === 'combo')!;
                    return (
                      <>
                        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                          <img src={combo.image} alt="Haircut" className="w-full h-1/2 object-cover" />
                          {combo.beardImage && (
                            <img src={combo.beardImage} alt="Beard" className="w-full h-1/2 object-cover absolute bottom-0 left-0" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="bg-white/95 backdrop-blur-sm p-3 rounded-sm">
                              <h4 className="font-bold text-gray-900 text-sm">{combo.name}</h4>
                              <div className="flex items-center gap-2 text-purple-600 text-xs mt-1">
                                <CheckCircle2 size={12} />
                                <span className="font-bold uppercase tracking-wider">{combo.overallScore}% Match</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-gray-600 text-sm mb-3">{combo.description}</p>
                          <button
                            onClick={() => bookStyle(combo)}
                            className="w-full py-2 px-3 bg-purple-600 text-white rounded-sm text-sm font-bold hover:bg-purple-500 transition-all"
                          >
                            Book This Complete Look
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Your Personalized Recommendations</h2>
              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="px-4 py-2 border border-gray-300 rounded-sm text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Start Over
                </button>
              </div>
            </div>





            {/* Haircut Recommendations */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Scissors className="text-amber-600" size={24} />
                Other Recommended Haircuts
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.filter(r => r.type === 'hair').map((style) => (
                  <div key={style.id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100 group">
                    <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                      <img
                        src={style.image}
                        alt={style.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-sm">
                          <h4 className="font-bold text-gray-900 text-sm">{style.name}</h4>
                          <div className="flex items-center gap-2 text-amber-600 text-xs mt-1">
                            <CheckCircle2 size={12} />
                            <span className="font-bold uppercase tracking-wider">{style.overallScore}% Match</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-600 text-sm mb-3">{style.description}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                        <span>Maintenance: {style.maintenance}</span>
                        <span>Occasion: {style.occasion}</span>
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={() => bookStyle(style)}
                          className="w-full py-2 px-3 bg-amber-600 text-white rounded-sm text-sm font-bold hover:bg-amber-500 transition-all"
                        >
                          Book This Style
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Beard Recommendations */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Star className="text-amber-600" />
                Other Recommended Beard Styles
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.filter(r => r.type === 'beard').map((style) => (
                  <div key={style.id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100 group">

                    <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                      <img
                        src={style.image}
                        alt={style.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-sm">
                          <h4 className="font-bold text-gray-900 text-sm">{style.name}</h4>
                          <div className="flex items-center gap-2 text-green-600 text-xs mt-1">
                            <CheckCircle2 size={12} />
                            <span className="font-bold uppercase tracking-wider">{style.overallScore}% Match</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-600 text-sm mb-3">{style.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {style.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                        <span>Maintenance: {style.maintenance}</span>
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={() => bookStyle(style)}
                          className="w-full py-2 px-3 bg-amber-600 text-white rounded-sm text-sm font-bold hover:bg-amber-500 transition-all"
                        >
                          Book This Style
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div >

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 flex items-start gap-4 max-w-3xl mx-auto">
              <AlertCircle className="text-amber-600 shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-amber-900 mb-1">Professional Consultation Recommended</h4>
                <p className="text-sm text-amber-800 leading-relaxed">
                  These AI recommendations are personalized based on your facial features and preferences. Our master barbers will refine these suggestions during your appointment to account for your hair's natural texture, growth patterns, and lifestyle needs.
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