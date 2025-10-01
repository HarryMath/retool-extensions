export class Env {
  static hosts = [
    "https://admin.walletbot.net",
    "https://retool.stand21.walletteam.org",
    "https://retool-new.walletteam.org"
  ];
  static index = 0;

  static getHosts() {
    return Env.hosts;
  }

  static getBaseUrl() {
    return Env.hosts[Env.index] || '';
  }

  static getCookieDomain() {
    return Env.getBaseUrl();
  }

  static async setIndex(newIndex) {
    Env.index = newIndex;
  }
}


