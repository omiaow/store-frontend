import React from 'react';
import ImageUploadField from '../../components/ImageUploadField';

export default function ShopDetailsForm({
    name,
    onNameChange,
    customName,
    onCustomNameChange,
    logoUrl,
    onLogoUrlChange,
    onLogoUploadLoadingChange,
}) {
    return (
        <>
            <section className="shop-create-section">
                <label className="shop-create-label" htmlFor="shop-name">
                    Название *
                </label>
                <input
                    id="shop-name"
                    className="shop-create-input"
                    placeholder="например, Макаронная"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    autoComplete="off"
                />
            </section>

            <section className="shop-create-section">
                <label className="shop-create-label" htmlFor="shop-custom">
                    Логин (обязательно)
                </label>
                <div className="shop-create-help">
                    На английском, без пробелов
                </div>
                <input
                    id="shop-custom"
                    className="shop-create-input"
                    placeholder="например, macaronnaya"
                    value={customName}
                    onChange={(e) => onCustomNameChange(e.target.value)}
                    autoComplete="off"
                />
            </section>

            <ImageUploadField
                label="Логотип"
                help="Выберите изображение — ссылка подставится автоматически"
                value={logoUrl}
                onChange={onLogoUrlChange}
                onUploadLoadingChange={onLogoUploadLoadingChange}
            />
        </>
    );
}

