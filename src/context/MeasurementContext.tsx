import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Measurement } from '../types';
import { mockMeasurements } from '../utils/mockData';

interface MeasurementContextType {
  measurements: Measurement[];
  addMeasurement: (measurement: Measurement) => void;
  getMeasurementById: (id: string) => Measurement | undefined;
  getLatestMeasurement: () => Measurement | undefined;
}

const MeasurementContext = createContext<MeasurementContextType | undefined>(undefined);

export const MeasurementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [measurements, setMeasurements] = useState<Measurement[]>(mockMeasurements);

  const addMeasurement = (measurement: Measurement) => {
    setMeasurements((prevMeasurements) => [...prevMeasurements, measurement]);
  };

  const getMeasurementById = (id: string) => {
    return measurements.find((m) => m.id === id);
  };

  const getLatestMeasurement = () => {
    if (measurements.length === 0) return undefined;
    
    // Sort by date and get the most recent
    return [...measurements].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  };

  return (
    <MeasurementContext.Provider 
      value={{ 
        measurements, 
        addMeasurement, 
        getMeasurementById, 
        getLatestMeasurement 
      }}
    >
      {children}
    </MeasurementContext.Provider>
  );
};

export const useMeasurements = (): MeasurementContextType => {
  const context = useContext(MeasurementContext);
  if (context === undefined) {
    throw new Error('useMeasurements must be used within a MeasurementProvider');
  }
  return context;
};