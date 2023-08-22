import express from 'express'
console.log("ca update")
const PORT = 3000
const app = express()

app.get("/",(req, res)=>{
	console.log("ca route")
	res.sendStatus(200)
})

app.listen(PORT,()=>{
	console.log(`API running on port ${PORT}`)
})