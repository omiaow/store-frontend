import React from 'react';

export default function ScheduleSection({
    schedule,
    dayLabels,
    onToggleDay,
    onPickTime,
}) {
    return (
        <section className="shop-create-section">
            <div className="shop-create-label">Schedule</div>
            <div className="shop-create-help">
                Format: {`[{ day: 1, open: "09:00", close: "17:00" }, ...]`}
            </div>

            <div className="shop-create-schedule">
                {schedule.map((s) => (
                    <div
                        className={[
                            'shop-create-scheduleRow',
                            s.enabled ? '' : 'shop-create-scheduleRowDisabled',
                        ].join(' ')}
                        key={s.day}
                    >
                        <label className="shop-create-dayPick">
                            <input
                                className="shop-create-dayCheckbox"
                                type="checkbox"
                                checked={!!s.enabled}
                                onChange={(e) => onToggleDay(s.day, e.target.checked)}
                            />
                            <span className="shop-create-dayText">
                                {dayLabels[s.day]}{' '}
                                <span className="shop-create-dayNum">({s.day})</span>
                            </span>
                        </label>

                        <button
                            className="shop-create-timeButton"
                            type="button"
                            disabled={!s.enabled}
                            onClick={() => onPickTime(s.day, 'open')}
                        >
                            {s.open}
                        </button>

                        <div className="shop-create-timeDash">—</div>

                        <button
                            className="shop-create-timeButton"
                            type="button"
                            disabled={!s.enabled}
                            onClick={() => onPickTime(s.day, 'close')}
                        >
                            {s.close}
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}

