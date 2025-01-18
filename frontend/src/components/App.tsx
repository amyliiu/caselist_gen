import React, { useState } from 'react';
import '../styles/globals.css';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import PreviewPage from './PreviewPage'; // Import the PreviewPage component
import Layout from './Layout'; // Import the Layout component

const App: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [file, setFile] = useState<File | null>(null); // State to hold the uploaded file
  const [errorMessage, setErrorMessage] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');

  const navigate = useNavigate(); // Use navigate for routing

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('usernmae:', username);
    console.log('Password:', password);
    
    const response = await fetch('http://localhost:5001/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setUsername('');
      setPassword('');
      setErrorMessage('This username and password does not exist.')
      console.error(data.error);
    }
    else{
      console.log('Logged in successfully:', data);
      handleProcessSpreadsheet(file);
      navigate('/preview'); // Redirect to the preview page
    }
  };

  const handleProcessSpreadsheet = async (file: File | null) => {
    if (!file) {
      setErrorMessage('No file selected');
      console.error('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5001/upload', {
        method: 'POST',
        body: formData,
      });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    setData(result.codes);
    setFileName(file.name);
    navigate('/preview');

    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }

  return (
    <Routes>
        <Route path="/" element={<Layout />}>
            <Route path="/" element={
                <div className="container">
                    <h1>AutoCase</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="username"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="file">Upload File</label>
                            <input
                                type="file"
                                id="file"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        handleProcessSpreadsheet(file);
                                    }
                                }}
                                required
                            />
                        </div>
                        <button type="submit">Submit</button>
                    </form>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </div>
            } />
            <Route path="/preview" element={<PreviewPage data={data} fileName={fileName} />} />
        </Route>
    </Routes>
);
};

export default App;
