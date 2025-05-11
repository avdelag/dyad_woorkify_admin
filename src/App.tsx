import { Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Componentes de página muy simples para prueba
const HomePage = () => <div><h1>Home Page</h1><Link to="/about">Go to About</Link></div>;
const AboutPage = () => <div><h1>About Page</h1><Link to="/">Go to Home</Link></div>;

function App() {
  console.log("[App.tsx] Rendering simplified App component.");
  return (
    <>
      <Toaster position="top-right" />
      <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<div><h1>Minimal Not Found</h1></div>} />
      </Routes>
    </>
  );
}

export default App;