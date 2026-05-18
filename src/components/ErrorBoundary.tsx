import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#0C0E14',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: 480, padding: '0 24px' }}>
            {/* Icon */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#EF4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h2
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.85)',
                margin: '0 0 8px',
              }}
            >
              Something went wrong
            </h2>

            <p
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.35)',
                margin: '0 0 28px',
                lineHeight: 1.6,
              }}
            >
              An unexpected error occurred in the application.
              {this.state.error && (
                <>
                  {' '}
                  <span style={{ color: 'rgba(239,68,68,0.7)', fontFamily: 'monospace' }}>
                    {this.state.error.message}
                  </span>
                </>
              )}
            </p>

            <button
              onClick={this.handleRetry}
              style={{
                padding: '10px 28px',
                background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                border: 'none',
                borderRadius: 10,
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
