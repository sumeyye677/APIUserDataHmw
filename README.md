# Kullanıcı Yönetim Sistemi

Bu proje JavaScript ile yapılmış basit bir kullanıcı yönetim uygulamasıdır.

## Kurulum

HTML dosyanızda bir div oluşturun:
```html
<div class="ins-api-users"></div>
```

JavaScript dosyasını dahil edin veya kodları console'a yapıştırın.

## Özellikler

- JSONPlaceholder API'den kullanıcı verileri çeker
- localStorage ile 1 gün cache yapar
- Kullanıcıları kart şeklinde listeler
- Kullanıcı silme özelliği
- Tüm kullanıcılar silindiğinde "Tekrar Yükle" butonu (session başına 1 kez)
- MutationObserver ile DOM değişikliklerini takip eder

## Nasıl Çalışır

1. Sayfa açıldığında localStorage kontrol edilir
2. Veri yoksa API'den çekilir ve kaydedilir
3. Kullanıcılar kart halinde gösterilir
4. Her kartın "Sil" butonu vardır
5. Son kullanıcı silindiğinde otomatik refresh butonu çıkar

## Konfigürasyon

Dosyanın başındaki `appendLocation` değişkenini değiştirerek hedef elementi belirleyebilirsiniz:

```javascript
const appendLocation = '.ins-api-users'; // Buraya farklı selector yazabilirsiniz
```

## Teknolojiler

- Vanilla JavaScript
- Fetch API
- localStorage/sessionStorage
- MutationObserver API
- CSS Grid
