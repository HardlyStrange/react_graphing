const axios = require("axios");
var cors = require("cors");
var moment = require('moment');
const util = require('util');
const express = require('express')
const { Client } = require('pg')
/* findings/subscription, avg age of findings */
const app = express()
const port = process.env.PORT || 4000
var auth_token = null;

async function tryBigOpenAlerts(auth_token){
/*const url = "https://api2.demo.io/alert?timeType=absolute&&startTime=1565149332&endTime=1565155332&detailed=detailed";*/
  const url = "https://api2.demo.io/alert?alert.status=open&policy.severity=high&timeType=relative&timeAmount=24&timeUnit=hour&detailed=true";

  /*refreshToken(auth_token);*/
  auth_token = await login();
  try {
    const response = await axios.get(url, {
      headers: {
        'x-demo-auth': auth_token.token
      }
    });
    const data = response.data;
    var list_ca = [];
    /* Interate over all the names in the object and extract list of compliance violations*/
    for (let [key, value] of Object.entries(data)) {
    /*  console.log("Big Open...");
      console.log(key, value.policy.name);*/
      list_ca.push(value.policy.name);
    }
    /*make object with policy volation name then count for each */
    var with_counts = {};
    list_ca.forEach((e) => {
      for (let [key, value] of Object.entries(data)) {
      /*  console.log(key, value.policy.name);*/
        if (value.policy.name == e){
          with_counts[value.policy.name] = (with_counts[value.policy.name]+1) || 1 ;
        }
      }
    });
    var sortable = [];
    for (let [key, value] of Object.entries(with_counts)) {
      sortable.push([key, with_counts[key]]);
    }
    sortable.sort(function(a, b) {
      return a[1] - b[1];
    });
    sortable.reverse();
    return Promise.resolve(sortable);
  } catch (error) {
    console.log(error);
  }
}

async function tryCompliance(auth_token){
  const url = "https://api2.demo.io/alert/count/open";

  try {
    const response = await axios.get(url, {
      headers: {
        'x-demo-auth': auth_token.token
      }
    });
    const data = response.data;
    /* Interate over all the names in the object and extract the Subscription ID*/
    for (let [key, value] of Object.entries(data)) {
        console.log("This...");
        console.log(key, value);
    }
    return Promise.resolve(response.data);

  } catch (error) {
    console.log(error);
  }
}

async function tryOpenAlerts(auth_token){
  const url = "https://api2.demo.io/alert/count/open";

  try {
    const response = await axios.get(url, {
      headers: {
        'x-demo-auth': auth_token.token
      }
    });
    const data = response.data;
    /* Interate over all the names in the object and extract the Subscription ID*/
    for (let [key, value] of Object.entries(data)) {
        console.log("This...");
        console.log(key, value);
    }
    return Promise.resolve(response.data);

  } catch (error) {
    console.log(error);
  }
}

async function tryResolvedAlerts(auth_token){
  const url = "https://api2.demo.io/alert/count/resolved";
  refreshToken(auth_token);
  try {
    const response = await axios.get(url, {
      headers: {
        'x-demo-auth': auth_token.token
      }
    });
    const data = response.data;
    /* Interate over all the names in the object and extract the Subscription ID*/
    for (let [key, value] of Object.entries(data)) {
      console.log("This...");
      console.log(key, value);
    }
    return Promise.resolve(response.data);
  } catch (error) {
    console.log(error);
  }
}

async function tryDismissedAlerts(auth_token){
  /*const url = "https://api2.demo.io/alert?timeType=absolute&&startTime=1565149332&endTime=1565155332&detailed=detailed";
    const url = "https://api2.demo.io/alert?alert.status=open&timeType=relative&timeAmount=24&timeUnit=hour&detailed=true";*/
  const url = "https://api2.demo.io/alert/count/dismissed";

  refreshToken(auth_token);
  try {
    const response = await axios.get(url, {
      headers: {
        'x-demo-auth': auth_token.token
      }
    });
    const data = response.data;
    /* Interate over all the names in the object and extract the Subscription ID*/
    for (let [key, value] of Object.entries(data)) {
      console.log("This...");
      console.log(key, value);
    }
    return Promise.resolve(response.data);
  } catch (error) {
    console.log(error);
  }
}

