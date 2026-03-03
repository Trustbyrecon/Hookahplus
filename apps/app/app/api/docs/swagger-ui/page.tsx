'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function SwaggerUIPage() {
  const [spec, setSpec] = useState<any>(null);

  useEffect(() => {
    fetch('/api/docs')
      .then((res) => res.json())
      .then((data) => setSpec(data))
      .catch((error) => {
        console.error('Failed to load API spec:', error);
      });
  }, []);

  if (!spec) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading API Documentation...</h1>
          <p className="text-gray-600">Fetching OpenAPI specification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="swagger-ui-wrapper">
      <SwaggerUI spec={spec} />
    </div>
  );
}

