// components/ui/LoadingSkeleton.js

/**
 * Reusable loading skeleton component with various preset types
 * @param {Object} props
 * @param {string} props.type - The type of skeleton ('text', 'card', 'table', 'profile', 'chart', 'list', 'detail')
 * @param {number} props.lines - Number of text lines to show (for text type)
 * @param {number} props.count - Number of items to show (for card, list types)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showHeader - Whether to show a header (for tables)
 */
const LoadingSkeleton = ({ 
    type = 'text', 
    lines = 3, 
    count = 1, 
    className = '', 
    showHeader = true 
  }) => {
    // Create an array of specified length
    const createRange = (length) => {
      return Array.from({ length }, (_, i) => i);
    };
  
    // Random width for realistic text lines
    const getRandomWidth = () => {
      const widths = ['w-1/4', 'w-1/3', 'w-1/2', 'w-2/3', 'w-3/4', 'w-full'];
      return widths[Math.floor(Math.random() * widths.length)];
    };
  
    // Text skeleton (for paragraphs, descriptions)
    const TextSkeleton = ({ lines }) => (
      <div className="space-y-2">
        {createRange(lines).map((i) => (
          <div 
            key={i} 
            className={`h-4 bg-gray-200 rounded animate-pulse ${i === lines - 1 ? getRandomWidth() : 'w-full'}`}
          ></div>
        ))}
      </div>
    );
  
    // Card skeleton (for items in grid or list layouts)
    const CardSkeleton = ({ count }) => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {createRange(count).map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  
    // Table skeleton
    const TableSkeleton = ({ rows = 5, showHeader = true }) => (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg animate-pulse">
        {showHeader && (
          <div className="px-4 py-5 border-b border-gray-200">
            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
          </div>
        )}
        <div className="border-t border-gray-200">
          <dl>
            {createRange(rows).map((i) => (
              <div key={i} className={`px-4 py-5 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="col-span-2 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    );
  
    // Profile skeleton (for user profile details)
    const ProfileSkeleton = () => (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg animate-pulse">
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className="mr-4 h-16 w-16 rounded-full bg-gray-200"></div>
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {createRange(4).map((i) => (
              <div key={i} className="grid grid-cols-3 gap-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="col-span-2 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  
    // Chart skeleton (for data visualizations)
    const ChartSkeleton = () => (
      <div className="bg-white shadow rounded-lg p-4 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="mt-4 flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    );
  
    // List skeleton (for simple lists)
    const ListSkeleton = ({ count }) => (
      <ul className="divide-y divide-gray-200 bg-white shadow overflow-hidden sm:rounded-lg animate-pulse">
        {createRange(count).map((i) => (
          <li key={i} className="px-4 py-4">
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="mt-2 h-4 bg-gray-200 rounded w-3/4"></div>
          </li>
        ))}
      </ul>
    );
  
    // Detail view skeleton (for single item details)
    const DetailSkeleton = () => (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg animate-pulse">
        <div className="px-4 py-5 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="px-4 py-5">
          <div className="space-y-6">
            {createRange(5).map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-5 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  
    // Render the appropriate skeleton based on type
    const renderSkeleton = () => {
      switch (type) {
        case 'text':
          return <TextSkeleton lines={lines} />;
        case 'card':
          return <CardSkeleton count={count} />;
        case 'table':
          return <TableSkeleton rows={lines} showHeader={showHeader} />;
        case 'profile':
          return <ProfileSkeleton />;
        case 'chart':
          return <ChartSkeleton />;
        case 'list':
          return <ListSkeleton count={count} />;
        case 'detail':
          return <DetailSkeleton />;
        default:
          return <TextSkeleton lines={lines} />;
      }
    };
  
    return (
      <div className={className}>
        {renderSkeleton()}
      </div>
    );
  };
  
  export default LoadingSkeleton;
  