async function fetchAlerts(auth_token){
  try {
    auth_token = await login();
    const open_alerts = await tryOpenAlerts(auth_token);
    const resolved_alerts = await tryResolvedAlerts(auth_token);
    const dismissed_alerts = await tryDismissedAlerts(auth_token);
    if (typeof open_alerts !== null && open_alerts){
      if (typeof resolved_alerts !== null && resolved_alerts){
        if (typeof dismissed_alerts !== null && dismissed_alerts){
          console.log("Alerts: OPEN="+open_alerts.count+" RESOLVED="+resolved_alerts.count+" DISMISSED="+dismissed_alerts.count);

          let tn = moment().format('YYYY-MM-DD');
          let tns = "'"+tn+"'";
          const client = new Client({
            user: 'grafanareader',
            host: 'localhost',
            database: 'data',
            password: '',
            port: 5432,
          })
          console.log("Updating DB....");
          await client.connect()
          const update_query = 'INSERT INTO Alerts (date, open, resolved, dismissed) VALUES ('+tns+', '+open_alerts.count+', '+resolved_alerts.count+', '+dismissed_alerts.count+');'
          const result = await client.query({
            rowMode: 'array',
            text: update_query,
          })
          await client.end()
          const alert_count = {
              open_alerts,
              resolved_alerts,
              dismissed_alerts,
          };
          return Promise.resolve(alert_count);
        }
      }
    }
  } catch (error){
    console.log(error);
  }

}

async function tryATrends(num){

  /*Date backwards num many days and return array with that range*/
  console.log("number I got is: "+num);
  /*calculate the number of date of num days to go back, default is 10. */
  const sAD = moment().subtract(num, 'days').format('YYYY-MM-DD');
  const sD = moment(sAD).format('YYYY-MM-DD');
  const eD = moment().format('YYYY-MM-DD');
  console.log("Fetching data from range "+sD+" to today: "+eD);
  const numm = "'"+num+" DAY'";
  const query =
  'SELECT * FROM Alerts WHERE date > current_date - INTERVAL '+numm+' ORDER BY date::date asc;'
  const client = new Client({
    user: 'grafanareader',
    host: 'localhost',
    database: 'data',
    password: '',
    port: 5432,
  })
  await client.connect()
  const result = await client.query({
    rowMode: 'array',
    text: query,
  })
  await client.end()
  return Promise.resolve(result.rows);

}

async function tryInvTrends(num){
  /*Date backwards num many days and return array with that range*/
  console.log("number I got is: "+num);
  /*calculate the number of date of num days to go back, default is 10. */
  const sAD = moment().subtract(num, 'days').format('YYYY-MM-DD');
  const sD = moment(sAD).format('YYYY-MM-DD');
  const eD = moment().format('YYYY-MM-DD');
  console.log("Fetching data from range "+sD+" to today: "+eD);
  const numm = "'"+num+" DAY'";
  const query =
  'SELECT * FROM inventory WHERE date > current_date - INTERVAL '+numm+' ORDER BY date::date asc;'
  const client = new Client({
    user: 'grafanareader',
    host: 'localhost',
    database: 'data',
    password: '',
    port: 5432,
  })
  await client.connect()
  const result = await client.query({
    rowMode: 'array',
    text: query,
  })
  await client.end()
  return Promise.resolve(result.rows);

}

async function refreshToken(auth_token) {
  const UNAUTHORIZED = 401;
  /* Add catch for gateway timeout*/
  axios.interceptors.response.use(
    response => response,
    error => {
      const {status} = error.response;
      if (status === UNAUTHORIZED) {

      /*  (async() => { /* ES6 trick to make the following use awaits-async */
        auth_token = login(); /*  WAIT FOR IT!!! */
          if (typeof auth_token.token !== 'undefined' && auth_token.token ){
            console.log(' 2nd... Login Successful '+auth_token.message);
            return Promise.resolve(auth_token);
          } else {
            console.log("Full Stop");
            return Promise.reject(error);
          }
        /*})();*/

      }
      return Promise.reject(error);
    }
  );

  const url = "https://api2.demo.io/auth_token/extend";
  try {
    const response = await axios.get(url, {
      headers: {
        'x-demo-auth': auth_token.token
      }
    });
    console.log("Am I refreshed? "+response.data.message);
    if (response.data.message == 'login_successful'){
      console.log("YES!");
    }
  } catch (error) {
    console.log(error);
  }

}

async function login() {
  const user = "username";
  const passwd = ""; /* Generate per-session enc key. Should prompt user interface for these, then encrypt
                                  and local save. Decrypt for login then erase. */
  const url = "https://api2.demo.io/login";
  try {
    /*axios.defaults.headers.common['headers'] = data; */
    return axios.post(url, {
      "username":user,"password":passwd
    }).then((login)=>{
      console.log('logged in: ' + login.data.message);
      auth_token = login.data;
      return login.data;
    });

  } catch (error) {
    console.log(error);
    return false
  }
}

