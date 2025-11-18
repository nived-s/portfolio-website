import MonitorScreen from "./components/MonitorScreen";

export default function Home() {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: "url('/bg_desk.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/*  monitor screen div here */}
      <div
        style={{
          position: "absolute",
          top: "4.5%",
          left: "26%",
          width: "48%",
          height: "53%",
          backgroundColor: "rgba(0, 0, 0, 0.8)", // temporary highlight
          backdropFilter: "blur(4px)",
        }}
      >
      <MonitorScreen />
      </div>
      
    </main>
  );
}
