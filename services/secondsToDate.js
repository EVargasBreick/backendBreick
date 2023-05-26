function secondsToDate(seconds) {
  const milliseconds = seconds * 1000; // Convert seconds to milliseconds
  const expirationDate = new Date(Date.now() + milliseconds);
  const formattedDate = expirationDate.toISOString(); // Convert to ISO 8601 format
  return formattedDate;
}
module.exports = secondsToDate;