async function tryInventory(auth_token) {
 let subslist = [];
 let awslist = [];
 let azurelist = [];
 let gcplist = [];
 let doupdate = false;
 const url = "https://api2.demo.io/cloud";


  auth_token = await login();
  /*refreshToken(auth_token);*/

  try {
    const response = await axios.get(url, {
      headers: {
        'x-demo-auth': auth_token.token
      }
    });
    const data = response.data;
    /* Interate over all the names in the object and extract the Subscription ID*/

    for (let [key, value] of Object.entries(data)) {
        /* Extract numbers for aws, azure.*/
        if (value.cloudType == 'azure'){
            azurelist.push(value.name);
        } else if (value.cloudType == 'aws'){
            awslist.push(value.name);
        } else if (value.cloudType == 'gcp'){
            gcplist.push(value.name);
        }
        subslist.push(value.name);
    }
    console.log("There are currenly: "+subslist.length+" subscriptions in demo");
    console.log("or "+azurelist.length+" Azure, "+awslist.length+" Aws and "+gcplist.length+" GCP accounts");

    const scribers = {
      all: subslist.length.toString(),
      azure: azurelist.length.toString(),
      aws: awslist.length.toString(),
      gcp: gcplist.length.toString()
    };
    /*for some reason, objectifying this data is neccesary*/
    const scri = Object.create(scribers);

    async function doForceUpdate(){
      console.log("TNS Looks like: "+tns);
      const query = 'UPDATE inventory set total = '+scri.all+', azure = '+scri.azure+', aws = '+scri.aws+', gcp = '+scri.gcp+' WHERE date = '+tns+';'
      const client = new Client({
        user: 'grafanareader',
        host: 'localhost',
        database: 'data',
        password: '',
        port: 5432,
      })
      await client.connect()
      const result = await client.query({
        rowMode: 'array',
        text: query,
      })
      await client.end()
      return Promise.resolve(result.rows);
    };

    async function doUpdate(){
      const client = new Client({
        user: 'grafanareader',
        host: 'localhost',
        database: 'data',
        password: '',
        port: 5432,
      })
      console.log("Updating DB....");
      await client.connect()
      const update_query = 'INSERT INTO inventory (date, total, azure, aws, gcp) VALUES ('+tns+', '+scri.all+', '+scri.azure+', '+scri.aws+', '+scri.gcp+');'
      const result = await client.query({
        rowMode: 'array',
        text: update_query,
      })
      await client.end()
      return Promise.resolve(result.rows);
    };
    /* see if we already have numbers for today
    I tried a more complicated, singular function way to do this, but kept getting promise loops. revisit*/
    let tn = moment().format('YYYY-MM-DD');
    let tns = "'"+tn+"'";
    const query_string = 'SELECT total FROM inventory WHERE date = '+tns+';'
    const client = new Client({
      user: 'grafanareader',
      host: 'localhost',
      database: 'data',
      password: '',
      port: 5432,
    })
    await client.connect()
    await client.query(query_string, (error, res) => {
      console.log(res);
      if (typeof res.rows[0] !== 'undefined' && res.rows[0] ){
        console.log("Inventory Metrics exists for today, tossing a failsafe update");
        doForceUpdate();
      } else {
        console.log("Cataloging new days inventory...");
        doUpdate();
      }
      client.end();
    });
      return scri;
  } catch (error) {
    console.log(error);
  }
}

async function main() {
  /* ------ Login and get the auth token, the refresh it every 50 seconds ---  */
  var tn = moment().format('YYYY-MM-DD');
  /* Login to demo, get a token */
/*  (async() => { /* ES6 trick to make the following use awaits-async */

  /*  auth_token = await login(); /*  WAIT FOR IT!!!

    if (typeof auth_token !== null && auth_token){
      /* How about refresh the token ever 60 seconds?
      setInterval(() => refreshToken(auth_token), 60000);
      console.log(tn+' Login Successfull '+auth_token.message);
    } else {
      console.log("Full Stop");
    }
/*  })(); */
  /* ------ Done Login ---  */
  /* ------ Here are the api2 listen and responders ---  */
  app.use(cors());
  /*app.set('json replacer', replacer);
  app.set('json spaces', 2); */

  app.get('/countBigOffenders', async (req, res, next) => {

    try {
      let trends = await tryBigOpenAlerts(req.params.num);
      res.setHeader('Content-Type', 'application/json');
      res.json(trends);

    } catch (error) {
      console.log(error);
      next(error)
    }
  });

  app.get('/countSubs', async (req, res, next) => {
    try {
      sub_count = await tryInventory(auth_token);
      res.setHeader('Content-Type', 'application/json');
      res.json({all: sub_count.all,
                azure: sub_count.azure,
                aws: sub_count.aws,
                gcp: sub_count.gcp});
      } catch (error) {
        console.log(error);
        next(error)
      }
  });

  app.get('/countAlerts/:num', async (req, res, next) => {
    try {
            const alert_count = await fetchAlerts(auth_token);
            let trends = await tryATrends(req.params.num);
            res.setHeader('Content-Type', 'application/json');
            res.json(trends);

    } catch (error) {
        console.log(error);
        next(error)
    }
  });

  app.get('/trendSubChart/:num', async (req, res, next) => {
    try {
      let trends = await tryInvTrends(req.params.num);
      res.setHeader('Content-Type', 'application/json');
      res.json(trends);

    } catch (error) {
      console.log(error);
      next(error)
    }
  });

  app.listen(port, () => console.log(`App listening on port ${port}!`))
    /* ------ End of the api2 listen and responders ---  */
}

main();
