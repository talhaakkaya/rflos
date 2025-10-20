import { HelpCircle } from 'lucide-react';

interface HelpButtonProps {
  onClick: () => void;
}

export default function HelpButton({ onClick }: HelpButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        top: '10px',
        right: '65px',
        zIndex: 1000,
        background: 'white',
        border: '2px solid rgba(0,0,0,0.2)',
        borderRadius: '4px',
        width: '34px',
        height: '34px',
        cursor: 'pointer',
        fontSize: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 5px rgba(0,0,0,0.4)',
        transition: 'background 0.2s',
        color: '#555',
        flexShrink: 0
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#f4f4f4'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
      title="Help and usage guide"
    >
      <HelpCircle size={18} style={{ minWidth: '18px', minHeight: '18px' }} />
    </button>
  );
}
