const electron = require('electron')
const config = require('./config')
const app = electron.app;
const Tray = electron.Tray;
const BrowserWindow = electron.BrowserWindow;

//Prevents dock icon to display
if (process.platform == 'darwin') {
  //app.dock.hide();
}

//Prevents multiples instances of the program
app.makeSingleInstance(function() {})

app.on('ready', function() {
  //Sets the Tray icon
  var appIcon = null;
  appIcon = new Tray('./img/trayTemplate.png');
  appIcon.setToolTip(config.appname);

  //Main app Window
  var mw_width = 300
  var mw_height = 220
  var MainWindow = new BrowserWindow({
    width: mw_width,
    height: mw_height,
    show: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    frame: false,
  });
  MainWindow.loadURL('file://' + __dirname + '/windows/main.html');
  MainWindow.webContents.openDevTools();
  //Hide the main window when blured
  MainWindow.on('blur', function() {
    this.hide();
  })

  //Open main window when tray icon is clicked
  appIcon.on('click', function(event, bounds) {
    var x = bounds.x + (bounds.width / 2) - (mw_width / 2);
    if (bounds.y < 100) {
      //tray at top
      var y = bounds.y + bounds.height;
    } else {
      //tray at bottom
      var y = bounds.y - bounds.height - mw_height;
    }
    MainWindow.setPosition(x, y);
    MainWindow.show();
  })
})
