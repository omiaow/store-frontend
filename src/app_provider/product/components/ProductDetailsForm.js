import React from 'react';
import ImageUploadField from '../../components/ImageUploadField';

export default function ProductDetailsForm({
    name,
    onNameChange,
    imageUrl,
    onImageUrlChange,
    onImageUploadLoadingChange,
    price,
    onPriceChange,
}) {
    return (
        <>
            <section className="shop-create-section">
                <label className="shop-create-label" htmlFor="product-name">
                    Название *
                </label>
                <input
                    id="product-name"
                    className="shop-create-input"
                    placeholder="например, Латте"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    autoComplete="off"
                />
            </section>

            <ImageUploadField
                label="Изображение"
                help="Выберите изображение — ссылка подставится автоматически"
                value={imageUrl}
                onChange={onImageUrlChange}
                onUploadLoadingChange={onImageUploadLoadingChange}
            />

            <section className="shop-create-section">
                <label className="shop-create-label" htmlFor="product-price">
                    Цена *
                </label>
                <input
                    id="product-price"
                    className="shop-create-input"
                    placeholder="например, 199"
                    value={price}
                    onChange={(e) => onPriceChange(e.target.value)}
                    autoComplete="off"
                    inputMode="decimal"
                />
            </section>
        </>
    );
}

