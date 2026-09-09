// PRIME System — Value formatters & display helpers

export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';

  const defaultOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };

  return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
};

export const formatShortDate = (dateString) => {
  return formatDate(dateString, { month: 'short', day: 'numeric', hour: undefined, minute: undefined, year: undefined });
};

export const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export const formatNumber = (num, decimals = 1) => {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  return Number(num).toFixed(decimals);
};

export const formatNutrientValue = (val, type) => {
  if (val === null || val === undefined || isNaN(val)) return 'N/A';
  const num = Number(val).toFixed(1);
  switch (type?.toLowerCase()) {
    case 'nitrogen':
    case 'n':
    case 'phosphorus':
    case 'p':
    case 'potassium':
    case 'k':
      return `${num} mg/kg`;
    case 'ph':
      return num;
    case 'moisture':
      return `${num}%`;
    case 'temperature':
      return `${num}°C`;
    case 'ec':
      return `${num} dS/m`;
    default:
      return num;
  }
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatRole = (role) => {
  if (!role) return '';
  if (role === 'admin') return 'Administrator';
  if (role === 'farmer') return 'Farmer';
  return capitalize(role);
};
