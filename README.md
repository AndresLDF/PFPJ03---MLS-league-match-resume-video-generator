# PFPJ03 - MLS league matches resume video generator
## Table of Contents
1. [Objective](#objective)
2. [Structure of the project](#Structure-of-the-project)
3. [Main functions](#Main-functions)
4. [Creating a Video](#Creating-a-Video)
   - [Example Video](#Example-Video)
5. [Points of improvement](#Points-of-improvement)

## Objective

The objective of this project is to o explore the potential of Selenium and FFmpeg in Node.js for automatic video content generation from a live web page. This is achieved by accomplishing the following sub-objectives:
1. **Use Selenium as a web scraping tool.** In this case, we extract information from the MLS soccer league page.
2. **Use Selenium to capture screenshots of specific elements.**
3. **Use Selenium as a web automation tool.** In this example, we automate the creation of sound files on a TTS (Text To Speach) web page.
4. **Use Selenium to handle shadow-root elements**. In this case the browser's download page and after that manipulate downloaded files using Node.js.
5. **Use FFmpeg for video creation.**

This project's objective is not to generate high-quality videos, for this, several changes should be done to the project, between them using a TTS API, such as the ones provided by Google, Amazon, or Cooki TTS.

This project, in particular, uses a **procedural programming approach**. For an object-oriented approach in Node.js, please check other projects like PFPJ04.

## Structure of the project

This project consists of 5 main files:
1. **Index.js**: This is the main file from where all the functions are called and executed.
2. **mlsExtractor.js**: This file contains the function **mlsMatchesExtractor** and the supporting functions. Its main purpose is to extract match information for a certain week.
3. **mlsVideo.js**: This file contains the function **mlsVideoCreator** and the supporting functions. Its main purpose is to create a video from a specific date range.
4. **utils.js**: This file contains some general-purpose functions such as centering the browser view, changing file names, managing the database, etc.
5. **soccer.sqlite**: This file contains all the information scraped by the mlsMatchesExtractor function.

All the other files in the project are modules or configuration files.

## Main functions
The main functions used in this project are:

1. **mlsMatchesExtractor**: This function is responsible for scraping the MLS website for a specific week. The parameters are:
   - Chrome capabilities configuration
   - Chrome options
   - An SQLite connection (generated with the `createConnection` function located in `utils.js`)
   - Date in the format yyyy-mm-dd. If no date is specified, the current date is used.

2. **mlsVideoCreator**: This function is responsible for creating a video with the results of all the matches. The parameters are:
   - Chrome capabilities configuration
   - Chrome options
   - An SQLite connection (generated with the `createConnection` function located in `utils.js`)
   - Start date in the format yyyy-mm-dd
   - End date in the format yyyy-mm-dd. If this parameter is not specified, the video will include matches until the last date in the database is reached.

The remaining functions are support functions for these two main functions. More details can be found in the respective files.

## Install:
Before downloading the files, please install in your system the follwing:
- Node.js and NPM
- Download the ChromeDriver for your Chrome version from here: https://chromedriver.chromium.org/downloads
- include the ChromeDriver location in your PATH environment variable
- Download FFmpeg from: https://ffmpeg.org/download.html
- include the FFmpeg location in your PATH environment variable

Afterwards, you can download the contents of this repository and open them with your preferred code editor to make any necessary changes. To execute the main file, open a terminal in the folder that contains the file and use the command node index.js. 

## Creating a Video
The steps to create a video are:
1. Call the **mlsMatchesExtractor** function for the weeks that contain the matches that you would like to use for the vide
2. Call **mlsVideoCreator** for the specific dates that you would like to create the video. Specify the name
3. Check the video at the videos folder

### Example Video
Please unmute the video

https://github.com/AndresLDF/PFPJ03---MLS-league-match-resume-video-generator/assets/71279108/0f760527-2370-4ea7-b253-3671ce8ddb93

**Important Notes:** This project was updated on the 05/25/23 but the web page for the MLS website may have changed the classes names, tags used, or id names (this happens from the first version done in 2021 to the version uploaded in 2023 for my portfolio). If an element is not located it should be properly updated.


## Points of Improvement:
- The program does not check if the video files already exist, which can lead to issues when generating a new video with the same name as an existing one.
- An UI interface should be added to allow users to select the desired options. Additionally, it would be beneficial to generate an executable file for easier execution.
- The frames need to be removed at the end of the `mlsVideoCreator` function execution.
- Consider adding expression markup to the text and providing a proper introduction to the project.
- The `mlsVideoCreator` function could be enhanced by including the video configuration as one of its parameters.
- Include a header in the frames that indicates that the video is a resume and also includes the dates for the video.
- It is recommended to conduct thorough testing on the program to identify and resolve any potential bugs.


