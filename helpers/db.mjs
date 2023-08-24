import pg from 'pg'
const {Client}=pg
import dotenv from 'dotenv'
dotenv.config()



const connection = async (myQuery)=>{
	try {const client = new Client({
	user: process.env.user,
	host: process.env.host,
	database: process.env.database,
	password: process.env.password,
	port: process.env.port,
})
	const connect = await client.connect()
	const response = await client.query(myQuery)
	
	client.end()
	return response
}
	catch (err){
		throw err
	}

}

export default connection