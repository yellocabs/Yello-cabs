import { CommonActions } from '@react-navigation/native';
import { navigationRef } from '../navigation'; // adjust path as needed

export const resetAndNavigate = (routeName: string) => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: routeName }],
      })
    );
  }
};
