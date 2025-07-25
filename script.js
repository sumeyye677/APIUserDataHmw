const appendLocation = '.ins-api-users'; 
const UserApp = {
    apiUrl: 'https://jsonplaceholder.typicode.com/users',
    storageKey: 'userAppData',
    sessionKey: 'refreshButtonUsed',
    users: [],
    observer: null,

    styles: `
        <style>
            .user-app-container {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 1200px;
                margin: 20px auto;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .user-app-header {
                text-align: center;
                color: #2c3e50;
                margin-bottom: 30px;
                font-size: 28px;
                font-weight: 600;
            }
            .user-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: 20px;
                margin-bottom: 20px;
            }
            .user-card {
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                transition: transform 0.2s, box-shadow 0.2s;
                border-left: 4px solid #3498db;
            }
            .user-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 4px 15px rgba(0,0,0,0.15);
            }
            .user-name {
                font-size: 20px;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 8px;
            }
            .user-email {
                color: #3498db;
                margin-bottom: 8px;
                font-size: 14px;
            }
            .user-address {
                color: #7f8c8d;
                font-size: 13px;
                line-height: 1.4;
                margin-bottom: 15px;
            }
            .delete-btn {
                background: #e74c3c;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: background 0.2s;
            }
            .delete-btn:hover {
                background: #c0392b;
            }
            .refresh-btn {
                background: #27ae60;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                font-weight: 600;
                display: block;
                margin: 20px auto;
                transition: background 0.2s;
            }
            .refresh-btn:hover {
                background: #229954;
            }
            .refresh-btn:disabled {
                background: #95a5a6;
                cursor: not-allowed;
            }
            .loading {
                text-align: center;
                padding: 40px;
                color: #7f8c8d;
                font-size: 18px;
            }
            .error {
                background: #e74c3c;
                color: white;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
            }
            .no-users {
                text-align: center;
                padding: 40px;
                color: #7f8c8d;
                font-size: 16px;
                background: white;
                border-radius: 8px;
                border: 2px dashed #bdc3c7;
            }
        </style>
    `,

    init() {
        console.log('UserApp başlatılıyor...');
        this.injectStyles();
        this.setupMutationObserver();
        this.loadUsers();
    },

    injectStyles() {
        if (!document.querySelector('#user-app-styles')) {
            const styleElement = document.createElement('div');
            styleElement.id = 'user-app-styles';
            styleElement.innerHTML = this.styles;
            document.head.appendChild(styleElement.firstElementChild);
        }
    },

    setupMutationObserver() {
        const targetElement = document.querySelector(appendLocation);
        if (!targetElement) {
            console.error(`Hedef element bulunamadı: ${appendLocation}`);
            return;
        }

        this.observer = new MutationObserver((mutations) => {
            setTimeout(() => {
                const userCards = targetElement.querySelectorAll('.user-card');
                const refreshBtn = targetElement.querySelector('.refresh-btn');
                
                if (userCards.length === 0 && !refreshBtn && this.users.length === 0) {
                    console.log('Tüm kullanıcılar silindi, refresh butonu gösteriliyor');
                    this.showRefreshButton();
                }
            }, 100);
        });

        this.observer.observe(targetElement, {
            childList: true,
            subtree: true
        });

        console.log('MutationObserver kuruldu');
    },

    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                const now = new Date().getTime();
                
                if (now - data.timestamp > 24 * 60 * 60 * 1000) {
                    localStorage.removeItem(this.storageKey);
                    return null;
                }
                
                return data.users;
            }
        } catch (error) {
            console.error('localStorage okuma hatası:', error);
            localStorage.removeItem(this.storageKey);
        }
        return null;
    },

    saveToStorage(users) {
        try {
            const data = {
                users: users,
                timestamp: new Date().getTime()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            console.log('Veriler localStorage\'a kaydedildi');
        } catch (error) {
            console.error('localStorage yazma hatası:', error);
        }
    },

    async fetchUsers() {
        try {
            console.log('API\'den kullanıcılar çekiliyor...');
            const response = await fetch(this.apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const users = await response.json();
            console.log(`${users.length} kullanıcı başarıyla çekildi`);
            return users;
        } catch (error) {
            console.error('API çekme hatası:', error);
            throw error;
        }
    },

    async loadUsers() {
        const targetElement = document.querySelector(appendLocation);
        if (!targetElement) {
            console.error(`Hedef element bulunamadı: ${appendLocation}`);
            return;
        }

        this.showLoading();

        try {
            let users = this.loadFromStorage();
            
            if (users) {
                console.log('Veriler localStorage\'dan yüklendi');
                this.users = users;
            } else {
                console.log('localStorage\'da veri yok, API\'den çekiliyor...');
                users = await this.fetchUsers();
                this.users = users;
                this.saveToStorage(users);
            }

            this.renderUsers();
        } catch (error) {
            this.showError('Kullanıcılar yüklenirken bir hata oluştu: ' + error.message);
        }
    },

    showLoading() {
        const targetElement = document.querySelector(appendLocation);
        targetElement.innerHTML = `
            <div class="user-app-container">
                <div class="loading">Kullanıcılar yükleniyor...</div>
            </div>
        `;
    },

    showError(message) {
        const targetElement = document.querySelector(appendLocation);
        targetElement.innerHTML = `
            <div class="user-app-container">
                <div class="error">${message}</div>
            </div>
        `;
    },

    showRefreshButton() {
        const targetElement = document.querySelector(appendLocation);
        const sessionUsed = sessionStorage.getItem(this.sessionKey);
        
        if (sessionUsed) {
            targetElement.innerHTML = `
                <div class="user-app-container">
                    <div class="no-users">
                        <h3>Tüm kullanıcılar silindi</h3>
                        <p>Kullanıcıları tekrar yüklemek için sayfayı yenileyin.</p>
                    </div>
                </div>
            `;
            return;
        }

        targetElement.innerHTML = `
            <div class="user-app-container">
                <div class="no-users">
                    <h3>Tüm kullanıcılar silindi</h3>
                    <p>Kullanıcıları tekrar yüklemek için aşağıdaki butona tıklayın.</p>
                    <button class="refresh-btn" onclick="UserApp.refreshUsers()">
                        Kullanıcıları Tekrar Yükle
                    </button>
                </div>
            </div>
        `;
    },

    async refreshUsers() {
        sessionStorage.setItem(this.sessionKey, 'true');
        
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.textContent = 'Yükleniyor...';
        }

        try {
            localStorage.removeItem(this.storageKey);
            const users = await this.fetchUsers();
            this.users = users;
            this.saveToStorage(users);
            this.renderUsers();
        } catch (error) {
            this.showError('Kullanıcılar yüklenirken bir hata oluştu: ' + error.message);
        }
    },

    renderUsers() {
        const targetElement = document.querySelector(appendLocation);
        
        if (this.users.length === 0) {
            this.showRefreshButton();
            return;
        }

        const userCards = this.users.map(user => `
            <div class="user-card" data-user-id="${user.id}">
                <div class="user-name">${user.name}</div>
                <div class="user-email">📧 ${user.email}</div>
                <div class="user-address">
                    📍 ${user.address.street}, ${user.address.suite}<br>
                    ${user.address.city}, ${user.address.zipcode}
                </div>
                <button class="delete-btn" onclick="UserApp.deleteUser(${user.id})">
                    Sil
                </button>
            </div>
        `).join('');

        targetElement.innerHTML = `
            <div class="user-app-container">
                <div class="user-app-header">Kullanıcı Yönetim Sistemi</div>
                <div class="user-grid">
                    ${userCards}
                </div>
            </div>
        `;

        console.log(`${this.users.length} kullanıcı başarıyla render edildi`);
    },

    deleteUser(userId) {
        console.log(`Kullanıcı siliniyor: ${userId}`);
        
        this.users = this.users.filter(user => user.id !== userId);
        
        this.saveToStorage(this.users);
        
        console.log(`Kullanıcı ${userId} silindi. Kalan kullanıcı sayısı: ${this.users.length}`);
        
        if (this.users.length === 0) {
            const userCard = document.querySelector(`[data-user-id="${userId}"]`);
            if (userCard) {
                userCard.remove();
            }
        } else {
            this.renderUsers();
        }
    },

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            console.log('MutationObserver durduruldu');
        }
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => UserApp.init());
} else {
    UserApp.init();
}

window.UserApp = UserApp;

console.log('Kullanıcı Yönetim Sistemi yüklendi. Kullanım için appendLocation değişkenini ayarlayın.');