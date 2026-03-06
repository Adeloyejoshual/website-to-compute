import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Login() {
const [fullName, setFullName] = useState("")
const [phone, setPhone] = useState("")
const [email, setEmail] = useState("")
const [password, setPassword] = useState("")
const [loading, setLoading] = useState(false)
const [isRegister, setIsRegister] = useState(false)

const validateForm = () => {
if (!email || !password) return "Enter email and password"
if (isRegister && (!fullName || !phone)) return "Fill all fields for register"
if (!/^S+@S+.S+$/.test(email)) return "Valid email required"
if (password.length < 6) return "Password min 6 chars"
return null
}

const register = async () => {
const errorMsg = validateForm()
if (errorMsg) return alert(errorMsg)

setLoading(true)  
  
// Supabase signup  
const { data, error } = await supabase.auth.signUp({  
  email,  
  password,  
  options: {   
    data: {   
      full_name: fullName,   
      phone   
    }   
  }  
})  

if (error) {  
  alert(error.message)  
  setLoading(false)  
  return  
}  

if (data?.user) {  
  // Insert into your exact users table schema  
  const { error: dbError } = await supabase  
    .from("users")  
    .insert([{  
      auth_id: data.user.id,  
      full_name: fullName,  
      email: email,  
      phone: phone,  
      is_seller: false,  
      seller_type: "individual",        // From your schema  
      marketplace_type: "buyer",        // From your schema    
      is_active: true,                  // From your schema  
      kyc_status: "pending"             // From your schema  
    }])  

  if (dbError) {  
    console.error(dbError)  
    alert("Registration failed - profile save error")  
  } else {  
    alert("Check your email to confirm signup!")  
  }  
}  
setLoading(false)

}

const login = async () => {
const errorMsg = validateForm()
if (errorMsg) return alert(errorMsg)

setLoading(true)  
const { error } = await supabase.auth.signInWithPassword({   
  email,   
  password   
})  
  
if (error) alert(error.message)  
setLoading(false)

}

return (
<div style={{ maxWidth: 420, margin: "60px auto" }}>
<h2>{isRegister ? "Register" : "Login"}</h2>

{isRegister && (  
    <>  
      <input  
        type="text"  
        placeholder="Full Name *"  
        value={fullName}  
        onChange={(e) => setFullName(e.target.value)}  
        style={{ width: "100%", padding: 10, marginBottom: 10 }}  
      />  
      <input  
        type="tel"  
        placeholder="Phone Number *"  
        value={phone}  
        onChange={(e) => setPhone(e.target.value)}  
        style={{ width: "100%", padding: 10, marginBottom: 10 }}  
      />  
    </>  
  )}  
    
  <input  
    type="email"  
    placeholder="Email *"  
    value={email}  
    onChange={(e) => setEmail(e.target.value)}  
    style={{ width: "100%", padding: 10, marginBottom: 10 }}  
  />  
    
  <input  
    type="password"  
    placeholder="Password *"  
    value={password}  
    onChange={(e) => setPassword(e.target.value)}  
    style={{ width: "100%", padding: 10, marginBottom: 20 }}  
  />  

  <button  
    onClick={login}  
    disabled={loading}  
    style={{   
      width: "100%",   
      padding: 12,   
      marginBottom: 10,  
      background: isRegister ? '#f0f0f0' : '#007bff',  
      color: isRegister ? 'black' : 'white'  
    }}  
  >  
    {loading ? "Loading..." : "Login"}  
  </button>  

  <button  
    onClick={register}  
    disabled={loading}  
    style={{   
      width: "100%",   
      padding: 12,  
      background: isRegister ? '#28a745' : '#f0f0f0',  
      color: isRegister ? 'white' : 'black'  
    }}  
  >  
    {loading ? "Registering..." : "Register"}  
  </button>  

  <p style={{ textAlign: 'center', marginTop: 15, fontSize: 14 }}>  
    {isRegister ? 'Already have account?' : "New to marketplace?"}  
    <br />  
    <button   
      type="button"   
      onClick={() => setIsRegister(!isRegister)}   
      disabled={loading}  
      style={{   
        background: 'none',   
        border: 'none',   
        color: '#007bff',  
        cursor: loading ? 'not-allowed' : 'pointer',  
        textDecoration: 'underline'  
      }}  
    >  
      {isRegister ? ' Login' : ' Register now'}  
    </button>  
  </p>  
</div>

)
}