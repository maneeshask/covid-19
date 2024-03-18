const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");
let db = null;

const initializeDbAndStartServer = async () => {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
  } catch (e) {
    console.log(`DBError ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndStartServer();

const convertDbObjIntoStateObj = (dbObj) => {
  return {
    stateId: dbObj.state_id,
    stateName: dbObj.state_name,
    population: dbObj.population,
  };
};
const convertDbObjIntoDistrictObj = (dbObj) => {
  return {
    districtId: dbObj.district_id,
    districtName: dbObj.district_name,
    stateId: dbObj.state_id,
    cases: dbObj.cases,
    cured: dbObj.cured,
    active: dbObj.active,
    deaths: dbObj.deaths,
  };
};
//api to get all states from state table
app.get("/states/", async (request, response) => {
  const getStatesQ = `SELECT * FROM state;`;
  const statesArray = await db.all(getStatesQ);
  response.send(statesArray);
});
