import React, { useRef, useEffect } from 'react';

function InputForm({ inputText, setInputText, handleSimplifyClick, isLoading, error, isEditing, onInputFocus }) {
  const inputRef = useRef(null);

  const charCount = inputText.length;

  // Effect to auto-resize the textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'; // Reset height to recalculate
      // Set a max height (e.g., 200px or 6 lines based on font-size) for expansion
      const maxHeight = Math.min(inputRef.current.scrollHeight, 200); // Max 200px or its natural scroll height
      inputRef.current.style.height = `${maxHeight}px`;
      inputRef.current.style.overflowY = inputRef.current.scrollHeight > 200 ? 'auto' : 'hidden'; // Add scrollbar if exceeds max height
    }
  }, [inputText]); // Rerun when inputText changes

  // Handler for Analyze button
  const onAnalyzeClick = () => {
    handleSimplifyClick();
    // No need to scroll here, App.js handles the layout change
  };

  return (
    <div className={`input-bar ${!isEditing ? ' minimized' : ''}`}>
      <textarea
        id="legal-text-input"
        className="text-area input-bar-textarea"
        ref={inputRef}
        rows="2" // Initial rows for basic rendering, height controlled by JS
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Ask anything or paste legal text..."
        disabled={isLoading} // Only disable when loading, not based on isEditing
        style={{ resize: 'none' }} // Prevent manual resizing
        onFocus={onInputFocus} // Call the passed-in focus handler
      />
      <div className="input-bar-actions">
        <button
          type="button"
          className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none send-btn"
          onClick={onAnalyzeClick}
          disabled={isLoading || !inputText.trim()} // Disable if loading or text is empty
        >
          {isLoading ? (
            <span
              className="animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-white rounded-full"
              role="status"
              aria-label="loading"
            >
              {/* Removed "Loading..." text, only the spinner will show */}
            </span>
          ) : (
            <span>&#8594;</span>
          )}
        </button>
        <button
          className="upload-btn"
          disabled
          title="Upload file (Coming Soon)"
        >
          📎
        </button>
      </div>
      <div className="char-count">{charCount} chars</div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default InputForm;