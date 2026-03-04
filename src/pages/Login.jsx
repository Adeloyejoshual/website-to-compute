const register = async () => {
const { data, error } = await supabase.auth.signUp({
email,
password,
})

if (error) {
alert(error.message)
return
}

const user = data.user

if (user) {
await supabase.from("users").insert([
{
auth_id: user.id,
email: user.email
}
])
}

alert("Account created")
}