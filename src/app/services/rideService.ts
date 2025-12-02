export const createRide = async (ride: any) => {
  console.log("Creating ride with the following data:", ride);
  // a mock api call
  return new Promise(resolve => setTimeout(resolve, 1000));
};
