import './Footer.css';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <span>
          Made by{' '}
          <a
            href="https://www.qrz.com/db/TA1VAL"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            TA1VAL
          </a>
        </span>
        <span className="footer-separator">•</span>
        <span>
          Open Source on{' '}
          <a
            href="https://github.com/talhaakkaya/rflos"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            GitHub
          </a>
        </span>
      </div>
    </footer>
  );
}
