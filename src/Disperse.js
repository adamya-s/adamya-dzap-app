import React, { useState, useEffect } from 'react';
import './Disperse.css';

const Disperse = () => {
  const [inputData, setInputData] = useState('');
  const [errors, setErrors] = useState([]);
  const [lineCount, setLineCount] = useState(1); // Track the line count
  const [seenAddresses, setSeenAddresses] = useState(new Map());
  const [duplicateErrors, setDuplicateErrors] = useState([]);
  const [buttonClicked, setButtonClicked] = useState(false); // State to track button click

  useEffect(() => {
    // Update the line count based on the number of lines in the input
    setLineCount(inputData.split('\n').length);
  }, [inputData]);

  const handleInputChange = (e) => {
    setInputData(e.target.value);
  };

  const validateInput = (input) => {
    const entries = input.split(/\n/);
    const newErrors = [];
    const newSeenAddresses = new Map();
    const newDuplicateErrors = new Map();

    // Clear previous seen addresses and errors when validating new input
    setSeenAddresses(newSeenAddresses);
    setDuplicateErrors(newDuplicateErrors);

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const [address, amount] = entry.split(/[\s=,]+/).filter(Boolean);

      if (address && amount) {
        if (address.length !== 42) {
          newErrors.push(`Line ${i + 1}: Ethereum address is not 42 characters long.`);
        }
        if (!address.startsWith('0x')) {
          newErrors.push(`Line ${i + 1}: Invalid Ethereum address format.`);
        }
        if (isNaN(amount) || parseFloat(amount) < 0) {
          newErrors.push(`Line ${i + 1}: Invalid amount. Please enter a valid amount.`);
        }

        // Check for duplicate addresses
        const addressLower = address.toLowerCase();
        if (newSeenAddresses.has(addressLower)) {
          if (!newDuplicateErrors.has(addressLower)) {
            newDuplicateErrors.set(addressLower, [newSeenAddresses.get(addressLower)]);
          }
          newDuplicateErrors.get(addressLower).push(i + 1);
        } else {
          newSeenAddresses.set(addressLower, i + 1);
        }
      } else {
        newErrors.push(`Line ${i + 1}: Ethereum address and amount must be specified.`);
      }
    }

    setErrors(newErrors);
    setDuplicateErrors(newDuplicateErrors);
  };

  const handleRemoveDuplicates = () => {
    const lines = inputData.split(/\n/);
    const updatedLines = [];
    const seenDuplicates = new Set();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const [address, amount] = line.split(/[\s=,]+/).filter(Boolean);

      if (address && amount) {
        const addressAmountKey = `${address.toLowerCase()}=${amount}`;
        if (!seenDuplicates.has(addressAmountKey)) {
          updatedLines.push(line);
          seenDuplicates.add(addressAmountKey);
        }
      } else {
        updatedLines.push(line);
      }
    }

    const updatedData = updatedLines.join('\n');
    setInputData(updatedData);
    validateInput(updatedData);
    setDuplicateErrors(new Map());
  };

  const handleCombineBalance = () => {
    const lines = inputData.split(/\n/);
    const balances = new Map();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const [address, amount] = line.split(/[\s=,]+/).filter(Boolean);

      if (address && amount) {
        const addressLower = address.toLowerCase();
        if (balances.has(addressLower)) {
          balances.set(addressLower, balances.get(addressLower) + parseFloat(amount));
        } else {
          balances.set(addressLower, parseFloat(amount));
        }
      }
    }

    const combinedLines = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const [address, amount] = line.split(/[\s=,]+/).filter(Boolean);

      if (address && amount) {
        const addressLower = address.toLowerCase();
        if (balances.has(addressLower)) {
          combinedLines.push(`${address}=${balances.get(addressLower)}`);
          balances.delete(addressLower);
        }
      }
    }

    const updatedData = combinedLines.join('\n');
    setInputData(updatedData);
    validateInput(updatedData);
    setDuplicateErrors(new Map());
  };

  const handleSubmit = () => {
    validateInput(inputData);
    setButtonClicked(true); // Set buttonClicked to true on click
  };

  return (
    <div className="disperse-container">
      <div className="header-section">
        <p>Addresses with Amounts</p>
        <p>Upload Files</p>
      </div>
      <div className="editor-container">
        <div className="line-numbers">
          {Array.from({ length: lineCount }, (_, index) => (
            <div className="line-number" key={index + 1}>
              {index + 1}
            </div>
          ))}
        </div>
        <textarea
          className="input-editor"
          value={inputData}
          onChange={handleInputChange}
          rows="10"
        />
      </div>
      <div className="header-section">
        <p>Separated by ',' or '='</p>
        <p style={{ color: 'grey' }}>Show Example</p>
      </div>
      {[...duplicateErrors.keys()].length > 0 && (
        <div className='custom-button'>
          <button
            className="keep-the-first-one-button"
            onClick={handleRemoveDuplicates}
          >
            Keep the First One
          </button>
          <span>|</span>
          
          <button
            className="keep-the-first-one-button"
            onClick={handleCombineBalance}
          >
            Combine Balance
          </button>
        </div>
      )}
      {(errors.length > 0 || [...duplicateErrors.keys()].length > 0) && (
        <div className="error-box">
          {errors.map((error, index) => (
            <div className="error-message" key={index}>
              {error}
            </div>
          ))}
          {[...duplicateErrors.keys()].map((address) => (
            <div className="error-message" key={address}>
              Duplicate addresses {address} found in line {duplicateErrors.get(address).join(', ')}
            </div>
          ))}
        </div>
      )}
      <div className="button-section">
        <button
          className="gradient-button"
          onClick={handleSubmit}
          style={{ background: buttonClicked ? '#1c1f22' : 'linear-gradient(to right, #c072fb, #6b55d1)' }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Disperse;
