import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  isLoading: boolean;
}

export default function LoadingSpinner({ isLoading }: LoadingSpinnerProps) {
  if (!isLoading) return null;

  return (
    <div className="loading-spinner-container">
      <div className="spinner"></div>
      <div className="loading-text">Calculating...</div>
    </div>
  );
}
