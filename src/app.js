import { UIUtils } from './utils/ui-utils.js';
import { Search } from './search.js';
import { Env } from './env.js';


export class App {
  constructor() {
    this.initializeElements();
    this.bindEvents();
  }

  initializeElements() {
    this.searchButton = document.getElementById('loadApps');
    this.searchInput = document.getElementById('search');
    this.envSelect = document.getElementById('envSelect');
  }


  bindEvents() {
    this.searchButton.addEventListener('click', this.handleSearchClick.bind(this));
    this.searchInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        this.handleSearchClick().catch();
      }
    });

    this.envSelect.addEventListener('change', async (e) => {
      const newIndex = Number(e.target.value);
      await Env.setIndex(newIndex);
    });
  }

  async handleSearchClick() {
    const searchText = UIUtils.getSearchValue();
    const isCaseSensitive = UIUtils.isCaseSensitive();

    if (!UIUtils.isSearchValueValid()) {
      UIUtils.showError('Введите текст для поиска');
      return;
    }

    this.setSearchButtonState(false);

    try {
      await Search.searchApps(searchText, isCaseSensitive);
    } finally {
      this.setSearchButtonState(true);
    }
  }


  setSearchButtonState(enabled) {
    if (this.searchButton) {
      this.searchButton.disabled = !enabled;
      this.searchButton.textContent = enabled ? 'Загрузить' : 'Поиск...';
    }
  }

  async populateEnv() {
    const hosts = Env.getHosts();
    const labels = ['prod', 'stand 21', 'retool new'];
    this.envSelect.innerHTML = '';
    hosts.forEach((h, i) => {
      const opt = document.createElement('option');
      opt.value = String(i);
      const url = h.replace(/\/$/, '');
      const label = labels[i] ? ` (${labels[i]})` : '';
      opt.textContent = `${url}${label}`;
      if (i === Env.index) {
        opt.selected = true;
      }
      this.envSelect.appendChild(opt);
    });
  }
}