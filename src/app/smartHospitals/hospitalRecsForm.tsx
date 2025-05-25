'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [searchRadius, setSearchRadius] = useState(25);
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
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-primary">
            <Search className="h-7 w-7" /> Hospital Search & Recommendations
          </CardTitle>
          <CardDescription>
            Search for hospitals based on your medical conditions or symptoms. We'll use real-time web search to find the most relevant options near you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="diagnosedConditions" className="block text-sm font-medium text-foreground mb-1">
                  Diagnosed Condition(s)
                </label>
                <Textarea
                  id="diagnosedConditions"
                  value={diagnosedConditions}
                  onChange={(e) => setDiagnosedConditions(e.target.value)}
                  placeholder="e.g., Pneumonia, Cardiac Arrhythmia, Diabetes"
                  className="min-h-[80px]"
                  disabled={isLoading || isGettingLocation}
                />
              </div>
              
              <div>
                <label htmlFor="symptoms" className="block text-sm font-medium text-foreground mb-1">
                  Symptoms (if no diagnosis)
                </label>
                <Textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g., Chest pain, Shortness of breath, High fever"
                  className="min-h-[80px]"
                  disabled={isLoading || isGettingLocation}
                />
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Separate multiple items with commas. You can enter conditions, symptoms, or both.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-foreground">
                  Your Location (Optional but Recommended)
                </label>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleGetLocation} 
                  disabled={isLoading || isGettingLocation}
                  className="w-full"
                >
                  {isGettingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LocateFixed className="mr-2 h-4 w-4" />}
                  {userLatitude && userLongitude ? 'Update My Location' : 'Get My Current Location'}
                </Button>
                {userLatitude && userLongitude && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Location: {userLatitude.toFixed(4)}, {userLongitude.toFixed(4)}
                    </p>
                    <div>
                      <label htmlFor="searchRadius" className="block text-xs font-medium text-foreground mb-1">
                        Search Radius (km)
                      </label>
                      <Input
                        id="searchRadius"
                        type="number"
                        min="1"
                        max="100"
                        value={searchRadius}
                        onChange={(e) => setSearchRadius(parseInt(e.target.value) || 25)}
                        className="w-20"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}
                {locationError && <p className="text-xs text-destructive">{locationError}</p>}
              </div>
              
              <div className="space-y-4">
                <label className="block text-sm font-medium text-foreground">
                  Search Preferences
                </label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="preferGovernment"
                    checked={preferGovernment}
                    onCheckedChange={(checked) => setPreferGovernment(checked === true)}
                    disabled={isLoading}
                  />
                  <label htmlFor="preferGovernment" className="text-sm text-foreground">
                    Prefer government/public hospitals
                  </label>
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading || isGettingLocation} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Searching Hospitals...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" /> Search Hospital Recommendations
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="shadow-md">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Search Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {result && (
        <Card className="shadow-xl mt-8 animate-in fade-in duration-500">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2 text-primary">
              <ListChecks className="h-7 w-7" /> Search Results
            </CardTitle>
            <CardDescription>{result.recommendationIntro}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {googleMapsApiKey && result.hospitals && result.hospitals.some(h => h.coordinates) && (
              <div className="my-6 rounded-lg overflow-hidden shadow-md">
                <LoadScriptNext googleMapsApiKey={googleMapsApiKey} loadingElement={<div className="text-center p-4">Loading Map...</div>}>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={userLatitude && userLongitude ? 10 : 4} // Zoom in more if user location is available
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
                          scale: 8,
                          fillColor: '#4285F4',
                          fillOpacity: 1,
                          strokeColor: '#ffffff',
                          strokeWeight: 2,
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
                    
                    {/* Hospital markers (red/default) */}
                    {result.hospitals.map((hospital, index) =>
                      hospital.coordinates ? (
                        <MarkerF
                          key={`hospital-${index}`}
                          position={hospital.coordinates}
                          onClick={() => setSelectedHospital(hospital)}
                          title={hospital.hospitalName}
                          icon={{
                            path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                            scale: 6,
                            fillColor: '#EA4335',
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
                        <div className="p-2 max-w-xs">
                          <h4 className="font-bold text-sm text-primary">{selectedHospital.hospitalName}</h4>
                          {selectedHospital.hospitalName === "Your Current Location" ? (
                            <div>
                              <p className="text-xs text-blue-600 font-medium">📍 Your GPS Location</p>
                              <p className="text-xs text-muted-foreground mt-1">{selectedHospital.address}</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-xs text-muted-foreground">{selectedHospital.address || "Address not available"}</p>
                              <p className="text-xs mt-1">{selectedHospital.specializationFocus}</p>
                              {selectedHospital.contact && (
                                <p className="text-xs mt-1 font-medium">{selectedHospital.contact}</p>
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
              <Alert variant="default" className="bg-accent">
                <MapPin className="h-5 w-5 text-primary" />
                <AlertTitle>Map Display Available</AlertTitle>
                <AlertDescription>
                  To see hospitals on a map, set up your Google Maps API key in `.env.local` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
                </AlertDescription>
              </Alert>
            )}

            {result.hospitals && result.hospitals.length > 0 ? (
              result.hospitals.map((hospital, index) => (
                <Card 
                  key={index} 
                  className="bg-background shadow-lg border-primary/20 hover:shadow-primary/20 transition-shadow cursor-pointer" 
                  onClick={() => hospital.coordinates && setSelectedHospital(hospital)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg text-primary">{hospital.hospitalName}</CardTitle>
                    <CardDescription className="font-medium">{hospital.specializationFocus}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="font-semibold text-foreground text-sm">Why recommended:</span>
                      <p className="text-sm text-muted-foreground mt-1">{hospital.simulatedRankingReason}</p>
                    </div>
                    
                    {hospital.address && (
                      <div>
                        <span className="font-semibold text-foreground text-sm">Address:</span>
                        <p className="text-sm text-muted-foreground">{hospital.address}</p>
                      </div>
                    )}
                    
                    {hospital.contact && (
                      <div>
                        <span className="font-semibold text-foreground text-sm">Contact:</span>
                        <p className="text-sm text-muted-foreground">{hospital.contact}</p>
                      </div>
                    )}

                    {hospital.coordinates && (
                      <p className="text-xs text-blue-600 mt-2">📍 Click to view on map</p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>No Specific Hospitals Found</AlertTitle>
                <AlertDescription>
                  The search didn't return specific hospital recommendations. Try adjusting your search terms or location settings.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-start text-xs text-muted-foreground space-y-2 pt-4 border-t">
            <div className="font-semibold text-amber-700 bg-amber-50 p-3 rounded-md w-full">
              ⚠️ Important Medical Disclaimer
            </div>
            <p className="text-sm leading-relaxed">{result.disclaimer}</p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}