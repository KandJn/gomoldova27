import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {error.status} {error.statusText}
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {error.data?.message || "Ne pare rău, a apărut o eroare."}
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Înapoi la pagina principală
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Oops! A apărut o eroare
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {error instanceof Error ? error.message : "Ne pare rău, a apărut o eroare neașteptată."}
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Înapoi la pagina principală
          </Link>
        </div>
      </div>
    </div>
  );
} 