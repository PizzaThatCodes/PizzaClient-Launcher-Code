const electron = require('electron');
const url = require('url');
const path = require('path');
var exec = require('child_process').exec;
const screen = electron.screen;
const os = require("os");
const fs = require('fs');
const Downloader = require("nodejs-file-downloader");
var AdmZip = require("adm-zip");

const { app, BrowserWindow } = electron;

let mainWindow;

app.on('before-quit', function() {
  var natives = path.join(__dirname, "natives.zip");
    var libraries = path.join(__dirname, "libraries.zip");
    var jar = path.join(__dirname,"PizzaClient.jar");

    fs.rmSync(natives);
    fs.rmSync(libraries);
    fs.rmSync(jar);

    fs.rmSync("natives", {
      recursive: true,
    });
    fs.rmSync("libraries", {
      recursive: true,
    });
})

// Listen for app to be ready
app.on('ready', function(){
    //Create new window
    downloadFiles();
    
    let factor = screen.getPrimaryDisplay().scaleFactor;

    // Create the browser window.
    mainWindow = new BrowserWindow({
      frame: false,
      movable: true,
      width: 1400 / factor,
      height: 800 / factor,
      webPreferences: {
        zoomFactor: 1.0 / factor
      },
      resizable: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        devTools: true
    }
    });
    
    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    mainWindow.setMovable(true);
    // mainWindow.setMenu(null);
});


function downloadFiles() {
  const natives = new Downloader({
    url: "https://github.com/PizzaThatCodes/PizzaClient-Launcher/raw/main/natives.zip",
    directory: "./",
    cloneFiles: false,
  });
  const libraries = new Downloader({
    url: "https://github.com/PizzaThatCodes/PizzaClient-Launcher/raw/main/libaries.zip",
    directory: "./",
    fileName: "libraries.zip",
    cloneFiles: false,
  });
  const jar = new Downloader({
    url: "https://github.com/PizzaThatCodes/PizzaClient-Launcher/raw/main/PizzaClient.jar",
    directory: "./",
    cloneFiles: false,
  });

  try {
    natives.download();
    libraries.download();
    jar.download();
  } catch (error) {
    console.log(error);
  }
}


function getOSMCFiles() {
  const isMac = os.platform() === "darwin";
  const isWindows = os.platform() === "win32";
  const isLinux = os.platform() === "linux";
  if(isMac) return os.homedir + path.sep + "Library" + path.sep + "Applacation Support" + path.sep + "minecraft";
  if(isWindows) return os.homedir + path.sep + "AppData" + path.sep + "Roaming" + path.sep + ".minecraft";
  if(isLinux) return os.homedir + path.sep + ".minecraft";
}

const minecraftDirectory = getOSMCFiles();
console.log(minecraftDirectory.toString())
const minecraftAssets = minecraftDirectory.toString() + path.sep + "assets";


const {ipcMain} = require('electron');
ipcMain.on('close-me', (evt, arg) => {
  app.quit()
})

ipcMain.on('launch', (evt, arg) => {
  downloadFiles();
  setTimeout(function() {

    const startTime = new Date().getTime() + 1000;
    let currentTime = new Date().getTime();
    
    function customTimeout() {
      while (startTime > currentTime) {
        currentTime = new Date().getTime();
      }
  
      var natives = path.join("./", "natives.zip");
      var libraries = path.join("./", "libraries.zip");
      var jar = path.join("./","PizzaClient.jar");
  
      var zipNatives = new AdmZip("./natives.zip");
      var zipLibraries = new AdmZip("./libraries.zip");
    
      zipNatives.extractAllTo(/*target path*/ "./natives/", /*overwrite*/ true);
      zipLibraries.extractAllTo(/*target path*/ "./libraries/", /*overwrite*/ true);
      fs.rmSync(natives);
      fs.rmSync(libraries);
  
      exec("java -"  
      + "Xms1024M "
      + "-Xmx4096M "
      + "-Djava.library.path=\"" + "./" + path.sep + "natives" + "\" "
      + "-cp \"" + "./" + path.sep + "libraries" + path.sep + "*" + ";" + jar.toString() + "\" "
      + "net.minecraft.client.main.Main "
      + "--width 854 "
      + "--height 480 "
      + "--username Pizza "
      + "--version 1.8.8 "
      + "--gameDir " + minecraftDirectory.toString() + " "
      + "--assetsDir " + minecraftAssets.toString() + " "
      + "assetsIndex 1.8.8 "
      + "uuid N/A "
      + "--accessToken aeef7bc935f9420eb6314dea7ad7e1e5 "
      + "--userType mojang");
      app.quit();
  
    };
  
    
    customTimeout();


  }, 8000);


})