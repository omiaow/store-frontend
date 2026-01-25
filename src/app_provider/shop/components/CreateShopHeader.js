import React from 'react';

export default function CreateShopHeader({
    title = 'Create shop',
    subtitle = 'Fill details and pick location on the map',
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
                        aria-label="Back"
                        title="Back"
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

