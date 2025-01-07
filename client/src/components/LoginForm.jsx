   // src/components/LoginForm.jsx
   import React, { useState } from 'react';

   const LoginForm = ({ onLogin }) => {
     const [username, setUsername] = useState('');
     const [password, setPassword] = useState('');

     const handleSubmit = (e) => {
       e.preventDefault();
       onLogin({ username, password });
     };

     return (
       <form onSubmit={handleSubmit}>
         <div>
           <label>
             Username:
             <input
               type="text"
               value={username}
               onChange={(e) => setUsername(e.target.value)}
               required
           />
           </label>
         </div>
         <div>
           <label>
             Password:
             <input
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
           />
           </label>
         </div>
         <button type="submit">Login</button>
       </form>
     );
   };

   export default LoginForm;