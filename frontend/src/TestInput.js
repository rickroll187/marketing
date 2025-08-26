import React, { useState } from 'react';

/**
 * TestInput - Minimal component to test if the focus issue exists in isolation
 */
function TestInput() {
  const [inputValue, setInputValue] = useState('');
  
  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h2>🧪 Input Focus Test - Minimal Component</h2>
      <p>This component has minimal state and no complex React patterns.</p>
      
      <label>
        Test Input:
        <br />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type here to test focus..."
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginTop: '5px'
          }}
        />
      </label>
      
      <p>Current value: {inputValue}</p>
      
      <label>
        Test Textarea:
        <br />
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type here to test textarea focus..."
          rows={4}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginTop: '5px',
            fontFamily: 'monospace'
          }}
        />
      </label>
    </div>
  );
}

export default TestInput;