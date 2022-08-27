import path from "path";
import {
  app,
  dialog,
  Menu,
  MenuItemConstructorOptions,
  shell,
  Tray,
  nativeTheme,
} from "electron";

import Vault from "./vault";
import Server from "./server";

class TrayMenu {
  static readonly OPEN_BROWSER_DELAY = 500;

  static readonly MENU_SERVER_STATUS = "menu-server-status";
  static readonly MENU_SERVER_TOGGLE = "menu-server-toggle";
  static readonly MENU_OPEN_IN_BROWSER = "menu-open-in-browser";
  static readonly MENU_VAULT_PATH = "menu-vault-path";
  static readonly MENU_VAULT_OPEN = "menu-vault-open";

  static readonly ICON_TRAY_LOOP_DURATION = 1200;
  static readonly ICON_TRAY_IDLE = "canutin-tray-idle";
  static readonly ICON_TRAY_ACTIVE = "canutin-tray-active";
  static readonly ICON_STATUS_POSITIVE = "status-positive";
  static readonly ICON_STATUS_NEGATIVE = "status-negative";

  private isServerRunning: boolean;
  private isAppBusy: boolean;
  private isAppPackaged: boolean;
  private isMacOs: boolean;

  private tray: Tray;
  private trayIcon: string;
  private vault: Vault;
  server: Server | undefined;

  private menuServerStatus: MenuItemConstructorOptions;
  private menuServerToggle: MenuItemConstructorOptions;
  private menuOpenInBrowser: MenuItemConstructorOptions;
  private menuVaultPath: MenuItemConstructorOptions;
  private menuSwitchVault: MenuItemConstructorOptions;
  private menuPresistentOptions: MenuItemConstructorOptions[];
  private menuSeparator: MenuItemConstructorOptions;
  private menuCurrentTemplate: MenuItemConstructorOptions[];

  constructor(vault: Vault) {
    this.vault = vault;
    this.isServerRunning = false;
    this.isAppBusy = true;
    this.isAppPackaged = app.isPackaged || false;
    this.isMacOs = process.platform === "darwin";

    // Menu items (not in order)
    this.menuSeparator = { type: "separator" };
    this.menuServerStatus = {
      label: "Canutin is not running",
      icon: this.getImagePath(TrayMenu.ICON_STATUS_NEGATIVE),
      id: TrayMenu.MENU_SERVER_STATUS,
      enabled: false,
    };
    this.menuServerToggle = {
      label: "Start Canutin",
      click: () => this.toggleServer(),
      id: TrayMenu.MENU_SERVER_TOGGLE,
      visible: false,
    };
    this.menuOpenInBrowser = {
      label: "Open in browser",
      id: TrayMenu.MENU_OPEN_IN_BROWSER,
      accelerator: this.isMacOs ? "Command+T" : "Ctrl+T",
      visible: false,
      click: () => this.openBrowser(),
    };
    this.menuOpenInBrowser = {
      label: "Open in browser",
      id: TrayMenu.MENU_OPEN_IN_BROWSER,
      accelerator: this.isMacOs ? "Command+T" : "Ctrl+T",
      visible: false,
      click: () => this.openBrowser(),
    };
    this.menuVaultPath = {
      label: this.vault?.path ? this.vault.path : "No vault chosen",
      id: TrayMenu.MENU_VAULT_PATH,
      enabled: false,
    };
    this.menuSwitchVault = {
      label: "Switch vault...",
      id: TrayMenu.MENU_VAULT_OPEN,
      accelerator: this.isMacOs ? "Command+S" : "Ctrl+S",
      click: () => this.switchVault(),
    };
    this.menuPresistentOptions = [
      {
        label: "About",
        click: () => app.showAboutPanel(),
      },
      {
        label: "Quit",
        accelerator: this.isMacOs ? "Command+Q" : "Alt+F4",
        click: () => app.quit(),
      },
    ];
    // Menu items (in order)
    this.menuCurrentTemplate = [
      this.menuServerStatus,
      this.menuSeparator,
      this.menuServerToggle,
      this.menuOpenInBrowser,
      this.menuSeparator,
      this.menuVaultPath,
      this.menuSwitchVault,
      this.menuSeparator,
      ...this.menuPresistentOptions,
    ];

    // Set the tray
    this.tray = new Tray(this.getImagePath(TrayMenu.ICON_TRAY_IDLE));
    this.tray.on("click", () => this.tray?.popUpContextMenu()); // Left-click opens the context menu in Windows
    this.tray.setToolTip("Canutin");
    this.tray.setContextMenu(Menu.buildFromTemplate(this.menuCurrentTemplate));

    // Intilialize the tray icon animation
    this.setTrayIconBusy();

    // Update the tray menu if the OS color theme changes
    nativeTheme.on("updated", () => {
      this.setTrayIcon(this.trayIcon);
    });

    // Start the server
    if (this.vault?.path) {
      this.toggleServer();
      this.isAppPackaged && this.openBrowser(TrayMenu.OPEN_BROWSER_DELAY);
    }
  }

