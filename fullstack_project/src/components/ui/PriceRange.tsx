
type Props = {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  step?: number;
  onChange: (nextMin: number, nextMax: number) => void;
  accent?: string; // color for active segment + thumb border
};

export default function PriceRange({
  min,
  max,
  valueMin,
  valueMax,
  step = 10,
  onChange,
  accent = "#E6B100", // gold
}: Props) {
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const pct = (v: number) => ((v - min) / (max - min || 1)) * 100;

  const onMin = (raw: number) => onChange(clamp(raw, min, valueMax), valueMax);
  const onMax = (raw: number) => onChange(valueMin, clamp(raw, valueMin, max));

  return (
    <div>
      {/* Slider */}
      <div className="relative h-8 select-none">
        {/* base track */}
        <div
          className="absolute left-0 right-0 top-1/2 h-[4px] -translate-y-1/2 rounded-full"
          style={{ backgroundColor: "#2f2f2f" }}
        />

        {/* active range: continuous yellow bar between thumbs using scaleX to avoid rounding gaps */}
        <div
          aria-hidden
          className="absolute top-1/2 h-[4px] rounded-full pointer-events-none origin-left"
          style={{
            left: `${pct(valueMin)}%`,
            transform: `translateY(-50%) scaleX(${Math.max(
              0.001,
              (pct(valueMax) - pct(valueMin)) / 100
            )})`,
            backgroundColor: accent,
            width: "100%",
          }}
        />

        {/* collapsed indicator when min==max */}
        {valueMax === valueMin && (
          <div
            aria-hidden
            className="absolute top-1/2 h-[4px] -translate-y-1/2 rounded-full pointer-events-none"
            style={{
              left: `calc(${pct(valueMin)}% - 6px)`,
              width: "12px",
              backgroundColor: accent,
            }}
          />
        )}

        {/* MIN slider: left half */}
        <input
          aria-label="Minimum price"
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={(e) => onMin(Number(e.target.value))}
          className="absolute top-0 bottom-0 left-0 bg-transparent appearance-none"
          style={{ width: "calc(50% + 14px)", zIndex: 2 }}
        />
        {/* MAX slider: right half (higher z) */}
        <input
          aria-label="Maximum price"
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={(e) => onMax(Number(e.target.value))}
          className="absolute top-0 bottom-0 right-0 bg-transparent appearance-none"
          style={{ width: "calc(50% + 14px)", zIndex: 3 }}
        />

        {/* thumbs and tracks */}
        <style>{`
          input[type="range"] {
            -webkit-appearance: none;
            appearance: none;
            height: 32px;
            pointer-events: auto;
          }
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 22px; height: 22px;
            background: white;
            border-radius: 9999px;
            border: 3px solid ${accent};
            cursor: pointer;
            margin-top: -9px; /* center on 4px track */
            box-shadow: 0 0 0 2px white inset, 0 0 0 1px rgba(0,0,0,.04);
          }
          input[type="range"]::-moz-range-thumb {
            width: 22px; height: 22px;
            background: white;
            border-radius: 9999px;
            border: 3px solid ${accent};
            cursor: pointer;
            box-shadow: 0 0 0 1px rgba(0,0,0,.04);
          }
          input[type="range"]::-webkit-slider-runnable-track {
            background: transparent;
            height: 4px;
          }
          input[type="range"]::-moz-range-track {
            background: transparent;
            height: 4px;
          }
        `}</style>
      </div>

      {/* Min/Max inputs */}
      <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-zinc-700 mb-1">Minimum</div>
          <input
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="₹349"
            inputMode="numeric"
            value={valueMin}
            onChange={(e) => onMin(Number(e.target.value || min))}
          />
        </div>
        <div>
          <div className="text-sm text-zinc-700 mb-1">Maximum</div>
          <input
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="₹4999"
            inputMode="numeric"
            value={valueMax}
            onChange={(e) => onMax(Number(e.target.value || max))}
          />
        </div>
      </div>
    </div>
  );
}
