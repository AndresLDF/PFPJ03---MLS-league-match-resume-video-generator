# PFPJ03 - MLS league matches resume video generator
## Table of Contents
1. [Objective](#objective)
2. [Structure of the project](#Structure-of-the-project)
3. [Main functions](#Main-functions)
4. [Creating a Video](#Creating-a-Video)
   - [Example Video](#Example-Video)
5. [Points of improvement](#Points-of-improvement)


## Objective

The objective of this project is to generate a video related to a live web page using Selenium and Ffmpeg in Node.js. This is achieved by accomplishing the following sub-objectives:
1. **Use Selenium as a web scraping tool.** In this case, we extract information from a soccer league page.
2. **Use Selenium to capture screenshots of specific elements.**
3. **Use Selenium as a web automation tool.** In this example, we automate the creation of sound files on a TTS (Text To Speach) web page.
4. **Use Selenium to handle shadow-root elements**. In this case the browser's download page and after that manipulate downloaded files using Node.js.
5. **Use Ffmpeg for video creation.**

This project's objective is not to generate high-quality videos but to explore the potential of Selenium and Ffmpeg for automatic video content generation.
In a project with the main objective of automatic video generation, I recommend using a TTS API, such as the ones provided by Google, Amazon, or Cooki TTS.

This project, in particular, uses a procedural programming approach. For an object-oriented approach in Node.js, please check other projects like PFPJ04.

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

## Creating a Video
The steps to create a video are:
1. Call the **mlsMatchesExtractor** function for the weeks that contain the matches that you would like to use for the vide
2. Call **mlsVideoCreator** for the specific dates that you would like to create the video. Specify the name
3. Check the video at the videos folder

### Example Video
Please unmute the video

https://github.com/AndresLDF/PFPJ03---MLS-league-match-resume-video-generator/assets/71279108/0f760527-2370-4ea7-b253-3671ce8ddb93


## Points of improvement:
- The programm does not check if the files already exist to take proper actions. This cause that a new video with the same name of an old one is not generated 
- An interfase for selecting the options to use should be added
- The frames has to be removed at the end of the function
- The function mlsVideoCreator for creating the video could include the video configuration as on of the paramenter
- Include a header in the frames that indicate that the video is a resume and also has the dates included
- Some testing should be done over the programm to check for possible bugs


