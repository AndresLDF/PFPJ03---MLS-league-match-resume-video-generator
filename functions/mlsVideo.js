
const {Builder, By, until} = require ("selenium-webdriver");
const mysql = require('mysql2');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegStatic);
const { Canvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const {centerElement, changeFileName, executeQuery} = require ("./utils.js")

async function mlsVideoCreator(chromeCapabilities, opt, con, startDate=null, endDate=null, videoName = "new video"){
  
    let matchedInfo = await readMatchesTable(con, startDate);
    
    let soundFiles = [];
    let imageFiles = [];
    
    for(let i=0; i < matchedInfo.length; i++){
      let matchcharid = matchedInfo [i]["matchcharid"];
      let date = matchedInfo [i]["date"];
      let competition = matchedInfo [i]["competition"];
      let imagepath = matchedInfo [i]["imagepath"];
      let matchtext = matchedInfo [i]["matchtext"];
      console.log(matchtext)
      let matchSpeach = await speachGenerator(chromeCapabilities, opt, matchtext, matchcharid);
      soundFiles.push(matchSpeach);
      imageFiles.push(imagepath);
    }
      
    let soundList = [];
    console.log(soundList); 
    for(let index=0; index<soundFiles.length; index++){
      soundList.push([soundFiles[index], await getSoundDuration("./downloads/"+soundFiles[index]), imageFiles[index]]);
    }
  
  
  let totalTime = soundList.reduce((acc, cur) => acc + cur[1], 0);
  console.log(soundList);
  console.log(totalTime);
  await createVideoFromArray(soundList, "./videos/"+videoName+".mp4")
}
  
  
async function createVideoFromArray(infoArray, outputVideoPath) {
  /*  -infoArray: Is an Array of shape x,3, were x is the number of matches includes. en each sub array:
               -The first elmeent is the name of the sound file [mp3]
               -the second element is the duration of the sound file i seconds
               -the third element is the image file name [png] 
      -outputVideoPath: the path to the were the video will be saved. Usually it is something like ./videos/[match name].mp4
  */  
    // Set the Canvas and canvas contex
    let pw= 1280;
    let ph= 720
    const canvas = new Canvas(pw, ph);
    const context = canvas.getContext('2d');
    let totalFrameCount = 0;
    let time = 0;
    const frameRate = 60;
  
    //Create the Frames for each match
    for(let a=0; a<infoArray.length; a++ ){
      console.log(a);
      const logo = await loadImage(infoArray[a][2]);
      var speachDuration = infoArray[a][1];
      
      // The video length and frame rate, as well as the number of frames required
      // to create the video
      const duration = speachDuration * 1.01;
          const frameCount = Math.floor(duration * frameRate);
      
      // Render each frame
      for (let i = 0; i < frameCount; i++) {
        time = totalFrameCount / frameRate;
  
        
        // Clear the canvas with a white background color. This is required as we are
        // reusing the canvas with every frame
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
  
        // Render the frame
        renderFrame(canvas, context, logo);
  
        // Store the image in the directory where it can be found by FFmpeg
        const output = canvas.toBuffer('image/png');
        const paddedNumber = String(totalFrameCount).padStart(4, '0');
        await fs.promises.writeFile(`frames/frame-${paddedNumber}.png`, output);
        totalFrameCount++;
      }
      console.log(`Rendering frame ${totalFrameCount} at ${Math.round(time * 10) / 10} seconds for match ${infoArray[a][2]}...`);
    }
  
    //Create the video
  
    // Create the video with FFmpeg
    await new Promise((resolve, reject) => {
        let video  = ffmpeg()
          .input(`frames/frame-%04d.png`)
          .inputOptions(`-framerate ${frameRate}`);
          
        for(let index=0; index < infoArray.length; index++){
          video.input("./downloads/"+infoArray[index][0]);
        }  
        video.complexFilter(`concat=n=${infoArray.length}:v=0:a=1`)  
          .outputOptions('-c:v libx264')
          .outputOptions('-preset slow')
          .outputOptions('-tune stillimage')
          .outputOptions('-pix_fmt yuv420p')
          .output(outputVideoPath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });
   
}
  
async function createVideo(imagePath, soundPath, outputVideoPath) { //Function to create individual videos. Not implemented anymore
    let pw= 1280;
    let ph= 720
    const canvas = new Canvas(pw, ph);
    const context = canvas.getContext('2d');
    const logo = await loadImage(imagePath);
    var speachDuration = await getSoundDuration(soundPath);
    
    // The video length and frame rate, as well as the number of frames required
    // to create the video
    console.log(speachDuration);
    const duration = speachDuration * 1.02;
    console.log(duration);
    const frameRate = 60;
    const frameCount = Math.floor(duration * frameRate);
  
    // Render each frame
    for (let i = 0; i < frameCount; i++) {
      const time = i / frameRate;
  
      console.log(`Rendering frame ${i} at ${Math.round(time * 10) / 10} seconds...`);
  
      // Clear the canvas with a white background color. This is required as we are
      // reusing the canvas with every frame
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
  
      // Render the frame
      renderFrame(canvas, context, logo, duration, time);
  
      // Store the image in the directory where it can be found by FFmpeg
      const output = canvas.toBuffer('image/png');
      const paddedNumber = String(i).padStart(4, '0');
      await fs.promises.writeFile(`frames/frame-${paddedNumber}.png`, output);
    }
  
    // Create the video with FFmpeg
    await new Promise((resolve, reject) => {
      let test  = ffmpeg()
        .input(`frames/frame-%04d.png`)
        .inputOptions(`-framerate ${frameRate}`)
        .input(soundPath)
        .outputOptions('-c:v libx264');
        
      test.outputOptions('-preset slow')
        .outputOptions('-tune stillimage')
        .outputOptions('-pix_fmt yuv420p')
        .output(outputVideoPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
}
  
function getSoundDuration(soundPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(soundPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          const duration = metadata.format.duration;
          resolve(duration);
        }
      });
    });
}
  
function renderFrame(canvas, context, logo) {
    // Center the image and draw it on the canvas context
    let yPos= (canvas.height-logo.height)/2;
    let xPos= (canvas.width-logo.width)/2
    context.drawImage(logo, xPos, yPos);
  }
  
  async function stitchFramesToVideo(
    framesFilepath,
    soundtrackFilePath,
    outputFilepath,
    duration,
    frameRate,
  ) {
  
    await new Promise((resolve, reject) => {
      ffmpeg()
  
        // Tell FFmpeg to stitch all images together in the provided directory
        .input(framesFilepath)
        .inputOptions([
          // Set input frame rate
          `-framerate ${frameRate}`,
        ])
  
        // Add the soundtrack
        .input(soundtrackFilePath)
        .audioFilters([
          // Fade out the volume 2 seconds before the end
          `afade=out:st=${duration - 2}:d=2`,
        ])
  
        .videoCodec('libx264')
        .outputOptions([
          // YUV color space with 4:2:0 chroma subsampling for maximum compatibility with
          // video players
          '-pix_fmt yuv420p',
        ])
  
        // Set the output duration. It is required because FFmpeg would otherwise
        // automatically set the duration to the longest input, and the soundtrack might
        // be longer than the desired video length
        .duration(duration)
        // Set output frame rate
        .fps(frameRate)
  
        // Resolve or reject (throw an error) the Promise once FFmpeg completes
        .saveToFile(outputFilepath)
        .on('end', () => resolve())
        .on('error', (error) => reject(new Error(error)));
    });
}
  
async function speachGenerator(chromeCapabilities, opt, textToSepeach, matchname){
    //Create a new browser and navigate to the TTS page
    let driver = await new Builder().forBrowser("chrome").withCapabilities(chromeCapabilities).setChromeOptions(opt).build();
    await driver.get("https://ttsmp3.com/");
    
    //Wait for the Text area to be visible and center on it
    let textArea = await driver.wait(until.elementLocated(By.css('#voicetext')), 10000);
    await driver.wait(until.elementIsVisible(textArea));
    await driver.wait(until.elementIsEnabled(textArea));
    centerElement(textArea, driver);
    console.log("Text area loaded");
    
    //Getting the text area again, click on the element, add the text
    textArea = await driver.findElement(By.css("#voicetext"));
    console.log("text aread element selected");
    textArea.click();
    console.log("Text Area Clicked");
    textArea.sendKeys(textToSepeach);
    
    //Get the download button and click on it to start the download process
    await driver.findElement(By.css("#downloadenbutton")).click();
    let readButton = await driver.findElement(By.css("#vorlesenbutton"));
    
    //Follow up the readButton text to check if the file creation process has started (text changed to "Creating...")
    await driver.wait(async function () {
      const value = await readButton.getAttribute('value');
      return value === "Creating...";
    });
    
    //Follow up the readButton text to check the creation process has finished (text changed to "Read")
    await driver.wait(async function () {
      const value = await readButton.getAttribute('value');
      return value === "Read";
    }); 
    console.log("File Created");//log the button value in console just for debug purposes 
  
    // Open the Chrome Download Manager in a new tab
    await driver.switchTo().newWindow("tab");
    await driver.get("chrome://downloads/");
    console.log("Download Panel opened");
  
    
    //Get the download file name and change it to match the match that it represents
    let fileTitle = null;
    let fileTitleText = null;
    await driver.wait(async () => {
      
      //The Download manager use shadowRoot. To be able to reach the element an script has to be executed
      try{
      fileTitle = await driver.executeScript('return document.getElementsByTagName("downloads-manager")[0].shadowRoot.querySelectorAll("downloads-item")[0].shadowRoot.querySelector("#file-link")');
      } catch {
        fileTitle = null;
      }
      if(fileTitle){
        fileTitleText = await fileTitle.getText();
        if (fileTitleText !== null && fileTitleText !=""){
          console.log("The download browser element was successfully found")
          return true
        }
        return false;
      }
      else{
        return false;
      }
    }, 5000, "Element for downloaded file not found");
    
    //Check if the loading bar is still present and if it is not present it fails and the program continues, if not it waits untill it is downloaded
    try{ //change it so it use execute script beccauas the element is in a shadow DOM
        await driver.wait(until.elementLocated(driver.executeScript('return document.getElementsByTagName("downloads-manager")[0].shadowRoot.querySelectorAll("downloads-item")[0].shadowRoot.querySelectorAll("#description")[0]')),300,"File already downloaded");
        let progressBar = await driver.executeScript('return document.getElementsByTagName("downloads-manager")[0].shadowRoot.querySelectorAll("downloads-item")[0].shadowRoot.querySelectorAll("#primaryProgress")[0]'); //primaryProgress
        await driver.wait(until.elementIsNotVisible(progressBar));
    } catch(error){
        console.log("There was an error: "+error);
    }
  
    //Change the name of the downloaded file to the match identifier
    fileTitle = await fileTitle.getText(); //the FileTitle indeed is alrady there, just leaving this line, but it should be removed
    newName = matchname+".mp3";
    changeFileName("./downloads", fileTitle, newName);
    
    //Close the browser and return the MP3 file name
    driver.quit();
    return newName
}
  
function changeLastDownloadName(downloadPath, newName){ //Not in use anymore, can be removed
    // Read the download directory and sort files by modification time
    fs.readdir(downloadPath, (err, files) => {
      if (err) {
        console.error(err);
        return;
      }
  
      files = files
        .map(file => ({ name: file, time: fs.statSync(path.join(downloadPath, file)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time);
  
      // Rename the last downloaded file
      const lastDownloadedFile = files[0].name;
      fs.rename(path.join(downloadPath, lastDownloadedFile), path.join(downloadPath, newName), (err) => {
        if (err) {
          console.error(err);
          return;
        }
  
        console.log(`File ${lastDownloadedFile} renamed to ${newName}`);
      });
    });
}
  
  
  
async function readMatchesTable(con, startDate= null,  endDate=null){
      let queryText = 'SELECT * FROM `matches`'
      if(startDate !==null || endDate!==null){queryText += " WHERE ";}
      if(startDate !==null){queryText += "date <= '"+ startDate+"'";}
      if(startDate !==null && endDate!==null){queryText += " AND ";}
      if(endDate!==null){queryText += " date >= '"+ endDate+"'";}
      console.log(queryText)
      let ret = executeQuery(con, queryText);
      return ret;
    
}
  
module.exports = {mlsVideoCreator};


  
  