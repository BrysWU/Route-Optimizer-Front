import React, { useState } from 'react';

// CHANGE this to your actual backend URL!
const BACKEND_URL = 'https://route-optimizer-back.onrender.com/api/optimize';

function App() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [stops, setStops] = useState(['', '']);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStopChange = (idx, value) => {
    setStops(stops => stops.map((s, i) => (i === idx ? value : s)));
  };

  const addStop = () => setStops([...stops, '']);
  const removeStop = idx => setStops(stops.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const filteredStops = stops.map(s => s.trim()).filter(Boolean);

    if (!start.trim() || !end.trim() || filteredStops.length === 0) {
      setError('Please enter start, end, and at least one stop.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: start.trim(),
          stops: filteredStops,
          end: end.trim()
        })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'API error');
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Route Optimizer</h1>
      <form className="route-form" onSubmit={handleSubmit}>
        <label>
          Start Address:
          <input
            type="text"
            value={start}
            onChange={e => setStart(e.target.value)}
            required
            placeholder="e.g. 123 Main St, Springfield"
          />
        </label>
        <div>
          <label>Stops:</label>
          {stops.map((stop, idx) => (
            <div className="stop-row" key={idx}>
              <input
                type="text"
                value={stop}
                onChange={e => handleStopChange(idx, e.target.value)}
                required
                placeholder={`Stop #${idx + 1}`}
              />
              {stops.length > 1 && (
                <button type="button" onClick={() => removeStop(idx)} title="Remove stop">✕</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addStop}>+ Add Stop</button>
        </div>
        <label>
          End Address:
          <input
            type="text"
            value={end}
            onChange={e => setEnd(e.target.value)}
            required
            placeholder="e.g. 456 Elm St, Springfield"
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Optimizing...' : 'Optimize Route'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="result">
          <h2>Optimized Route</h2>
          <ol>
            <li><strong>Start:</strong> {result.start}</li>
            {result.stops.map((stop, idx) => (
              <li key={idx}><strong>Stop {idx + 1}:</strong> {stop}</li>
            ))}
            <li><strong>End:</strong> {result.end}</li>
          </ol>
        </div>
      )}
      <footer>
        <small>
          &copy; {new Date().getFullYear()} Route Optimizer &mdash; Powered by OpenRouteService &amp; Open Source Software
        </small>
      </footer>
    </div>
  );
}

export default App;