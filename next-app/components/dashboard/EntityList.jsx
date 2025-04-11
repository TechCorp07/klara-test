import { SectionContainer } from '../layout/SectionContainer';
import { StatusBadge } from '../ui/StatusBadge';
import Link from 'next/link';

/**
 * Generic entity list component for displaying a list of entities in dashboard sections
 */
export function EntityList({
  title,
  entities = [],
  viewAllLink,
  emptyMessage = 'No items found.',
  renderItem = null,
  maxItems = 5
}) {
  // Standardized rendering function if none is provided
  const defaultRenderItem = (item, index) => {
    return (
      <div key={item.id || index} className="border-b pb-3">
        <div className="flex justify-between">
          <p className="font-medium">{item.title || item.name}</p>
          {item.status && (
            <StatusBadge status={item.status} />
          )}
        </div>
        {item.description && (
          <p className="text-sm text-gray-600">{item.description}</p>
        )}
        {item.detailsLink && (
          <div className="flex justify-end mt-1">
            <Link href={item.detailsLink} className="text-sm text-blue-600 hover:text-blue-800">
              {item.detailsLinkText || 'View details'} →
            </Link>
          </div>
        )}
      </div>
    );
  };
  
  // Use the provided render function or fall back to the default
  const renderFunction = renderItem || defaultRenderItem;
  const displayedEntities = entities?.slice(0, maxItems) || [];
  
  return (
    <SectionContainer
      title={title}
      linkUrl={viewAllLink}
      linkText="View all"
    >
      {displayedEntities.length > 0 ? (
        <div className="space-y-4">
          {displayedEntities.map((entity, index) => renderFunction(entity, index))}
        </div>
      ) : (
        <p className="text-gray-500">{emptyMessage}</p>
      )}
    </SectionContainer>
  );
}