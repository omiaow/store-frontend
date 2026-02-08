import React from 'react';

export default function CreateShopHeader({
    title = 'Создать магазин',
    subtitle = 'Заполните данные и выберите локацию на карте',
    onBack,
}) {
    return (
        <header className="shop-create-header">
            <div className="shop-create-headerRow">
                {typeof onBack === 'function' ? (
                    <button
                        type="button"
                        className="shop-create-headerBack"
                        onClick={onBack}
                        aria-label="Назад"
                        title="Назад"
                    >
                        ←
                    </button>
                ) : null}

                <div className="shop-create-headerText">
                    <div className="shop-create-title">{title}</div>
                    <div className="shop-create-subtitle">{subtitle}</div>
                </div>
            </div>
        </header>
    );
}

