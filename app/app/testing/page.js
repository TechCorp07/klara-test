"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthenticatedLayout from '../../components/layout/AuthenticatedLayout';
import { format } from 'date-fns';

export default function TestingPage() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchTestResults = async () => {
      try {
        setLoading(true);
        // Mock data for demonstration
        const mockResults = [
          {
            id: '1',
            test_name: 'COVID-19 PCR Test',
            date: new Date(2025, 2, 15),
            result: 'Negative',
            provider: 'City Medical Lab',
            notes: 'Standard nasal swab test'
          },
          {
            id: '2',
            test_name: 'Complete Blood Count (CBC)',
            date: new Date(2025, 2, 10),
            result: 'Normal',
            provider: 'Memorial Hospital',
            notes: 'All values within normal range'
          },
          {
            id: '3',
            test_name: 'Lipid Panel',
            date: new Date(2025, 1, 28),
            result: 'Abnormal',
            provider: 'Memorial Hospital',
            notes: 'LDL cholesterol slightly elevated'
          }
        ];
        
        setTestResults(mockResults);
      } catch (err) {
        console.error('Error fetching test results:', err);
        setError('Failed to load test results. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTestResults();
  }, [user]);
  
  const handleViewDetails = (test) => {
    setSelectedTest(test);
  };
  
  const handleCloseDetails = () => {
    setSelectedTest(null);
  };
  
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Medical Tests & Results</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Test Results</h2>
                
                {testResults.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Test Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Result
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Provider
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {testResults.map((test) => (
                          <tr key={test.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {test.test_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {format(test.date, 'MMM d, yyyy')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                test.result === 'Normal' || test.result === 'Negative'
                                  ? 'bg-green-100 text-green-800'
                                  : test.result === 'Abnormal'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : test.result === 'Positive'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {test.result}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {test.provider}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleViewDetails(test)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No test results available.</p>
                )}
              </div>
            </div>
            
            {/* Test Details Modal */}
            {selectedTest && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">{selectedTest.test_name} Details</h3>
                      <button
                        onClick={handleCloseDetails}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Test Date</p>
                        <p className="mt-1">{format(selectedTest.date, 'MMMM d, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Result</p>
                        <p className={`mt-1 ${
                          selectedTest.result === 'Normal' || selectedTest.result === 'Negative'
                            ? 'text-green-600'
                            : selectedTest.result === 'Abnormal'
                            ? 'text-yellow-600'
                            : selectedTest.result === 'Positive'
                            ? 'text-red-600'
                            : 'text-gray-900'
                        }`}>
                          {selectedTest.result}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Provider</p>
                        <p className="mt-1">{selectedTest.provider}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Ordered By</p>
                        <p className="mt-1">Dr. Sarah Johnson</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Notes</p>
                      <p className="mt-1">{selectedTest.notes}</p>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Test Details</h4>
                      
                      {/* Mock test details - would be replaced with actual data */}
                      <div className="bg-gray-50 rounded p-3 text-sm">
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <div className="font-medium">Measure</div>
                          <div className="font-medium">Result</div>
                          <div className="font-medium">Reference Range</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 border-t border-gray-200 pt-2">
                          <div>White Blood Cell Count</div>
                          <div>7.2 K/uL</div>
                          <div>4.5-11.0 K/uL</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 border-t border-gray-200 pt-2">
                          <div>Red Blood Cell Count</div>
                          <div>4.8 M/uL</div>
                          <div>4.5-5.9 M/uL</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 border-t border-gray-200 pt-2">
                          <div>Hemoglobin</div>
                          <div>14.2 g/dL</div>
                          <div>13.5-17.5 g/dL</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 border-t border-gray-200 pt-2">
                          <div>Hematocrit</div>
                          <div>42.1 %</div>
                          <div>41.0-53.0 %</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={handleCloseDetails}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Close
                    </button>
                    <button
                      className="ml-3 px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
