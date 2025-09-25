import { UIUtils } from './utils/ui-utils.js';
import { Search } from './search.js';


export class App {
  constructor() {
    this.initializeElements();
    this.bindEvents();
  }

  initializeElements() {
    this.searchButton = document.getElementById('loadApps');
    this.searchInput = document.getElementById('search');
  }


  bindEvents() {
    this.searchButton.addEventListener('click', this.handleSearchClick.bind(this));
    this.searchInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        this.handleSearchClick().catch();
      }
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
}