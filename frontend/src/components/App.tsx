// src/App.tsx
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import { CaselistGeneratorComponent } from './CaselistGenerator'; // Ensure this import is correct

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [file, setFile] = useState<File | null>(null); // State to hold the uploaded file

  const handleLogin = (data: any) => {
    console.log('Logged in successfully:', data);
    setIsLoggedIn(true);
  };

  const handleFileUpload = (uploadedFile: File) => {
    console.log('File uploaded:', uploadedFile);
    setFile(uploadedFile); 
  };

  return (
    <div className="min-h-screen bg-background">
      {!isLoggedIn ? (
        <LoginForm onLogin={handleLogin} /> // Show LoginForm if not logged in
      ) : (
        <CaselistGeneratorComponent onFileUpload={handleFileUpload} />
      )}
    </div>
  );
};

export default App;