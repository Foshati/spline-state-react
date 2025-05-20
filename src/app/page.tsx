/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useEffect, useRef } from 'react';
import Spline from '@splinetool/react-spline';
import type { Application } from '@splinetool/runtime';

export default function Home() {
    const splineRef = useRef<Application | null>(null);
    const [isAnimating, setIsAnimating] = useState(true);
    const animationRef = useRef<number | null>(null);
    const [position, setPosition] = useState({ x: -340, y: -545, z: -249 });
    const targetPositions = [
        { x: -340, y: -545, z: -249 },   // Starting position (from image 1)
        { x: 164.5, y: -111.5, z: -249 } // Movement position (from image 2)
    ];
    const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
    const speed = 0.05; // Animation speed factor

    // Handle the Spline scene load
    const onLoad = (splineApp: Application) => {
        splineRef.current = splineApp;
        console.log('Spline scene loaded');

        // Get the cone object after scene is loaded
        const cone = splineApp.findObjectByName('Cone');
        if (cone) {
            console.log('Found Cone object:', cone);
        } else {
            console.error('Could not find Cone object in the scene');
        }
    };

    // Animation loop function
    const animateCone = () => {
        if (!splineRef.current) return;

        const cone = splineRef.current.findObjectByName('Cone');
        if (!cone) return;

        const targetPosition = targetPositions[currentTargetIndex];

        // Calculate new position with smooth interpolation
        const newX = position.x + (targetPosition.x - position.x) * speed;
        const newY = position.y + (targetPosition.y - position.y) * speed;
        const newZ = position.z + (targetPosition.z - position.z) * speed;

        // Update position
        setPosition({ x: newX, y: newY, z: newZ });

        // Apply the new position to the cone
        cone.position.x = newX;
        cone.position.y = newY;
        cone.position.z = newZ;

        // Check if we're close enough to the target to switch to the next target
        const distance = Math.sqrt(
            Math.pow(targetPosition.x - newX, 2) +
            Math.pow(targetPosition.y - newY, 2) +
            Math.pow(targetPosition.z - newZ, 2)
        );

        if (distance < 5) {
            // Switch to the next target position
            setCurrentTargetIndex((prevIndex) => (prevIndex + 1) % targetPositions.length);
        }

        // Continue the animation loop
        animationRef.current = requestAnimationFrame(animateCone);
    };

    // Set up and clean up the animation loop
    useEffect(() => {
        if (isAnimating) {
            animationRef.current = requestAnimationFrame(animateCone);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isAnimating, currentTargetIndex, position]);

    // UI controls for animation
    const toggleAnimation = () => {
        setIsAnimating(!isAnimating);
    };

    return (
        <main className="relative w-full h-screen">
            <Spline
                scene="https://prod.spline.design/tJl0SE5c4ip1mNMB/scene.splinecode"
                onLoad={onLoad}
            />

            <div className="absolute bottom-4 left-4 bg-black/70 p-4 rounded-lg text-white">
                <button
                    onClick={toggleAnimation}
                    className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
                >
                    {isAnimating ? 'Pause Animation' : 'Start Animation'}
                </button>
            </div>
        </main>
    );
}