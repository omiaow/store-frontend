import React from 'react';

export default function LocationSection({ lat, lon, onOpenMap }) {
    const hasLocation = typeof lat === 'number' && typeof lon === 'number';

    return (
        <section className="shop-create-section">
            <div className="shop-create-row">
                <div>
                    <div className="shop-create-label">Локация {hasLocation ? '✅' : '📍'}</div>
                    <div className="shop-create-help">
                        Нажмите точку на карте
                    </div>
                </div>
                <button
                    className="shop-create-buttonSecondary"
                    type="button"
                    onClick={onOpenMap}
                >
                    Выбрать на карте
                </button>
            </div>
        </section>
    );
}

