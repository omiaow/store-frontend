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
                    Название *
                </label>
                <input
                    id="shop-name"
                    className="shop-create-input"
                    placeholder="например, Coffee Corner"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    autoComplete="off"
                />
            </section>

            <section className="shop-create-section">
                <label className="shop-create-label" htmlFor="shop-custom">
                    Короткое название (обязательно)
                </label>
                <div className="shop-create-help">
                    Используется как логин вашего магазина
                </div>
                <input
                    id="shop-custom"
                    className="shop-create-input"
                    placeholder="например, coffee_corner"
                    value={customName}
                    onChange={(e) => onCustomNameChange(e.target.value)}
                    autoComplete="off"
                />
            </section>

            <section className="shop-create-section">
                <label className="shop-create-label" htmlFor="shop-logo">
                    Ссылка на логотип
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
                            alt="предпросмотр логотипа"
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

