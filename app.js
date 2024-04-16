const express = require('express')
const app = express()
app.use(express.json())
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'covid19India.db')
let db = null
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000)
  } catch (e) {
    console.log('DB Error : ${e.message}')
    process.exit(1)
  }
}
initializeDBAndServer()
const convertDbobjIntoStateobj = dbObj => {
  return {
    stateId: dbObj.state_id,
    stateName: dbObj.state_name,
    population: dbObj.population,
  }
}
const convertDbobjIntoDistrictobj = dbObj => {
  return {
    districtId: dbObj.district_id,
    districtName: dbObj.district_name,
    stateId: dbObj.state_id,
    cases: dbObj.cases,
    cured: dbObj.cured,
    active: dbObj.active,
    deaths: dbObj.deaths,
  }
}
//API TO GET STATES IN STATES TABLE
app.get('/states/', async (request, response) => {
  const allStatesQ = `SELECT * FROM state;`
  const result = await db.all(allStatesQ)
  const resArr = result.map(each => convertDbobjIntoStateobj(each))
  response.send(resArr)
})
//API TO GET STATE BASED ON STATE_ID
app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getStateQ = `SELECT * FROM state WHERE state_id = ${stateId}; `
  const result = await db.get(getStateQ)
  const resArr = convertDbobjIntoStateobj(result)
  response.send(resArr)
})

//API TO POST TO DISTRICT TABLE

app.post('/districts/', async (request, response) => {
  const districtDetails = request.body
  const {districtName, stateId, cases, cured, active, deaths} = districtDetails
  const newDistrictQ = `INSERT INTO district (district_name, state_id, cases, cured, active, deaths) 
                      VALUES ('${districtName}', ${stateId}, ${cases}, ${cured}, ${active}, ${deaths});
                      `
  const result = await db.run(newDistrictQ)
  response.send('District Successfully Added')
})

//API TO GET THE DISTRICT BASED ON THE ID

app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const getDistrictQ = `SELECT * FROM district 
  WHERE district_id=${districtId};`
  const result = await db.get(getDistrictQ)
  const resArr = convertDbobjIntoDistrictobj(result)
  response.send(resArr)
})

//API TO DELETE A DISTRICT BASED ON THE GIVEN ID

app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const delDistrictQ = `DELETE FROM district 
  WHERE district_id=${districtId};`
  const result = await db.run(delDistrictQ)
  response.send('District Removed')
})

//API TO UPDATE DETAILS OF GIVEN DISTRICT ID
app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const districtDetails = request.body
  const {districtName, stateId, cases, cured, active, deaths} = districtDetails
  const updateDistrictQ = `UPDATE district 
  SET district_name='${districtName}',
  state_id=${stateId},cases=${cases},cured=${cured},active=${active},deaths=${deaths} 
  WHERE district_id=${districtId};`
  const result = await db.run(updateDistrictQ)
  response.send('District Details Updated')
})

//API TO GET THE STATISTICS OF GIVEN STATE

app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const stateStatisticsQ = `SELECT SUM(cases) AS totalCases,
  SUM(cured) AS totalCured, SUM(active) AS totalActive, SUM(deaths) AS totalDeaths 
  FROM district WHERE state_id=${stateId};`
  const result = await db.get(stateStatisticsQ)
  response.send(result)
})

//API TO GET THE STATENAME BASED ON GIVEN DISTRICT ID

app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const getStateNameQ = `SELECT state_name AS stateName 
  FROM district INNER JOIN state ON district.state_id=state.state_id 
  WHERE district_id=${districtId};`
  const result = await db.get(getStateNameQ)
  response.send(result)
})

module.exports = app
