// Minimal test component
export default function App() {
  console.log("AppTest component rendering");
  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Arial",
        backgroundColor: "#111",
        color: "#0ea5e9",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
        ✅ Campus Nexus Running!
      </h1>
      <p style={{ fontSize: "18px", marginBottom: "10px" }}>
        ✅ React is working correctly
      </p>
      <p style={{ fontSize: "18px", marginBottom: "10px" }}>
        ✅ Backend: http://localhost:5001
      </p>
      <p style={{ fontSize: "18px", marginBottom: "10px" }}>
        ✅ Frontend: http://localhost:5173
      </p>
    </div>
  );
}
