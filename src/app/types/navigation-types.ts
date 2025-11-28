export type RootStackParamList = {
  Auth: undefined;
  Home: { expand?: boolean } | undefined;
  FindRide: undefined;
  BookRide: undefined;
  ConfirmRides: undefined;
  RideDetails: { id: string };
  Login: undefined;

  Rider: {
    screen: string;
    params?: object;
  };
};
