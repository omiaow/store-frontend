import React, { useMemo, useRef, useState } from 'react';
import useHttp from '../../hooks/http.hook';

export default function ImageUploadField({
    label,
    help,
    value,
    onChange,
    onUploadLoadingChange,
    uploadPath = '/images',
    fieldName = 'image',
    accept = 'image/*',
    maxSizeMb = 10,
}) {
    const inputRef = useRef(null);
    const { loading, requestWithMeta } = useHttp();
    const [error, setError] = useState(null);

    const url = String(value ?? '').trim();

    const maxBytes = useMemo(() => maxSizeMb * 1024 * 1024, [maxSizeMb]);

    React.useEffect(() => {
        onUploadLoadingChange?.(loading);
        return () => {
            onUploadLoadingChange?.(false);
        };
    }, [loading, onUploadLoadingChange]);

    async function uploadFile(file) {
        setError(null);

        if (!file) return;
        if (!String(file.type || '').startsWith('image/')) {
            setError('Можно загрузить только изображение');
            return;
        }
        if (file.size > maxBytes) {
            setError(`Файл слишком большой (макс. ${maxSizeMb}MB)`);
            return;
        }

        const form = new FormData();
        form.append(fieldName, file);

        try {
            const res = await requestWithMeta(uploadPath, 'POST', form);
            if (!res?.ok) {
                setError(res?.data?.error || res?.data?.message || 'Не удалось загрузить изображение');
                return;
            }

            const nextUrl = res?.data?.url;
            if (!nextUrl) {
                setError('Сервер не вернул url изображения');
                return;
            }
            onChange(nextUrl);
        } catch (e) {
            setError(e?.message || 'Не удалось загрузить изображение');
        } finally {
            // allow re-selecting the same file
            if (inputRef.current) inputRef.current.value = '';
        }
    }

    return (
        <section className="shop-create-section">
            <label className="shop-create-label">{label}</label>
            {/* {help ? <div className="shop-create-help">{help}</div> : null} */}

            <div className="shop-create-uploadInline">
                <input
                    ref={inputRef}
                    className="shop-create-fileInputHidden"
                    type="file"
                    accept={accept}
                    onChange={(e) => {
                        const file = e.target.files && e.target.files[0];
                        uploadFile(file);
                    }}
                    disabled={loading}
                />

                <button
                    type="button"
                    className="shop-create-buttonSecondary shop-create-uploadButton"
                    onClick={() => inputRef.current?.click?.()}
                    disabled={loading}
                >
                    {loading ? 'Загрузка…' : 'Загрузить'}
                </button>

                {loading || url ? (
                    <div className="shop-create-uploadThumbBox" aria-label="upload-preview">
                        {loading ? (
                            <div className="shop-create-uploadSpinner" aria-hidden="true" />
                        ) : (
                            <img
                                className="shop-create-uploadThumb"
                                src={url}
                                alt="изображение"
                            />
                        )}
                    </div>
                ) : null}
            </div>

            {error ? (
                <div className="shop-create-help shop-create-helpStoreSettings shop-create-uploadError">
                    {error}
                </div>
            ) : null}
        </section>
    );
}

