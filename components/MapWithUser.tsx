import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";
import React, { useEffect, useState } from "react";
import InfiniteGridMap from "./InfiniteGridMap";

export default function MapWithUser(props) {
    const [userLocation, setUserLocation] = useState<
        { latitude: number; longitude: number; heading: number } | undefined
    >(undefined);

    useEffect(() => {
        let locSub: Location.LocationSubscription | null = null;
        let magSub: any = null;

        (async () => {
            try {
                // Ask for GPS permission
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") return;

                // Watch GPS
                locSub = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 1000,
                        distanceInterval: 1,
                    },
                    (pos) => {
                        setUserLocation((prev) => ({
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude,
                            heading: prev?.heading ?? 0,
                        }));
                    }
                );

                // Watch compass heading
                magSub = Magnetometer.addListener((data) => {
                    const { x, y } = data;
                    if (x === 0 && y === 0) return; // avoid NaN
                    let angle = Math.atan2(y, x) * (180 / Math.PI);
                    angle = angle >= 0 ? angle : angle + 360;
                    setUserLocation((prev) =>
                        prev
                            ? { ...prev, heading: angle }
                            : { latitude: 0, longitude: 0, heading: angle }
                    );
                });
                Magnetometer.setUpdateInterval(500);
            } catch (err) {
                console.error("Location/Magnetometer error:", err);
            }
        })();

        return () => {
            locSub?.remove();
            magSub?.remove();
        };
    }, []);

    // 🚨 Guard: don’t render InfiniteGridMap until we have at least lat/lng
    if (!userLocation) {
        return null; // or a <Loading/> component
    }

    return (
        <InfiniteGridMap
            userLocation={userLocation}
            points={props.points || []}
            shape={props.shape || []}
            autoCenter={props.autoCenter ?? true}
        />
    );
}
