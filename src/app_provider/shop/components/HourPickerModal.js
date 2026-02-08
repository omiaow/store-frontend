import React, { useEffect, useRef } from 'react';

export default function HourPickerModal({
    isOpen,
    title,
    hourOptions,
    selectedValue,
    onSelect,
    onClose,
}) {
    const listRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const t = setTimeout(() => {
            const list = listRef.current;
            if (!list) return;
            const selected = list.querySelector('[data-selected="true"]');
            if (selected && typeof selected.scrollIntoView === 'function') {
                selected.scrollIntoView({ block: 'center' });
            }
        }, 0);
        return () => clearTimeout(t);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="shop-create-modalOverlay"
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="shop-create-modalCard">
                <div className="shop-create-modalHeader">
                    <div className="shop-create-modalTitle">{title}</div>
                    <button
                        className="shop-create-modalClose"
                        type="button"
                        onClick={onClose}
                    >
                        Закрыть
                    </button>
                </div>

                <div className="shop-create-modalList" ref={listRef}>
                    {hourOptions.map((t) => {
                        const isSelected = selectedValue === t;
                        return (
                            <button
                                key={`hour-${t}`}
                                type="button"
                                className={[
                                    'shop-create-modalItem',
                                    isSelected ? 'shop-create-modalItemSelected' : '',
                                ].join(' ')}
                                data-selected={isSelected ? 'true' : 'false'}
                                onClick={() => onSelect(t)}
                            >
                                {t}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

