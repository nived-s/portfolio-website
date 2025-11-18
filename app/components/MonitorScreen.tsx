"use client";

import Image from "next/image";
import terminalIcon from "@/public/icons/terminal.png"; 

export default function MonitorScreen() {
  return (
    <div
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
        onClick={() => alert("Terminal icon clicked!")}
      >
        <Image src={terminalIcon} alt="Terminal Icon" width={60} height={60} />
        <p style={{ color: "white", fontSize: "12px", marginTop: "5px" }}>
          Terminal
        </p>
      </div>
    </div>
  );
}
