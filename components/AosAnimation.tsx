"use client";

import { useEffect } from 'react';
import AOS from 'aos';

export default function AosAnimation() {
    useEffect(() => {
        AOS.init({
        duration: 800,
        once: true,
        });
    }, []);

    return (
        <div data-aos="fade-up">
        <h2 className="text-2xl font-bold">Animated with AOS</h2>
        <p>This content will fade up when it enters the viewport.</p>
        </div>
    );
    };