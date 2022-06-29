const {ipcRenderer} = require('electron');
// var closeApp = document.getElementById('close');
window.onload=function(){
    const closeApp = document.getElementById('close');
    closeApp.addEventListener('click', function() {
        ipcRenderer.send('close-me')
    });

    const launchApp = document.getElementById('launch');
    launchApp.addEventListener('click', function() {
        ipcRenderer.send('launch')
    });
  }