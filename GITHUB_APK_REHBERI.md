# GitHub Üzerinden Mihrab Android APK Oluşturma Rehberi

Bu proje **Capacitor** ve **GitHub Actions** ile doğrudan GitHub üzerinden Android `.apk` dosyası üretecek şekilde yapılandırılmıştır. Bilgisayarınıza Android Studio kurmanıza gerek yoktur.

## Hazırlanan Dosyalar
- `capacitor.config.ts` — Android uygulama kimliği (`com.mihrab.namazvakti`) ve adı (`Mihrab`)
- `.github/workflows/build-apk.yml` — GitHub üzerinde otomatik APK derleme iş akışı (Java 21 + Android SDK 36 + Gradle)
- `scripts/configure-android.mjs` — Konum (Kıble & Vakitler), Bildirim ve Titreşim (Zikirmatik) izinlerini `AndroidManifest.xml` içine otomatik ekleyen betik

## Adım Adım APK Alma

1. **Projeyi GitHub'a Yükleyin**
   - GitHub hesabınızda yeni bir depo (repository) oluşturun (örneğin `mihrab-namaz-vakti`).
   - Bu projenin tüm dosyalarını `.github/workflows/build-apk.yml` dahil olmak üzere `main` (veya `master`) dalına yükleyin (`git push`).

2. **GitHub Actions ile Derlemeyi Başlatın**
   - Dosyaları `main` / `master` dalına gönderdiğinizde derleme otomatik olarak başlar.
   - İsterseniz GitHub deponuzun üst menüsünden **Actions** sekmesine girip sol taraftan **Android APK Oluştur** iş akışını seçerek **Run workflow** düğmesiyle manuel olarak da başlatabilirsiniz.

3. **APK Dosyasını İndirin**
   - İş akışı yeşil tik ile tamamlandığında (genellikle 3-5 dakika sürer) çalışmanın içine tıklayın.
   - Sayfanın altındaki **Artifacts** bölümünden **`Mihrab-Android-APK`** dosyasını indirin.
   - İndirilen `.zip` dosyasını açtığınızda içindeki **`app-debug.apk`** dosyasını doğrudan Android telefonunuza kurabilirsiniz.
