import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function TestPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  // Signup user
  async function signup() {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("User signed up!");
  }

  // Login user
  async function login() {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Logged in!");
  }

  // Add sample user data to Firestore
  async function addUser() {
    await addDoc(collection(db, "users"), { email });
    alert("User added to Firestore!");
  }

  // Fetch users from Firestore
  async function fetchUsers() {
    const snapshot = await getDocs(collection(db, "users"));
    setUsers(snapshot.docs.map(doc => doc.data()));
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Firebase Test Page</h1>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
      <br /><br />
      <button onClick={signup}>Signup</button>
      <button onClick={login}>Login</button>
      <br /><br />
      <button onClick={addUser}>Add User to Firestore</button>
      <button onClick={fetchUsers}>Fetch Users</button>

      <h2>Users:</h2>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}
