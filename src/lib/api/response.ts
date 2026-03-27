/**
 * Standardized API Response Helpers
 */

export function jsonResponse<T>(data: T, status: number = 200) {
  return Response.json(data, { status });
}

export function errorResponse(error: string, status: number = 400) {
  return Response.json({ error }, { status });
}

export function notFoundResponse(resource: string = "Resource") {
  return Response.json({ error: `${resource} not found` }, { status: 404 });
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return Response.json({
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
}

/**
 * Parse pagination params from URL search params.
 */
export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
