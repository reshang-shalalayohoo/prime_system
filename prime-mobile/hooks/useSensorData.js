import { useState, useEffect, useCallback } from 'react';
import sensorService from '../services/sensor.service';
import { useSocket } from './useSocket';

export const useSensorData = (fieldId = 'FIELD_001') => {
  const [latestData, setLatestData] = useState(null);
  const [history, setHistory] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { socket, isConnected } = useSocket(fieldId);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [latestRes, historyRes, assessRes] = await Promise.allSettled([
        sensorService.getLatestReading(),
        sensorService.getHistory({ limit: 20 }),
        sensorService.getLatestAssessment(),
      ]);

      if (latestRes.status === 'fulfilled') {
        setLatestData(latestRes.value?.data || latestRes.value);
      }
      if (historyRes.status === 'fulfilled') {
        setHistory(historyRes.value?.data || historyRes.value || []);
      }
      if (assessRes.status === 'fulfilled') {
        setAssessment(assessRes.value?.data || assessRes.value);
      }
    } catch (err) {
      console.error('Failed to fetch sensor data:', err);
      setError(err.message || 'Failed to load sensor data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Subscribe to real-time updates via Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleSensorUpdate = (newData) => {
      setLatestData(newData);
      setHistory((prev) => [newData, ...prev.slice(0, 19)]);
    };

    const handleAssessmentUpdate = (newAssessment) => {
      setAssessment(newAssessment);
    };

    socket.on('sensor-update', handleSensorUpdate);
    socket.on('assessment-update', handleAssessmentUpdate);

    return () => {
      socket.off('sensor-update', handleSensorUpdate);
      socket.off('assessment-update', handleAssessmentUpdate);
    };
  }, [socket]);

  return {
    latestData,
    history,
    assessment,
    loading,
    error,
    refetch: fetchData,
    isConnected,
  };
};
