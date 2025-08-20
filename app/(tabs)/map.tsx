import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MapWithUser from "../../components/MapWithUser"; // wrapper around InfiniteGridMap
import { useCoordinateStore } from "../store/coordinateStore";

const MapScreen = () => {
  // Pull from store
  const swCor = useCoordinateStore((state) => state.swCorner);
  const neCor = useCoordinateStore((state) => state.neCorner);
  const pointsOfInterest = useCoordinateStore((state) => state.pointsOfInterest);

  // Example: construct shape polygon from store corners
  const shape = swCor && neCor
    ? [
      swCor,
      { latitude: swCor.latitude, longitude: neCor.longitude },
      neCor,
      { latitude: neCor.latitude, longitude: swCor.longitude },
    ]
    : [];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MapWithUser
        autoCenter={true}                // auto follow the user
        points={pointsOfInterest}        // red POI dots
        shape={shape}                    // blue polygon outline
      />
    </GestureHandlerRootView>
  );
};

export default MapScreen;
