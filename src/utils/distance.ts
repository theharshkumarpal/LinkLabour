export const calculateDistance = (lat1?: number, lon1?: number, lat2?: number, lon2?: number): number | undefined => {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return undefined;
  }
  const R = 3958.8; // Radius of the earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;  
  const dLon = (lon2 - lon1) * Math.PI / 180; 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in miles
  return Number(d.toFixed(1));
};
