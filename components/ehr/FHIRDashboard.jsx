import React from 'react';
import FHIRExport from './FHIRExport';
import FHIRResourceBrowser from './FHIRResourceBrowser';
import FHIRConverter from './FHIRConverter';

/**
 * FHIR Dashboard Component
 * Integrates all FHIR components into a single dashboard
 */
const FHIRDashboard = ({ patientId = null }) => {
  return (
    <div className="fhir-dashboard">
      <h2 className="mb-4">FHIR Data Management</h2>
      
      <div className="row mb-4">
        <div className="col-12">
          <FHIRResourceBrowser 
            resourceType="Patient" 
            patientId={patientId} 
          />
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-6">
          <FHIRExport patientId={patientId} />
        </div>
        <div className="col-md-6">
          <FHIRConverter />
        </div>
      </div>
    </div>
  );
};

export default FHIRDashboard;
