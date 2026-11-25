import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const iosRoot = path.resolve(process.cwd(), 'ios');
const appDir = path.join(iosRoot, 'App/App');
const infoPlistPath = path.join(appDir, 'Info.plist');
const appDelegatePath = path.join(appDir, 'AppDelegate.swift');
const sceneDelegatePath = path.join(appDir, 'SceneDelegate.swift');
const mainStoryboardPath = path.join(appDir, 'Base.lproj/Main.storyboard');
const appIconTargetPath = path.join(
  appDir,
  'Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'
);
const sourceIconPath = path.resolve(process.cwd(), 'electron/icon.png');

if (!fs.existsSync(infoPlistPath)) {
  console.error('Info.plist bulunamadı:', infoPlistPath);
  process.exit(1);
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function setPlistString(xml, key, value) {
  const escaped = escapeXml(value);
  const re = new RegExp(`(<key>${key}<\\/key>\\s*<string>)[\\s\\S]*?(<\\/string>)`);
  if (re.test(xml)) {
    return xml.replace(re, `$1${escaped}$2`);
  }
  return xml.replace(
    /<\/dict>\s*<\/plist>/,
    `\t<key>${key}</key>\n\t<string>${escaped}</string>\n</dict>\n</plist>`
  );
}

function setPlistBool(xml, key, value) {
  const tag = value ? '<true/>' : '<false/>';
  const re = new RegExp(`(<key>${key}<\\/key>\\s*)<(?:true|false)\\/>`);
  if (re.test(xml)) {
    return xml.replace(re, `$1${tag}`);
  }
  return xml.replace(
    /<\/dict>\s*<\/plist>/,
    `\t<key>${key}</key>\n\t${tag}\n</dict>\n</plist>`
  );
}

function ensurePlistBackgroundAudio(xml) {
  if (xml.includes('<key>UIBackgroundModes</key>')) {
    if (!xml.includes('<string>audio</string>')) {
      return xml.replace(
        /(<key>UIBackgroundModes<\/key>\s*<array>)/,
        '$1\n\t\t<string>audio</string>'
      );
    }
    return xml;
  }
  return xml.replace(
    /<\/dict>\s*<\/plist>/,
    `\t<key>UIBackgroundModes</key>\n\t<array>\n\t\t<string>audio</string>\n\t</array>\n</dict>\n</plist>`
  );
}

// 1. Info.plist izinleri, Türkçe uygulama adı ve arka plan ses desteği
let plist = fs.readFileSync(infoPlistPath, 'utf8');
plist = setPlistString(plist, 'CFBundleDisplayName', 'Mihrab');
plist = setPlistString(plist, 'CFBundleDevelopmentRegion', 'tr');
plist = setPlistString(
  plist,
  'NSLocationWhenInUseUsageDescription',
  'Mihrab, bulunduğunuz konuma göre Diyanet uyumlu namaz vakitlerini ve Kıble açısını hesaplamak için konum bilginize ihtiyaç duyar.'
);
plist = setPlistString(
  plist,
  'NSMotionUsageDescription',
  'Canlı Kıble pusulasının cihaz yönüne göre doğru çalışabilmesi için hareket ve yön sensörü erişimi gereklidir.'
);
plist = setPlistBool(plist, 'ITSAppUsesNonExemptEncryption', false);
plist = ensurePlistBackgroundAudio(plist);
fs.writeFileSync(infoPlistPath, plist, 'utf8');

// 2. AppDelegate.swift + MihrabViewController + MihrabNotificationPlugin (UNUserNotificationCenter)
fs.writeFileSync(
  appDelegatePath,
  `import UIKit
import Capacitor
import UserNotifications
import AVFoundation

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {
    var window: UIWindow?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        UNUserNotificationCenter.current().delegate = self
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            // Ses oturumu sessizce yoksayılır
        }
        return true
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.banner, .list, .sound])
    }

    func application(
        _ application: UIApplication,
        configurationForConnecting connectingSceneSession: UISceneSession,
        options: UIScene.ConnectionOptions
    ) -> UISceneConfiguration {
        let config = UISceneConfiguration(
            name: "Default Configuration",
            sessionRole: connectingSceneSession.role
        )
        config.delegateClass = SceneDelegate.self
        return config
    }
}

class MihrabViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(MihrabNotificationPlugin())
    }
}

@objc(MihrabNotificationPlugin)
public class MihrabNotificationPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "MihrabNotificationPlugin"
    public let jsName = "MihrabNotifications"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getPermissionStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestPermission", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "syncPrayerSchedule", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "sendAlertNotification", returnType: CAPPluginReturnPromise),
    ]

    private let notificationPrefix = "mihrab-prayer-"
    private let defaultsScheduleKey = "mihrab_schedule_json"

    @objc public func getPermissionStatus(_ call: CAPPluginCall) {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            call.resolve(["state": self.mapAuthStatus(settings.authorizationStatus)])
        }
    }

    @objc public func requestPermission(_ call: CAPPluginCall) {
        UNUserNotificationCenter.current().requestAuthorization(
            options: [.alert, .sound, .badge]
        ) { granted, _ in
            UNUserNotificationCenter.current().getNotificationSettings { settings in
                let status = granted ? "granted" : self.mapAuthStatus(settings.authorizationStatus)
                if granted {
                    self.rescheduleFromDefaults()
                }
                call.resolve(["state": status])
            }
        }
    }

    @objc public func syncPrayerSchedule(_ call: CAPPluginCall) {
        let payload: [String: Any] = [
            "persistentEnabled": call.getBool("persistentEnabled") ?? true,
            "alertsEnabled": call.getBool("alertsEnabled") ?? true,
            "soundEnabled": call.getBool("soundEnabled") ?? false,
            "leadMinutes": call.getInt("leadMinutes") ?? 0,
            "locationName": call.getString("locationName") ?? "İstanbul",
            "dateLabel": call.getString("dateLabel") ?? "",
            "hijriLabel": call.getString("hijriLabel") ?? "",
            "prayersJson": call.getString("prayersJson") ?? "[]",
            "enabledPrayersJson": call.getString("enabledPrayersJson") ?? "{}",
        ]

        if let data = try? JSONSerialization.data(withJSONObject: payload),
           let raw = String(data: data, encoding: .utf8) {
            UserDefaults.standard.set(raw, forKey: defaultsScheduleKey)
        }

        applySchedule(payload: payload)

        UNUserNotificationCenter.current().getNotificationSettings { settings in
            call.resolve([
                "applied": true,
                "permission": self.mapAuthStatus(settings.authorizationStatus),
            ])
        }
    }

    @objc public func sendAlertNotification(_ call: CAPPluginCall) {
        let title = call.getString("title") ?? "Mihrab Namaz Vakti"
        let body = call.getString("body") ?? ""

        UNUserNotificationCenter.current().getNotificationSettings { settings in
            let status = self.mapAuthStatus(settings.authorizationStatus)
            guard status == "granted" else {
                call.resolve(["sent": false])
                return
            }

            let content = UNMutableNotificationContent()
            content.title = title
            content.body = body
            content.sound = .default

            let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 0.25, repeats: false)
            let req = UNNotificationRequest(
                identifier: "mihrab-alert-\\(Int(Date().timeIntervalSince1970 * 1000))",
                content: content,
                trigger: trigger
            )
            UNUserNotificationCenter.current().add(req) { error in
                call.resolve(["sent": error == nil])
            }
        }
    }

    private func rescheduleFromDefaults() {
        guard let raw = UserDefaults.standard.string(forKey: defaultsScheduleKey),
              let data = raw.data(using: .utf8),
              let payload = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return
        }
        applySchedule(payload: payload)
    }

    private func applySchedule(payload: [String: Any]) {
        let center = UNUserNotificationCenter.current()
        center.getPendingNotificationRequests { requests in
            let idsToRemove = requests
                .map { $0.identifier }
                .filter { $0.hasPrefix(self.notificationPrefix) }
            if !idsToRemove.isEmpty {
                center.removePendingNotificationRequests(withIdentifiers: idsToRemove)
            }

            let alertsEnabled = (payload["alertsEnabled"] as? Bool) ?? true
            guard alertsEnabled else { return }

            let soundEnabled = (payload["soundEnabled"] as? Bool) ?? false
            let leadMinutes = (payload["leadMinutes"] as? Int) ?? 0
            let locationName = (payload["locationName"] as? String) ?? "Mihrab"
            let prayersJson = (payload["prayersJson"] as? String) ?? "[]"
            let enabledPrayersJson = (payload["enabledPrayersJson"] as? String) ?? "{}"

            guard let prayersData = prayersJson.data(using: .utf8),
                  let prayers = try? JSONSerialization.jsonObject(with: prayersData) as? [[String: Any]] else {
                return
            }

            var enabledMap: [String: Bool] = [:]
            if let enabledData = enabledPrayersJson.data(using: .utf8),
               let parsed = try? JSONSerialization.jsonObject(with: enabledData) as? [String: Any] {
                for (k, v) in parsed {
                    if let b = v as? Bool {
                        enabledMap[k] = b
                    }
                }
            }

            let nowSec = Date().timeIntervalSince1970
            var scheduledCount = 0

            for (index, item) in prayers.enumerated() {
                if scheduledCount >= 60 { break }
                guard let key = item["key"] as? String,
                      let label = item["label"] as? String,
                      let timeStr = item["time"] as? String,
                      let epochNum = item["epochMs"] as? NSNumber else {
                    continue
                }

                let isPrayerEnabled = enabledMap[key] ?? true
                if !isPrayerEnabled { continue }

                let triggerSec = (epochNum.doubleValue / 1000.0) - Double(leadMinutes * 60)
                if triggerSec <= nowSec + 2.0 { continue }

                let fireDate = Date(timeIntervalSince1970: triggerSec)
                let components = Calendar.current.dateComponents(
                    [.year, .month, .day, .hour, .minute, .second],
                    from: fireDate
                )

                let content = UNMutableNotificationContent()
                content.title = leadMinutes > 0
                    ? "\\(label) vaktine \\(leadMinutes) dakika kaldı"
                    : "\\(label) Vakti Girdi"
                content.body = "\\(locationName) için \\(label) vakti: \\(timeStr)"
                if soundEnabled {
                    content.sound = .default
                }

                let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
                let req = UNNotificationRequest(
                    identifier: "\\(self.notificationPrefix)\\(index)-\\(key)",
                    content: content,
                    trigger: trigger
                )
                center.add(req, withCompletionHandler: nil)
                scheduledCount += 1
            }
        }
    }

    private func mapAuthStatus(_ status: UNAuthorizationStatus) -> String {
        switch status {
        case .authorized, .provisional, .ephemeral:
            return "granted"
        case .denied:
            return "denied"
        case .notDetermined:
            return "default"
        @unknown default:
            return "default"
        }
    }
}
`,
  'utf8'
);

// 3. SceneDelegate.swift — MihrabViewController kök ekran olarak atanır
fs.writeFileSync(
  sceneDelegatePath,
  `import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(
        _ scene: UIScene,
        willConnectTo session: UISceneSession,
        options connectionOptions: UIScene.ConnectionOptions
    ) {
        guard let windowScene = scene as? UIWindowScene else { return }
        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = MihrabViewController()
        window?.makeKeyAndVisible()
        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
`,
  'utf8'
);

// 4. Main.storyboard — MihrabViewController referansını güncelle
if (fs.existsSync(mainStoryboardPath)) {
  let storyboard = fs.readFileSync(mainStoryboardPath, 'utf8');
  storyboard = storyboard
    .replace('customClass="CAPBridgeViewController"', 'customClass="MihrabViewController"')
    .replace('customModule="Capacitor"', 'customModule="App"');
  fs.writeFileSync(mainStoryboardPath, storyboard, 'utf8');
}

// 5. Uygulama İkonu (macOS ortamında sips ile 1024x1024 PNG olarak kopyala)
if (fs.existsSync(sourceIconPath) && fs.existsSync(path.dirname(appIconTargetPath))) {
  try {
    if (process.platform === 'darwin') {
      execFileSync(
        'sips',
        ['-z', '1024', '1024', '-s', 'format', 'png', sourceIconPath, '--out', appIconTargetPath],
        { stdio: 'ignore' }
      );
    }
  } catch {
    // İkon ölçekleme başarısız olursa varsayılan ikon korunur
  }
}

console.log('iOS Info.plist, arka plan ses/bildirim izinleri ve MihrabNotificationPlugin başarıyla yapılandırıldı.');
