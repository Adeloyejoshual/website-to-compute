import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Login() {

const [fullName,setFullName]=useState("")
const [phone,setPhone]=useState("")
const [email,setEmail]=useState("")
const [password,setPassword]=useState("")
const [error,setError]=useState("")
const [loading,setLoading]=useState(false)
const [isRegister,setIsRegister]=useState(false)

const validate = () => {

if(!email || !password) return "Enter email and password"

const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}$/

if(!emailRegex.test(email)) return "Invalid email"

if(password.length < 6) return "Password must be at least 6 characters"

if(isRegister && (!fullName || !phone)) return "Fill all fields"

return null
}

const register = async () => {

const err = validate()

if(err){
setError(err)
return
}

setError("")
setLoading(true)

const { data, error } = await supabase.auth.signUp({
email: email.trim().toLowerCase(),
password: password.trim()
})

if(error){
setError(error.message)
setLoading(false)
return
}

const user = data?.user

if(user){

const { error: insertError } = await supabase
.from("users")
.insert([
{
auth_id: user.id,
email: email.trim().toLowerCase(),
full_name: fullName.trim(),
phone: phone.trim()
}
])

if(insertError){
setError(insertError.message)
setLoading(false)
return
}

}

setLoading(false)

alert("Account created successfully. Please check your email.")

setIsRegister(false)

}

const login = async () => {

const err = validate()

if(err){
setError(err)
return
}

setError("")
setLoading(true)

const { error } = await supabase.auth.signInWithPassword({
email: email.trim().toLowerCase(),
password: password.trim()
})

setLoading(false)

if(error){
setError(error.message)
}

}

return (

<div style={{maxWidth:400,margin:"60px auto"}}><h2>{isRegister ? "Create Account" : "Login"}</h2>{error && <p style={{color:"red"}}>{error}</p>}

{isRegister && (
<>
<input
placeholder="Full Name"
value={fullName}
onChange={(e)=>setFullName(e.target.value)}
/>

<input
placeholder="Phone"
value={phone}
onChange={(e)=>setPhone(e.target.value)}
/>
</>
)}

<input
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
/>

<button
onClick={isRegister ? register : login}
disabled={loading}

«»

{loading ? "Loading..." : isRegister ? "Register" : "Login"}

</button><button
onClick={()=>setIsRegister(!isRegister)}

«»

{isRegister ? "Already have account? Login" : "Create new account"}

</button></div>)

}