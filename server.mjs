import express from 'express'
import cors from 'cors'
console.log("ca corse")
const PORT = 3000
const app = express()

/*const corsOption=({
	http://example.com
})*/

app.use(cors())


app.get("/", (req, res)=>{
	console.log("ca route")
	res.sendStatus(200)
})

app.listen(PORT,()=>{
	console.log(`API running on port ${PORT}`)
})