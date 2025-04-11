/**
 * Reusable data table component
 */
export function DataTable({ 
    columns, 
    data,
    onRowClick,
    emptyMessage = 'No data available.',
    isLoading = false,
    error = null
  }) {
    if (isLoading) {
      return <LoadingState />;
    }
  
    if (error) {
      return <ErrorState message={error} />;
    }
  
    if (!data || data.length === 0) {
      return <EmptyState message={emptyMessage} />;
    }
  
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    {column.cell ? column.cell(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }