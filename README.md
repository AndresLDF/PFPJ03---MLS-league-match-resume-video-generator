# PFPJ03 - MLS league matches resume video generator
## Objective

The objective of this project is to generate a video related to a live web page using Selenium and Ffmpeg in Node.js. This is achieved by accomplishing the following sub-objectives:
1. **Use Selenium as a web scraping tool.** In this case, we extract information from a soccer league page.
2. **Use Selenium to capture screenshots of specific elements.**
3. **Use Selenium as a web automation tool.** In this example, we automate the creation of sound files on a TTS (Text To Speach) web page.
4. **Use Selenium to handle shadow-root elements**. In this case the browser's download page and after that manipulate downloaded files using Node.js.
5. **Use Ffmpeg for video creation.**

This project's objective is not to generate high-quality videos but to explore the potential of Selenium and Ffmpeg for automatic video content generation.
In a project with the main objective of automatic video generation, I recommend using a TTS API, such as the ones provided by Google, Amazon, or Cooki TTS.

## Structure of the project

This project consists of 5 main files:
1. **Index.js**: This is the main file from where all the functions are called and executed.
2. **mlsExtractor.js**: This file contains the function **mlsMatchesExtractor** and the supporting functions. Its main purpose is to extract match information for a certain week.
3. **mlsVideo.js**: This file contains the function **mlsVideoCreator** and the supporting functions. Its main purpose is to create a video from a specific date range.
4. **utils.js**: This file contains some general-purpose functions such as centering the browser view, changing file names, managing the database, etc.
5. **soccer.sqlite**: This file contains all the information scraped by the mlsMatchesExtractor function.

All the other files in the project are modules or configuration files.

## Main functions to use in this project are:
- **mlsMatchesExtractor**: This functions is in charge of scrapping the MLS web for and specific week. The parameters are:
  - Chrome Capabilities configuration
  - Chrome Options
  - An SQLite Connection (generated with the createConnection fucntion located in utils.js)
  - Date in format yyyy-mm-dd. If not date is specified, the current date is used
-**mlsVideoCreator**:  This functions is in charge of creating a video with the results of all the matches. The parameters are:
  - Chrome Capabilities configuration
  - Chrome Options
  - An SQLite Connection (generated with the createConnection fucntion located in utils.js)
  - Start date in format yyyy-mm-dd
  - End date in format yyyy-mm-dd




