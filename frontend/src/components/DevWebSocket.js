import { useEffect } from 'react';
import { config } from '../config';

export const DevWebSocket = () => {
  useEffect(() => {
    // Only attempt WebSocket connection in development
    if (process.env.NODE_ENV === 'development' && config.WS_URL) {
      // WebSocket connection logic here
    }
  }, []);

  return null; // This component doesn't render anything
}; 