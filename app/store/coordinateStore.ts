import { create } from 'zustand';

interface Coordinate {
    latitude: number;
    longitude: number;
}

interface CoordinateStore {
    fieldCoords: Coordinate[];
    swCorner: Coordinate;
    neCorner: Coordinate;
    pointsOfInterest: Coordinate[];
    setFieldCoords: (coords: Coordinate[]) => void;
    setCorners: (swCorner: Coordinate, neCorner: Coordinate) => void
    setPointsOfInterest: (points: Coordinate[]) => void;
}

export const useCoordinateStore = create<CoordinateStore>((set) => ({
    fieldCoords: [
        { latitude: 50.0653, longitude: 19.94544 },
        { latitude: 50.0635, longitude: 19.94544 },
        { latitude: 50.0653, longitude: 19.94376 },
        { latitude: 50.0635, longitude: 19.94376 }
    ],
    swCorner: { latitude: 0, longitude: 0 },
    neCorner: { latitude: 0, longitude: 0 },
    pointsOfInterest: [
        { latitude: 50.0643, longitude: 19.94444 }
    ],
    setFieldCoords: (coords) => set({ fieldCoords: coords }),
    setCorners: (swCorner, neCorner) => set({ swCorner: swCorner, neCorner: neCorner }),
    setPointsOfInterest: (points) => set({ pointsOfInterest: points })
}));
