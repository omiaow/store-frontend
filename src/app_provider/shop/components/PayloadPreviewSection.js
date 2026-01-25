import React from 'react';

export default function PayloadPreviewSection({ payloadPreview }) {
    return (
        <section className="shop-create-section">
            <div className="shop-create-label">Preview (state only)</div>
            <pre className="shop-create-pre">{JSON.stringify(payloadPreview, null, 2)}</pre>
        </section>
    );
}

