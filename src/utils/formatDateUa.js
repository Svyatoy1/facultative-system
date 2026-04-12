function formatDateUa(value) {
  if (!value) {
    return '';
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const parts = new Intl.DateTimeFormat('uk-UA', {
    timeZone: 'Europe/Kyiv',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).formatToParts(date);

  const get = (type) => parts.find((part) => part.type === type)?.value || '';

  return `${get('day')} ${get('month')} ${get('year')} р. ${get('hour')}:${get('minute')}:${get('second')}`;
}

module.exports = formatDateUa;