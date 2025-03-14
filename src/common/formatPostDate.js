export const formatPostDate = (date) => {
  const postDate = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now - postDate) / 1000);
  
  // Less than a minute
  if (diffInSeconds < 60) {
    return 'few seconds ago';
  }
  
  // Less than an hour
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}min ago`;
  }
  
  // Less than a day
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  // Less than a week
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  // Less than a month
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInDays < 30) {
    return `${diffInWeeks}w ago`;
  }
  
  // Less than a year
  const diffInMonths = Math.floor(diffInDays / 30.44); // Using average month length
  if (diffInDays < 365) {
    return `${diffInMonths}mo ago`;
  }
  
  // More than a year
  return postDate.toLocaleDateString("en-us", {
    day: "numeric",
    year: "numeric",
    month: "short",
  });
};
