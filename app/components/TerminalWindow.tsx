"use client";

import React, { useEffect, useRef, useState } from "react";

const TERMINAL_WIDTH = 500;
const TERMINAL_HEIGHT = 300;
const MARGIN = 40; // initial margin from right/bottom when placed

export default function TerminalWindow({ onClose, initialLeft, initialTop }: { onClose: () => void; initialLeft?: number | null; initialTop?: number | null }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLElement | null>(null);

  const [pos, setPos] = useState({ left: 0, top: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  // Compute initial position on mount relative to parent container
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const parent = el.parentElement as HTMLElement | null;
    containerRef.current = parent;

    const containerRect = parent ? parent.getBoundingClientRect() : document.body.getBoundingClientRect();

    // If parent passed explicit initial position (from MonitorScreen), use it (and clamp)
    if (typeof initialLeft === "number" && typeof initialTop === "number") {
      const clampedLeft = Math.max(0, Math.min(initialLeft, containerRect.width - TERMINAL_WIDTH));
      const clampedTop = Math.max(0, Math.min(initialTop, containerRect.height - TERMINAL_HEIGHT));
      setPos({ left: clampedLeft, top: clampedTop });
    } else {
      const computedLeft = Math.max(0, containerRect.width - TERMINAL_WIDTH - MARGIN);
      const computedTop = Math.max(0, containerRect.height - TERMINAL_HEIGHT - MARGIN);
      setPos({ left: computedLeft, top: computedTop });
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!draggingRef.current) return;
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();

      let newLeft = e.clientX - containerRect.left - offsetRef.current.x;
      let newTop = e.clientY - containerRect.top - offsetRef.current.y;

      // constrain within container bounds
      newLeft = Math.max(0, Math.min(newLeft, containerRect.width - TERMINAL_WIDTH));
      newTop = Math.max(0, Math.min(newTop, containerRect.height - TERMINAL_HEIGHT));

      setPos({ left: newLeft, top: newTop });
    }

    function onMouseUp() {
      draggingRef.current = false;
      document.body.style.userSelect = "";
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  function handleTopbarMouseDown(e: React.MouseEvent) {
    const el = rootRef.current;
    if (!el) return;

    const container = containerRef.current ?? (el.parentElement as HTMLElement | null);
    const containerRect = container ? container.getBoundingClientRect() : document.body.getBoundingClientRect();

    draggingRef.current = true;
    // store click offset within terminal
    offsetRef.current = {
      x: e.clientX - containerRect.left - pos.left,
      y: e.clientY - containerRect.top - pos.top,
    };

    // prevent text selection while dragging
    document.body.style.userSelect = "none";
  }

  return (
    <div
      ref={rootRef}
      style={{
        position: "absolute",
        left: isInitialized ? pos.left : undefined,
        top: isInitialized ? pos.top : undefined,
        width: `${TERMINAL_WIDTH}px`,
        height: `${TERMINAL_HEIGHT}px`,
        backgroundColor: "#1f1f1f",
        border: "1px solid #444",
        borderRadius: "6px",
        color: "white",
        boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
        userSelect: "none",
        zIndex: 60,
      }}
    >
      {/* TOPBAR */}
      <div
        onMouseDown={handleTopbarMouseDown}
        style={{
          width: "100%",
          height: "32px",
          backgroundColor: "#2b2b2b",
          borderTopLeftRadius: "6px",
          borderTopRightRadius: "6px",
          display: "flex",
          alignItems: "center",
          padding: "0 10px",
          cursor: "grab",
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            backgroundColor: "#ff5f56",
            borderRadius: "50%",
            marginRight: "6px",
            cursor: "pointer",
          }}
          onClick={onClose}
        />

        <div
          style={{
            width: "12px",
            height: "12px",
            backgroundColor: "#ffbd2e",
            borderRadius: "50%",
            marginRight: "6px",
            cursor: "pointer",
          }}
          onClick={onClose}
        />

        <div
          style={{
            width: "12px",
            height: "12px",
            backgroundColor: "#27c93f",
            borderRadius: "50%",
            cursor: "pointer",
          }}
          onClick={onClose}
        />
      </div>

      {/* Terminal inner content placeholder */}
      <div style={{ padding: "10px" }}>Terminal goes here...</div>
    </div>
  );
}
