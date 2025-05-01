import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { fhirService } from '../../lib/services/ehr/fhirService';

/**
 * FHIR Data Converter Component
 * Allows users to convert data to FHIR format
 */
const FHIRConverter = () => {
  const [sourceFormat, setSourceFormat] = useState('hl7');
  const [sourceData, setSourceData] = useState('');
  const [convertedData, setConvertedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConvert = async (e) => {
    e.preventDefault();
    
    if (!sourceData.trim()) {
      toast.error('Please enter source data to convert');
      return;
    }
    
    setLoading(true);
    setError(null);
    setConvertedData(null);
    
    try {
      const result = await fhirService.convertToFHIR(sourceFormat, { data: sourceData });
      setConvertedData(result);
      toast.success(`Successfully converted ${sourceFormat} to FHIR`);
    } catch (error) {
      console.error('Conversion error:', error);
      setError(error.message || `Failed to convert ${sourceFormat} to FHIR`);
      toast.error(error.message || `Failed to convert ${sourceFormat} to FHIR`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fhir-converter card">
      <div className="card-header">
        <h3>FHIR Data Converter</h3>
      </div>
      <div className="card-body">
        <form onSubmit={handleConvert}>
          <div className="mb-3">
            <label htmlFor="sourceFormat" className="form-label">Source Format</label>
            <select
              id="sourceFormat"
              className="form-select"
              value={sourceFormat}
              onChange={(e) => setSourceFormat(e.target.value)}
              disabled={loading}
            >
              <option value="hl7">HL7 v2</option>
              <option value="ccda">C-CDA</option>
              <option value="json">JSON</option>
              <option value="xml">XML</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label htmlFor="sourceData" className="form-label">Source Data</label>
            <textarea
              id="sourceData"
              className="form-control"
              rows="10"
              value={sourceData}
              onChange={(e) => setSourceData(e.target.value)}
              disabled={loading}
              placeholder={`Enter ${sourceFormat} data to convert to FHIR...`}
            ></textarea>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !sourceData.trim()}
          >
            {loading ? 'Converting...' : 'Convert to FHIR'}
          </button>
        </form>
        
        {error && (
          <div className="alert alert-danger mt-4">
            <h4>Conversion Error</h4>
            <p>{error}</p>
          </div>
        )}
        
        {convertedData && (
          <div className="mt-4">
            <h4>Converted FHIR Data</h4>
            <div className="card">
              <div className="card-body">
                <pre className="converted-data">{JSON.stringify(convertedData, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FHIRConverter;
