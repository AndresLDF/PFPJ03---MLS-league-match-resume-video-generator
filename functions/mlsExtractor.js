const { writeFileSync } = require('fs');
const path =require('path');
const {Builder, By, until} = require ("selenium-webdriver");
const {wait, centerElement, executeQuery} = require ("./utils.js")
// mlsMatchesExtractor extract the information for certain week by passing any day of the mentioned week
async function mlsMatchesExtractor(chromeCapabilities, opt, con, fullDate=null, year=null){
  
    //If no date is given, it gets the current Date 
    if(fullDate===null){
      let dateNow = new Date()
      year = dateNow.getFullYear();
      let month = dateNow.getMonth() + 1;
      let day = dateNow.getDate();
      fullDate= year + "-" +month+"-"+day;
    }
    console.log(fullDate);
  
    if(year===null){
      console.log("year is null")
      let newDate = new Date(fullDate);
      year = newDate.getFullYear();
    }
    console.log(year);
  
    //Start builder
    let promises = []; // variable to get all the promises that can be let to be fullfill later
    let driver = await new Builder().forBrowser("chrome").withCapabilities(chromeCapabilities).setChromeOptions(opt).build();
    
    
    //navigate to the MLS Soccer page and close the cookies banner
    await driver.get("https://www.mlssoccer.com/schedule/scores#competition=all&club=all&date=" + fullDate);
    await driver.wait(until.elementLocated(By.className('sc-eDvSVe')), 10000);
    await driver.findElement(By.css("#onetrust-accept-btn-handler")).click();
    await wait(1000);
  
    //Select all the matches blocks
    let matchBlock = await driver.findElements(By.className('sc-cZFQFd'));
    console.log("The quantity of matching blocks are " +matchBlock.length );
      
    //MAIN INFORMATION EXTRACTION BLOCK
    for (let i = 0; i < matchBlock.length; i++) {
      
      //Get the date for the block and create
      let date = await matchBlock[i].findElement(By.className('sc-dkrFOg')).getText(); 
          
      // Convert the date to a database format and add it into the dates table
      dateFormated = formatDate(date, year);
      insertDate(dateFormated, "MLS", con)
      
      //Get all the matches elements for an specific date
      let matches = await  matchBlock[i].findElements(By.className('mls-c-match-list__match-container'));
      console.log("matches length is "+ matches.length);
      
      //For each match get all the information needed, make the video text, and add it all to the database
      for(let key = 0; key < matches.length; key++) {
        
        //Start getting basic information
        console.log('The element is> '+await matches[key].getText())
        let hometeam = await matches[key].findElement(By.className('--home'));
        console.log("The home team element is: "+ await hometeam.getText());
        let hmShort = await driver.executeScript(`return arguments[0].getElementsByClassName("mls-c-club__abbreviation")[0].getInnerHTML(); `, hometeam) 
        console.log("Short name: "+ hmShort);
        let hmLong = await hometeam.findElement(By.className('mls-c-club__shortname')).getText();
        console.log("Long name: "+ hmLong);
        let awayteam = await matches[key].findElement(By.className('--away'));
        let awShort = await driver.executeScript(`return arguments[0].getElementsByClassName("mls-c-club__abbreviation")[0].getInnerHTML(); `, awayteam) 
        console.log("awayteam short name is "+ awShort);
        let awLong = await awayteam.findElement(By.className('mls-c-club__shortname')).getText();
        let scoreboard = await matches[key].findElement(By.className('sc-eDvSVe'));
        await driver.wait(until.elementLocated(By.css('span')), 10000,"The score class is not loaded");
        let score = await scoreboard.findElements(By.css('span'));
        console.log("la cantidad de elementos span es " + score.length);
        
        //Check if the there is a result for the match (score.length>2) and finish getting all the information and adding it to the database
        if(score.length>2){
          let homegoalsElement = score[0];
          let homegoals = await homegoalsElement.getText();
          let awaygoals = await score[2].getText();
          let weeklyvideo = 0;
          let matchvideo = 0;
          let matchcharid = dateFormated+hmShort+awShort+homegoals+awaygoals;
          let compt = await matches[key].findElement(By.css('.sc-dmctIk')).getText();
          let matchText = " The result for "+ hmLong + " versus "+awLong+ " was "+homegoals+ " to " +awaygoals  
          
          //Center the match result element and take a screenshot of it
          let sPath = "./images/"+matchcharid+".png"
          await centerElement(matches[key], driver)
          let screenshot = elementScreenshot(matches[key], sPath)
          promises.push(screenshot); //set the screenshot prosses to the promises array so it can run in parallel
          
          //Add the iformation to the database
          let matchPromise = insertMatch(matchcharid, hmLong, awLong, dateFormated, homegoals, awaygoals, weeklyvideo, matchvideo, "MLS",compt, sPath, matchText, con );
          promises.push(matchPromise);
          console.log(matchcharid + " match information added");
        }
      }
       console.log("All the matches were examined for the date " + dateFormated);
       console.log(i+" from "+ (matchBlock.length-1) );
    }
  
    //Wait for all the prommises to be completed
    console.log("All the dates were added, waiting for the promises to be completed");
    await Promise.all(promises);
    console.log("All promises completed");
    
    //Close diver
    await driver.quit();
    console.log("Driver quit successful");
  }
  
  async function elementScreenshot(ele, directory){
    let encodedString = await ele.takeScreenshot(true);
    writeFileSync(directory, encodedString, 'base64');
  }
  
  // QUERY RELATED FUNCTIONS
  async function insertDate(date, league,con){
    let query = 'INSERT INTO matches_dates (date, league) VALUES ("'+date+'", "'+league+'")';
    console.log(query);
    await executeQuery(con, query);
  }
  
  //insertMatch insert the matches properties into the database
  async function insertMatch(matchcharid, hometeam, awayteam, date, homegoals, awaygoals, weeklyvideo, matchvideo, league, competition, imagepath, matchtext, con){
    let query = 'INSERT INTO matches (matchcharid, hometeam, awayteam, date, homegoals, awaygoals, weeklyvideo, matchvideo, league, competition, imagepath, matchtext) VALUES ("'+ matchcharid +'", "' + hometeam +'", "' + awayteam +'", "' + date + '", ' + homegoals +', ' + awaygoals +', ' + weeklyvideo+', ' + matchvideo + ', "'+ league +'", "'+ competition +'", "'+ imagepath +'", "'+ matchtext+'")';
    console.log(query);
    await executeQuery(con, query);
  }

  function formatDate(dateString, year) {
    // Parse the input string into a Date object
    const  splitDate= dateString.split(' '); //split the date text
    let month = splitDate[1]; //get the month from the splitted text
    const day = splitDate[2]; //get the day from the splitted text
    const date = new Date(month+" "+day+", "+year); //create date object from format MMM dd, yyyy
  
    // Format the date in ISO format
    const formattedDate = `${year}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    return formattedDate;
  }
  
  module.exports = {mlsMatchesExtractor};