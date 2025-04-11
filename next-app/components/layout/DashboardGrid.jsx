/**
 * Reusable grid layout for dashboard sections
 */
export function DashboardGrid({ children, cols = 2, gap = 6, className = '' }) {
    const colClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-4'
    };
  
    const gapClasses = {
      4: 'gap-4',
      6: 'gap-6',
      8: 'gap-8'
    };
  
    return (
      <div className={`grid ${colClasses[cols] || colClasses[2]} ${gapClasses[gap] || gapClasses[6]} ${className} mb-8`}>
        {children}
      </div>
    );
  }