import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { BrowserProvider } from "ethers";
import "./styles.css";

// Firebase configuration (Use .env for security)
const firebaseConfig = {
  apiKey: "AIzaSyCFpigaNEjkBenu9_KhVVVn-akZmDvtcH0",
 authDomain: "svceee-20b89.firebaseapp.com",
 projectId: "svceee-20b89",
 storageBucket: "svceee-20b89.firebasestorage.app",
 messagingSenderId: "674465161121",
 appId: "1:674465161121:web:077aaf86d34260668d35e0",
 measurementId: "G-P3KEZVZQF1"

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Login Component
function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login Error", error);
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
      <Link to="/walletlogin">Login with Wallet</Link>
    </div>
  );
}

// Signup Component
function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSignUpSuccess(true);
      console.log("User created:", name);
    } catch (error) {
      console.error("Signup Error", error);
    }
  };

  return (
    <div className="container">
      <h2>Signup</h2>
      {signUpSuccess && <p style={{ color: "green" }}>Sign Up Successful!</p>}
      <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      <button onClick={handleSignup}>Signup</button>
      <p>Already have an account? <Link to="/">Login</Link></p>
    </div>
  );
}

// Dashboard Component
function Dashboard({ user }) {
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="container">
      <h2>Dashboard</h2>
      <p>Welcome, {user?.email}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

// Wallet Login Component (MetaMask integration)
function WalletLogin() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        console.log("MetaMask is detected");
        
        const provider = new BrowserProvider(window.ethereum); // Fix: Use BrowserProvider
        await window.ethereum.request({ method: "eth_requestAccounts" });
  
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        setWalletAddress(address);
        console.log("Connected wallet address:", address);
      } else {
        setErrorMessage("MetaMask is not installed. Please install it to continue.");
        console.log("MetaMask is not installed.");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setErrorMessage("Failed to connect wallet. Please try again.");
    }
  };
  
  return (
    <div>
      <h2>Login with Wallet</h2>
      {walletAddress ? (
        <p>Wallet Address: {walletAddress}</p>
      ) : (
        <div>
          <button onClick={connectWallet}>Connect Wallet</button>
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        </div>
      )}
    </div>
  );
}

// Main App Component
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/walletlogin" element={<WalletLogin />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
