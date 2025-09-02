'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '800px', 
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <h1 style={{ marginBottom: '20px', color: '#2c3e50' }}>
        LydianLab Music Theory Entrance Exam
      </h1>
      
      <div style={{ 
        backgroundColor: '#f8f9fa',
        padding: '30px',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        marginBottom: '30px'
      }}>
        <h2 style={{ color: '#495057', marginBottom: '15px' }}>
          Welcome to the Music Theory Assessment
        </h2>
        <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#6c757d', marginBottom: '20px' }}>
          This exam consists of <strong>2 sections</strong> designed to assess your music theory knowledge 
          and determine appropriate class placement for music camp.
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '20px', 
          margin: '20px 0' 
        }}>
          <div style={{ 
            padding: '20px', 
            backgroundColor: 'white', 
            borderRadius: '6px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ color: '#28a745', marginBottom: '10px' }}>📝 Section 1</h3>
            <h4 style={{ marginBottom: '8px' }}>Scale Notation</h4>
            <p style={{ fontSize: '14px', color: '#6c757d' }}>
              Enter the D Major scale notes with proper accidentals
            </p>
          </div>
          <div style={{ 
            padding: '20px', 
            backgroundColor: 'white', 
            borderRadius: '6px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ color: '#007bff', marginBottom: '10px' }}>🎼 Section 2</h3>
            <h4 style={{ marginBottom: '8px' }}>Key Signature Notation</h4>
            <p style={{ fontSize: '14px', color: '#6c757d' }}>
              Place the correct sharps or flats for key signatures
            </p>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          padding: '15px',
          margin: '20px 0'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>
            ⏱️ <strong>Time Limit:</strong> 60 minutes • 
            💾 <strong>Auto-save:</strong> Your progress is saved automatically • 
            🎯 <strong>Grading:</strong> Immediate feedback provided
          </p>
        </div>
      </div>

      <Link 
        href="/exam/1"
        style={{
          display: 'inline-block',
          padding: '15px 30px',
          fontSize: '18px',
          fontWeight: 'bold',
          color: 'white',
          backgroundColor: '#007bff',
          textDecoration: 'none',
          borderRadius: '6px',
          border: '2px solid #007bff',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#0056b3';
          e.currentTarget.style.borderColor = '#0056b3';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#007bff';
          e.currentTarget.style.borderColor = '#007bff';
        }}
      >
        Start Exam →
      </Link>
      
      <div style={{ marginTop: '40px', fontSize: '14px', color: '#6c757d' }}>
        <p>
          <strong>Need help?</strong> Contact your music instructor before starting the exam.
        </p>
        <p>
          Make sure you have a stable internet connection and uninterrupted time to complete both sections.
        </p>
      </div>
    </div>
  );
}
