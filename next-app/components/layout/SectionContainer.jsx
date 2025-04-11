/**
 * Reusable section container component with title and optional link
 */
export function SectionContainer({
    title,
    linkUrl,
    linkText = 'View all',
    children
  }) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          {linkUrl && (
            <Link href={linkUrl} className="text-blue-600 hover:text-blue-800 text-sm">
              {linkText}
            </Link>
          )}
        </div>
        {children}
      </div>
    );
  }