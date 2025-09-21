import React from 'react';

function AnalysisResult({ analysisResult }) {
  return (
    <div className="result-box">
      <h3>Simplified Explanation</h3>
      <p>{analysisResult.simplifiedText}</p>

      <hr />

      <h3>Key Points</h3>
      <ul>
        {analysisResult.keyPoints && analysisResult.keyPoints.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>

      <hr />

      <h3>Legal References</h3>
      {analysisResult.legalReferences && analysisResult.legalReferences.length > 0 ? (
        <ul>
          {analysisResult.legalReferences.map((reference, index) => (
            <li key={index}>{reference}</li>
          ))}
        </ul>
      ) : <p>No legal references were identified.</p>}

      <hr />

      <h3>Defined Terms</h3>
      {analysisResult.definedTerms && Object.keys(analysisResult.definedTerms).length > 0 ? (
        <dl>
          {Object.entries(analysisResult.definedTerms).map(([term, definition]) => (
            <React.Fragment key={term}>
              <dt><strong>{term}</strong></dt>
              <dd>{definition}</dd>
            </React.Fragment>
          ))}
        </dl>
      ) : <p>No complex terms were identified.</p>}
    </div>
  );
}

export default AnalysisResult;