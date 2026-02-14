import { NextResponse } from 'next/server';
import { generateOpenAPISpec } from '../../../lib/openapi';

/**
 * GET /api/docs
 * Returns OpenAPI/Swagger specification
 */
export async function GET() {
  try {
    const spec = generateOpenAPISpec();
    return NextResponse.json(spec, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate API documentation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

