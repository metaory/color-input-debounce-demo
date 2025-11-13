import { useState, useEffect, useRef, useMemo } from 'react'
import './App.css'
import { convertColor } from './utils/color.js'

function useDebounce(callback, delay) {
  const timeoutRef = useRef(null)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useMemo(() => (value) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(value)
    }, delay)
  }, [delay])
}

function ColorInput({ label, value, onChange, debounced = false, debounceDelay = 300 }) {
  const [localValue, setLocalValue] = useState(value)
  const [updateCount, setUpdateCount] = useState(0)
  const debouncedOnChange = useDebounce((val) => {
    onChange(val)
    setUpdateCount(c => c + 1)
  }, debounceDelay)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const { rgb, hsl, lch, palette, variations, contrasts } = useMemo(() => convertColor(localValue), [localValue])

  const handleChange = (e) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    
    if (debounced) {
      debouncedOnChange(newValue)
    } else {
      onChange(newValue)
      setUpdateCount(c => c + 1)
    }
  }

  return (
    <div className="color-input-section">
      <h2>{label}</h2>
      <div className="update-count">Updates: {updateCount}</div>
      <div className="color-input-wrapper">
        <input
          type="color"
          value={localValue}
          onChange={handleChange}
          className="color-input"
        />
        <div
          className="color-preview"
          style={{ backgroundColor: localValue }}
        />
        <div className="color-value">{localValue.toUpperCase()}</div>
        <div className="color-conversions">
          <div className="conversion-item">
            <span className="conversion-label">RGB:</span>
            <span className="conversion-value">rgb({rgb.r}, {rgb.g}, {rgb.b})</span>
          </div>
          <div className="conversion-item">
            <span className="conversion-label">HSL:</span>
            <span className="conversion-value">hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</span>
          </div>
          <div className="conversion-item">
            <span className="conversion-label">LCH:</span>
            <span className="conversion-value">lch({lch.l}, {lch.c}, {lch.h})</span>
          </div>
          <div className="conversion-item">
            <span className="conversion-label">Contrast:</span>
            <span className="conversion-value">W:{contrasts.white} B:{contrasts.black}</span>
          </div>
        </div>
        <div className="color-palette">
          <div className="palette-row">
            <div className="palette-label">Complementary:</div>
            <div className="palette-swatch" style={{ backgroundColor: palette.complementary }} />
          </div>
          <div className="palette-row">
            <div className="palette-label">Triadic:</div>
            {palette.triadic.map((color, i) => (
              <div key={i} className="palette-swatch" style={{ backgroundColor: color }} />
            ))}
          </div>
          <div className="palette-row">
            <div className="palette-label">Analogous:</div>
            {palette.analogous.map((color, i) => (
              <div key={i} className="palette-swatch" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
        <div className="color-variations">
          <div className="variation-group">
            <div className="variation-label">Tints:</div>
            <div className="variation-swatches">
              {variations.tints.map((color, i) => (
                <div key={i} className="variation-swatch" style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
          <div className="variation-group">
            <div className="variation-label">Shades:</div>
            <div className="variation-swatches">
              {variations.shades.map((color, i) => (
                <div key={i} className="variation-swatch" style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [color1, setColor1] = useState('#ff0000')
  const [color2, setColor2] = useState('#0000ff')
  const [bgColor, setBgColor] = useState('#242424')
  const [debounceDelay, setDebounceDelay] = useState(300)

  const handleColor1Change = (color) => {
    setColor1(color)
    setBgColor(color)
  }

  const handleColor2Change = (color) => {
    setColor2(color)
    setBgColor(color)
  }

  return (
    <div className="app" style={{ backgroundColor: bgColor }}>
      <div className="debounce-control">
        <label htmlFor="debounce-slider" className="debounce-label">
          Debounce Delay: {debounceDelay}ms
        </label>
        <input
          id="debounce-slider"
          type="range"
          min="0"
          max="1000"
          step="50"
          value={debounceDelay}
          onChange={(e) => setDebounceDelay(Number(e.target.value))}
          className="debounce-slider"
        />
      </div>
      <div className="color-inputs-container">
        <ColorInput
          label="Without Debounce"
          value={color1}
          onChange={handleColor1Change}
          debounced={false}
        />
        <ColorInput
          label={`With Debounce (${debounceDelay}ms)`}
          value={color2}
          onChange={handleColor2Change}
          debounced={true}
          debounceDelay={debounceDelay}
        />
      </div>
    </div>
  )
}

export default App
