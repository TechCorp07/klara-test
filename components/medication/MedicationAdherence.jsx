import React, { useState, useEffect } from 'react';
import { medication } from '../../api';
import { toast } from 'react-toastify';

/**
 * MedicationAdherence Component
 * Displays medication adherence data and tracking
 */
const MedicationAdherence = ({ patientId }) => {
  const [adherenceData, setAdherenceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('week'); // 'week', 'month', 'year'

  useEffect(() => {
    if (patientId) {
      fetchAdherenceData();
    }
  }, [patientId, dateRange]);

  const fetchAdherenceData = async () => {
    setLoading(true);
    try {
      const response = await medicationAPI.getAdherenceData(patientId, { period: dateRange });
      setAdherenceData(response);
      setError(null);
    } catch (err) {
      console.error('Error fetching adherence data:', err);
      setError('Failed to load medication adherence data. Please try again.');
      toast.error('Failed to load medication adherence data');
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallAdherence = () => {
    if (!adherenceData || !adherenceData.medications) return 0;
    
    const totalDoses = adherenceData.medications.reduce((sum, med) => sum + med.totalDoses, 0);
    const takenDoses = adherenceData.medications.reduce((sum, med) => sum + med.takenDoses, 0);
    
    return totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
  };

  const getAdherenceColorClass = (percentage) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!adherenceData || !adherenceData.medications || adherenceData.medications.length === 0) {
    return (
      <div className="alert alert-info" role="alert">
        No medication adherence data available for this patient.
      </div>
    );
  }

  const overallAdherence = calculateOverallAdherence();
  const adherenceColorClass = getAdherenceColorClass(overallAdherence);

  return (
    <div className="medication-adherence">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Medication Adherence</h3>
        <div className="btn-group" role="group">
          <button 
            type="button" 
            className={`btn btn-outline-primary ${dateRange === 'week' ? 'active' : ''}`}
            onClick={() => setDateRange('week')}
          >
            Week
          </button>
          <button 
            type="button" 
            className={`btn btn-outline-primary ${dateRange === 'month' ? 'active' : ''}`}
            onClick={() => setDateRange('month')}
          >
            Month
          </button>
          <button 
            type="button" 
            className={`btn btn-outline-primary ${dateRange === 'year' ? 'active' : ''}`}
            onClick={() => setDateRange('year')}
          >
            Year
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-4 text-center">
              <div className="adherence-circle">
                <div className={`progress-circle p${overallAdherence} ${adherenceColorClass}`}>
                  <span>{overallAdherence}%</span>
                  <div className="left-half-clipper">
                    <div className="first50-bar"></div>
                    <div className="value-bar"></div>
                  </div>
                </div>
              </div>
              <h4 className="mt-3">Overall Adherence</h4>
            </div>
            <div className="col-md-8">
              <div className="adherence-summary">
                <p>
                  <strong>Period:</strong> {adherenceData.startDate ? new Date(adherenceData.startDate).toLocaleDateString() : ''} - {adherenceData.endDate ? new Date(adherenceData.endDate).toLocaleDateString() : ''}
                </p>
                <p>
                  <strong>Total Medications:</strong> {adherenceData.medications.length}
                </p>
                <p>
                  <strong>Doses Taken:</strong> {adherenceData.medications.reduce((sum, med) => sum + med.takenDoses, 0)} of {adherenceData.medications.reduce((sum, med) => sum + med.totalDoses, 0)} prescribed doses
                </p>
                <p>
                  <strong>Adherence Status:</strong> 
                  <span className={`badge bg-${adherenceColorClass} ms-2`}>
                    {overallAdherence >= 90 ? 'Excellent' : overallAdherence >= 70 ? 'Good' : 'Needs Improvement'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Medication</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Doses Taken</th>
              <th>Adherence</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {adherenceData.medications.map((medication) => {
              const adherencePercentage = medication.totalDoses > 0 
                ? Math.round((medication.takenDoses / medication.totalDoses) * 100) 
                : 0;
              const colorClass = getAdherenceColorClass(adherencePercentage);
              
              return (
                <tr key={medication.id}>
                  <td>{medication.name}</td>
                  <td>{medication.dosage}</td>
                  <td>{medication.frequency}</td>
                  <td>{medication.takenDoses} of {medication.totalDoses}</td>
                  <td>
                    <div className="progress">
                      <div 
                        className={`progress-bar bg-${colorClass}`} 
                        role="progressbar" 
                        style={{ width: `${adherencePercentage}%` }}
                        aria-valuenow={adherencePercentage} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      >
                        {adherencePercentage}%
                      </div>
                    </div>
                  </td>
                  <td>
                    {medication.trend === 'improving' && (
                      <span className="text-success">
                        <i className="bi bi-arrow-up-circle-fill"></i> Improving
                      </span>
                    )}
                    {medication.trend === 'declining' && (
                      <span className="text-danger">
                        <i className="bi bi-arrow-down-circle-fill"></i> Declining
                      </span>
                    )}
                    {medication.trend === 'stable' && (
                      <span className="text-secondary">
                        <i className="bi bi-dash-circle-fill"></i> Stable
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <h4 className="mb-0">Adherence Tips</h4>
        </div>
        <div className="card-body">
          <ul className="list-group list-group-flush">
            <li className="list-group-item">Set daily alarms or reminders for medication times</li>
            <li className="list-group-item">Use a pill organizer to keep track of doses</li>
            <li className="list-group-item">Connect medication times with daily routines (e.g., brushing teeth)</li>
            <li className="list-group-item">Keep a medication journal or use the app to track doses</li>
            <li className="list-group-item">Ask family members or caregivers to help remind you</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MedicationAdherence;
