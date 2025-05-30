import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useMeasurements } from '../context/MeasurementContext';
import { Measurement } from '../types';
import { calculateBMI } from '../utils/healthCalculations';
import { v4 as uuidv4 } from 'uuid';
import { Save, X } from 'lucide-react';

const DataEntry: React.FC = () => {
  const { user } = useUser();
  const { addMeasurement } = useMeasurements();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<Partial<Measurement>>({
    weight: 0,
    bodyFatMass: 0,
    bodyFatPercentage: 0,
    skeletalMuscleMass: 0,
    visceralFat: 0,
    waterPercentage: 0,
    basalMetabolicRate: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          User Profile Required
        </h2>
        <p className="text-gray-600 mb-6">
          Please complete your profile before adding measurements.
        </p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = parseFloat(value);
    
    setFormData({
      ...formData,
      [name]: numberValue,
    });
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!formData.weight || formData.weight <= 0) {
      newErrors.weight = 'Weight is required and must be greater than 0';
    }
    
    if (!formData.bodyFatPercentage || formData.bodyFatPercentage < 0) {
      newErrors.bodyFatPercentage = 'Body fat percentage is required and must be non-negative';
    }
    
    if (!formData.skeletalMuscleMass || formData.skeletalMuscleMass <= 0) {
      newErrors.skeletalMuscleMass = 'Skeletal muscle mass is required and must be greater than 0';
    }
    
    // Range validations
    if (formData.bodyFatPercentage && (formData.bodyFatPercentage < 0 || formData.bodyFatPercentage > 100)) {
      newErrors.bodyFatPercentage = 'Body fat percentage must be between 0 and 100';
    }
    
    if (formData.waterPercentage && (formData.waterPercentage < 0 || formData.waterPercentage > 100)) {
      newErrors.waterPercentage = 'Water percentage must be between 0 and 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    if (!validateForm()) {
      return;
    }
    
    // Calculate derived values
    const bmi = calculateBMI(formData.weight!, user.height);
    const bodyFatMass = formData.weight! * (formData.bodyFatPercentage! / 100);
    
    // Create new measurement
    const newMeasurement: Measurement = {
      id: uuidv4(),
      userId: user.id,
      date: new Date(),
      weight: formData.weight!,
      bodyFatMass: bodyFatMass,
      bodyFatPercentage: formData.bodyFatPercentage!,
      skeletalMuscleMass: formData.skeletalMuscleMass!,
      bmi: bmi,
      pbf: formData.bodyFatPercentage!, // Same as bodyFatPercentage
      visceralFat: formData.visceralFat || 0,
      waterPercentage: formData.waterPercentage || 0,
      basalMetabolicRate: formData.basalMetabolicRate || 0,
      metabolicAge: formData.metabolicAge,
    };
    
    // Add measurement to context
    addMeasurement(newMeasurement);
    
    // Navigate to dashboard
    navigate('/');
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Measurement</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-card p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Weight */}
            <div className="mb-4">
              <label htmlFor="weight" className="label">
                Weight (kg) *
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight || ''}
                onChange={handleChange}
                className={`input ${errors.weight ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                step="0.1"
                required
              />
              {errors.weight && <p className="mt-1 text-sm text-error-500">{errors.weight}</p>}
            </div>

            {/* Body Fat Percentage */}
            <div className="mb-4">
              <label htmlFor="bodyFatPercentage" className="label">
                Body Fat Percentage (%) *
              </label>
              <input
                type="number"
                id="bodyFatPercentage"
                name="bodyFatPercentage"
                value={formData.bodyFatPercentage || ''}
                onChange={handleChange}
                className={`input ${errors.bodyFatPercentage ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                step="0.1"
                min="0"
                max="100"
                required
              />
              {errors.bodyFatPercentage && <p className="mt-1 text-sm text-error-500">{errors.bodyFatPercentage}</p>}
            </div>

            {/* Skeletal Muscle Mass */}
            <div className="mb-4">
              <label htmlFor="skeletalMuscleMass" className="label">
                Skeletal Muscle Mass (kg) *
              </label>
              <input
                type="number"
                id="skeletalMuscleMass"
                name="skeletalMuscleMass"
                value={formData.skeletalMuscleMass || ''}
                onChange={handleChange}
                className={`input ${errors.skeletalMuscleMass ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                step="0.1"
                required
              />
              {errors.skeletalMuscleMass && <p className="mt-1 text-sm text-error-500">{errors.skeletalMuscleMass}</p>}
            </div>

            {/* Visceral Fat */}
            <div className="mb-4">
              <label htmlFor="visceralFat" className="label">
                Visceral Fat Level
              </label>
              <input
                type="number"
                id="visceralFat"
                name="visceralFat"
                value={formData.visceralFat || ''}
                onChange={handleChange}
                className="input"
                step="1"
                min="1"
                max="30"
              />
            </div>

            {/* Water Percentage */}
            <div className="mb-4">
              <label htmlFor="waterPercentage" className="label">
                Body Water Percentage (%)
              </label>
              <input
                type="number"
                id="waterPercentage"
                name="waterPercentage"
                value={formData.waterPercentage || ''}
                onChange={handleChange}
                className={`input ${errors.waterPercentage ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                step="0.1"
                min="0"
                max="100"
              />
              {errors.waterPercentage && <p className="mt-1 text-sm text-error-500">{errors.waterPercentage}</p>}
            </div>

            {/* Basal Metabolic Rate */}
            <div className="mb-4">
              <label htmlFor="basalMetabolicRate" className="label">
                Basal Metabolic Rate (kcal)
              </label>
              <input
                type="number"
                id="basalMetabolicRate"
                name="basalMetabolicRate"
                value={formData.basalMetabolicRate || ''}
                onChange={handleChange}
                className="input"
                step="1"
              />
            </div>

            {/* Metabolic Age */}
            <div className="mb-4">
              <label htmlFor="metabolicAge" className="label">
                Metabolic Age (years)
              </label>
              <input
                type="number"
                id="metabolicAge"
                name="metabolicAge"
                value={formData.metabolicAge || ''}
                onChange={handleChange}
                className="input"
                step="1"
                min="1"
              />
            </div>
          </div>

          {formSubmitted && Object.keys(errors).length > 0 && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-md">
              <p className="text-error-700 font-medium">Please correct the errors above before submitting.</p>
            </div>
          )}

          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-outline flex items-center"
            >
              <X className="mr-2 h-5 w-5" />
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center"
            >
              <Save className="mr-2 h-5 w-5" />
              Save Measurement
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-100">
        <h3 className="text-lg font-medium text-blue-800 mb-2">
          How to Use InBody Measurements
        </h3>
        <p className="text-blue-700 mb-4">
          Enter the values from your InBody scan report in the form above. Required fields are marked with an asterisk (*).
        </p>
        <ul className="list-disc pl-5 text-blue-700 space-y-2">
          <li>Weight - Your total body weight in kilograms</li>
          <li>Body Fat Percentage - The percentage of your body weight that is fat</li>
          <li>Skeletal Muscle Mass - The weight of your skeletal muscles in kilograms</li>
          <li>Visceral Fat - A rating of the fat surrounding your internal organs</li>
          <li>Body Water Percentage - The percentage of your weight that is water</li>
        </ul>
      </div>
    </div>
  );
};

export default DataEntry;