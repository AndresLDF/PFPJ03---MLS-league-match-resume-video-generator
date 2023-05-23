const proxy = require('selenium-webdriver/proxy');
const chrome = require("selenium-webdriver/chrome");
const {Builder, Capabilities, By, until, promise} = require ("selenium-webdriver");
const {Options} = require("selenium-webdriver/chrome");
//const mysql = require('mysql2');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegStatic);
const {mlsMatchesExtractor} = require("./functions/mlsExtractor.js");
const {mlsVideoCreator} = require("./functions/mlsVideo.js");
const {createConnection, executeQuery}= require("./functions/utils.js")

// LIBRARIES THAT WERE DISCARDED AS DID NOT WORK AS EXPECTED FOR THE PROJECT
//const ffmpeg = require('js-ffmpeg'); did not work, ffmpeg.isLoaded not a function
//const { JSDOM } = require('jsdom'); to create mockup windows element
//const dom = new JSDOM(); to create mockup windows element
//global.window = dom.window; mockup windows element
//const { createCanvas, loadImage } = require('canvas'); //imported to be used with videocontext
//const {VideoContext, VideoNode} = require('videocontext'); // video context did not work, even generating a seudo windows element
//const { stitchFramesToVideo } = require('./utils/stitchFramesToVideo.js');
//const videoNode = new VideoNode(context);  


test();


async function test(){

  let con = {};
  try {
    const dbPath = './database/soccer.sqlite';
    const query = 'SELECT * FROM matches';
    
    con = await createConnection(dbPath)
    let rows = await executeQuery(con, query);

    rows.forEach((row) => {
      console.log(row);
    });
  } catch (error) {
    console.error(error.message);
  }

  //Set the options for Chrome
  let downloadPath = path.join(process.cwd(), 'downloads');
  console.log(downloadPath);
  let opt = new Options();
  opt.addArguments("start-maximized");
  opt.addArguments('--disable-blink-features=AutomationControlled');
  opt.excludeSwitches("enable-logging");
  opt.excludeSwitches("enable-automation")
  opt.setUserPreferences({'useAutomationExtension': false})
  opt.setUserPreferences({'download.default_directory': downloadPath,})

  //Set Chrome capabilities, some already set with options
  let chromeCapabilities = Capabilities.chrome()
  let chromeOptions = {
    acceptSslCerts: true,
    acceptInsecureCerts: true,
    excludeSwitches: ['--enable-automation'],
    ignoreDefaultArgs: ["--enable-automation"],
    useAutomationExtension: false,
  };
  chromeCapabilities.set('chromeOptions', chromeOptions);
  
  //Extract the resuls for all the matches for certain week tha contain the date specified
  await mlsMatchesExtractor(chromeCapabilities, opt, con, "2023-03-7"); 
  
  //Create video for certain date range
  await mlsVideoCreator(chromeCapabilities, opt, con,"2023-03-11");
  
  //End database connection
  console.log("All the main functions were executed"); 
  //con.end(); old MySql connection termination
  //console.log("Database conection ended");

}


async function connectToDatabase() {
    return new sqlite3.Database('./database/soccer.sqlite', (err) => {
      if (err) {
        console.error(err.message);
      }
      console.log('Connected to the soccer database.');
    });
  
}

function connectToDatabaseMysql() {
  return new Promise((resolve, reject) => {
    const con = mysql.createConnection({
      host: "localhost",
      port : 3306,
      user: "root",
      password: "Test",
      database: "soccer"
    });

    con.connect((err) => {
      if (err) {
        reject(err);
      } else {
        console.log("Connected to database!");
        resolve(con);
      }
    });
  });
}

/*function executeQuery(dbPath, query) {
  return new Promise((resolve, reject) => {
    const con = new sqlite3.Database(dbPath);
    console.log("just connected");

    con.serialize(() => {
      con.all(query, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(rows);
      });
    });

    con.close();
  });
}*/

