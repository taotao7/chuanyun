const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  dialog,
  Notification,
} = require("electron");
const path = require("path");

const url = "https://h3yun.com/index.php?g=Chuanyun&m=Index&a=login";

//定义托盘logo和窗口
let tray;
let win;

//创建窗口
const createWindow = () => {
  win = new BrowserWindow({
    width: 1280,
    height: 768,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  win.loadURL(url);

  //最小化
  win.on("minimize", (event) => {
    event.preventDefault();
    win.hide();
  });

  //关闭
  win.on("close", (event) => {
    event.preventDefault();
    win.hide();
  });
  win.on("closed", () => {
    win = null;
  });

  //更改下载
  win.webContents.session.on("will-download", (e, item) => {
    //获取文件的总大小
    const totalBytes = item.getTotalBytes();
    //设置文件的保存路径，此时默认弹出的 save dialog 将被覆盖
    //const filePath = path.join(app.getPath("downloads"), item.getFilename());
    //item.setSavePath(filePath);
    //监听下载过程，计算并设置进度条进度
    item.on("updated", () => {
      win.setProgressBar(item.getReceivedBytes() / totalBytes);
    });
    //监听下载结束事件
    item.on("done", (e, state) => {
      //如果窗口还在的话，去掉进度条
      if (!win.isDestroyed()) {
        win.setProgressBar(-1);
      }
      //下载被取消或中断了
      if (state === "interrupted") {
        dialog.showErrorBox(
          "下载失败",
          `文件 ${item.getFilename()} 因为某些原因被中断下载`
        );
      }
      //下载完成，让 dock 上的下载目录Q弹一下下
      if (state === "completed") {
        showNotification();
      }
    });
  });

  //托盘
  tray = new Tray(path.join(__dirname, "./assets/logo.png"));

  let trayMenuTemplate = Menu.buildFromTemplate([
    {
      label: "退出",
      click: () => {
        win.destroy();
        app.quit();
      },
    },
    {
      label: "显示OA程序",
      click: () => {
        win.show();
      },
    },
  ]);

  tray.setToolTip("标禾OA");
  tray.setContextMenu(trayMenuTemplate);

  //监听双击重新显示窗口
  tray.on("double-click", () => {
    win.show();
  });
};

app.whenReady().then(createWindow);

//当全部关闭
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

//下载完成提醒
const showNotification = () => {
  const notification = {
    titile: "OA提醒",
    body: "下载完成了",
  };
  new Notification(notification).show();
};
