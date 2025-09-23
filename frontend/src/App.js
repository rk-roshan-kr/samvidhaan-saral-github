import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import InputForm from './components/InputForm';
import AnalysisResult from './components/AnalysisResult';
import DotGrid from './components/dotbackground';
import useApiWarmup from './hooks/useApiWarmup';

function NotificationPopup({ message, duration = 120000, onDismiss }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onDismiss) onDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);
  if (!visible) return null;
  return (
    <div style={{
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)',
      color: '#222',
      borderRadius: '12px',
      boxShadow: '0 4px 24px rgba(82,39,255,0.12)',
      padding: '20px 28px',
      minWidth: '320px',
      maxWidth: '360px',
      fontSize: '16px',
      lineHeight: '1.6',
      border: '1px solid #d1d5fa',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '14px',
      marginBottom: '18px',
      animation: 'fadeIn 0.5s',
      position: 'relative',
    }}>
      <span style={{fontWeight:'bold',marginRight:'8px',color:'#5227FF'}}>ℹ️ Info</span>
      <span style={{flex:1}}>{message}</span>
      <button onClick={() => { setVisible(false); if (onDismiss) onDismiss(); }} style={{marginLeft:'8px',background:'none',border:'none',color:'#5227FF',fontWeight:'bold',cursor:'pointer',fontSize:'18px'}}>✕</button>
    </div>
  );
}

function NotificationStack({ notifications }) {
  const [active, setActive] = useState(notifications.map(() => true));
  return (
    <div style={{
      position: 'fixed',
      bottom: '32px',
      right: '32px',
      zIndex: 10001, 
      display: 'flex',
      flexDirection: 'column-reverse',
      alignItems: 'flex-end',
      pointerEvents: 'none',
    }}>
      {notifications.map((notif, idx) =>
        active[idx] ? (
          <div key={idx} style={{pointerEvents:'auto'}}>
            <NotificationPopup
              message={notif.message}
              duration={notif.duration}
              onDismiss={() => setActive(a => a.map((v,i) => i === idx ? false : v))}
            />
          </div>
        ) : null
      )}
    </div>
  );
}

function App() {
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(true); // True when input is active/centered, false when result is shown/input is at bottom

  const handleSimplifyClick = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to analyze.");
      return;
    }
    setIsLoading(true);
    setAnalysisResult(null); // Clear previous result
    setError('');

    // Logic to decide which API endpoint to call
    const articleRegex = /\b(article|art|a|preamble)\b\s*(\d*[A-Z]?)/i;
    const match = inputText.trim().match(articleRegex);

    const baseUrl = process.env.REACT_APP_API_URL || 'https://samvidhaan-saral-api.onrender.com';
    let endpoint = `${baseUrl}/api/simplify`;
    let requestBody = { text: inputText };
    let method = 'POST';

    if (match) {
      const articleNumber = match[1].toLowerCase() === 'preamble' ? 'preamble' : (match[2] || '');
      endpoint = `${baseUrl}/api/get_article/${articleNumber}`;
      requestBody = null;
      method = 'GET';
    }

    try {
      const options = {
        method: method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (requestBody) {
        options.body = JSON.stringify(requestBody);
      }

      const response = await fetch(endpoint, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Server returned an invalid response' }));
        throw new Error(errorData.error || 'Network response was not ok');
      }
      const data = await response.json();
      if (data.error) { throw new Error(data.error); }
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

  const notifications = [
    {
      message: <div>We are building a database of simplified article explanations to reduce token utilization for the model.If you want info about an article, we have a limited set pre-processed for instant answers.</div>,
      duration: 120000,
    },

    {
      message: <div>We are also working on the upload file feature (paperclip icon).</div>,
      duration: 120000,
    },
    {
      message: <div>Our backend is hosted for free on Render.com, so the API may take 40s–1min to start up after inactivity. Please wait up to 40s after your first prompt for best results.</div>,
      duration: 120000,
    },
  ];
  // Ping / warm-up backend once on app mount
  useApiWarmup(process.env.REACT_APP_API_URL || 'https://samvidhaan-saral-api.onrender.com');

  return (
    <div className={`App${!isEditing ? ' analyzed' : ''}`}>
      {/* Notification Stack for judges and users */}
      <NotificationStack notifications={notifications} />
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