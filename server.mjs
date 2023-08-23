import express from 'express'
import cors from 'cors'
import connect from './helpers/db.mjs'

console.log("ca deploie")
const PORT = 3000
const app = express()


import loginRoutes from './routes/login.mjs'
/*const corsOption=({
	http://example.com
})*/

app.use(cors())
app.use(express.json())


app.use('/',loginRoutes)

app.get("/", async (req, res)=>{
	console.log("ca route")
	const response = await connect("select *from users")
	console.log(response.rows)
	res.status(200).json(response.rows)
})

app.listen(PORT,()=>{
	console.log(`API running on port ${PORT}`)
})