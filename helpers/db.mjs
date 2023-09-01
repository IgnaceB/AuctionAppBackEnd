import pg from 'pg'
const {Client}=pg
const {Pool}=pg

import dotenv from 'dotenv'
dotenv.config()


const pool = new Pool({
	user: process.env.user,
	host: process.env.host,
	database: process.env.database,
	password: process.env.password,
	port: process.env.port,
	max:70,
})




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

/*export {connection as default, pool as pool} */
export default pool
