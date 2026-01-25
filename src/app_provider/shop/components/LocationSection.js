import React from 'react';

export default function LocationSection({ lat, lon, onOpenMap }) {
    return (
        <section className="shop-create-section">
            <div className="shop-create-row">
                <div>
                    <div className="shop-create-label">Location</div>
                    <div className="shop-create-help">
                        Tap on the map to set точку (lat/lon)
                    </div>
                </div>
                <button
                    className="shop-create-buttonSecondary"
                    type="button"
                    onClick={onOpenMap}
                >
                    Pick on map
                </button>
            </div>

            <div className="shop-create-coords">
                <div className="shop-create-coord">
                    <span className="shop-create-coordLabel">Lat</span>
                    <span className="shop-create-coordValue">
                        {typeof lat === 'number' ? lat : '—'}
                    </span>
                </div>
                <div className="shop-create-coord">
                    <span className="shop-create-coordLabel">Lon</span>
                    <span className="shop-create-coordValue">
                        {typeof lon === 'number' ? lon : '—'}
                    </span>
                </div>
            </div>
        </section>
    );
}

