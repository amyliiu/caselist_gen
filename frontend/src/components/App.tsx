import React, { useState } from 'react';
import '../styles/globals.css';
import { CaselistGeneratorComponent } from './CaselistGenerator';

const App: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [file, setFile] = useState<File | null>(null); // State to hold the uploaded file
  const [errorMessage, setErrorMessage] = useState('');

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
      handleProcessSpreadsheet();
    }

  };

  return (
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
                <label htmlFor="fileUpload">Upload File</label>
                <input
                    type="file"
                    id="fileUpload"
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                />
            </div>
            <button type="submit">Submit</button>
        </form>
    </div>
  );
};

export default App;


