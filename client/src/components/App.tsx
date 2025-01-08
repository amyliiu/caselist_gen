// src/App.tsx
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import { CaselistGeneratorComponent } from './CaselistGenerator'; // Ensure this import is correct

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [file, setFile] = useState<File | null>(null); // State to hold the uploaded file

  // Handler for successful login
  const handleLogin = (data: any) => {
    console.log('Logged in successfully:', data);
    setIsLoggedIn(true);
  };

  // Handler for file upload
  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile); // Store the uploaded file in state
  };

  return (
    <div className="min-h-screen bg-background">
      {!isLoggedIn ? (
        <LoginForm onLogin={handleLogin} /> // Show LoginForm if not logged in
      ) : (
        <CaselistGeneratorComponent onFileUpload={handleFileUpload} /> // Pass file upload handler
      )}
    </div>
  );
};

export default App;