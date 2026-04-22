export const formatTransactionDateTime = (dateValue: string | Date) => {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};
