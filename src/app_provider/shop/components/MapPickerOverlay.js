import React, { useEffect, useRef } from 'react';

function ensureLeafletLoaded() {
    // Load Leaflet via CDN (no npm deps). Safe to call multiple times.
    if (window.L) return Promise.resolve(window.L);

    const existingScript = document.querySelector('script[data-leaflet="true"]');
    if (existingScript) {
        return new Promise((resolve, reject) => {
            existingScript.addEventListener('load', () => resolve(window.L));
            existingScript.addEventListener('error', reject);
        });
    }

    if (!document.querySelector('link[data-leaflet="true"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.setAttribute('data-leaflet', 'true');
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.defer = true;
        script.setAttribute('data-leaflet', 'true');
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.onload = () => resolve(window.L);
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

export default function MapPickerOverlay({
    isOpen,
    lat,
    lon,
    setLat,
    setLon,
    onClose,
}) {
    const mapElRef = useRef(null);
    const leafletMapRef = useRef(null);
    const leafletMarkerRef = useRef(null);

    useEffect(() => {
        let cancelled = false;

        async function initMap() {
            if (!isOpen) return;
            if (!mapElRef.current) return;

            const L = await ensureLeafletLoaded();
            if (cancelled) return;

            // In React strict mode effects can run twice; guard against double init.
            if (leafletMapRef.current) return;

            const initialLat = typeof lat === 'number' ? lat : 43.2389; // Almaty-ish fallback
            const initialLon = typeof lon === 'number' ? lon : 76.8897;

            const map = L.map(mapElRef.current, {
                zoomControl: false,
                attributionControl: false,
            }).setView([initialLat, initialLon], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(map);

            // Add a marker if we already have coordinates.
            if (typeof lat === 'number' && typeof lon === 'number') {
                leafletMarkerRef.current = L.marker([lat, lon]).addTo(map);
            }

            map.on('click', (e) => {
                const nextLat = Number(e.latlng.lat.toFixed(6));
                const nextLon = Number(e.latlng.lng.toFixed(6));

                setLat(nextLat);
                setLon(nextLon);

                if (leafletMarkerRef.current) {
                    leafletMarkerRef.current.setLatLng([nextLat, nextLon]);
                } else {
                    leafletMarkerRef.current = L.marker([nextLat, nextLon]).addTo(map);
                }
            });

            leafletMapRef.current = map;
            setTimeout(() => map.invalidateSize(), 0);
        }

        initMap();

        return () => {
            cancelled = true;
            if (leafletMapRef.current) {
                leafletMapRef.current.remove();
                leafletMapRef.current = null;
            }
            leafletMarkerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    function useMyLocation() {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const nextLat = Number(pos.coords.latitude.toFixed(6));
                const nextLon = Number(pos.coords.longitude.toFixed(6));
                setLat(nextLat);
                setLon(nextLon);

                const map = leafletMapRef.current;
                const L = window.L;
                if (map && L) {
                    map.setView([nextLat, nextLon], 16);
                    if (leafletMarkerRef.current) {
                        leafletMarkerRef.current.setLatLng([nextLat, nextLon]);
                    } else {
                        leafletMarkerRef.current = L.marker([nextLat, nextLon]).addTo(map);
                    }
                }
            },
            () => {
                // ignore for now (state-only UI)
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    }

    if (!isOpen) return null;

    const hasPoint = typeof lat === 'number' && typeof lon === 'number';

    return (
        <div className="shop-create-mapOverlay" role="dialog" aria-modal="true">
            <div className="shop-create-mapWrap">
                <div ref={mapElRef} className="shop-create-map" />

                <div className="shop-create-mapControls" aria-hidden="false">
                    <button
                        className="shop-create-mapFab shop-create-mapFabBack"
                        type="button"
                        onClick={onClose}
                        aria-label="Назад"
                        title="Назад"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <path
                                d="M15 18l-6-6 6-6"
                                stroke="currentColor"
                                strokeWidth="2.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>

                    <button
                        className="shop-create-mapFab shop-create-mapFabMyLoc"
                        type="button"
                        onClick={useMyLocation}
                        aria-label="Моё местоположение"
                        title="Моё местоположение"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <path
                                d="M12 2v3m0 14v3M2 12h3m14 0h3"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                            />
                            <circle
                                cx="12"
                                cy="12"
                                r="6.5"
                                stroke="currentColor"
                                strokeWidth="2.2"
                            />
                            <circle cx="12" cy="12" r="1.2" fill="currentColor" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="shop-create-mapBottom">
                <div className="shop-create-mapCoords">
                    {hasPoint ? `${lat}, ${lon}` : 'Точка не выбрана'}
                </div>
                <button
                    className="shop-create-buttonPrimary"
                    type="button"
                    disabled={!hasPoint}
                    onClick={onClose}
                >
                    Использовать эту локацию
                </button>
            </div>
        </div>
    );
}