  private switchVault = () => {
    const { vault } = this;
    const isVaultSet = vault.dialog();

    if (isVaultSet && vault.path) {
      this.menuVaultPath.label = vault.path;
      this.updateTray();

      // Starting (or restarting) the server
      if (this.isServerRunning) {
        this.toggleServer(); // Stops the server
        this.toggleServer(); // Starts the server
      } else {
        this.toggleServer(); // Starts the server
        this.openBrowser(TrayMenu.OPEN_BROWSER_DELAY);
      }
    }
  };

  private toggleServer = () => {
    this.isAppBusy = true;
    const vaultPath = this.vault?.path;

    if (!this.server && vaultPath) this.server = new Server(vaultPath);

    if (this.server && this.isServerRunning) {
      // Stop the server
      this.server.stop();
      this.menuServerToggle.label = "Start Canutin";
      this.menuServerStatus.label = "Canutin is not running";
      this.menuServerStatus.icon = this.getImagePath(
        TrayMenu.ICON_STATUS_NEGATIVE
      );
      this.menuOpenInBrowser.visible = false;
      this.updateTray();

      // FIXME: remove setTimeout and instead check if the server is still listening to requests
      // REF: https://github.com/Canutin/desktop-2/issues/8
      setTimeout(() => {
        // Runs one loop of the tray icon animation before switching to `ICON_TRAY_IDLE`
        this.isAppBusy = false;
        this.setTrayIcon(TrayMenu.ICON_TRAY_IDLE);
      }, TrayMenu.ICON_TRAY_LOOP_DURATION);
    } else if (this.server) {
      // Start the server
      this.server.start(vaultPath);
      this.menuServerToggle.visible = true;
      this.menuServerToggle.label = "Stop Canutin";
      this.menuServerStatus.label = "Canutin is running";
      this.menuServerStatus.icon = this.getImagePath(
        TrayMenu.ICON_STATUS_POSITIVE
      );
      this.menuOpenInBrowser.visible = true;
      this.updateTray();

      // FIXME: remove setTimeout and instead check if the server is still listening to requests
      // REF: https://github.com/Canutin/desktop-2/issues/8
      setTimeout(() => {
        // Runs one loop of the tray icon animation before switching to `ICON_TRAY_ACTIVE`
        this.isAppBusy = false;
        this.setTrayIcon(TrayMenu.ICON_TRAY_ACTIVE);
      }, TrayMenu.ICON_TRAY_LOOP_DURATION);
    }

    // FIXME:
    // It would be better to check if the server is actually running (or not)
    // instead of blindingly reversing the vaule of `isServerRunning`.
    // REF: https://github.com/Canutin/desktop-2/issues/8
    this.isServerRunning = !this.isServerRunning;
  };

  private updateTray = () => {
    this.tray?.setContextMenu(Menu.buildFromTemplate(this.menuCurrentTemplate));
  };

  private openBrowser(delay: number = 0) {
    const server = this.server;
    // FIXME:
    // To prevent opening the browser before the server is ready we wait.
    // Server boot up time is likely to vary so ideally we would "ping"
    // the server until it's ready and only then open the user's browser.
    server?.url && setTimeout(() => shell.openExternal(server.url), delay);
  }

  private getImagePath(fileName: string) {
    const themeAgnosticIcons = [
      TrayMenu.ICON_STATUS_POSITIVE,
      TrayMenu.ICON_STATUS_NEGATIVE,
    ];

    let theme: string;
    if (themeAgnosticIcons.includes(fileName)) {
      theme = "";
    } else {
      theme = nativeTheme.shouldUseDarkColors ? "-dark" : "-light";
    }

    return this.isAppPackaged
      ? path.join(process.resourcesPath, `assets/${fileName}${theme}.png`)
      : `./resources/assets/${fileName}${theme}.png`;
  }

  private setTrayIcon = (icon: string) => {
    this.trayIcon = icon;
    this.tray.setImage(this.getImagePath(icon));
  };

  private setTrayIconBusy = () => {
    // Animates the tray icon by cycling through the frames below
    enum TrayBusyIconFrames {
      FRAME_1 = "canutin-tray-busy-frame1",
      FRAME_2 = "canutin-tray-busy-frame2",
      FRAME_3 = "canutin-tray-busy-frame3",
    }

    const toggleAnimation = () => {
      if (!this.isAppBusy) return;

      setTimeout(() => {
        this.isAppBusy && this.setTrayIcon(TrayBusyIconFrames.FRAME_2);
      }, TrayMenu.ICON_TRAY_LOOP_DURATION * 0);
      setTimeout(() => {
        this.isAppBusy && this.setTrayIcon(TrayBusyIconFrames.FRAME_3);
      }, TrayMenu.ICON_TRAY_LOOP_DURATION * 0.25);
      setTimeout(() => {
        this.isAppBusy && this.setTrayIcon(TrayBusyIconFrames.FRAME_2);
      }, TrayMenu.ICON_TRAY_LOOP_DURATION * 0.5);
      setTimeout(() => {
        this.isAppBusy && this.setTrayIcon(TrayBusyIconFrames.FRAME_1);
      }, TrayMenu.ICON_TRAY_LOOP_DURATION * 0.75);
    };

    setInterval(toggleAnimation, TrayMenu.ICON_TRAY_LOOP_DURATION);
  };
}

export default TrayMenu;
