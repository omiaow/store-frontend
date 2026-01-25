import React from 'react';

export default function TelegramChannelSection({ tgChannelId, onTgChannelIdChange }) {
    return (
        <section className="shop-create-section">
            <label className="shop-create-label" htmlFor="shop-tg-channel-id">
                Telegram channel id
            </label>
            <div className="shop-create-help">String input: `tgChannelId`</div>
            <input
                id="shop-tg-channel-id"
                className="shop-create-input"
                placeholder="e.g. -1001234567890"
                value={tgChannelId}
                onChange={(e) => onTgChannelIdChange(e.target.value)}
                autoComplete="off"
            />
        </section>
    );
}

