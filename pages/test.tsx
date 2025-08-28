import { useState } from "react";
import { app } from "../lib/firebase"; 
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

const auth = getAuth(app);
const db = getFirestore(app);

export default function TestPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  // Signup
  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("✅ User signed up successfully!");
    } catch (error: any) {
      console.error(error);
      alert("Signup error: " + error.message);
    }
  };

  // Login
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("✅ Logged in successfully!");
    } catch (error: any) {
      console.error(error);
      alert("Login error: " + error.message);
    }
  };

  // Add user to Firestore
  const handleAddUser = async () => {
    try {
      await addDoc(collection(db, "users"), { email });
      alert("✅ User added to Firestore!");
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch users from Firestore
  const handleFetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const usersList = snapshot.docs.map((doc) => doc.data());
      setUsers(usersList);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🔥 Firebase Test Page</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={handleSignup}>Signup</button>
      <button onClick={handleLogin}>Login</button>
      <br />
      <button onClick={handleAddUser}>Add User to Firestore</button>
      <button onClick={handleFetchUsers}>Fetch Users</button>

      <h2>Users:</h2>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}
