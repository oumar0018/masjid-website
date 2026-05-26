import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function TestLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleLogin() {
    setMsg("Logging in...");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg("Error: " + error.message);
    else setMsg("Success! User: " + data.user.email);
  }

  return (
    <div>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      <p>{msg}</p>
    </div>
  );
}