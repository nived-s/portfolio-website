"use client";

import React, { useEffect, useRef, useState } from "react";
import { runCommand, COMMANDS } from "./terminalCommands";

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

  // New interactive terminal state and logic
  type Line = { kind: "output" | "input"; text: string };

  const [lines, setLines] = useState<Line[]>([
    { kind: "output", text: "Welcome to the portfolio terminal. Type 'help' to see available commands." },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const historyIndexRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom whenever lines change
  useEffect(() => {
    const el = contentRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [lines]);

  // focus input when terminal mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Command runner is imported from ./terminalCommands and used below

  function pushOutputLines(outLines: string[]) {
    setLines((prev) => {
      const toAdd = outLines.flatMap((s) => (s === "__CLEAR__" ? [] : s.split("\n")));
      return [...prev, ...toAdd.map((t) => ({ kind: "output" as const, text: t }))];
    });
  }

  async function handleSubmitCommand() {
    const cmdText = input;
    // push the input line
    setLines((prev) => [...prev, { kind: "input", text: cmdText }]);
    setHistory((prev) => [...prev, cmdText]);
    historyIndexRef.current = null;
    setInput(""); // clear prompt immediately
    inputRef.current?.blur();

    const result = await runCommand(cmdText);

    // handle clear specially
    if (result.length === 1 && result[0] === "__CLEAR__") {
      setLines([]);
      // keep welcome line
      setLines([{ kind: "output", text: "Welcome to the portfolio terminal. Type 'help' to see available commands." }]);
    } else {
      pushOutputLines(result);
    }

    // refocus input
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmitCommand();
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHistoryNavigation(-1);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHistoryNavigation(1);
      return;
    }

    if (e.key === "Tab") {
      // prevent default focus change; simple tab-complete for known commands
      e.preventDefault();
      const candidates = COMMANDS.filter((c) => c.startsWith(input));
      if (candidates.length === 1) {
        setInput(candidates[0] + (input.endsWith(" ") ? "" : " "));
      } else if (candidates.length > 1) {
        pushOutputLines(["Possible completions: " + candidates.join("  ")]);
      }
    }
  }

  function setHistoryNavigation(delta: number) {
    setHistory((hist) => {
      if (hist.length === 0) return hist;
      let idx = historyIndexRef.current;
      if (idx === null) {
        idx = hist.length;
      }
      idx = Math.max(0, Math.min(hist.length - 1, idx + delta));
      historyIndexRef.current = idx;
      setInput(hist[idx] ?? "");
      return hist;
    });
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
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
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

      {/* Terminal content */}
      <div
        ref={contentRef}
        style={{
          flex: 1,
          padding: "10px",
          fontFamily: "Menlo, Monaco, monospace",
          fontSize: "12px",
          lineHeight: "1.4",
          overflowY: "auto",
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((l, i) => (
          <div key={i} style={{ whiteSpace: "pre-wrap", color: l.kind === "input" ? "#9cdcfe" : "#d4d4d4", marginBottom: 4 }}>
            {l.kind === "input" ? (
              <span>
                <span style={{ color: "#6ee7b7" }}>guest@portfolio:~$</span> {l.text}
              </span>
            ) : (
              <span>{l.text}</span>
            )}
          </div>
        ))}

        {/* current prompt */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ color: "#6ee7b7", marginRight: 8 }}>guest@portfolio:~$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "white",
              flex: 1,
              fontFamily: "inherit",
              fontSize: "12px",
            }}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
          {/* caret simulation when input is focused */}
          <div
            style={{
              width: 8,
              height: 16,
              marginLeft: 4,
              background: inputRef.current === document.activeElement && input === "" ? "rgba(255,255,255,0.7)" : "transparent",
              animation: inputRef.current === document.activeElement && input === "" ? "blink 1s step-end infinite" : undefined,
            }}
          />
        </div>
      </div>
      {/* simple styles for blink */}
      <style>{`@keyframes blink { from { opacity: 1 } to { opacity: 0 } }`}</style>
    </div>
  );
}
