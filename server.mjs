import express from 'express'
import cors from 'cors'
console.log("ca update")
const PORT = 3000
const app = express()

/*const corsOption=({
	http://example.com
})*/

app.get("/", cors(),(req, res)=>{
	console.log("ca route")
	res.sendStatus(200)
})

app.listen(PORT,()=>{
	console.log(`API running on port ${PORT}`)
})