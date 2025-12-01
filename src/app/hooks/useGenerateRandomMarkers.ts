import { useEffect } from 'react';

import { useLocationStore } from '@/store';

const useGenerateRandomMarkers = (setMarkers: any) => {
  const { userLatitude, userLongitude } = useLocationStore();

  useEffect(() => {
    if (!userLatitude || !userLongitude) return;

    const types = ['bike', 'auto', 'cab'];
    const newMarkers = Array.from({ length: 20 }, (_, index) => {
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomRotation = Math.floor(Math.random() * 360);

      return {
        id: index,
        latitude: userLatitude + (Math.random() - 0.5) * 0.01,
        longitude: userLongitude + (Math.random() - 0.5) * 0.01,
        type: randomType,
        rotation: randomRotation,
        visible: true,
      };
    });

    setMarkers(newMarkers);
  }, [userLatitude, userLongitude, setMarkers]);
};

export default useGenerateRandomMarkers;
