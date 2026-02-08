import React from 'react';

export default function LocationSection({ lat, lon, onOpenMap }) {
    return (
        <section className="shop-create-section">
            <div className="shop-create-row">
                <div>
                    <div className="shop-create-label">Локация</div>
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

            <div className="shop-create-coords">
                <div className="shop-create-coord">
                    <span className="shop-create-coordLabel">Широта</span>
                    <span className="shop-create-coordValue">
                        {typeof lat === 'number' ? lat : '—'}
                    </span>
                </div>
                <div className="shop-create-coord">
                    <span className="shop-create-coordLabel">Долгота</span>
                    <span className="shop-create-coordValue">
                        {typeof lon === 'number' ? lon : '—'}
                    </span>
                </div>
            </div>
        </section>
    );
}

