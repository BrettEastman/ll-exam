import StaffNotation from "../components/notation/StaffNotation";

export default function Home() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>LydianLab Music Theory Exam - VexFlow Demo</h1>
      <StaffNotation />
      
      <div style={{ marginTop: '40px' }}>
        <h2>Bass Clef Example</h2>
        <StaffNotation clef="bass" />
      </div>
    </div>
  );
}
