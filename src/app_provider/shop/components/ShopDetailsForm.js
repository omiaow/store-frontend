import React, { useEffect, useState } from 'react';

export default function ShopDetailsForm({
    name,
    onNameChange,
    customName,
    onCustomNameChange,
    logoUrl,
    onLogoUrlChange,
}) {
    const [isPreviewVisible, setIsPreviewVisible] = useState(true);

    useEffect(() => {
        setIsPreviewVisible(true);
    }, [logoUrl]);

    return (
        <>
            <section className="shop-create-section">
                <label className="shop-create-label" htmlFor="shop-name">
                    Name *
                </label>
                <input
                    id="shop-name"
                    className="shop-create-input"
                    placeholder="e.g. Coffee Corner"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    autoComplete="off"
                />
            </section>

            <section className="shop-create-section">
                <label className="shop-create-label" htmlFor="shop-custom">
                    Custom name (optional)
                </label>
                <div className="shop-create-help">
                    Used like a username: lowercase, no spaces recommended
                </div>
                <input
                    id="shop-custom"
                    className="shop-create-input"
                    placeholder="e.g. coffee_corner"
                    value={customName}
                    onChange={(e) => onCustomNameChange(e.target.value)}
                    autoComplete="off"
                />
            </section>

            <section className="shop-create-section">
                <label className="shop-create-label" htmlFor="shop-logo">
                    Logo URL
                </label>
                <input
                    id="shop-logo"
                    className="shop-create-input"
                    placeholder="https://..."
                    value={logoUrl}
                    onChange={(e) => onLogoUrlChange(e.target.value)}
                    autoComplete="off"
                    inputMode="url"
                />
                {logoUrl.trim() ? (
                    <div className="shop-create-logoPreviewWrap">
                        <img
                            className={
                                isPreviewVisible
                                    ? 'shop-create-logoPreview'
                                    : 'shop-create-logoPreview shop-create-logoPreviewHidden'
                            }
                            src={logoUrl}
                            alt="logo preview"
                            onError={(e) => {
                                setIsPreviewVisible(false);
                            }}
                            onLoad={(e) => {
                                setIsPreviewVisible(true);
                            }}
                        />
                    </div>
                ) : null}
            </section>
        </>
    );
}

