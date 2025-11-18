"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import terminalIcon from "@/public/icons/terminal.png"; 
import TerminalWindow from "./TerminalWindow";

export default function MonitorScreen() {
    const [showTerminal, setShowTerminal] = useState(false);
    const [terminalPos, setTerminalPos] = useState<{ left: number; top: number } | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    return (
        <div
            ref={containerRef}
        style={{
            width: "100%",
            height: "100%",
            backgroundImage: "url('/monitor_wallpaper.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
        }}
        >
        {/* Terminal Icon */}
        <div
            style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            width: "60px",
            textAlign: "center",
            cursor: "pointer",
            userSelect: "none",
            }}
            onClick={() => {
                // compute center position inside the monitor container
                const container = containerRef.current;
                const TERMINAL_WIDTH = 500;
                const TERMINAL_HEIGHT = 300;
                if (container) {
                    const rect = container.getBoundingClientRect();
                    const left = Math.max(0, Math.round((rect.width - TERMINAL_WIDTH) / 2));
                    const top = Math.max(0, Math.round((rect.height - TERMINAL_HEIGHT) / 2));
                    setTerminalPos({ left, top });
                } else {
                    setTerminalPos(null);
                }
                setShowTerminal(true);
            }}
        >
            <Image src={terminalIcon} alt="Terminal Icon" width={60} height={60} />
            <p style={{ color: "white", fontSize: "12px", marginTop: "5px" }}>
            Terminal
            </p>
        </div>
        {/* TERMINAL WINDOW */}
            {showTerminal && (
                <TerminalWindow
                    onClose={() => setShowTerminal(false)}
                    initialLeft={terminalPos?.left}
                    initialTop={terminalPos?.top}
                />
            )}

        </div>
    );
}
