interface RFAnalysisButtonProps {
  onClick: () => void;
  isActive: boolean;
  disabled?: boolean;
}

export default function RFAnalysisButton({ onClick, isActive, disabled = false }: RFAnalysisButtonProps) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        position: 'absolute',
        top: '10px',
        right: '120px',
        zIndex: 1000,
        background: disabled ? '#e0e0e0' : isActive ? '#e3f2fd' : 'white',
        border: disabled ? '2px solid #ccc' : isActive ? '2px solid #2196F3' : '2px solid rgba(0,0,0,0.2)',
        borderRadius: '4px',
        width: '34px',
        height: '34px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 5px rgba(0,0,0,0.4)',
        transition: 'background 0.2s, border 0.2s',
        opacity: disabled ? 0.5 : 1
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isActive) {
          e.currentTarget.style.background = '#f4f4f4';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = isActive ? '#e3f2fd' : 'white';
        }
      }}
      title={disabled ? "Calculate a path first" : isActive ? "Hide RF analysis" : "Show RF analysis"}
    >
      📡
    </button>
  );
}
