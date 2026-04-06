'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { AlertCircle, LocateFixed, MapPin, Search } from 'lucide-react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { buildApiUrl } from '@/lib/backend-url';

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
  disclaimer?: string;
}

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];

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
  const [selectedHospital, setSelectedHospital] = useState<HospitalRecommendation | null>(null);

  const mapCenter = useMemo<[number, number]>(() => {
    const firstWithCoords = result?.hospitals.find((hospital) => hospital.coordinates);
    if (firstWithCoords?.coordinates) {
      return [firstWithCoords.coordinates.lat, firstWithCoords.coordinates.lng];
    }
    if (userLatitude !== null && userLongitude !== null) {
      return [userLatitude, userLongitude];
    }
    return DEFAULT_CENTER;
  }, [result, userLatitude, userLongitude]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLatitude(position.coords.latitude);
        setUserLongitude(position.coords.longitude);
        setIsGettingLocation(false);
      },
      (positionError) => {
        setLocationError(positionError.message);
        setIsGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const conditionsArray = diagnosedConditions.split(',').map((item) => item.trim()).filter(Boolean);
    const symptomsArray = symptoms.split(',').map((item) => item.trim()).filter(Boolean);

    if (!conditionsArray.length && !symptomsArray.length) {
      setError('Enter either a known diagnosis or a symptom list before searching.');
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
        ...(userLatitude !== null && userLongitude !== null && { userLatitude, userLongitude, searchRadiusKm: searchRadius }),
        preferGovernmentHospitals: preferGovernment,
      };

      const response = await fetch(buildApiUrl('/api/recommendHospital'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || `Request failed with status ${response.status}`);
      }

      setResult(payload);
    } catch (caught) {
      const err = caught as Error;
      setError(err.message || 'Unable to search hospitals.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
        <form onSubmit={handleSubmit} className="soft-panel p-6 sm:p-8">
          <div className="grid gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Search brief</p>
              <h2 className="mt-2 text-3xl text-foreground">Describe the condition and anchor the search with location</h2>
            </div>
            <Textarea value={diagnosedConditions} onChange={(event) => setDiagnosedConditions(event.target.value)} placeholder="Diagnosed conditions, comma separated" className="min-h-28 rounded-[24px] bg-background/70" disabled={isLoading} />
            <Textarea value={symptoms} onChange={(event) => setSymptoms(event.target.value)} placeholder="Symptoms if there is no diagnosis yet" className="min-h-28 rounded-[24px] bg-background/70" disabled={isLoading} />
            <div className="grid gap-4 rounded-[24px] border border-border/70 bg-background/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Location</p>
                  <p className="text-sm text-muted-foreground">Recommended for precise ranking and map positioning.</p>
                </div>
                <Button type="button" variant="outline" className="rounded-full" onClick={handleGetLocation} disabled={isLoading || isGettingLocation}>
                  <LocateFixed className="mr-2 h-4 w-4" />
                  {isGettingLocation ? 'Locating...' : 'Use current location'}
                </Button>
              </div>
              {userLatitude !== null && userLongitude !== null && (
                <p className="text-sm text-muted-foreground">Location set: {userLatitude.toFixed(4)}, {userLongitude.toFixed(4)}</p>
              )}
              {locationError && <p className="text-sm text-destructive">{locationError}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-[160px_1fr] sm:items-center">
              <Input type="number" min="1" max="200" value={searchRadius} onChange={(event) => setSearchRadius(Number.parseInt(event.target.value, 10) || 25)} disabled={isLoading} />
              <div className="flex items-center gap-3 rounded-full border border-border/70 bg-secondary/70 px-4 py-3 text-sm text-muted-foreground">
                <Checkbox id="preferGovernment" checked={preferGovernment} onCheckedChange={(checked) => setPreferGovernment(checked === true)} disabled={isLoading} />
                <label htmlFor="preferGovernment">Prefer government/public hospitals</label>
              </div>
            </div>
            <Button type="submit" className="rounded-full px-6 py-6 text-base" disabled={isLoading || isGettingLocation}>
              {isLoading ? 'Searching hospitals...' : 'Search hospitals'}
            </Button>
          </div>
        </form>

        <section className="soft-panel overflow-hidden">
          <div className="border-b border-border/70 px-6 py-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Map</p>
            <h2 className="mt-2 text-3xl text-foreground">Nearby facilities on OpenStreetMap</h2>
          </div>
          <div className="h-[520px] overflow-hidden">
            <MapContainer center={mapCenter} zoom={userLatitude !== null && userLongitude !== null ? 11 : 5} style={{ height: '100%', width: '100%' }}>
              <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {userLatitude !== null && userLongitude !== null && (
                <CircleMarker center={[userLatitude, userLongitude]} radius={9} pathOptions={{ color: '#0f766e', fillColor: '#0f766e', fillOpacity: 0.85 }}>
                  <Popup>Your current location</Popup>
                </CircleMarker>
              )}
              {result?.hospitals.map((hospital) =>
                hospital.coordinates ? (
                  <CircleMarker
                    key={`${hospital.hospitalName}-${hospital.coordinates.lat}-${hospital.coordinates.lng}`}
                    center={[hospital.coordinates.lat, hospital.coordinates.lng]}
                    radius={8}
                    pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.9 }}
                    eventHandlers={{ click: () => setSelectedHospital(hospital) }}
                  >
                    <Popup>
                      <p className="font-semibold">{hospital.hospitalName}</p>
                      <p className="text-xs">{hospital.address || 'Address unavailable'}</p>
                    </Popup>
                  </CircleMarker>
                ) : null
              )}
            </MapContainer>
          </div>
        </section>
      </section>

      {error && (
        <Alert variant="destructive" className="rounded-[24px]">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Hospital search failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <section className="grid gap-4 lg:grid-cols-[0.6fr_1.4fr]">
          <article className="soft-panel p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Search summary</p>
            <p className="mt-3 text-sm leading-7 text-foreground/90">{result.recommendationIntro}</p>
            {selectedHospital && (
              <div className="mt-5 rounded-[24px] border border-border/70 bg-background/70 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Selected hospital</p>
                <p className="mt-2 text-xl text-foreground">{selectedHospital.hospitalName}</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{selectedHospital.specializationFocus}</p>
                {selectedHospital.address && <p className="mt-2 text-sm leading-7 text-foreground/90">{selectedHospital.address}</p>}
              </div>
            )}
            {result.disclaimer && <p className="mt-5 text-sm leading-7 text-muted-foreground">{result.disclaimer}</p>}
          </article>

          <div className="grid gap-4">
            {result.hospitals.length > 0 ? (
              result.hospitals.map((hospital) => (
                <button key={`${hospital.hospitalName}-${hospital.address}`} type="button" onClick={() => setSelectedHospital(hospital)} className="soft-panel p-6 text-left transition-transform duration-200 hover:-translate-y-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl text-foreground">{hospital.hospitalName}</h3>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{hospital.specializationFocus}</p>
                    </div>
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-foreground/90">{hospital.simulatedRankingReason}</p>
                  {hospital.address && (
                    <p className="mt-4 flex items-start gap-2 text-sm leading-7 text-muted-foreground">
                      <MapPin className="mt-1 h-4 w-4" />
                      <span>{hospital.address}</span>
                    </p>
                  )}
                  {hospital.contact && <p className="mt-2 text-sm leading-7 text-muted-foreground">Contact: {hospital.contact}</p>}
                </button>
              ))
            ) : (
              <div className="soft-panel p-6">
                <p className="text-sm leading-7 text-muted-foreground">No hospitals were returned for this query. Try changing the radius, adding location, or simplifying the symptom list.</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
