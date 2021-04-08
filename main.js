const { app, BrowserWindow } = require('electron');
const path = require('path')

var winGlobal;

require('./server/index.js')

global.WIKI.serverEvent.on('success', ()=> {
    setTimeout(() => winGlobal.loadURL('http://localhost:3456'), 5000);
});

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 900,
        webPreferences: {
            //   preload: path.join(__dirname, 'preload.js')
        }
    })
    winGlobal = win;
    win.setMenuBarVisibility(false)
    win.loadFile('./index.html')
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})