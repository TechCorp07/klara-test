import Link from 'next/link';

/**
 * Dashboard statistics card component
 */
export function StatsCard({
  title,
  value,
  icon: Icon,
  link,
  linkText = 'View all →',
  textColorClass = 'text-blue-600',
  bgColorClass = 'bg-white',
  onClick
}) {
  const cardContent = (
    <div className={`${bgColorClass} rounded-lg shadow-md p-6`}>
      <h2 className="text-lg font-medium text-gray-600 mb-2">{title}</h2>
      <p className={`text-3xl font-bold ${textColorClass}`}>
        {value}
      </p>
      {link && (
        <Link href={link} className="text-blue-600 hover:text-blue-800 text-sm">
          {linkText}
        </Link>
      )}
    </div>
  );

  return onClick ? (
    <button 
      onClick={onClick}
      className="w-full text-left"
    >
      {cardContent}
    </button>
  ) : (
    cardContent
  );
}