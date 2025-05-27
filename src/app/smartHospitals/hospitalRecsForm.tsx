'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, AlertCircle, CheckCircle, Sparkles, ListChecks, MapPin, LocateFixed, Search } from 'lucide-react';
import { GoogleMap, LoadScriptNext, MarkerF, InfoWindowF } from '@react-google-maps/api';

// Type definitions based on the API schema
interface HospitalCoordinates {
  lat: number;
  lng: number;
}

interface HospitalRecommendation {
  hospitalName: string;
  specializationFocus: string;
  simulatedRankingReason: string;
  address?: string;
  coordinates?: HospitalCoordinates;
  contact?: string;
}

interface RecommendHospitalsOutput {
  recommendationIntro: string;
  hospitals: HospitalRecommendation[];
  disclaimer: string;
}

interface ApiResponse {
  error?: string;
  recommendations?: RecommendHospitalsOutput;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const initialCenter = {
  lat: 37.0902, 
  lng: -95.7129,
};

export function HospitalRecsForm() {
  const [diagnosedConditions, setDiagnosedConditions] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [searchRadius, setSearchRadius] = useState(0);
  const [preferGovernment, setPreferGovernment] = useState(false);
  
  const [userLatitude, setUserLatitude] = useState<number | null>(null);
  const [userLongitude, setUserLongitude] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecommendHospitalsOutput | null>(null);
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [selectedHospital, setSelectedHospital] = useState<HospitalRecommendation | null>(null);
  
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (result && result.hospitals && result.hospitals.length > 0) {
      const firstHospitalWithCoords = result.hospitals.find(h => h.coordinates);
      if (firstHospitalWithCoords && firstHospitalWithCoords.coordinates) {
        setMapCenter(firstHospitalWithCoords.coordinates);
      } else if (userLatitude && userLongitude) {
        setMapCenter({ lat: userLatitude, lng: userLongitude });
      }
    } else if (userLatitude && userLongitude) {
        setMapCenter({ lat: userLatitude, lng: userLongitude });
    } else {
        setMapCenter(initialCenter);
    }
  }, [result, userLatitude, userLongitude]);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setIsGettingLocation(true);
      setLocationError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLatitude(position.coords.latitude);
          setUserLongitude(position.coords.longitude);
          setIsGettingLocation(false);
          setMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (err) => {
          setLocationError(`Error getting location: ${err.message}. Please ensure location services are enabled.`);
          setIsGettingLocation(false);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const conditionsArray = diagnosedConditions.split(',').map(c => c.trim()).filter(c => c.length > 0);
    const symptomsArray = symptoms.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    if (conditionsArray.length === 0 && symptomsArray.length === 0) {
      setError('Please enter either diagnosed conditions or symptoms.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSelectedHospital(null);

    try {
      const requestBody = {
        ...(conditionsArray.length > 0 && { diagnosedConditions: conditionsArray }),
        ...(symptomsArray.length > 0 && { symptoms: symptomsArray }),
        ...(userLatitude !== null && userLongitude !== null && {
          userLatitude,
          userLongitude,
          searchRadiusKm: searchRadius,
        }),
        preferGovernmentHospitals: preferGovernment,
      };

      const response = await fetch('/api/recommendHospital', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }

    } catch (e: any) {
      setError('An unexpected error occurred: ' + (e.message || 'Please try again.'));
      console.error('Submit error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl flex items-center gap-3">
              <Search className="h-8 w-8" /> Hospital Search & Recommendations
            </CardTitle>
            <CardDescription className="text-indigo-100">
              Search for hospitals based on your medical conditions or symptoms. We'll use real-time web search to find the most relevant options near you.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label htmlFor="diagnosedConditions" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Diagnosed Condition(s)
                  </label>
                  <Textarea
                    id="diagnosedConditions"
                    value={diagnosedConditions}
                    onChange={(e) => setDiagnosedConditions(e.target.value)}
                    placeholder="e.g., Pneumonia, Cardiac Arrhythmia, Diabetes"
                    className="min-h-[100px] border-2 border-indigo-200 focus:border-teal-500 focus:ring-teal-500 rounded-lg shadow-sm"
                    disabled={isLoading || isGettingLocation}
                  />
                </div>
                
                <div className="space-y-3">
                  <label htmlFor="symptoms" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Symptoms (if no diagnosis)
                  </label>
                  <Textarea
                    id="symptoms"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g., Chest pain, Shortness of breath, High fever"
                    className="min-h-[100px] border-2 border-indigo-200 focus:border-teal-500 focus:ring-teal-500 rounded-lg shadow-sm"
                    disabled={isLoading || isGettingLocation}
                  />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-indigo-50 to-teal-50 dark:from-indigo-900/30 dark:to-teal-900/30 p-4 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  💡 Separate multiple items with commas. You can enter conditions, symptoms, or both.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-700">
                  <label className="block text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-teal-600" />
                    Your Location (Optional but Recommended)
                  </label>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleGetLocation} 
                    disabled={isLoading || isGettingLocation}
                    className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white border-0 shadow-lg transition-all duration-300 hover:shadow-xl"
                  >
                    {isGettingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LocateFixed className="mr-2 h-4 w-4" />}
                    {userLatitude && userLongitude ? 'Update My Location' : 'Get My Current Location'}
                  </Button>
                  {userLatitude && userLongitude && (
                    <div className="space-y-3 p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                      <p className="text-sm text-teal-700 dark:text-teal-300 font-medium">
                        📍 Location: {userLatitude.toFixed(4)}, {userLongitude.toFixed(4)}
                      </p>
                      <div>
                        <label htmlFor="searchRadius" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Search Radius (km)
                        </label>
                        <Input
                          id="searchRadius"
                          type="number"
                          min="1"
                          max="1000"
                          value={searchRadius}
                          onChange={(e) => setSearchRadius(parseInt(e.target.value) || 0)}
                          className="w-24 border-2 border-teal-300 focus:border-indigo-500"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}
                  {locationError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{locationError}</p>}
                </div>
                
                <div className="space-y-4 p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-xl border border-indigo-200 dark:border-indigo-700">
                  <label className="block text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    Search Preferences
                  </label>
                  <div className="flex items-center space-x-3 p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <Checkbox
                      id="preferGovernment"
                      checked={preferGovernment}
                      onCheckedChange={(checked) => setPreferGovernment(checked === true)}
                      disabled={isLoading}
                      className="border-2 border-indigo-300 data-[state=checked]:bg-indigo-600"
                    />
                    <label htmlFor="preferGovernment" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Prefer government/public hospitals
                    </label>
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading || isGettingLocation} 
                className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600 hover:from-indigo-700 hover:via-blue-700 hover:to-teal-700 text-white text-xl py-6 rounded-xl shadow-2xl transition-all duration-300 hover:shadow-indigo-500/25 hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" /> Searching Hospitals...
                  </>
                ) : (
                  <>
                    <Search className="mr-3 h-6 w-6" /> Search Hospital Recommendations
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="shadow-lg border-red-200 bg-red-50 dark:bg-red-900/30">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-red-800 dark:text-red-200">Search Error</AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
          </Alert>
        )}
        
        {result && (
          <Card className="shadow-2xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm animate-in fade-in duration-700">
            <CardHeader className="bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-3xl flex items-center gap-3">
                <ListChecks className="h-8 w-8" /> Search Results
              </CardTitle>
              <CardDescription className="text-teal-100">{result.recommendationIntro}</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {googleMapsApiKey && result.hospitals && result.hospitals.some(h => h.coordinates) && (
                <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-gradient-to-r from-indigo-300 to-teal-300">
                  <LoadScriptNext googleMapsApiKey={googleMapsApiKey} loadingElement={<div className="text-center p-8 bg-gradient-to-r from-indigo-100 to-teal-100">Loading Map...</div>}>
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={mapCenter}
                      zoom={userLatitude && userLongitude ? 10 : 4}
                      onLoad={(map) => {
                        // You can interact with the map instance here if needed
                      }}
                    >
                      {/* User location marker (blue dot) */}
                      {userLatitude && userLongitude && (
                        <MarkerF
                          position={{ lat: userLatitude, lng: userLongitude }}
                          title="Your Location"
                          icon={{
                            path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                            scale: 10,
                            fillColor: '#0F766E',
                            fillOpacity: 1,
                            strokeColor: '#ffffff',
                            strokeWeight: 3,
                          }}
                          onClick={() => setSelectedHospital({
                            hospitalName: "Your Current Location",
                            specializationFocus: "User Position",
                            simulatedRankingReason: "This is your current location based on GPS coordinates.",
                            address: `Lat: ${userLatitude.toFixed(4)}, Lng: ${userLongitude.toFixed(4)}`,
                            coordinates: { lat: userLatitude, lng: userLongitude }
                          })}
                        />
                      )}
                      
                      {/* Hospital markers (indigo/blue) */}
                      {result.hospitals.map((hospital, index) =>
                        hospital.coordinates ? (
                          <MarkerF
                            key={`hospital-${index}`}
                            position={hospital.coordinates}
                            onClick={() => setSelectedHospital(hospital)}
                            title={hospital.hospitalName}
                            icon={{
                              path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                              scale: 8,
                              fillColor: '#4F46E5',
                              fillOpacity: 1,
                              strokeColor: '#ffffff',
                              strokeWeight: 2,
                            }}
                          />
                        ) : null
                      )}
                      {selectedHospital && selectedHospital.coordinates && (
                        <InfoWindowF
                          position={selectedHospital.coordinates}
                          onCloseClick={() => setSelectedHospital(null)}
                        >
                          <div className="p-3 max-w-xs">
                            <h4 className="font-bold text-base text-indigo-700">{selectedHospital.hospitalName}</h4>
                            {selectedHospital.hospitalName === "Your Current Location" ? (
                              <div>
                                <p className="text-sm text-teal-600 font-medium">📍 Your GPS Location</p>
                                <p className="text-xs text-slate-600 mt-1">{selectedHospital.address}</p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-sm text-slate-600">{selectedHospital.address || "Address not available"}</p>
                                <p className="text-sm mt-1 text-blue-700">{selectedHospital.specializationFocus}</p>
                                {selectedHospital.contact && (
                                  <p className="text-sm mt-1 font-medium text-indigo-600">{selectedHospital.contact}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </InfoWindowF>
                      )}
                    </GoogleMap>
                  </LoadScriptNext>
                </div>
              )}
              
              {!googleMapsApiKey && result.hospitals && result.hospitals.some(h => h.coordinates) && (
                <Alert variant="default" className="bg-gradient-to-r from-indigo-50 to-teal-50 border-indigo-200">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                  <AlertTitle className="text-indigo-800">Map Display Available</AlertTitle>
                  <AlertDescription className="text-indigo-700">
                    To see hospitals on a map, set up your Google Maps API key in `.env.local` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
                  </AlertDescription>
                </Alert>
              )}

              {result.hospitals && result.hospitals.length > 0 ? (
                <div className="grid gap-6">
                  {result.hospitals.map((hospital, index) => (
                    <Card 
                      key={index} 
                      className="bg-gradient-to-br from-white to-indigo-50 dark:from-slate-800 dark:to-indigo-900/30 shadow-xl border-2 border-indigo-200 dark:border-indigo-700 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 cursor-pointer hover:scale-[1.02]" 
                      onClick={() => hospital.coordinates && setSelectedHospital(hospital)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-600">{hospital.hospitalName}</CardTitle>
                        <CardDescription className="font-semibold text-blue-700 dark:text-blue-300">{hospital.specializationFocus}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                            Why recommended:
                          </span>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{hospital.simulatedRankingReason}</p>
                        </div>
                        
                        {hospital.address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Address:</span>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{hospital.address}</p>
                            </div>
                          </div>
                        )}
                        
                        {hospital.contact && (
                          <div className="flex items-start gap-2">
                            <Sparkles className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Contact:</span>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{hospital.contact}</p>
                            </div>
                          </div>
                        )}

                        {hospital.coordinates && (
                          <div className="flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400 font-medium bg-teal-50 dark:bg-teal-900/30 px-3 py-2 rounded-lg">
                            <MapPin className="h-4 w-4" />
                            Click to view on map
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                  <CheckCircle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800">No Specific Hospitals Found</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    The search didn't return specific hospital recommendations. Try adjusting your search terms or location settings.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}