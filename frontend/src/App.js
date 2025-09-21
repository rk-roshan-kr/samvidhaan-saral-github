import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import InputForm from './components/InputForm';
import AnalysisResult from './components/AnalysisResult';
import DotGrid from './components/dotbackground';

function App() {
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(true); // True when input is active/centered, false when result is shown/input is at bottom

  const handleSimplifyClick = async () => {
    if (!inputText) {
      setError("Please enter some text to analyze.");
      return;
    }
    setIsLoading(true);
    setAnalysisResult(null); // Clear previous result
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/simplify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Server returned a non-JSON error' }));
        throw new Error(errorData.error || 'Network response was not ok');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysisResult(data);
      setIsEditing(false); // Switch to "result shown" mode
      
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || 'Failed to fetch analysis. Please check the backend server and console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  // When user clicks input box AFTER a result is shown, revert to editing mode and hide result
  const handleInputFocus = () => {
    if (!isEditing) {
      setIsEditing(true);
      setAnalysisResult(null); // Clear the result when returning to editing
    }
  };

  return (
    <div className={`App${!isEditing ? ' analyzed' : ''}`}>
      {/* DotGrid background at the top level, behind all content */}
      <div style={{ width: '100%', height: '6000px', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
        <DotGrid 
          dotSize={4}
          gap={20}
          baseColor="rgba(0,0,0 , 0.3)"
          activeColor="#5227FF"
          proximity={70}
          shockRadius={150}
          shockStrength={10}
          resistance={50}
          returnDuration={1.05}
        />
      </div>
      <Header minimized={!isEditing} />
      {/* Conditionally render content based on whether an analysis result exists */}
      {analysisResult ? (
        <>
          <div className="result-scroll-container fade-in">
            <AnalysisResult analysisResult={analysisResult} />
          </div>
          {/* InputForm always present, but its appearance is controlled by isEditing and CSS */}
          <InputForm
            inputText={inputText}
            setInputText={setInputText}
            handleSimplifyClick={handleSimplifyClick}
            isLoading={isLoading}
            error={error}
            isEditing={isEditing} // Pass isEditing state to InputForm
            onInputFocus={handleInputFocus}
          />
        </>
      ) : (
        <div className="input-center-container">
          <InputForm
            inputText={inputText}
            setInputText={setInputText}
            handleSimplifyClick={handleSimplifyClick}
            isLoading={isLoading}
            error={error}
            isEditing={isEditing} // Pass isEditing state to InputForm
            onInputFocus={handleInputFocus}
          />
        </div>
      )}
    </div>
  );
}

export default App;