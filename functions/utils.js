const {Builder, Capabilities, By, until, promise} = require ("selenium-webdriver");
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();


function wait(ms) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }


  async function centerElement(elem, driver){
    /*
      This code executes a console script to center the element given by th argument elem.
      The script does the following>
      1- Get the scrollbar to position 0
      2- Get the document element height (windows heihht)
      3- Get the document element with (windows with)
      4- Get the element rectangle
      5- Get the element 
    */
    await driver.executeScript(`
      window.scrollTo(0, 0);   
      const elem = arguments[0];
      const clientHeight = document.documentElement.clientHeight;
      const clientWidth = document.documentElement.clientWidth;
      const elemRect = elem.getBoundingClientRect();
      const elemHeight = elemRect.height;
      const elemWidth = elemRect.width;
      const centerTop = (clientHeight - elemHeight) / 2;
      const centerLeft = (clientWidth - elemWidth) / 2;
      window.scrollTo(elemRect.left - centerLeft, elemRect.top - centerTop);
  `, elem);
  }

  function changeFileName(Path, oldFile, newName){ 
    // Rename the requested file ile
    fs.rename(path.join(Path, oldFile), path.join(Path, newName), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`File ${oldFile} renamed to ${newName}`);
      });
  }
  async function waitUntilVisible(driver, cssSelector, timeout = 5000) { //Not in use anymore, can be removed
    await driver.wait(until.elementLocated(By.css(cssSelector)), timeout);
    await driver.wait(until.elementIsVisible(driver.findElement(By.css(cssSelector))), timeout);
  }


  function createConnection(dbPath) {
    return new Promise((resolve, reject) => {
      const con = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(con);
      });
    });
  }
  
  function executeQuery(con, query) {
    return new Promise((resolve, reject) => {
      con.all(query, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  }
  



  module.exports = {wait, centerElement, changeFileName, waitUntilVisible, createConnection, executeQuery};
