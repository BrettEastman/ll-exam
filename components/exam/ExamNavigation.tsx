interface ExamNavigationProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export default function ExamNavigation({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  onFinish
}: ExamNavigationProps) {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px',
      borderTop: '2px solid #eee',
      backgroundColor: '#f8f9fa'
    }}>
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        disabled={isFirstPage}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: isFirstPage ? '#f8f9fa' : '#6c757d',
          color: isFirstPage ? '#999' : 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: isFirstPage ? 'not-allowed' : 'pointer',
          opacity: isFirstPage ? 0.5 : 1
        }}
      >
        ← Previous
      </button>

      {/* Progress Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <div
            key={i + 1}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: i + 1 === currentPage ? '#007bff' : 
                              i + 1 < currentPage ? '#28a745' : '#dee2e6',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
        <span style={{ marginLeft: '10px', color: '#666' }}>
          {currentPage} of {totalPages}
        </span>
      </div>

      {/* Next/Finish Button */}
      {isLastPage ? (
        <button
          onClick={onFinish}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: '1px solid #28a745',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Finish Exam ✓
        </button>
      ) : (
        <button
          onClick={onNext}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: '1px solid #007bff',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Next →
        </button>
      )}
    </div>
  );
}