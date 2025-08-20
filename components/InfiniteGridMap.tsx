import React, { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Canvas from "react-native-canvas";
import { GestureHandlerRootView, PanGestureHandler, PinchGestureHandler } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");

interface Coordinate {
    latitude: number;
    longitude: number;
}

interface InfiniteGridMapProps {
    userLocation?: { latitude: number; longitude: number; heading: number };
    points?: Coordinate[];
    shape?: Coordinate[];
    autoCenter?: boolean;
}

export default function InfiniteGridMap({
    userLocation,
    points = [],
    shape = [],
    autoCenter = true,
}: InfiniteGridMapProps) {
    const canvasRef = useRef<Canvas | null>(null);
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    // Draw everything safely
    const drawMap = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = await canvas.getContext("2d");
        if (!ctx) return;

        const cw = canvas.width;
        const ch = canvas.height;

        ctx.clearRect(0, 0, cw, ch);

        // Draw grid
        ctx.strokeStyle = "#ccc";
        ctx.lineWidth = 0.5;
        const spacing = 50 * scale;
        for (let x = -offset.x % spacing; x < cw; x += spacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, ch);
            ctx.stroke();
        }
        for (let y = -offset.y % spacing; y < ch; y += spacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(cw, y);
            ctx.stroke();
        }

        // Draw shape (safe)
        if (shape.length >= 2) {
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 2;
            ctx.beginPath();
            shape.forEach((p, i) => {
                const px = cw / 2 + (p.longitude - (userLocation?.longitude ?? 0)) * 1000 * scale;
                const py = ch / 2 - (p.latitude - (userLocation?.latitude ?? 0)) * 1000 * scale;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            });
            ctx.stroke();
        }

        // Draw points
        points.forEach((p) => {
            const px = cw / 2 + (p.longitude - (userLocation?.longitude ?? 0)) * 1000 * scale;
            const py = ch / 2 - (p.latitude - (userLocation?.latitude ?? 0)) * 1000 * scale;
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(px, py, 2 * scale, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Draw user location
        if (userLocation) {
            const px = cw / 2;
            const py = ch / 2;
            ctx.fillStyle = "green";
            ctx.beginPath();
            ctx.arc(px, py, 5 * scale, 0, 2 * Math.PI);
            ctx.fill();

            // Draw heading arrow safely
            if (!isNaN(userLocation.heading)) {
                ctx.save();
                ctx.translate(px, py);
                ctx.rotate((userLocation.heading * Math.PI) / 180);
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, -15 * scale);
                ctx.stroke();
                ctx.restore();
            }
        }
    };

    useEffect(() => {
        drawMap();
    }, [userLocation, points, shape, scale, offset]);

    // Pan & pinch gestures
    const onPinch = (event: any) => setScale(Math.max(0.1, event.nativeEvent.scale));
    const onPan = (event: any) => {
        if (!event.nativeEvent.translationX || !event.nativeEvent.translationY) return;
        setOffset({ x: offset.x + event.nativeEvent.translationX, y: offset.y + event.nativeEvent.translationY });
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <PanGestureHandler onGestureEvent={onPan}>
                <PinchGestureHandler onGestureEvent={onPinch}>
                    <View style={styles.container}>
                        <Canvas ref={canvasRef} style={styles.canvas} />
                    </View>
                </PinchGestureHandler>
            </PanGestureHandler>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    canvas: { flex: 1, width: "100%", height: "100%" },
});
