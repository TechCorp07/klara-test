// src/app/(dashboard)/patient/family-history/add/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, AlertTriangle } from 'lucide-react';

interface FamilyMember {
  name: string;
  relationship: string;
  age: string;
  gender: 'male' | 'female' | 'other' | '';
  is_alive: boolean;
  age_at_death: string;
  cause_of_death: string;
  medical_conditions: string[];
  medications: string[];
  rare_diseases: string[];
  genetic_testing: string;
  lifestyle_factors: string[];
  notes: string;
}

export default function AddFamilyMemberPage() {
  const router = useRouter();
  const [member, setMember] = useState<FamilyMember>({
    name: '',
    relationship: '',
    age: '',
    gender: '',
    is_alive: true,
    age_at_death: '',
    cause_of_death: '',
    medical_conditions: [],
    medications: [],
    rare_diseases: [],
    genetic_testing: '',
    lifestyle_factors: [],
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const relationships = [
    'Mother', 'Father', 'Sister', 'Brother', 'Daughter', 'Son',
    'Grandmother (Maternal)', 'Grandfather (Maternal)',
    'Grandmother (Paternal)', 'Grandfather (Paternal)',
    'Aunt (Maternal)', 'Uncle (Maternal)',
    'Aunt (Paternal)', 'Uncle (Paternal)',
    'Cousin', 'Half-Sister', 'Half-Brother', 'Other'
  ];

  const commonConditions = [
    'Heart Disease', 'Diabetes', 'High Blood Pressure', 'Cancer',
    'Alzheimer\'s Disease', 'Stroke', 'Asthma', 'Depression',
    'Arthritis', 'Osteoporosis', 'Kidney Disease', 'Liver Disease'
  ];

  const rareDiseasesOptions = [
    'Huntington\'s Disease', 'Cystic Fibrosis', 'Sickle Cell Disease',
    'Hemophilia', 'Muscular Dystrophy', 'Multiple Sclerosis',
    'Crohn\'s Disease', 'Lupus', 'Fibromyalgia', 'Rare Cancers',
    'Genetic Syndromes', 'Metabolic Disorders'
  ];

  const lifestyleOptions = [
    'Smoking', 'Alcohol Use', 'Drug Use', 'Sedentary Lifestyle',
    'Regular Exercise', 'Healthy Diet', 'Stress', 'Environmental Exposure'
  ];

  const handleArrayFieldChange = (field: keyof FamilyMember, value: string, checked: boolean) => {
    const currentArray = member[field] as string[];
    if (checked) {
      setMember({
        ...member,
        [field]: [...currentArray, value]
      });
    } else {
      setMember({
        ...member,
        [field]: currentArray.filter(item => item !== value)
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Family member added successfully!');
      router.push('/patient?tab=health');
    } catch (error) {
      console.error('Failed to add family member:', error);
      alert('Failed to add family member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Add Family Member</h1>
            </div>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-amber-600 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-900 mb-1">Important for Rare Disease Research</h3>
                <p className="text-sm text-amber-800">
                  Family medical history is crucial for understanding genetic patterns in rare diseases. 
                  This information helps researchers and your care team better understand your condition.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name or Identifier
                  </label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => setMember({...member, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Mom, Maternal Grandmother"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship *
                  </label>
                  <select
                    value={member.relationship}
                    onChange={(e) => setMember({...member, relationship: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select relationship</option>
                    {relationships.map(rel => (
                      <option key={rel} value={rel}>{rel}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={member.gender}
                    onChange={(e) => setMember({...member, gender: e.target.value as 'male' | 'female'})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Age
                  </label>
                  <input
                    type="number"
                    value={member.age}
                    onChange={(e) => setMember({...member, age: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    disabled={!member.is_alive}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={member.is_alive}
                    onChange={(e) => setMember({...member, is_alive: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm">This person is alive</span>
                </label>
              </div>

              {!member.is_alive && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age at Death
                    </label>
                    <input
                      type="number"
                      value={member.age_at_death}
                      onChange={(e) => setMember({...member, age_at_death: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cause of Death
                    </label>
                    <input
                      type="text"
                      value={member.cause_of_death}
                      onChange={(e) => setMember({...member, cause_of_death: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Medical Conditions */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Conditions</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonConditions.map((condition) => (
                  <label key={condition} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={member.medical_conditions.includes(condition)}
                      onChange={(e) => handleArrayFieldChange('medical_conditions', condition, e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">{condition}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rare Diseases */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Rare Diseases</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {rareDiseasesOptions.map((disease) => (
                  <label key={disease} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={member.rare_diseases.includes(disease)}
                      onChange={(e) => handleArrayFieldChange('rare_diseases', disease, e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">{disease}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Genetic Testing */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Genetic Testing</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genetic Testing Results
                </label>
                <textarea
                  value={member.genetic_testing}
                  onChange={(e) => setMember({...member, genetic_testing: e.target.value})}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Include any genetic testing results, carrier status, or genetic counseling information..."
                />
              </div>
            </div>

            {/* Lifestyle Factors */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Lifestyle Factors</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {lifestyleOptions.map((factor) => (
                  <label key={factor} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={member.lifestyle_factors.includes(factor)}
                      onChange={(e) => handleArrayFieldChange('lifestyle_factors', factor, e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">{factor}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information
                </label>
                <textarea
                  value={member.notes}
                  onChange={(e) => setMember({...member, notes: e.target.value})}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Any additional medical history, family patterns, or other relevant information..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !member.relationship}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Family Member'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}