import React, { useEffect, useMemo, useRef, useState } from 'react';

export default function HourPickerModal({
    isOpen,
    title,
    hourOptions,
    selectedFrom,
    selectedTo,
    onSave,
    onClose,
}) {
    const fromListRef = useRef(null);
    const toListRef = useRef(null);
    // Important: key by contents (not array reference) to avoid effect/state reset loops.
    const optionsKey = useMemo(
        () => (Array.isArray(hourOptions) ? hourOptions.join('|') : ''),
        [hourOptions]
    );
    const options = useMemo(() => (optionsKey ? optionsKey.split('|') : []), [optionsKey]);
    const maxFromIdx = Math.max(0, options.length - 2); // can't pick last as "from"
    const maxToIdx = Math.max(0, options.length - 1);

    const [fromIdx, setFromIdx] = useState(0);
    const [toIdx, setToIdx] = useState(1);

    useEffect(() => {
        if (!isOpen) return;
        if (options.length < 2) return;

        let nextFrom = Math.max(0, options.indexOf(selectedFrom));
        let nextTo = Math.max(0, options.indexOf(selectedTo));

        if (nextFrom === -1) nextFrom = 0;
        if (nextTo === -1) nextTo = 1;

        nextFrom = Math.min(nextFrom, maxFromIdx);
        nextTo = Math.min(nextTo, maxToIdx);

        if (nextFrom >= nextTo) nextTo = Math.min(nextFrom + 1, maxToIdx);
        if (nextFrom >= nextTo) nextFrom = Math.max(0, nextTo - 1);

        setFromIdx(nextFrom);
        setToIdx(nextTo);
    }, [isOpen, selectedFrom, selectedTo, options, maxFromIdx, maxToIdx]);

    useEffect(() => {
        if (!isOpen) return;
        const t = setTimeout(() => {
            const fromList = fromListRef.current;
            const toList = toListRef.current;
            if (fromList) {
                const selectedFromEl = fromList.querySelector('[data-selected="true"]');
                if (selectedFromEl && typeof selectedFromEl.scrollIntoView === 'function') {
                    selectedFromEl.scrollIntoView({ block: 'center' });
                }
            }
            if (toList) {
                const selectedToEl = toList.querySelector('[data-selected="true"]');
                if (selectedToEl && typeof selectedToEl.scrollIntoView === 'function') {
                    selectedToEl.scrollIntoView({ block: 'center' });
                }
            }
        }, 0);
        return () => clearTimeout(t);
    }, [isOpen, fromIdx, toIdx]);

    if (!isOpen) return null;

    if (options.length < 2) {
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
                            aria-label="Закрыть"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <path
                                    d="M6 6l12 12M18 6L6 18"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </button>
                    </div>
                    <div className="shop-create-modalList">
                        <div style={{ padding: 12, textAlign: 'center', opacity: 0.7 }}>
                            Нет доступных часов
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const isSaveDisabled = !(fromIdx < toIdx);

    function pickFrom(nextIdx) {
        const safeFrom = Math.min(nextIdx, maxFromIdx);
        const safeTo = Math.max(toIdx, safeFrom + 1);
        setFromIdx(safeFrom);
        if (safeTo !== toIdx) setToIdx(Math.min(safeTo, maxToIdx));
    }

    function pickTo(nextIdx) {
        const safeTo = Math.min(nextIdx, maxToIdx);
        const safeFrom = Math.min(fromIdx, safeTo - 1);
        setToIdx(safeTo);
        if (safeFrom !== fromIdx) setFromIdx(Math.max(0, safeFrom));
    }

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
                        aria-label="Закрыть"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <path
                                d="M6 6l12 12M18 6L6 18"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>

                <div className="shop-create-modalDual">
                    <div className="shop-create-modalCol">
                        <div className="shop-create-modalColLabel">С</div>
                        <div className="shop-create-modalList" ref={fromListRef}>
                            {options.map((t, idx) => {
                                const isSelected = fromIdx === idx;
                                const isDisabled = idx >= toIdx || idx > maxFromIdx;
                                return (
                                    <button
                                        key={`from-hour-${t}`}
                                        type="button"
                                        className={[
                                            'shop-create-modalItem',
                                            isDisabled ? 'shop-create-modalItemDisabled' : '',
                                            isSelected ? 'shop-create-modalItemSelected' : '',
                                        ].join(' ')}
                                        data-selected={isSelected ? 'true' : 'false'}
                                        disabled={isDisabled}
                                        onClick={() => pickFrom(idx)}
                                    >
                                        {t}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="shop-create-modalCol">
                        <div className="shop-create-modalColLabel">До</div>
                        <div className="shop-create-modalList" ref={toListRef}>
                            {options.map((t, idx) => {
                                const isSelected = toIdx === idx;
                                const isDisabled = idx <= fromIdx;
                                return (
                                    <button
                                        key={`to-hour-${t}`}
                                        type="button"
                                        className={[
                                            'shop-create-modalItem',
                                            isDisabled ? 'shop-create-modalItemDisabled' : '',
                                            isSelected ? 'shop-create-modalItemSelected' : '',
                                        ].join(' ')}
                                        data-selected={isSelected ? 'true' : 'false'}
                                        disabled={isDisabled}
                                        onClick={() => pickTo(idx)}
                                    >
                                        {t}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="shop-create-modalFooter">
                    <button
                        className="shop-create-buttonPrimary shop-create-modalSave"
                        type="button"
                        disabled={isSaveDisabled}
                        onClick={() => onSave({ open: options[fromIdx], close: options[toIdx] })}
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
}

