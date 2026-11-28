import fs from 'fs';
import path from 'path';

const androidRoot = path.resolve(process.cwd(), 'android');
const appMainDir = path.join(androidRoot, 'app/src/main');
const manifestPath = path.join(appMainDir, 'AndroidManifest.xml');
const javaPkgDir = path.join(appMainDir, 'java/com/mihrab/namazvakti');
const resDir = path.join(appMainDir, 'res');

if (!fs.existsSync(manifestPath)) {
  console.error('AndroidManifest.xml bulunamadı:', manifestPath);
  process.exit(1);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

// 1. AndroidManifest.xml: İzinler + Alıcılar (PrayerAlarmReceiver & BootReceiver)
let manifest = fs.readFileSync(manifestPath, 'utf8');

const requiredPermissions = [
  '<uses-permission android:name="android.permission.INTERNET" />',
  '<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />',
  '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />',
  '<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />',
  '<uses-permission android:name="android.permission.VIBRATE" />',
  '<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />',
];

for (const perm of requiredPermissions) {
  const attrMatch = perm.match(/android:name="([^"]+)"/);
  if (attrMatch && !manifest.includes(attrMatch[1])) {
    manifest = manifest.replace(
      '<application',
      `    ${perm}\n\n    <application`
    );
  }
}

if (!manifest.includes('android.hardware.type.watch')) {
  manifest = manifest.replace(
    '<application',
    `    <uses-feature android:name="android.hardware.type.watch" android:required="false" />\n\n    <application`
  );
}

if (!manifest.includes('com.google.android.wearable.standalone')) {
  manifest = manifest.replace(
    '</application>',
    `        <meta-data\n            android:name="com.google.android.wearable.standalone"\n            android:value="true" />\n    </application>`
  );
}

const receiverSnippets = `
        <receiver
            android:name=".PrayerAlarmReceiver"
            android:exported="false" />

        <receiver
            android:name=".BootReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>

        <receiver
            android:name=".MihrabPrayerWidgetProvider"
            android:exported="true"
            android:label="Mihrab Vakitler (4×2)">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/mihrab_prayer_widget_info" />
        </receiver>

        <receiver
            android:name=".MihrabCompactWidgetProvider"
            android:exported="true"
            android:label="Mihrab Sıradaki Vakit (2×1)">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/mihrab_compact_widget_info" />
        </receiver>
`;

if (!manifest.includes('PrayerAlarmReceiver') || !manifest.includes('MihrabPrayerWidgetProvider')) {
  if (!manifest.includes('PrayerAlarmReceiver')) {
    manifest = manifest.replace(
      '</application>',
      `${receiverSnippets}    </application>`
    );
  } else if (!manifest.includes('MihrabPrayerWidgetProvider')) {
    const widgetReceivers = `
        <receiver
            android:name=".MihrabPrayerWidgetProvider"
            android:exported="true"
            android:label="Mihrab Vakitler (4×2)">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/mihrab_prayer_widget_info" />
        </receiver>

        <receiver
            android:name=".MihrabCompactWidgetProvider"
            android:exported="true"
            android:label="Mihrab Sıradaki Vakit (2×1)">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/mihrab_compact_widget_info" />
        </receiver>
`;
    manifest = manifest.replace(
      '</application>',
      `${widgetReceivers}    </application>`
    );
  }
}

if (!manifest.includes('LaunchRouterActivity')) {
  manifest = manifest.replace(
    /<intent-filter>[\s\S]*?android\.intent\.category\.LAUNCHER[\s\S]*?<\/intent-filter>/,
    ''
  );
  manifest = manifest.replace(
    '</application>',
    `
        <activity
            android:name=".LaunchRouterActivity"
            android:exported="true"
            android:noHistory="true"
            android:theme="@android:style/Theme.DeviceDefault.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity
            android:name=".WearWatchActivity"
            android:exported="false"
            android:theme="@android:style/Theme.DeviceDefault.NoActionBar" />
    </application>`
  );
}

fs.writeFileSync(manifestPath, manifest, 'utf8');

// 2. Bildirim İkonu (Monokrom Beyaz Vektör — Android Durum Çubuğu Standardı)
ensureDir(path.join(resDir, 'drawable'));
fs.writeFileSync(
  path.join(resDir, 'drawable/ic_stat_mihrab.xml'),
  `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FFFFFFFF"
        android:pathData="M12.5,3.2C8.1,3.5 4.7,7.2 4.7,11.7c0,4.7 3.8,8.5 8.5,8.5c2.5,0 4.8,-1.1 6.3,-2.9c-0.7,0.2 -1.4,0.3 -2.2,0.3c-4.2,0 -7.6,-3.4 -7.6,-7.6c0,-2.8 1.5,-5.3 3.8,-6.6C13.2,3.3 12.8,3.2 12.5,3.2zM17.2,6.5l0.6,1.4l1.5,0.2l-1.1,1l0.3,1.5l-1.3,-0.7l-1.3,0.7l0.3,-1.5l-1.1,-1l1.5,-0.2z" />
</vector>
`,
  'utf8'
);

// 3. Açık & Koyu Tema Renkleri (One UI / Android Bildirim Çubuğu Uyumlu)
ensureDir(path.join(resDir, 'values'));
fs.writeFileSync(
  path.join(resDir, 'values/colors.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="mihrab_notif_text">#171A19</color>
    <color name="mihrab_notif_muted">#575C59</color>
    <color name="mihrab_notif_active">#0F6E56</color>
    <color name="mihrab_notif_active_bg">#E6F4F0</color>
    <color name="mihrab_notif_divider">#E2DDD2</color>
    <color name="mihrab_widget_bg">#FBF9F5</color>
    <color name="mihrab_widget_border">#E5E0D5</color>
</resources>
`,
  'utf8'
);

ensureDir(path.join(resDir, 'values-night'));
fs.writeFileSync(
  path.join(resDir, 'values-night/colors.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="mihrab_notif_text">#EDF2F0</color>
    <color name="mihrab_notif_muted">#9CA7B0</color>
    <color name="mihrab_notif_active">#34D399</color>
    <color name="mihrab_notif_active_bg">#123027</color>
    <color name="mihrab_notif_divider">#253344</color>
    <color name="mihrab_widget_bg">#121A24</color>
    <color name="mihrab_widget_border">#223040</color>
</resources>
`,
  'utf8'
);

// 4. Bildirim Çubuğu Özel Düzenleri (Compact + Expanded)
ensureDir(path.join(resDir, 'layout'));

const sixColumnPrayerRowXml = `
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:baselineAligned="false">

        <LinearLayout
            android:id="@+id/col_imsak"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:gravity="center"
            android:orientation="vertical"
            android:paddingTop="3dp"
            android:paddingBottom="3dp">
            <TextView
                android:id="@+id/lbl_imsak"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="İmsak"
                android:textSize="10sp"
                android:maxLines="1"
                android:textColor="@color/mihrab_notif_muted" />
            <TextView
                android:id="@+id/val_imsak"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="--:--"
                android:textSize="12sp"
                android:textStyle="bold"
                android:maxLines="1"
                android:textColor="@color/mihrab_notif_text" />
        </LinearLayout>

        <LinearLayout
            android:id="@+id/col_gunes"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:gravity="center"
            android:orientation="vertical"
            android:paddingTop="3dp"
            android:paddingBottom="3dp">
            <TextView
                android:id="@+id/lbl_gunes"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Güneş"
                android:textSize="10sp"
                android:maxLines="1"
                android:textColor="@color/mihrab_notif_muted" />
            <TextView
                android:id="@+id/val_gunes"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="--:--"
                android:textSize="12sp"
                android:textStyle="bold"
                android:maxLines="1"
                android:textColor="@color/mihrab_notif_text" />
        </LinearLayout>

        <LinearLayout
            android:id="@+id/col_ogle"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:gravity="center"
            android:orientation="vertical"
            android:paddingTop="3dp"
            android:paddingBottom="3dp">
            <TextView
                android:id="@+id/lbl_ogle"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Öğle"
                android:textSize="10sp"
                android:maxLines="1"
                android:textColor="@color/mihrab_notif_muted" />
            <TextView
                android:id="@+id/val_ogle"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="--:--"
                android:textSize="12sp"
                android:textStyle="bold"
                android:maxLines="1"
                android:textColor="@color/mihrab_notif_text" />
        </LinearLayout>

        <LinearLayout
            android:id="@+id/col_ikindi"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:gravity="center"
            android:orientation="vertical"
            android:paddingTop="3dp"
            android:paddingBottom="3dp">
            <TextView
                android:id="@+id/lbl_ikindi"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="İkindi"
                android:textSize="10sp"
                android:maxLines="1"
                android:textColor="@color/mihrab_notif_muted" />
            <TextView
                android:id="@+id/val_ikindi"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="--:--"
                android:textSize="12sp"
                android:textStyle="bold"
                android:maxLines="1"
                android:textColor="@color/mihrab_notif_text" />
        </LinearLayout>

        <LinearLayout
            android:id="@+id/col_aksam"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:gravity="center"
            android:orientation="vertical"
            android:paddingTop="3dp"
            android:paddingBottom="3dp">
            <TextView
                android:id="@+id/lbl_aksam"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Akşam"
                android:textSize="10sp"
                android:maxLines="1"
                android:textColor="@color/mihrab_notif_muted" />
            <TextView
                android:id="@+id/val_aksam"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="--:--"
                android:textSize="12sp"
                android:textStyle="bold"
                android:maxLines="1"
                android:textColor="@color/mihrab_notif_text" />
        </LinearLayout>

        <LinearLayout
            android:id="@+id/col_yatsi"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:gravity="center"
            android:orientation="vertical"
            android:paddingTop="3dp"
            android:paddingBottom="3dp">
            <TextView
                android:id="@+id/lbl_yatsi"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Yatsı"
                android:textSize="10sp"
                android:maxLines="1"
                android:textColor="@color/mihrab_notif_muted" />
            <TextView
                android:id="@+id/val_yatsi"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="--:--"
                android:textSize="12sp"
                android:textStyle="bold"
                android:maxLines="1"
                android:textColor="@color/mihrab_notif_text" />
        </LinearLayout>
    </LinearLayout>`;

fs.writeFileSync(
  path.join(resDir, 'layout/notification_prayer_bar.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical"
    android:paddingTop="2dp"
    android:paddingBottom="2dp">
${sixColumnPrayerRowXml}
</LinearLayout>
`,
  'utf8'
);

fs.writeFileSync(
  path.join(resDir, 'layout/notification_prayer_bar_big.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical"
    android:paddingTop="4dp"
    android:paddingBottom="4dp">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:gravity="center_vertical"
        android:paddingBottom="6dp">

        <TextView
            android:id="@+id/notif_location_date"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="İstanbul"
            android:textSize="12sp"
            android:textStyle="bold"
            android:maxLines="1"
            android:ellipsize="end"
            android:textColor="@color/mihrab_notif_text" />

        <TextView
            android:id="@+id/notif_next_label"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Sıradaki: Öğle"
            android:textSize="12sp"
            android:textStyle="bold"
            android:maxLines="1"
            android:textColor="@color/mihrab_notif_active" />
    </LinearLayout>

${sixColumnPrayerRowXml}
</LinearLayout>
`,
  'utf8'
);

// 4b. Ana Ekran Widget Arka Planı, Düzenleri ve AppWidgetProvider Metadata XML'leri
fs.writeFileSync(
  path.join(resDir, 'drawable/mihrab_widget_bg.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <solid android:color="@color/mihrab_widget_bg" />
    <corners android:radius="18dp" />
    <stroke
        android:width="1dp"
        android:color="@color/mihrab_widget_border" />
</shape>
`,
  'utf8'
);

fs.writeFileSync(
  path.join(resDir, 'layout/widget_prayer_bar.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/widget_root"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@drawable/mihrab_widget_bg"
    android:orientation="vertical"
    android:padding="14dp">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:gravity="center_vertical"
        android:orientation="horizontal"
        android:paddingBottom="8dp">

        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:orientation="vertical">

            <TextView
                android:id="@+id/widget_location_date"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:ellipsize="end"
                android:maxLines="1"
                android:text="Mihrab · İstanbul"
                android:textColor="@color/mihrab_notif_text"
                android:textSize="13sp"
                android:textStyle="bold" />

            <TextView
                android:id="@+id/widget_next_label"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:ellipsize="end"
                android:maxLines="1"
                android:text="Sıradaki Vakit"
                android:textColor="@color/mihrab_notif_active"
                android:textSize="11sp"
                android:textStyle="bold" />
        </LinearLayout>

        <Chronometer
            android:id="@+id/widget_countdown"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:background="@color/mihrab_notif_active_bg"
            android:paddingLeft="10dp"
            android:paddingTop="4dp"
            android:paddingRight="10dp"
            android:paddingBottom="4dp"
            android:textColor="@color/mihrab_notif_active"
            android:textSize="13sp"
            android:textStyle="bold" />
    </LinearLayout>

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="1dp"
        android:layout_marginBottom="8dp"
        android:background="@color/mihrab_notif_divider" />

${sixColumnPrayerRowXml}
</LinearLayout>
`,
  'utf8'
);

fs.writeFileSync(
  path.join(resDir, 'layout/widget_prayer_compact.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/widget_compact_root"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@drawable/mihrab_widget_bg"
    android:gravity="center_vertical"
    android:orientation="vertical"
    android:padding="12dp">

    <TextView
        android:id="@+id/widget_compact_location"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:ellipsize="end"
        android:maxLines="1"
        android:text="Mihrab · İstanbul"
        android:textColor="@color/mihrab_notif_muted"
        android:textSize="11sp" />

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="4dp"
        android:gravity="center_vertical"
        android:orientation="horizontal">

        <TextView
            android:id="@+id/widget_compact_next"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:ellipsize="end"
            android:maxLines="1"
            android:text="Öğle · 13:02"
            android:textColor="@color/mihrab_notif_text"
            android:textSize="15sp"
            android:textStyle="bold" />

        <Chronometer
            android:id="@+id/widget_compact_countdown"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:textColor="@color/mihrab_notif_active"
            android:textSize="14sp"
            android:textStyle="bold" />
    </LinearLayout>

    <TextView
        android:id="@+id/widget_compact_sub"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="4dp"
        android:ellipsize="end"
        android:maxLines="1"
        android:text="İkindi 16:15 · Akşam 18:45"
        android:textColor="@color/mihrab_notif_muted"
        android:textSize="11sp" />
</LinearLayout>
`,
  'utf8'
);

ensureDir(path.join(resDir, 'xml'));
fs.writeFileSync(
  path.join(resDir, 'xml/mihrab_prayer_widget_info.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="250dp"
    android:minHeight="110dp"
    android:targetCellWidth="4"
    android:targetCellHeight="2"
    android:minResizeWidth="220dp"
    android:minResizeHeight="96dp"
    android:resizeMode="horizontal|vertical"
    android:updatePeriodMillis="1800000"
    android:initialLayout="@layout/widget_prayer_bar"
    android:widgetCategory="home_screen|keyguard" />
`,
  'utf8'
);

fs.writeFileSync(
  path.join(resDir, 'xml/mihrab_compact_widget_info.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="140dp"
    android:minHeight="64dp"
    android:targetCellWidth="2"
    android:targetCellHeight="1"
    android:minResizeWidth="110dp"
    android:minResizeHeight="56dp"
    android:resizeMode="horizontal|vertical"
    android:updatePeriodMillis="1800000"
    android:initialLayout="@layout/widget_prayer_compact"
    android:widgetCategory="home_screen|keyguard" />
`,
  'utf8'
);

// 5. Java Yardımcı Sınıfı: PrayerBarHelper.java
ensureDir(javaPkgDir);

fs.writeFileSync(
  path.join(javaPkgDir, 'PrayerBarHelper.java'),
  `package com.mihrab.namazvakti;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.SystemClock;
import android.widget.RemoteViews;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;

import org.json.JSONArray;
import org.json.JSONObject;

public class PrayerBarHelper {
    public static final String PREFS_NAME = "mihrab_prefs";
    public static final String KEY_SCHEDULE_JSON = "schedule_json";
    public static final String CHANNEL_BAR_ID = "mihrab_prayer_bar";
    public static final String CHANNEL_ALERT_ID = "mihrab_prayer_alerts";
    public static final String CHANNEL_WATCH_ID = "mihrab_watch_mirror";
    public static final int BAR_NOTIFICATION_ID = 1001;
    public static final int WATCH_NOTIFICATION_ID = 1002;
    public static final int ALARM_REFRESH_REQUEST_BASE = 2000;
    public static final int ALARM_ALERT_REQUEST_BASE = 3000;
    public static final int ALARM_WATCH_REQUEST_BASE = 5000;

    public static void ensureChannels(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = context.getSystemService(NotificationManager.class);
            if (nm == null) return;

            NotificationChannel barChannel = new NotificationChannel(
                CHANNEL_BAR_ID,
                "Sabit Namaz Vakitleri Çubuğu",
                NotificationManager.IMPORTANCE_LOW
            );
            barChannel.setDescription("Bildirim çubuğunda günlük namaz vakitlerini ve geri sayımı gösterir.");
            barChannel.setShowBadge(false);
            barChannel.setSound(null, null);
            barChannel.enableVibration(false);
            barChannel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            nm.createNotificationChannel(barChannel);

            NotificationChannel alertChannel = new NotificationChannel(
                CHANNEL_ALERT_ID,
                "Namaz Vakti Uyarıları",
                NotificationManager.IMPORTANCE_HIGH
            );
            alertChannel.setDescription("Ezan vakti girdiğinde veya öncesinde sesli/titreşimli bildirim gönderir.");
            alertChannel.enableVibration(true);
            alertChannel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            nm.createNotificationChannel(alertChannel);

            NotificationChannel watchChannel = new NotificationChannel(
                CHANNEL_WATCH_ID,
                "Akıllı Saat Vakit Özeti",
                NotificationManager.IMPORTANCE_DEFAULT
            );
            watchChannel.setDescription("Akıllı saat ve bilekliklere vakit geçişlerini yansıtır.");
            watchChannel.setSound(null, null);
            watchChannel.enableVibration(true);
            watchChannel.setShowBadge(false);
            watchChannel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            nm.createNotificationChannel(watchChannel);
        }
    }

    public static boolean hasNotificationPermission(Context context) {
        if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) {
            return false;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return ContextCompat.checkSelfPermission(
                context,
                android.Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED;
        }
        return true;
    }

    public static void saveAndApplySchedule(Context context, JSONObject payload) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(KEY_SCHEDULE_JSON, payload.toString()).apply();
        applyFromStorage(context);
    }

    public static void applyFromStorage(Context context) {
        ensureChannels(context);
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String raw = prefs.getString(KEY_SCHEDULE_JSON, null);
        if (raw == null || raw.isEmpty()) {
            return;
        }

        try {
            JSONObject data = new JSONObject(raw);
            boolean persistentEnabled = data.optBoolean("persistentEnabled", true);
            if (!persistentEnabled) {
                cancelPrayerBar(context);
            } else if (hasNotificationPermission(context)) {
                postPrayerBar(context, data);
            }
            updateAllWidgets(context, data);
            scheduleAlarms(context, data);
        } catch (Exception ignored) {
        }
    }

    public static boolean hasActiveWidgets(Context context) {
        AppWidgetManager awm = AppWidgetManager.getInstance(context);
        if (awm == null) return false;
        int[] wideIds = awm.getAppWidgetIds(new ComponentName(context, MihrabPrayerWidgetProvider.class));
        int[] compactIds = awm.getAppWidgetIds(new ComponentName(context, MihrabCompactWidgetProvider.class));
        return (wideIds != null && wideIds.length > 0) || (compactIds != null && compactIds.length > 0);
    }

    public static void updateAllWidgets(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String raw = prefs.getString(KEY_SCHEDULE_JSON, null);
        if (raw == null || raw.isEmpty()) return;
        try {
            updateAllWidgets(context, new JSONObject(raw));
        } catch (Exception ignored) {
        }
    }

    public static void updateAllWidgets(Context context, JSONObject data) {
        AppWidgetManager awm = AppWidgetManager.getInstance(context);
        if (awm == null) return;

        long now = System.currentTimeMillis();
        String locationName = data.optString("locationName", "Mihrab");
        String dateLabel = data.optString("dateLabel", "");
        String hijriLabel = data.optString("hijriLabel", "");

        JSONArray allPrayers = data.optJSONArray("prayers");
        if (allPrayers == null || allPrayers.length() < 6) return;

        JSONObject nextObj = null;
        int nextIndex = -1;
        for (int i = 0; i < allPrayers.length(); i++) {
            JSONObject p = allPrayers.optJSONObject(i);
            if (p != null && p.optLong("epochMs", 0L) > now) {
                nextObj = p;
                nextIndex = i;
                break;
            }
        }
        if (nextObj == null) {
            nextObj = allPrayers.optJSONObject(allPrayers.length() - 1);
            nextIndex = allPrayers.length() - 1;
        }

        int blockStart = 0;
        if (allPrayers.length() >= 12 && nextIndex >= 6) {
            blockStart = 6;
        }

        String imsak = getTimeAt(allPrayers, blockStart);
        String gunes = getTimeAt(allPrayers, blockStart + 1);
        String ogle = getTimeAt(allPrayers, blockStart + 2);
        String ikindi = getTimeAt(allPrayers, blockStart + 3);
        String aksam = getTimeAt(allPrayers, blockStart + 4);
        String yatsi = getTimeAt(allPrayers, blockStart + 5);

        String nextKey = nextObj != null ? nextObj.optString("key", "") : "";
        String nextLabel = nextObj != null ? nextObj.optString("label", "") : "";
        String nextTime = nextObj != null ? nextObj.optString("time", "") : "";
        long nextEpochMs = nextObj != null ? nextObj.optLong("epochMs", now + 60000L) : (now + 60000L);
        long remainingMs = Math.max(0L, nextEpochMs - now);
        long chronoBase = SystemClock.elapsedRealtime() + remainingMs;

        Intent launchIntent = new Intent(context, LaunchRouterActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent launchPi = PendingIntent.getActivity(
            context,
            2,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        String headerLocation = hijriLabel.isEmpty()
            ? locationName + (dateLabel.isEmpty() ? "" : " · " + dateLabel)
            : locationName + " · " + hijriLabel;

        int[] wideIds = awm.getAppWidgetIds(new ComponentName(context, MihrabPrayerWidgetProvider.class));
        if (wideIds != null && wideIds.length > 0) {
            String pkg = context.getPackageName();
            for (int widgetId : wideIds) {
                RemoteViews views = new RemoteViews(pkg, R.layout.widget_prayer_bar);
                views.setTextViewText(R.id.widget_location_date, headerLocation);
                views.setTextViewText(R.id.widget_next_label, "Sıradaki: " + nextLabel + " (" + nextTime + ")");
                views.setChronometer(R.id.widget_countdown, chronoBase, null, true);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    views.setChronometerCountDown(R.id.widget_countdown, true);
                }
                populateSixColumns(context, views, imsak, gunes, ogle, ikindi, aksam, yatsi, nextKey);
                views.setOnClickPendingIntent(R.id.widget_root, launchPi);
                awm.updateAppWidget(widgetId, views);
            }
        }

        int[] compactIds = awm.getAppWidgetIds(new ComponentName(context, MihrabCompactWidgetProvider.class));
        if (compactIds != null && compactIds.length > 0) {
            String pkg = context.getPackageName();
            JSONObject afterNext = nextIndex + 1 < allPrayers.length() ? allPrayers.optJSONObject(nextIndex + 1) : null;
            String afterText = afterNext != null
                ? "Sonrası: " + afterNext.optString("label", "") + " " + afterNext.optString("time", "")
                : "Öğle " + ogle + " · Akşam " + aksam;

            for (int widgetId : compactIds) {
                RemoteViews views = new RemoteViews(pkg, R.layout.widget_prayer_compact);
                views.setTextViewText(R.id.widget_compact_location, locationName + (hijriLabel.isEmpty() ? "" : " · " + hijriLabel));
                views.setTextViewText(R.id.widget_compact_next, nextLabel + " · " + nextTime);
                views.setTextViewText(R.id.widget_compact_sub, afterText);
                views.setChronometer(R.id.widget_compact_countdown, chronoBase, null, true);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    views.setChronometerCountDown(R.id.widget_compact_countdown, true);
                }
                views.setOnClickPendingIntent(R.id.widget_compact_root, launchPi);
                awm.updateAppWidget(widgetId, views);
            }
        }
    }

    public static void cancelPrayerBar(Context context) {
        NotificationManagerCompat.from(context).cancel(BAR_NOTIFICATION_ID);
    }

    private static void postPrayerBar(Context context, JSONObject data) {
        long now = System.currentTimeMillis();
        String locationName = data.optString("locationName", "Mihrab");
        String dateLabel = data.optString("dateLabel", "");
        String hijriLabel = data.optString("hijriLabel", "");

        JSONArray allPrayers = data.optJSONArray("prayers");
        if (allPrayers == null || allPrayers.length() < 6) return;

        // Tüm günler içinden sıradaki ilk vakti bul
        JSONObject nextObj = null;
        int nextIndex = -1;
        for (int i = 0; i < allPrayers.length(); i++) {
            JSONObject p = allPrayers.optJSONObject(i);
            if (p != null && p.optLong("epochMs", 0L) > now) {
                nextObj = p;
                nextIndex = i;
                break;
            }
        }
        if (nextObj == null) {
            nextObj = allPrayers.optJSONObject(allPrayers.length() - 1);
            nextIndex = allPrayers.length() - 1;
        }

        // Görüntülenecek 6 vakitlik günü belirle (eğer bugünün Yatsısı geçtiyse yarının 6 vaktini göster)
        int blockStart = 0;
        if (allPrayers.length() >= 12 && nextIndex >= 6) {
            blockStart = 6;
        }

        String imsak = getTimeAt(allPrayers, blockStart);
        String gunes = getTimeAt(allPrayers, blockStart + 1);
        String ogle = getTimeAt(allPrayers, blockStart + 2);
        String ikindi = getTimeAt(allPrayers, blockStart + 3);
        String aksam = getTimeAt(allPrayers, blockStart + 4);
        String yatsi = getTimeAt(allPrayers, blockStart + 5);

        String nextKey = nextObj != null ? nextObj.optString("key", "") : "";
        String nextLabel = nextObj != null ? nextObj.optString("label", "") : "";
        String nextTime = nextObj != null ? nextObj.optString("time", "") : "";
        long nextEpochMs = nextObj != null ? nextObj.optLong("epochMs", now + 60000L) : (now + 60000L);

        String pkg = context.getPackageName();
        RemoteViews compactView = new RemoteViews(pkg, R.layout.notification_prayer_bar);
        RemoteViews expandedView = new RemoteViews(pkg, R.layout.notification_prayer_bar_big);

        String headerLocation = hijriLabel.isEmpty()
            ? locationName + (dateLabel.isEmpty() ? "" : " · " + dateLabel)
            : locationName + " · " + hijriLabel;
        expandedView.setTextViewText(R.id.notif_location_date, headerLocation);
        expandedView.setTextViewText(R.id.notif_next_label, "Sıradaki: " + nextLabel + " (" + nextTime + ")");

        populateSixColumns(context, compactView, imsak, gunes, ogle, ikindi, aksam, yatsi, nextKey);
        populateSixColumns(context, expandedView, imsak, gunes, ogle, ikindi, aksam, yatsi, nextKey);

        Intent launchIntent = new Intent(context, LaunchRouterActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
            context,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_BAR_ID)
            .setSmallIcon(R.drawable.ic_stat_mihrab)
            .setColor(0xFF0F6E56)
            .setContentTitle(locationName + " · " + nextLabel + " (" + nextTime + ")")
            .setContentText("İmsak " + imsak + " · Öğle " + ogle + " · İkindi " + ikindi + " · Akşam " + aksam + " · Yatsı " + yatsi)
            .setCustomContentView(compactView)
            .setCustomBigContentView(expandedView)
            .setStyle(new NotificationCompat.DecoratedCustomViewStyle())
            .setContentIntent(contentIntent)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setWhen(nextEpochMs)
            .setShowWhen(true)
            .setUsesChronometer(true);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            builder.setChronometerCountDown(true);
        }

        try {
            NotificationManagerCompat.from(context).notify(BAR_NOTIFICATION_ID, builder.build());
        } catch (SecurityException ignored) {
        }
    }

    private static String getTimeAt(JSONArray arr, int idx) {
        if (idx < 0 || idx >= arr.length()) return "--:--";
        JSONObject o = arr.optJSONObject(idx);
        return o != null ? o.optString("time", "--:--") : "--:--";
    }

    private static void populateSixColumns(
        Context context,
        RemoteViews views,
        String imsak,
        String gunes,
        String ogle,
        String ikindi,
        String aksam,
        String yatsi,
        String activeKey
    ) {
        int normalText = ContextCompat.getColor(context, R.color.mihrab_notif_text);
        int mutedText = ContextCompat.getColor(context, R.color.mihrab_notif_muted);
        int activeText = ContextCompat.getColor(context, R.color.mihrab_notif_active);
        int activeBg = ContextCompat.getColor(context, R.color.mihrab_notif_active_bg);

        bindCol(views, R.id.col_imsak, R.id.lbl_imsak, R.id.val_imsak, imsak, "imsak".equals(activeKey), normalText, mutedText, activeText, activeBg);
        bindCol(views, R.id.col_gunes, R.id.lbl_gunes, R.id.val_gunes, gunes, "gunes".equals(activeKey), normalText, mutedText, activeText, activeBg);
        bindCol(views, R.id.col_ogle, R.id.lbl_ogle, R.id.val_ogle, ogle, "ogle".equals(activeKey), normalText, mutedText, activeText, activeBg);
        bindCol(views, R.id.col_ikindi, R.id.lbl_ikindi, R.id.val_ikindi, ikindi, "ikindi".equals(activeKey), normalText, mutedText, activeText, activeBg);
        bindCol(views, R.id.col_aksam, R.id.lbl_aksam, R.id.val_aksam, aksam, "aksam".equals(activeKey), normalText, mutedText, activeText, activeBg);
        bindCol(views, R.id.col_yatsi, R.id.lbl_yatsi, R.id.val_yatsi, yatsi, "yatsi".equals(activeKey), normalText, mutedText, activeText, activeBg);
    }

    private static void bindCol(
        RemoteViews views,
        int colId,
        int lblId,
        int valId,
        String timeText,
        boolean isActive,
        int normalText,
        int mutedText,
        int activeText,
        int activeBg
    ) {
        views.setTextViewText(valId, timeText);
        views.setTextColor(lblId, isActive ? activeText : mutedText);
        views.setTextColor(valId, isActive ? activeText : normalText);
        views.setInt(colId, "setBackgroundColor", isActive ? activeBg : 0x00000000);
    }

    public static void postAlertNotification(Context context, String title, String body) {
        ensureChannels(context);
        if (!hasNotificationPermission(context)) return;

        Intent launchIntent = new Intent(context, LaunchRouterActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
            context,
            1,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ALERT_ID)
            .setSmallIcon(R.drawable.ic_stat_mihrab)
            .setColor(0xFF0F6E56)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setContentIntent(contentIntent)
            .setAutoCancel(true)
            .setLocalOnly(false)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .extend(new NotificationCompat.WearableExtender())
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC);

        try {
            int notifId = (int) (System.currentTimeMillis() % 100000) + 4000;
            NotificationManagerCompat.from(context).notify(notifId, builder.build());
        } catch (SecurityException ignored) {
        }
    }

    public static void postWatchSummaryNotification(Context context, String title, String body) {
        ensureChannels(context);
        if (!hasNotificationPermission(context)) return;

        Intent launchIntent = new Intent(context, LaunchRouterActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
            context,
            3,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_WATCH_ID)
            .setSmallIcon(R.drawable.ic_stat_mihrab)
            .setColor(0xFF0F6E56)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setContentIntent(contentIntent)
            .setAutoCancel(true)
            .setOngoing(false)
            .setLocalOnly(false)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .extend(new NotificationCompat.WearableExtender())
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC);

        try {
            NotificationManagerCompat.from(context).notify(WATCH_NOTIFICATION_ID, builder.build());
        } catch (SecurityException ignored) {
        }
    }

    private static void scheduleAlarms(Context context, JSONObject data) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;

        long now = System.currentTimeMillis();
        boolean persistentEnabled = data.optBoolean("persistentEnabled", true);
        boolean alertsEnabled = data.optBoolean("alertsEnabled", true);
        boolean watchAlertsEnabled = data.optBoolean("watchAlertsEnabled", true);
        int leadMinutes = data.optInt("leadMinutes", 0);
        String locationName = data.optString("locationName", "Mihrab");
        JSONObject enabledPrayers = data.optJSONObject("enabledPrayers");
        JSONArray prayers = data.optJSONArray("prayers");
        if (prayers == null) return;

        int maxItems = Math.min(prayers.length(), 18);
        for (int i = 0; i < maxItems; i++) {
            JSONObject p = prayers.optJSONObject(i);
            if (p == null) continue;
            long epochMs = p.optLong("epochMs", 0L);
            String key = p.optString("key", "");
            String label = p.optString("label", "");
            String time = p.optString("time", "");

            // Sabit bildirim çubuğu güncelleme alarmı
            Intent refreshIntent = new Intent(context, PrayerAlarmReceiver.class);
            refreshIntent.putExtra("actionType", "refresh");
            PendingIntent refreshPi = PendingIntent.getBroadcast(
                context,
                ALARM_REFRESH_REQUEST_BASE + i,
                refreshIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            am.cancel(refreshPi);

            boolean hasWidgets = hasActiveWidgets(context);
            if ((persistentEnabled || hasWidgets) && epochMs > now + 2000L) {
                setAllowIdleAlarm(am, epochMs + 1000L, refreshPi);
            }

            // Vakit uyarısı alarmı
            Intent alertIntent = new Intent(context, PrayerAlarmReceiver.class);
            alertIntent.putExtra("actionType", "alert");
            String alertTitle = leadMinutes > 0
                ? label + " vaktine " + leadMinutes + " dakika kaldı"
                : label + " Vakti Girdi";
            String alertBody = locationName + " için " + label + " vakti: " + time;
            alertIntent.putExtra("title", alertTitle);
            alertIntent.putExtra("body", alertBody);

            PendingIntent alertPi = PendingIntent.getBroadcast(
                context,
                ALARM_ALERT_REQUEST_BASE + i,
                alertIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            am.cancel(alertPi);

            boolean prayerChecked = enabledPrayers == null || enabledPrayers.optBoolean(key, true);
            long triggerMs = epochMs - ((long) leadMinutes * 60_000L);
            boolean primaryAlertScheduled = alertsEnabled && prayerChecked && triggerMs > now + 2000L;
            if (primaryAlertScheduled) {
                setAllowIdleAlarm(am, triggerMs, alertPi);
            }

            // Akıllı saat & bileklik özet aynalama alarmı (sesli uyarı kapalı olan vakitlerde de bileğe kısa özet düşer)
            Intent watchIntent = new Intent(context, PrayerAlarmReceiver.class);
            watchIntent.putExtra("actionType", "watch");
            JSONObject nextAfter = i + 1 < prayers.length() ? prayers.optJSONObject(i + 1) : null;
            String watchTitle = label + " " + time + " · " + locationName;
            String watchBody = nextAfter != null
                ? "Sıradaki: " + nextAfter.optString("label", "") + " " + nextAfter.optString("time", "")
                : locationName + " vakit özeti";
            watchIntent.putExtra("title", watchTitle);
            watchIntent.putExtra("body", watchBody);

            PendingIntent watchPi = PendingIntent.getBroadcast(
                context,
                ALARM_WATCH_REQUEST_BASE + i,
                watchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            am.cancel(watchPi);

            if (watchAlertsEnabled && !primaryAlertScheduled && epochMs > now + 2000L) {
                setAllowIdleAlarm(am, epochMs, watchPi);
            }
        }
    }

    private static void setAllowIdleAlarm(AlarmManager am, long triggerAtMillis, PendingIntent pi) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pi);
        } else {
            am.set(AlarmManager.RTC_WAKEUP, triggerAtMillis, pi);
        }
    }
}
`,
  'utf8'
);

// 6. BroadcastReceiver: PrayerAlarmReceiver.java
fs.writeFileSync(
  path.join(javaPkgDir, 'PrayerAlarmReceiver.java'),
  `package com.mihrab.namazvakti;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class PrayerAlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        PrayerBarHelper.applyFromStorage(context);

        if (intent != null) {
            String actionType = intent.getStringExtra("actionType");
            String title = intent.getStringExtra("title");
            String body = intent.getStringExtra("body");
            if ("alert".equals(actionType) && title != null && body != null) {
                PrayerBarHelper.postAlertNotification(context, title, body);
            } else if ("watch".equals(actionType) && title != null && body != null) {
                PrayerBarHelper.postWatchSummaryNotification(context, title, body);
            }
        }
    }
}
`,
  'utf8'
);

// 7. BroadcastReceiver: BootReceiver.java
fs.writeFileSync(
  path.join(javaPkgDir, 'BootReceiver.java'),
  `package com.mihrab.namazvakti;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent != null && Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            PrayerBarHelper.applyFromStorage(context);
        }
    }
}
`,
  'utf8'
);

// 8. Capacitor Eklentisi: MihrabNotificationPlugin.java
fs.writeFileSync(
  path.join(javaPkgDir, 'MihrabNotificationPlugin.java'),
  `package com.mihrab.namazvakti;

import android.Manifest;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import org.json.JSONArray;
import org.json.JSONObject;

@CapacitorPlugin(
    name = "MihrabNotifications",
    permissions = {
        @Permission(
            strings = { Manifest.permission.POST_NOTIFICATIONS },
            alias = "notifications"
        )
    }
)
public class MihrabNotificationPlugin extends Plugin {

    @Override
    public void load() {
        PrayerBarHelper.ensureChannels(getContext());
        PrayerBarHelper.applyFromStorage(getContext());
    }

    @PluginMethod
    public void getPermissionStatus(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("state", resolvePermissionString());
        call.resolve(ret);
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            JSObject ret = new JSObject();
            ret.put("state", PrayerBarHelper.hasNotificationPermission(getContext()) ? "granted" : "denied");
            call.resolve(ret);
            return;
        }

        if (getPermissionState("notifications") == PermissionState.GRANTED) {
            JSObject ret = new JSObject();
            ret.put("state", "granted");
            call.resolve(ret);
            return;
        }

        requestPermissionForAlias("notifications", call, "notificationsPermsCallback");
    }

    @PermissionCallback
    private void notificationsPermsCallback(PluginCall call) {
        String status = resolvePermissionString();
        if ("granted".equals(status)) {
            PrayerBarHelper.applyFromStorage(getContext());
        }
        JSObject ret = new JSObject();
        ret.put("state", status);
        call.resolve(ret);
    }

    @PluginMethod
    public void syncPrayerSchedule(PluginCall call) {
        try {
            JSONObject payload = new JSONObject();
            payload.put("persistentEnabled", call.getBoolean("persistentEnabled", true));
            payload.put("alertsEnabled", call.getBoolean("alertsEnabled", true));
            payload.put("watchAlertsEnabled", call.getBoolean("watchAlertsEnabled", true));
            payload.put("soundEnabled", call.getBoolean("soundEnabled", false));
            payload.put("leadMinutes", call.getInt("leadMinutes", 0));
            payload.put("locationName", call.getString("locationName", "İstanbul"));
            payload.put("dateLabel", call.getString("dateLabel", ""));
            payload.put("hijriLabel", call.getString("hijriLabel", ""));

            String prayersJson = call.getString("prayersJson", "[]");
            payload.put("prayers", new JSONArray(prayersJson));

            String enabledPrayersJson = call.getString("enabledPrayersJson", "{}");
            payload.put("enabledPrayers", new JSONObject(enabledPrayersJson));

            PrayerBarHelper.saveAndApplySchedule(getContext(), payload);

            JSObject ret = new JSObject();
            ret.put("applied", true);
            ret.put("permission", resolvePermissionString());
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Bildirim vakitleri kaydedilemedi: " + e.getMessage());
        }
    }

    @PluginMethod
    public void sendAlertNotification(PluginCall call) {
        String title = call.getString("title", "Mihrab Namaz Vakti");
        String body = call.getString("body", "");
        PrayerBarHelper.postAlertNotification(getContext(), title, body);
        JSObject ret = new JSObject();
        ret.put("sent", PrayerBarHelper.hasNotificationPermission(getContext()));
        call.resolve(ret);
    }

    @PluginMethod
    public void sendWatchSummaryNotification(PluginCall call) {
        String title = call.getString("title", "Mihrab Saat Özeti");
        String body = call.getString("body", "");
        PrayerBarHelper.postWatchSummaryNotification(getContext(), title, body);
        JSObject ret = new JSObject();
        ret.put("sent", PrayerBarHelper.hasNotificationPermission(getContext()));
        call.resolve(ret);
    }

    @PluginMethod
    public void isWatchDevice(PluginCall call) {
        boolean hasWatchFeature = getContext()
            .getPackageManager()
            .hasSystemFeature(PackageManager.FEATURE_WATCH);
        int uiModeType = getContext().getResources().getConfiguration().uiMode
            & Configuration.UI_MODE_TYPE_MASK;
        boolean isWatchUiMode = uiModeType == Configuration.UI_MODE_TYPE_WATCH;
        JSObject ret = new JSObject();
        ret.put("isWatch", hasWatchFeature || isWatchUiMode);
        call.resolve(ret);
    }

    @PluginMethod
    public void isPinWidgetSupported(PluginCall call) {
        boolean supported = false;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            android.appwidget.AppWidgetManager awm =
                android.appwidget.AppWidgetManager.getInstance(getContext());
            supported = awm != null && awm.isRequestPinAppWidgetSupported();
        }
        JSObject ret = new JSObject();
        ret.put("supported", supported);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestPinWidget(PluginCall call) {
        String variant = call.getString("variant", "wide");
        JSObject ret = new JSObject();
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            ret.put("requested", false);
            ret.put("reason", "unsupported_os");
            call.resolve(ret);
            return;
        }
        android.appwidget.AppWidgetManager awm =
            android.appwidget.AppWidgetManager.getInstance(getContext());
        if (awm == null || !awm.isRequestPinAppWidgetSupported()) {
            ret.put("requested", false);
            ret.put("reason", "unsupported_launcher");
            call.resolve(ret);
            return;
        }

        Class<?> providerCls = "compact".equals(variant)
            ? MihrabCompactWidgetProvider.class
            : MihrabPrayerWidgetProvider.class;
        android.content.ComponentName provider =
            new android.content.ComponentName(getContext(), providerCls);

        boolean ok = awm.requestPinAppWidget(provider, null, null);
        PrayerBarHelper.updateAllWidgets(getContext());
        ret.put("requested", ok);
        call.resolve(ret);
    }

    private String resolvePermissionString() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            PermissionState ps = getPermissionState("notifications");
            if (ps == PermissionState.GRANTED && PrayerBarHelper.hasNotificationPermission(getContext())) {
                return "granted";
            }
            if (ps == PermissionState.DENIED) {
                return "denied";
            }
            return "default";
        }
        return PrayerBarHelper.hasNotificationPermission(getContext()) ? "granted" : "denied";
    }
}
`,
  'utf8'
);

// 9. AppWidgetProvider Sınıfları (4x2 Tam Vakit Widget & 2x1 Kompakt Sayaç Widget)
fs.writeFileSync(
  path.join(javaPkgDir, 'MihrabPrayerWidgetProvider.java'),
  `package com.mihrab.namazvakti;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;

public class MihrabPrayerWidgetProvider extends AppWidgetProvider {
    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        PrayerBarHelper.updateAllWidgets(context);
    }

    @Override
    public void onEnabled(Context context) {
        PrayerBarHelper.applyFromStorage(context);
    }
}
`,
  'utf8'
);

fs.writeFileSync(
  path.join(javaPkgDir, 'MihrabCompactWidgetProvider.java'),
  `package com.mihrab.namazvakti;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;

public class MihrabCompactWidgetProvider extends AppWidgetProvider {
    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        PrayerBarHelper.updateAllWidgets(context);
    }

    @Override
    public void onEnabled(Context context) {
        PrayerBarHelper.applyFromStorage(context);
    }
}
`,
  'utf8'
);

// 10. MainActivity.java içine MihrabNotificationPlugin kaydını ekle
const mainActivityPath = path.join(javaPkgDir, 'MainActivity.java');
fs.writeFileSync(
  mainActivityPath,
  `package com.mihrab.namazvakti;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(MihrabNotificationPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
`,
  'utf8'
);

// 11. LaunchRouterActivity.java: Saat (Wear OS) veya WebView yoksa native WearWatchActivity açar
fs.writeFileSync(
  path.join(javaPkgDir, 'LaunchRouterActivity.java'),
  `package com.mihrab.namazvakti;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebView;

public class LaunchRouterActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        boolean hasWatchFeature = getPackageManager().hasSystemFeature(PackageManager.FEATURE_WATCH);
        int uiModeType = getResources().getConfiguration().uiMode & Configuration.UI_MODE_TYPE_MASK;
        boolean isWatchUi = (uiModeType == Configuration.UI_MODE_TYPE_WATCH);

        boolean hasWebView = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                PackageInfo pkg = WebView.getCurrentWebViewPackage();
                hasWebView = (pkg != null);
            } catch (Throwable t) {
                hasWebView = false;
            }
        }

        Class<?> target = (hasWatchFeature || isWatchUi || !hasWebView)
            ? WearWatchActivity.class
            : MainActivity.class;

        Intent next = new Intent(this, target);
        next.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION);
        startActivity(next);
        finish();
    }
}
`,
  'utf8'
);

// 12. WearPrayerCalculator.java: Wear OS saatler için WebView'sız tam çevrimdışı Diyanet namaz vakti & kıble motoru
fs.writeFileSync(
  path.join(javaPkgDir, 'WearPrayerCalculator.java'),
  `package com.mihrab.namazvakti;

import android.content.Context;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

public class WearPrayerCalculator {

    public static class WatchCity {
        public final String id;
        public final String name;
        public final double lat;
        public final double lon;
        public final String tz;

        public WatchCity(String id, String name, double lat, double lon, String tz) {
            this.id = id;
            this.name = name;
            this.lat = lat;
            this.lon = lon;
            this.tz = tz;
        }
    }

    public static class PrayerEntry {
        public final String key;
        public final String label;
        public final long epochMs;
        public final String formattedTime;

        public PrayerEntry(String key, String label, long epochMs, String formattedTime) {
            this.key = key;
            this.label = label;
            this.epochMs = epochMs;
            this.formattedTime = formattedTime;
        }
    }

    public static class DaySchedule {
        public final PrayerEntry[] prayers;
        public final String sabah;
        public final String teheccud;
        public final double qiblaAngle;
        public final String qiblaDirection;
        public final int distanceKm;

        public DaySchedule(
            PrayerEntry[] prayers,
            String sabah,
            String teheccud,
            double qiblaAngle,
            String qiblaDirection,
            int distanceKm
        ) {
            this.prayers = prayers;
            this.sabah = sabah;
            this.teheccud = teheccud;
            this.qiblaAngle = qiblaAngle;
            this.qiblaDirection = qiblaDirection;
            this.distanceKm = distanceKm;
        }
    }

    private static final String TR_TZ = "Europe/Istanbul";

    public static final WatchCity[] CITIES = new WatchCity[] {
        new WatchCity("tr-istanbul", "İstanbul", 41.0082, 28.9784, TR_TZ),
        new WatchCity("tr-ankara", "Ankara", 39.9334, 32.8597, TR_TZ),
        new WatchCity("tr-izmir", "İzmir", 38.4237, 27.1428, TR_TZ),
        new WatchCity("tr-bursa", "Bursa", 40.1885, 29.0610, TR_TZ),
        new WatchCity("tr-antalya", "Antalya", 36.8969, 30.7133, TR_TZ),
        new WatchCity("tr-konya", "Konya", 37.8746, 32.4932, TR_TZ),
        new WatchCity("tr-adana", "Adana", 37.0000, 35.3213, TR_TZ),
        new WatchCity("tr-gaziantep", "Gaziantep", 37.0662, 37.3833, TR_TZ),
        new WatchCity("tr-sanliurfa", "Şanlıurfa", 37.1674, 38.7955, TR_TZ),
        new WatchCity("tr-kocaeli", "Kocaeli", 40.7654, 29.9408, TR_TZ),
        new WatchCity("tr-mersin", "Mersin", 36.8121, 34.6415, TR_TZ),
        new WatchCity("tr-diyarbakir", "Diyarbakır", 37.9144, 40.2306, TR_TZ),
        new WatchCity("tr-hatay", "Hatay", 36.2023, 36.1613, TR_TZ),
        new WatchCity("tr-manisa", "Manisa", 38.6191, 27.4289, TR_TZ),
        new WatchCity("tr-kayseri", "Kayseri", 38.7312, 35.4787, TR_TZ),
        new WatchCity("tr-samsun", "Samsun", 41.2867, 36.3300, TR_TZ),
        new WatchCity("tr-balikesir", "Balıkesir", 39.6484, 27.8826, TR_TZ),
        new WatchCity("tr-kahramanmaras", "Kahramanmaraş", 37.5858, 36.9371, TR_TZ),
        new WatchCity("tr-van", "Van", 38.5012, 43.3730, TR_TZ),
        new WatchCity("tr-aydin", "Aydın", 37.8560, 27.8416, TR_TZ),
        new WatchCity("tr-tekirdag", "Tekirdağ", 40.9781, 27.5117, TR_TZ),
        new WatchCity("tr-sakarya", "Sakarya", 40.7569, 30.3783, TR_TZ),
        new WatchCity("tr-denizli", "Denizli", 37.7765, 29.0864, TR_TZ),
        new WatchCity("tr-mugla", "Muğla", 37.2153, 28.3636, TR_TZ),
        new WatchCity("tr-eskisehir", "Eskişehir", 39.7767, 30.5206, TR_TZ),
        new WatchCity("tr-mardin", "Mardin", 37.3212, 40.7245, TR_TZ),
        new WatchCity("tr-trabzon", "Trabzon", 41.0027, 39.7168, TR_TZ),
        new WatchCity("tr-malatya", "Malatya", 38.3552, 38.3095, TR_TZ),
        new WatchCity("tr-ordu", "Ordu", 40.9839, 37.8764, TR_TZ),
        new WatchCity("tr-erzurum", "Erzurum", 39.9000, 41.2700, TR_TZ),
        new WatchCity("tr-afyonkarahisar", "Afyonkarahisar", 38.7507, 30.5567, TR_TZ),
        new WatchCity("tr-sivas", "Sivas", 39.7477, 37.0179, TR_TZ),
        new WatchCity("tr-adiyaman", "Adıyaman", 37.7648, 38.2786, TR_TZ),
        new WatchCity("tr-tokat", "Tokat", 40.3167, 36.5500, TR_TZ),
        new WatchCity("tr-elazig", "Elazığ", 38.6810, 39.2264, TR_TZ),
        new WatchCity("tr-zonguldak", "Zonguldak", 41.4564, 31.7987, TR_TZ),
        new WatchCity("tr-batman", "Batman", 37.8812, 41.1351, TR_TZ),
        new WatchCity("tr-kutahya", "Kütahya", 39.4167, 29.9833, TR_TZ),
        new WatchCity("tr-canakkale", "Çanakkale", 40.1553, 26.4142, TR_TZ),
        new WatchCity("tr-osmaniye", "Osmaniye", 37.0742, 36.2478, TR_TZ),
        new WatchCity("tr-corum", "Çorum", 40.5506, 34.9556, TR_TZ),
        new WatchCity("tr-sirnak", "Şırnak", 37.5164, 42.4611, TR_TZ),
        new WatchCity("tr-giresun", "Giresun", 40.9128, 38.3895, TR_TZ),
        new WatchCity("tr-isparta", "Isparta", 37.7648, 30.5566, TR_TZ),
        new WatchCity("tr-agri", "Ağrı", 39.7191, 43.0503, TR_TZ),
        new WatchCity("tr-yozgat", "Yozgat", 39.8181, 34.8147, TR_TZ),
        new WatchCity("tr-edirne", "Edirne", 41.6771, 26.5557, TR_TZ),
        new WatchCity("tr-aksaray", "Aksaray", 38.3687, 34.0370, TR_TZ),
        new WatchCity("tr-duzce", "Düzce", 40.8438, 31.1565, TR_TZ),
        new WatchCity("tr-kastamonu", "Kastamonu", 41.3887, 33.7827, TR_TZ),
        new WatchCity("tr-usak", "Uşak", 38.6823, 29.4082, TR_TZ),
        new WatchCity("tr-kirklareli", "Kırklareli", 41.7333, 27.2167, TR_TZ),
        new WatchCity("tr-nigde", "Niğde", 37.9667, 34.6833, TR_TZ),
        new WatchCity("tr-bitlis", "Bitlis", 38.4006, 42.1095, TR_TZ),
        new WatchCity("tr-rize", "Rize", 41.0201, 40.5234, TR_TZ),
        new WatchCity("tr-amasya", "Amasya", 40.6499, 35.8353, TR_TZ),
        new WatchCity("tr-siirt", "Siirt", 37.9333, 41.9500, TR_TZ),
        new WatchCity("tr-bolu", "Bolu", 40.7350, 31.6061, TR_TZ),
        new WatchCity("tr-nevsehir", "Nevşehir", 38.6244, 34.7239, TR_TZ),
        new WatchCity("tr-mus", "Muş", 38.7432, 41.5064, TR_TZ),
        new WatchCity("tr-yalova", "Yalova", 40.6500, 29.2667, TR_TZ),
        new WatchCity("tr-bingol", "Bingöl", 38.8854, 40.4966, TR_TZ),
        new WatchCity("tr-kirikkale", "Kırıkkale", 39.8468, 33.5153, TR_TZ),
        new WatchCity("tr-hakkari", "Hakkari", 37.5833, 43.7333, TR_TZ),
        new WatchCity("tr-kars", "Kars", 40.6167, 43.1000, TR_TZ),
        new WatchCity("tr-burdur", "Burdur", 37.7203, 30.2908, TR_TZ),
        new WatchCity("tr-karaman", "Karaman", 37.1759, 33.2287, TR_TZ),
        new WatchCity("tr-karabuk", "Karabük", 41.2061, 32.6204, TR_TZ),
        new WatchCity("tr-kirsehir", "Kırşehir", 39.1425, 34.1709, TR_TZ),
        new WatchCity("tr-erzincan", "Erzincan", 39.7500, 39.5000, TR_TZ),
        new WatchCity("tr-bilecik", "Bilecik", 40.1451, 29.9799, TR_TZ),
        new WatchCity("tr-sinop", "Sinop", 42.0231, 35.1531, TR_TZ),
        new WatchCity("tr-igdir", "Iğdır", 39.9167, 44.0333, TR_TZ),
        new WatchCity("tr-bartin", "Bartın", 41.6344, 32.3375, TR_TZ),
        new WatchCity("tr-cankiri", "Çankırı", 40.6013, 33.6134, TR_TZ),
        new WatchCity("tr-artvin", "Artvin", 41.1828, 41.8183, TR_TZ),
        new WatchCity("tr-kilis", "Kilis", 36.7184, 37.1212, TR_TZ),
        new WatchCity("tr-gumushane", "Gümüşhane", 40.4600, 39.4814, TR_TZ),
        new WatchCity("tr-ardahan", "Ardahan", 41.1105, 42.7022, TR_TZ),
        new WatchCity("tr-tunceli", "Tunceli", 39.1079, 39.5401, TR_TZ),
        new WatchCity("tr-bayburt", "Bayburt", 40.2552, 40.2249, TR_TZ),
        new WatchCity("sa-makkah", "Mekke", 21.3891, 39.8579, "Asia/Riyadh"),
        new WatchCity("sa-madinah", "Medine", 24.5247, 39.5692, "Asia/Riyadh"),
        new WatchCity("ps-jerusalem", "Kudüs", 31.7683, 35.2137, "Asia/Jerusalem"),
        new WatchCity("cy-nicosia", "Lefkoşa", 35.1856, 33.3823, "Asia/Nicosia"),
        new WatchCity("az-baku", "Bakü", 40.4093, 49.8671, "Asia/Baku"),
        new WatchCity("de-berlin", "Berlin", 52.5200, 13.4050, "Europe/Berlin"),
        new WatchCity("de-munich", "Münih", 48.1351, 11.5820, "Europe/Berlin"),
        new WatchCity("de-cologne", "Köln", 50.9375, 6.9603, "Europe/Berlin"),
        new WatchCity("gb-london", "Londra", 51.5072, -0.1276, "Europe/London"),
        new WatchCity("fr-paris", "Paris", 48.8566, 2.3522, "Europe/Paris"),
        new WatchCity("nl-amsterdam", "Amsterdam", 52.3676, 4.9041, "Europe/Amsterdam"),
        new WatchCity("at-vienna", "Viyana", 48.2082, 16.3738, "Europe/Vienna")
    };

    public static WatchCity findNearestCity(double lat, double lon) {
        WatchCity best = CITIES[0];
        double bestDist = Double.MAX_VALUE;
        for (WatchCity c : CITIES) {
            double dLat = c.lat - lat;
            double dLon = c.lon - lon;
            double d = dLat * dLat + dLon * dLon;
            if (d < bestDist) {
                bestDist = d;
                best = c;
            }
        }
        return best;
    }

    public static WatchCity findById(String id) {
        if (id == null) return CITIES[0];
        for (WatchCity c : CITIES) {
            if (id.equals(c.id)) return c;
        }
        return CITIES[0];
    }

    public static final String METHOD_DIYANET = "Turkey";
    public static final String METHOD_FAZILET = "Fazilet";
    public static final String MADHAB_SHAFI = "Shafi";
    public static final String MADHAB_HANAFI = "Hanafi";

    public static DaySchedule calculateDay(WatchCity city, long dayTimestampMs) {
        return calculateDay(city, dayTimestampMs, METHOD_DIYANET, MADHAB_SHAFI, null);
    }

    public static DaySchedule calculateDay(
        WatchCity city,
        long dayTimestampMs,
        String methodId,
        String madhabId,
        int[] temkinOffsets
    ) {
        boolean isFazilet = METHOD_FAZILET.equals(methodId);
        boolean isHanafi = MADHAB_HANAFI.equals(madhabId);
        int[] tOff = new int[6];
        if (temkinOffsets != null) {
            for (int i = 0; i < Math.min(6, temkinOffsets.length); i++) {
                tOff[i] = temkinOffsets[i];
            }
        }

        TimeZone tz = TimeZone.getTimeZone(city.tz);
        Calendar cal = Calendar.getInstance(tz);
        cal.setTimeInMillis(dayTimestampMs);
        int year = cal.get(Calendar.YEAR);
        int month = cal.get(Calendar.MONTH) + 1;
        int day = cal.get(Calendar.DAY_OF_MONTH);

        double jd0 = julianDate(year, month, day);
        double noonUtHours = computeTransitUt(jd0 + 0.5, city.lon);

        double fajrAngle = isFazilet ? -19.0 : -18.0;
        double fajrUt = computeSunAngleTimeUt(jd0, noonUtHours, city.lat, city.lon, fajrAngle, false);
        double sunriseUt = computeSunAngleTimeUt(jd0, noonUtHours, city.lat, city.lon, -0.8333, false);
        double dhuhrUt = computeTransitUt(jd0 + noonUtHours / 24.0, city.lon);
        double asrShafiUt = computeAsrUt(jd0, noonUtHours, city.lat, city.lon, 1.0);
        double asrHanafiUt = computeAsrUt(jd0, noonUtHours, city.lat, city.lon, 2.0);
        double maghribUt = computeSunAngleTimeUt(jd0, noonUtHours, city.lat, city.lon, -0.8333, true);
        double ishaUt = computeSunAngleTimeUt(jd0, noonUtHours, city.lat, city.lon, -17.0, true);

        long utcMidnightMs = utcMidnightMillis(year, month, day);
        long fajrMs;
        long sunriseMs;
        long dhuhrMs;
        long asrMs;
        long maghribMs;
        long ishaMs;

        if (isFazilet) {
            // Fazilet Takvimi (Temkinli): İmsak -19° / Yatsı -17° ve geleneksel temkin payları
            fajrMs = floorMinuteMs(utcMidnightMs, fajrUt, -10) + (tOff[0] * 60_000L);
            sunriseMs = floorMinuteMs(utcMidnightMs, sunriseUt, -8) + (tOff[1] * 60_000L);
            dhuhrMs = roundMinuteMs(utcMidnightMs, dhuhrUt, 10) + (tOff[2] * 60_000L);
            long asrSaniMs = roundMinuteMs(utcMidnightMs, asrHanafiUt, 5);
            long asrBaseMs = isHanafi ? asrSaniMs : ceilMinuteMs(utcMidnightMs, asrShafiUt, 10);
            asrMs = asrBaseMs + (tOff[3] * 60_000L);
            maghribMs = roundMinuteMs(utcMidnightMs, maghribUt, 9) + (tOff[4] * 60_000L);
            ishaMs = ceilMinuteMs(utcMidnightMs, ishaUt, 10) + (tOff[5] * 60_000L);
        } else {
            // Diyanet (Türkiye) resmi temkin düzeltmeleri
            fajrMs = roundMinuteMs(utcMidnightMs, fajrUt, 0) + (tOff[0] * 60_000L);
            sunriseMs = roundMinuteMs(utcMidnightMs, sunriseUt, -7) + (tOff[1] * 60_000L);
            dhuhrMs = roundMinuteMs(utcMidnightMs, dhuhrUt, 5) + (tOff[2] * 60_000L);
            double chosenAsrUt = isHanafi ? asrHanafiUt : asrShafiUt;
            asrMs = roundMinuteMs(utcMidnightMs, chosenAsrUt, 4) + (tOff[3] * 60_000L);
            maghribMs = roundMinuteMs(utcMidnightMs, maghribUt, 7) + (tOff[4] * 60_000L);
            ishaMs = roundMinuteMs(utcMidnightMs, ishaUt, 0) + (tOff[5] * 60_000L);
        }

        String asrLabel = isHanafi ? "İkindi (A. Sânî)" : "İkindi";
        PrayerEntry[] entries = new PrayerEntry[] {
            new PrayerEntry("imsak", "İmsak", fajrMs, formatHHMM(fajrMs, tz)),
            new PrayerEntry("gunes", "Güneş", sunriseMs, formatHHMM(sunriseMs, tz)),
            new PrayerEntry("ogle", "Öğle", dhuhrMs, formatHHMM(dhuhrMs, tz)),
            new PrayerEntry("ikindi", asrLabel, asrMs, formatHHMM(asrMs, tz)),
            new PrayerEntry("aksam", "Akşam", maghribMs, formatHHMM(maghribMs, tz)),
            new PrayerEntry("yatsi", "Yatsı", ishaMs, formatHHMM(ishaMs, tz))
        };

        long nightSpan = (fajrMs + 86_400_000L) - maghribMs;
        long teheccudMs = (fajrMs + 86_400_000L) - (nightSpan / 3L);
        long sabahMs = fajrMs + 20L * 60_000L;

        double qiblaAngle = computeQiblaAngle(city.lat, city.lon);
        String qiblaDir = compassDirection(qiblaAngle);
        int distKm = haversineKm(city.lat, city.lon, 21.4225, 39.8262);

        return new DaySchedule(
            entries,
            formatHHMM(sabahMs, tz),
            formatHHMM(teheccudMs, tz),
            qiblaAngle,
            qiblaDir,
            distKm
        );
    }

    public static void syncToPrayerBarHelper(Context context, WatchCity city) {
        syncToPrayerBarHelper(context, city, METHOD_DIYANET, MADHAB_SHAFI, null);
    }

    public static void syncToPrayerBarHelper(
        Context context,
        WatchCity city,
        String methodId,
        String madhabId,
        int[] temkinOffsets
    ) {
        try {
            long now = System.currentTimeMillis();
            DaySchedule today = calculateDay(city, now, methodId, madhabId, temkinOffsets);
            DaySchedule tomorrow = calculateDay(city, now + 86_400_000L, methodId, madhabId, temkinOffsets);

            JSONArray arr = new JSONArray();
            for (PrayerEntry e : today.prayers) {
                JSONObject o = new JSONObject();
                o.put("key", e.key);
                o.put("label", e.label);
                o.put("time", e.formattedTime);
                o.put("epochMs", e.epochMs);
                arr.put(o);
            }
            for (PrayerEntry e : tomorrow.prayers) {
                JSONObject o = new JSONObject();
                o.put("key", e.key);
                o.put("label", e.label);
                o.put("time", e.formattedTime);
                o.put("epochMs", e.epochMs);
                arr.put(o);
            }

            SimpleDateFormat df = new SimpleDateFormat("d MMM", new Locale("tr", "TR"));
            df.setTimeZone(TimeZone.getTimeZone(city.tz));

            JSONObject enabled = new JSONObject();
            enabled.put("imsak", true);
            enabled.put("gunes", false);
            enabled.put("ogle", true);
            enabled.put("ikindi", true);
            enabled.put("aksam", true);
            enabled.put("yatsi", true);

            JSONObject payload = new JSONObject();
            payload.put("persistentEnabled", false);
            payload.put("alertsEnabled", true);
            payload.put("watchAlertsEnabled", true);
            payload.put("soundEnabled", false);
            payload.put("leadMinutes", 0);
            payload.put("locationName", city.name);
            payload.put("dateLabel", df.format(new Date(now)));
            payload.put("hijriLabel", "");
            payload.put("prayers", arr);
            payload.put("enabledPrayers", enabled);

            PrayerBarHelper.saveAndApplySchedule(context, payload);
        } catch (Exception ignored) {
        }
    }

    public static String formatHHMM(long epochMs, TimeZone tz) {
        SimpleDateFormat sdf = new SimpleDateFormat("HH:mm", Locale.US);
        sdf.setTimeZone(tz);
        return sdf.format(new Date(epochMs));
    }

    private static long utcMidnightMillis(int year, int month, int day) {
        Calendar c = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
        c.clear();
        c.set(year, month - 1, day, 0, 0, 0);
        return c.getTimeInMillis();
    }

    private static long exactRawMs(long utcMidnightMs, double utHours, int offsetMin) {
        if (Double.isNaN(utHours)) utHours = 12.0;
        return utcMidnightMs + Math.round(utHours * 3600.0 * 1000.0) + (offsetMin * 60_000L);
    }

    private static long roundMinuteMs(long utcMidnightMs, double utHours, int offsetMin) {
        return Math.round(exactRawMs(utcMidnightMs, utHours, offsetMin) / 60_000.0) * 60_000L;
    }

    private static long floorMinuteMs(long utcMidnightMs, double utHours, int offsetMin) {
        return (long) Math.floor(exactRawMs(utcMidnightMs, utHours, offsetMin) / 60_000.0) * 60_000L;
    }

    private static long ceilMinuteMs(long utcMidnightMs, double utHours, int offsetMin) {
        return (long) Math.ceil(exactRawMs(utcMidnightMs, utHours, offsetMin) / 60_000.0) * 60_000L;
    }

    private static double julianDate(int y, int m, int d) {
        if (m <= 2) {
            y -= 1;
            m += 12;
        }
        int A = y / 100;
        int B = 2 - A + (A / 4);
        return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
    }

    private static double[] solarCoords(double jd) {
        double D = jd - 2451545.0;
        double g = Math.toRadians(normalizeDeg(357.529 + 0.98560028 * D));
        double q = normalizeDeg(280.459 + 0.98564736 * D);
        double L = Math.toRadians(normalizeDeg(q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2.0 * g)));
        double e = Math.toRadians(23.439 - 0.00000036 * D);
        double ra = Math.toDegrees(Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L))) / 15.0;
        ra = normalizeHours(ra);
        double decl = Math.asin(Math.sin(e) * Math.sin(L));
        double eqT = (q / 15.0) - ra;
        if (eqT > 12.0) eqT -= 24.0;
        if (eqT < -12.0) eqT += 24.0;
        return new double[] { decl, eqT };
    }

    private static double computeTransitUt(double jdApprox, double lon) {
        double[] sc = solarCoords(jdApprox);
        return 12.0 - (lon / 15.0) - sc[1];
    }

    private static double computeSunAngleTimeUt(
        double jd0,
        double approxNoonUt,
        double latDeg,
        double lonDeg,
        double altDeg,
        boolean afterNoon
    ) {
        double t = approxNoonUt + (afterNoon ? 4.0 : -4.0);
        for (int iter = 0; iter < 2; iter++) {
            double[] sc = solarCoords(jd0 + t / 24.0);
            double decl = sc[0];
            double eqT = sc[1];
            double latRad = Math.toRadians(latDeg);
            double altRad = Math.toRadians(altDeg);
            double cosH = (Math.sin(altRad) - Math.sin(latRad) * Math.sin(decl))
                / (Math.cos(latRad) * Math.cos(decl));
            if (cosH > 1.0) cosH = 1.0;
            if (cosH < -1.0) cosH = -1.0;
            double H = Math.toDegrees(Math.acos(cosH)) / 15.0;
            double transit = 12.0 - (lonDeg / 15.0) - eqT;
            t = afterNoon ? (transit + H) : (transit - H);
        }
        return t;
    }

    private static double computeAsrUt(
        double jd0,
        double approxNoonUt,
        double latDeg,
        double lonDeg,
        double shadowFactor
    ) {
        double t = approxNoonUt + 3.5;
        for (int iter = 0; iter < 2; iter++) {
            double[] sc = solarCoords(jd0 + t / 24.0);
            double decl = sc[0];
            double eqT = sc[1];
            double latRad = Math.toRadians(latDeg);
            double diff = Math.abs(latRad - decl);
            double altRad = Math.atan(1.0 / (shadowFactor + Math.tan(diff)));
            double cosH = (Math.sin(altRad) - Math.sin(latRad) * Math.sin(decl))
                / (Math.cos(latRad) * Math.cos(decl));
            if (cosH > 1.0) cosH = 1.0;
            if (cosH < -1.0) cosH = -1.0;
            double H = Math.toDegrees(Math.acos(cosH)) / 15.0;
            double transit = 12.0 - (lonDeg / 15.0) - eqT;
            t = transit + H;
        }
        return t;
    }

    private static double normalizeDeg(double a) {
        a = a % 360.0;
        return a < 0 ? a + 360.0 : a;
    }

    private static double normalizeHours(double h) {
        h = h % 24.0;
        return h < 0 ? h + 24.0 : h;
    }

    public static double computeQiblaAngle(double latDeg, double lonDeg) {
        double latK = Math.toRadians(21.4225);
        double lonK = Math.toRadians(39.8262);
        double lat = Math.toRadians(latDeg);
        double lon = Math.toRadians(lonDeg);
        double y = Math.sin(lonK - lon);
        double x = Math.cos(lat) * Math.tan(latK) - Math.sin(lat) * Math.cos(lonK - lon);
        return normalizeDeg(Math.toDegrees(Math.atan2(y, x)));
    }

    public static String compassDirection(double angle) {
        String[] dirs = { "Kuzey", "Kuzeydoğu", "Doğu", "Güneydoğu", "Güney", "Güneybatı", "Batı", "Kuzeybatı" };
        int idx = (int) (Math.round((normalizeDeg(angle) / 45.0))) % 8;
        return dirs[idx];
    }

    public static int haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0)
            + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
            * Math.sin(dLon / 2.0) * Math.sin(dLon / 2.0);
        double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
        return (int) Math.round(R * c);
    }
}
`,
  'utf8'
);

// 13. WearWatchActivity.java: Samsung Galaxy Watch 8 ve tüm Wear OS saatler için %100 native arayüz (WebView gerektirmez)
fs.writeFileSync(
  path.join(javaPkgDir, 'WearWatchActivity.java'),
  `package com.mihrab.namazvakti;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.location.Location;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.text.TextUtils;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.util.Locale;
import java.util.TimeZone;

public class WearWatchActivity extends Activity implements SensorEventListener {

    private static final String PREFS = "mihrab_watch_ui_prefs";
    private static final String KEY_CITY_ID = "city_id";
    private static final String KEY_CUSTOM_NAME = "custom_name";
    private static final String KEY_CUSTOM_LAT = "custom_lat";
    private static final String KEY_CUSTOM_LON = "custom_lon";
    private static final String KEY_CUSTOM_TZ = "custom_tz";
    private static final String KEY_ZIKIR_IDX = "zikir_idx";
    private static final String KEY_ZIKIR_COUNTS = "zikir_counts";
    private static final String KEY_ZIKIR_ROUNDS = "zikir_rounds";
    private static final String KEY_METHOD_ID = "method_id";
    private static final String KEY_MADHAB_ID = "madhab_id";
    private static final String KEY_TEMKIN_OFFSETS = "temkin_offsets";
    private static final int REQ_WATCH_PERMS = 901;

    private static final String[] ZIKIR_TITLES = {
        "Sübhânallah", "Elhamdülillah", "Allâhu Ekber",
        "Lâ ilâhe illallâh", "Estağfirullâh", "Salavat-ı Şerife"
    };
    private static final int[] ZIKIR_TARGETS = { 33, 33, 33, 99, 100, 100 };
    private static final String[] TEMKIN_LABELS = {
        "İmsak", "Güneş", "Öğle", "İkindi", "Akşam", "Yatsı"
    };

    private int activeTab = 0; // 0: Vakit, 1: Liste, 2: Kıble, 3: Zikir, 4: Ayar/Takvim/Şehir
    private WearPrayerCalculator.WatchCity currentCity;
    private String methodId = WearPrayerCalculator.METHOD_DIYANET;
    private String madhabId = WearPrayerCalculator.MADHAB_SHAFI;
    private final int[] temkinOffsets = new int[6];

    private WearPrayerCalculator.DaySchedule todaySchedule;
    private WearPrayerCalculator.DaySchedule tomorrowSchedule;
    private WearPrayerCalculator.DaySchedule yesterdaySchedule;

    private int zikirIdx = 0;
    private final int[] zikirCounts = new int[ZIKIR_TITLES.length];
    private final int[] zikirRounds = new int[ZIKIR_TITLES.length];

    private final Handler handler = new Handler(Looper.getMainLooper());
    private Runnable ticker;

    private FrameLayout contentHost;
    private WatchDialView dialView;
    private WatchCompassView compassView;
    private LinearLayout prayerListContainer;
    private TextView zikirTitleView;
    private TextView zikirCountText;
    private TextView zikirTargetText;
    private TextView compassLabelText;
    private TextView cityStatusText;
    private Button diyanetBtn;
    private Button faziletBtn;
    private Button shafiBtn;
    private Button hanafiBtn;
    private final TextView[] temkinValueViews = new TextView[6];
    private final TextView[] temkinTimeViews = new TextView[6];
    private final Button[] navButtons = new Button[4];

    private SensorManager sensorManager;
    private Sensor rotSensor;
    private Sensor accelSensor;
    private Sensor magSensor;
    private final float[] lastAccel = new float[3];
    private final float[] lastMag = new float[3];
    private boolean hasAccel = false;
    private boolean hasMag = false;
    private Float smoothedHeading = null;
    private long lastAlignedBuzzMs = 0L;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        loadState();
        recomputeSchedules();
        WearPrayerCalculator.syncToPrayerBarHelper(this, currentCity, methodId, madhabId, temkinOffsets);
        requestWatchPermissionsIfNeeded();

        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager != null) {
            rotSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
            accelSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
            magSensor = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);
        }

        buildUi();
        switchTab(0);
    }

    private void requestWatchPermissionsIfNeeded() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(
                    this,
                    new String[] { Manifest.permission.POST_NOTIFICATIONS },
                    REQ_WATCH_PERMS
                );
            }
        }
    }

    private void loadState() {
        SharedPreferences sp = getSharedPreferences(PREFS, MODE_PRIVATE);
        String customName = sp.getString(KEY_CUSTOM_NAME, null);
        if (customName != null && sp.contains(KEY_CUSTOM_LAT)) {
            currentCity = new WearPrayerCalculator.WatchCity(
                "gps",
                customName,
                Double.longBitsToDouble(sp.getLong(KEY_CUSTOM_LAT, 0L)),
                Double.longBitsToDouble(sp.getLong(KEY_CUSTOM_LON, 0L)),
                sp.getString(KEY_CUSTOM_TZ, TimeZone.getDefault().getID())
            );
        } else {
            currentCity = WearPrayerCalculator.findById(sp.getString(KEY_CITY_ID, "tr-istanbul"));
        }

        methodId = sp.getString(KEY_METHOD_ID, WearPrayerCalculator.METHOD_DIYANET);
        madhabId = sp.getString(KEY_MADHAB_ID, WearPrayerCalculator.MADHAB_SHAFI);
        String[] temkinRaw = sp.getString(KEY_TEMKIN_OFFSETS, "").split(",");
        for (int i = 0; i < 6; i++) {
            try {
                if (i < temkinRaw.length && !temkinRaw[i].isEmpty()) {
                    temkinOffsets[i] = Math.max(-30, Math.min(30, Integer.parseInt(temkinRaw[i])));
                }
            } catch (NumberFormatException ignored) {
            }
        }

        zikirIdx = Math.max(0, Math.min(ZIKIR_TITLES.length - 1, sp.getInt(KEY_ZIKIR_IDX, 0)));
        String[] countsRaw = sp.getString(KEY_ZIKIR_COUNTS, "").split(",");
        String[] roundsRaw = sp.getString(KEY_ZIKIR_ROUNDS, "").split(",");
        for (int i = 0; i < ZIKIR_TITLES.length; i++) {
            try {
                if (i < countsRaw.length && !countsRaw[i].isEmpty()) {
                    zikirCounts[i] = Integer.parseInt(countsRaw[i]);
                }
                if (i < roundsRaw.length && !roundsRaw[i].isEmpty()) {
                    zikirRounds[i] = Integer.parseInt(roundsRaw[i]);
                }
            } catch (NumberFormatException ignored) {
            }
        }
    }

    private void saveCalendarPrefsAndRefresh() {
        StringBuilder tb = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            if (i > 0) tb.append(",");
            tb.append(temkinOffsets[i]);
        }
        getSharedPreferences(PREFS, MODE_PRIVATE)
            .edit()
            .putString(KEY_METHOD_ID, methodId)
            .putString(KEY_MADHAB_ID, madhabId)
            .putString(KEY_TEMKIN_OFFSETS, tb.toString())
            .apply();

        recomputeSchedules();
        WearPrayerCalculator.syncToPrayerBarHelper(this, currentCity, methodId, madhabId, temkinOffsets);
        refreshPrayerListUi();
        refreshSettingsUi();
        if (dialView != null) dialView.invalidate();
        if (compassView != null) compassView.invalidate();
    }

    private void saveZikirState() {
        StringBuilder cb = new StringBuilder();
        StringBuilder rb = new StringBuilder();
        for (int i = 0; i < ZIKIR_TITLES.length; i++) {
            if (i > 0) {
                cb.append(",");
                rb.append(",");
            }
            cb.append(zikirCounts[i]);
            rb.append(zikirRounds[i]);
        }
        getSharedPreferences(PREFS, MODE_PRIVATE)
            .edit()
            .putInt(KEY_ZIKIR_IDX, zikirIdx)
            .putString(KEY_ZIKIR_COUNTS, cb.toString())
            .putString(KEY_ZIKIR_ROUNDS, rb.toString())
            .apply();
    }

    private void saveCity(WearPrayerCalculator.WatchCity city) {
        currentCity = city;
        SharedPreferences.Editor ed = getSharedPreferences(PREFS, MODE_PRIVATE).edit();
        if ("gps".equals(city.id)) {
            ed.putString(KEY_CUSTOM_NAME, city.name);
            ed.putLong(KEY_CUSTOM_LAT, Double.doubleToRawLongBits(city.lat));
            ed.putLong(KEY_CUSTOM_LON, Double.doubleToRawLongBits(city.lon));
            ed.putString(KEY_CUSTOM_TZ, city.tz);
        } else {
            ed.remove(KEY_CUSTOM_NAME);
            ed.putString(KEY_CITY_ID, city.id);
        }
        ed.apply();

        recomputeSchedules();
        WearPrayerCalculator.syncToPrayerBarHelper(this, currentCity, methodId, madhabId, temkinOffsets);
        refreshPrayerListUi();
        refreshSettingsUi();
        if (dialView != null) dialView.invalidate();
        if (compassView != null) compassView.invalidate();
    }

    private void recomputeSchedules() {
        long now = System.currentTimeMillis();
        todaySchedule = WearPrayerCalculator.calculateDay(currentCity, now, methodId, madhabId, temkinOffsets);
        tomorrowSchedule = WearPrayerCalculator.calculateDay(currentCity, now + 86_400_000L, methodId, madhabId, temkinOffsets);
        yesterdaySchedule = WearPrayerCalculator.calculateDay(currentCity, now - 86_400_000L, methodId, madhabId, temkinOffsets);
    }

    private void buildUi() {
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(0xFF040806);

        contentHost = new FrameLayout(this);
        root.addView(contentHost, new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));

        // 0: Vakit Kadranı
        dialView = new WatchDialView(this);
        dialView.setOnClickListener(v -> switchTab(4)); // Şehir adına/kadrana dokununca konum seçimine geç

        // 1: 6 Vakit Listesi
        ScrollView listScroll = new ScrollView(this);
        listScroll.setVerticalScrollBarEnabled(false);
        prayerListContainer = new LinearLayout(this);
        prayerListContainer.setOrientation(LinearLayout.VERTICAL);
        prayerListContainer.setPadding(dp(26), dp(26), dp(26), dp(52));
        listScroll.addView(prayerListContainer);

        // 2: Kıble Pusulası
        LinearLayout compassScreen = new LinearLayout(this);
        compassScreen.setOrientation(LinearLayout.VERTICAL);
        compassScreen.setGravity(Gravity.CENTER);
        compassScreen.setPadding(dp(18), dp(20), dp(18), dp(46));
        compassView = new WatchCompassView(this);
        compassScreen.addView(compassView, new LinearLayout.LayoutParams(dp(122), dp(122)));
        compassLabelText = new TextView(this);
        compassLabelText.setGravity(Gravity.CENTER);
        compassLabelText.setTextColor(0xFF34D399);
        compassLabelText.setTextSize(12f);
        compassLabelText.setTypeface(Typeface.DEFAULT_BOLD);
        compassLabelText.setPadding(0, dp(4), 0, 0);
        compassScreen.addView(compassLabelText);

        // 3: Zikirmatik
        View zikirScreen = buildZikirScreen();

        // 4: Konum / Şehir Seçici
        View cityScreen = buildCityScreen();

        contentHost.addView(dialView);
        contentHost.addView(listScroll);
        contentHost.addView(compassScreen);
        contentHost.addView(zikirScreen);
        contentHost.addView(cityScreen);

        // Alt kompakt yuvarlak saat navigasyon çubuğu
        LinearLayout bottomNav = new LinearLayout(this);
        bottomNav.setOrientation(LinearLayout.HORIZONTAL);
        bottomNav.setGravity(Gravity.CENTER);
        bottomNav.setPadding(dp(8), dp(2), dp(8), dp(12));
        String[] tabLabels = { "Vakit", "Liste", "Kıble", "Zikir" };
        for (int i = 0; i < 4; i++) {
            final int idx = i;
            Button b = new Button(this);
            b.setAllCaps(false);
            b.setText(tabLabels[i]);
            b.setTextSize(10f);
            b.setPadding(dp(6), dp(2), dp(6), dp(2));
            b.setMinHeight(dp(28));
            b.setMinimumHeight(dp(28));
            b.setMinWidth(dp(40));
            b.setMinimumWidth(dp(40));
            b.setOnClickListener(v -> switchTab(idx));
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                dp(28)
            );
            lp.setMargins(dp(2), 0, dp(2), 0);
            bottomNav.addView(b, lp);
            navButtons[i] = b;
        }
        FrameLayout.LayoutParams navParams = new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT,
            Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL
        );
        root.addView(bottomNav, navParams);

        setContentView(root);
        refreshPrayerListUi();
        refreshZikirUi();
        refreshCompassLabel(null);
    }

    private View buildZikirScreen() {
        LinearLayout wrap = new LinearLayout(this);
        wrap.setOrientation(LinearLayout.VERTICAL);
        wrap.setGravity(Gravity.CENTER);
        wrap.setPadding(dp(22), dp(22), dp(22), dp(48));

        LinearLayout header = new LinearLayout(this);
        header.setOrientation(LinearLayout.HORIZONTAL);
        header.setGravity(Gravity.CENTER_VERTICAL);

        Button prevBtn = makeMiniBtn("‹", v -> {
            zikirIdx = (zikirIdx - 1 + ZIKIR_TITLES.length) % ZIKIR_TITLES.length;
            saveZikirState();
            refreshZikirUi();
        });

        zikirTitleView = new TextView(this);
        zikirTitleView.setGravity(Gravity.CENTER);
        zikirTitleView.setTextColor(0xFFEDF2F0);
        zikirTitleView.setTextSize(12f);
        zikirTitleView.setTypeface(Typeface.DEFAULT_BOLD);
        zikirTitleView.setSingleLine(true);
        zikirTitleView.setEllipsize(TextUtils.TruncateAt.END);

        Button nextBtn = makeMiniBtn("›", v -> {
            zikirIdx = (zikirIdx + 1) % ZIKIR_TITLES.length;
            saveZikirState();
            refreshZikirUi();
        });

        header.addView(prevBtn, new LinearLayout.LayoutParams(dp(28), dp(28)));
        LinearLayout.LayoutParams titleLp = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
        titleLp.setMargins(dp(4), 0, dp(4), 0);
        header.addView(zikirTitleView, titleLp);
        header.addView(nextBtn, new LinearLayout.LayoutParams(dp(28), dp(28)));
        wrap.addView(header, new LinearLayout.LayoutParams(dp(170), ViewGroup.LayoutParams.WRAP_CONTENT));

        // Büyük yuvarlak Zikir sayacı düğmesi
        LinearLayout tapCircle = new LinearLayout(this);
        tapCircle.setOrientation(LinearLayout.VERTICAL);
        tapCircle.setGravity(Gravity.CENTER);
        GradientDrawable circleBg = new GradientDrawable();
        circleBg.setShape(GradientDrawable.OVAL);
        circleBg.setColor(0xFF0D261D);
        circleBg.setStroke(dp(2), 0xFF34D399);
        tapCircle.setBackground(circleBg);

        zikirCountText = new TextView(this);
        zikirCountText.setTextColor(0xFF34D399);
        zikirCountText.setTextSize(26f);
        zikirCountText.setTypeface(Typeface.MONOSPACE, Typeface.BOLD);
        zikirCountText.setGravity(Gravity.CENTER);

        zikirTargetText = new TextView(this);
        zikirTargetText.setTextColor(0xFFA7BDB4);
        zikirTargetText.setTextSize(10f);
        zikirTargetText.setGravity(Gravity.CENTER);

        tapCircle.addView(zikirCountText);
        tapCircle.addView(zikirTargetText);
        tapCircle.setOnClickListener(v -> incrementZikir());

        LinearLayout.LayoutParams circleLp = new LinearLayout.LayoutParams(dp(96), dp(96));
        circleLp.setMargins(0, dp(6), 0, dp(6));
        wrap.addView(tapCircle, circleLp);

        LinearLayout actions = new LinearLayout(this);
        actions.setOrientation(LinearLayout.HORIZONTAL);
        actions.setGravity(Gravity.CENTER);
        Button minusBtn = makeMiniBtn("-1", v -> {
            if (zikirCounts[zikirIdx] > 0) {
                zikirCounts[zikirIdx]--;
                saveZikirState();
                refreshZikirUi();
            }
        });
        Button resetBtn = makeMiniBtn("Sıfırla", v -> {
            zikirCounts[zikirIdx] = 0;
            saveZikirState();
            refreshZikirUi();
        });
        LinearLayout.LayoutParams aLp1 = new LinearLayout.LayoutParams(dp(44), dp(26));
        aLp1.setMargins(0, 0, dp(6), 0);
        actions.addView(minusBtn, aLp1);
        actions.addView(resetBtn, new LinearLayout.LayoutParams(dp(58), dp(26)));
        wrap.addView(actions);

        return wrap;
    }

    private View buildCityScreen() {
        ScrollView scroll = new ScrollView(this);
        scroll.setVerticalScrollBarEnabled(false);

        LinearLayout col = new LinearLayout(this);
        col.setOrientation(LinearLayout.VERTICAL);
        col.setGravity(Gravity.CENTER_HORIZONTAL);
        col.setPadding(dp(24), dp(26), dp(24), dp(56));

        TextView head = new TextView(this);
        head.setText("Takvim, Temkin & Konum");
        head.setTextColor(0xFFEDF2F0);
        head.setTextSize(12f);
        head.setTypeface(Typeface.DEFAULT_BOLD);
        head.setGravity(Gravity.CENTER);
        col.addView(head);

        cityStatusText = new TextView(this);
        cityStatusText.setTextColor(0xFF34D399);
        cityStatusText.setTextSize(10f);
        cityStatusText.setGravity(Gravity.CENTER);
        cityStatusText.setPadding(0, dp(2), 0, dp(8));
        col.addView(cityStatusText);

        // Takvim Yöntemi: Diyanet vs Fazilet Takvimi (Temkinli)
        TextView methodLbl = new TextView(this);
        methodLbl.setText("Hesaplama Takvimi");
        methodLbl.setTextColor(0xFF9DB0A8);
        methodLbl.setTextSize(10f);
        methodLbl.setPadding(0, dp(2), 0, dp(4));
        col.addView(methodLbl);

        LinearLayout methodRow = new LinearLayout(this);
        methodRow.setOrientation(LinearLayout.HORIZONTAL);
        diyanetBtn = makeToggleBtn("Diyanet", v -> {
            methodId = WearPrayerCalculator.METHOD_DIYANET;
            vibrateMs(14);
            saveCalendarPrefsAndRefresh();
        });
        faziletBtn = makeToggleBtn("Fazilet (Temkin)", v -> {
            methodId = WearPrayerCalculator.METHOD_FAZILET;
            vibrateMs(14);
            saveCalendarPrefsAndRefresh();
        });
        LinearLayout.LayoutParams mLp1 = new LinearLayout.LayoutParams(0, dp(32), 1f);
        mLp1.setMargins(0, 0, dp(4), 0);
        methodRow.addView(diyanetBtn, mLp1);
        methodRow.addView(faziletBtn, new LinearLayout.LayoutParams(0, dp(32), 1f));
        LinearLayout.LayoutParams mRowLp = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT
        );
        mRowLp.setMargins(0, 0, 0, dp(8));
        col.addView(methodRow, mRowLp);

        // İkindi Mezhebi: Standart vs Hanefi (Asr-ı Sânî)
        TextView madhabLbl = new TextView(this);
        madhabLbl.setText("İkindi Mezhebi");
        madhabLbl.setTextColor(0xFF9DB0A8);
        madhabLbl.setTextSize(10f);
        madhabLbl.setPadding(0, 0, 0, dp(4));
        col.addView(madhabLbl);

        LinearLayout madhabRow = new LinearLayout(this);
        madhabRow.setOrientation(LinearLayout.HORIZONTAL);
        shafiBtn = makeToggleBtn("Standart", v -> {
            madhabId = WearPrayerCalculator.MADHAB_SHAFI;
            vibrateMs(14);
            saveCalendarPrefsAndRefresh();
        });
        hanafiBtn = makeToggleBtn("Hanefi İkindi", v -> {
            madhabId = WearPrayerCalculator.MADHAB_HANAFI;
            vibrateMs(14);
            saveCalendarPrefsAndRefresh();
        });
        LinearLayout.LayoutParams hLp1 = new LinearLayout.LayoutParams(0, dp(30), 1f);
        hLp1.setMargins(0, 0, dp(4), 0);
        madhabRow.addView(shafiBtn, hLp1);
        madhabRow.addView(hanafiBtn, new LinearLayout.LayoutParams(0, dp(30), 1f));
        LinearLayout.LayoutParams hRowLp = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT
        );
        hRowLp.setMargins(0, 0, 0, dp(10));
        col.addView(madhabRow, hRowLp);

        // Özel Temkin Ayarı (± Dakika)
        TextView temkinLbl = new TextView(this);
        temkinLbl.setText("Temkin Ayarı (± Dakika)");
        temkinLbl.setTextColor(0xFF9DB0A8);
        temkinLbl.setTextSize(10f);
        temkinLbl.setPadding(0, 0, 0, dp(4));
        col.addView(temkinLbl);

        for (int i = 0; i < 6; i++) {
            final int idx = i;
            LinearLayout row = new LinearLayout(this);
            row.setOrientation(LinearLayout.HORIZONTAL);
            row.setGravity(Gravity.CENTER_VERTICAL);
            row.setPadding(dp(8), dp(4), dp(6), dp(4));
            GradientDrawable rBg = new GradientDrawable();
            rBg.setCornerRadius(dp(10));
            rBg.setColor(0xFF0A120F);
            rBg.setStroke(dp(1), 0xFF1A2A24);
            row.setBackground(rBg);

            LinearLayout leftCol = new LinearLayout(this);
            leftCol.setOrientation(LinearLayout.VERTICAL);
            TextView pName = new TextView(this);
            pName.setText(TEMKIN_LABELS[i]);
            pName.setTextColor(0xFFEDF2F0);
            pName.setTextSize(11f);
            pName.setTypeface(Typeface.DEFAULT_BOLD);
            TextView pTime = new TextView(this);
            pTime.setTextColor(0xFF8EA39B);
            pTime.setTextSize(9.5f);
            pTime.setTypeface(Typeface.MONOSPACE);
            temkinTimeViews[i] = pTime;
            leftCol.addView(pName);
            leftCol.addView(pTime);
            row.addView(leftCol, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));

            Button minusBtn = makeMiniBtn("−", v -> {
                temkinOffsets[idx] = Math.max(-30, temkinOffsets[idx] - 1);
                vibrateMs(12);
                saveCalendarPrefsAndRefresh();
            });
            TextView valView = new TextView(this);
            valView.setGravity(Gravity.CENTER);
            valView.setTextSize(10.5f);
            valView.setTypeface(Typeface.MONOSPACE, Typeface.BOLD);
            temkinValueViews[i] = valView;
            Button plusBtn = makeMiniBtn("+", v -> {
                temkinOffsets[idx] = Math.min(30, temkinOffsets[idx] + 1);
                vibrateMs(12);
                saveCalendarPrefsAndRefresh();
            });

            row.addView(minusBtn, new LinearLayout.LayoutParams(dp(26), dp(26)));
            row.addView(valView, new LinearLayout.LayoutParams(dp(38), ViewGroup.LayoutParams.WRAP_CONTENT));
            row.addView(plusBtn, new LinearLayout.LayoutParams(dp(26), dp(26)));

            LinearLayout.LayoutParams rLp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT
            );
            rLp.setMargins(0, 0, 0, dp(4));
            col.addView(row, rLp);
        }

        Button resetTemkinBtn = makeMiniBtn("Temkini Sıfırla (0 dk)", v -> {
            for (int i = 0; i < 6; i++) temkinOffsets[i] = 0;
            vibrateMs(18);
            saveCalendarPrefsAndRefresh();
        });
        LinearLayout.LayoutParams rstLp = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, dp(28)
        );
        rstLp.setMargins(0, dp(2), 0, dp(10));
        col.addView(resetTemkinBtn, rstLp);

        // Şehir / Konum Seçimi
        TextView locLbl = new TextView(this);
        locLbl.setText("Şehir / Konum");
        locLbl.setTextColor(0xFF9DB0A8);
        locLbl.setTextSize(10f);
        locLbl.setPadding(0, 0, 0, dp(4));
        col.addView(locLbl);

        Button gpsBtn = new Button(this);
        gpsBtn.setAllCaps(false);
        gpsBtn.setText("GPS ile Konum Bul");
        gpsBtn.setTextSize(11f);
        gpsBtn.setTextColor(0xFF04140E);
        GradientDrawable gpsBg = new GradientDrawable();
        gpsBg.setCornerRadius(dp(14));
        gpsBg.setColor(0xFF10B981);
        gpsBtn.setBackground(gpsBg);
        gpsBtn.setOnClickListener(v -> detectWatchGps());
        LinearLayout.LayoutParams gLp = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, dp(34)
        );
        gLp.setMargins(0, 0, 0, dp(8));
        col.addView(gpsBtn, gLp);

        for (final WearPrayerCalculator.WatchCity c : WearPrayerCalculator.CITIES) {
            Button cb = new Button(this);
            cb.setAllCaps(false);
            cb.setText(c.name);
            cb.setTextSize(12f);
            cb.setTextColor(0xFFEDF2F0);
            GradientDrawable bg = new GradientDrawable();
            bg.setCornerRadius(dp(12));
            bg.setColor(0xFF0E1714);
            bg.setStroke(dp(1), 0xFF1E322B);
            cb.setBackground(bg);
            cb.setOnClickListener(v -> {
                saveCity(c);
                vibrateMs(18);
                switchTab(0);
            });
            LinearLayout.LayoutParams cLp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, dp(34)
            );
            cLp.setMargins(0, 0, 0, dp(5));
            col.addView(cb, cLp);
        }

        scroll.addView(col);
        refreshSettingsUi();
        return scroll;
    }

    private Button makeToggleBtn(String text, View.OnClickListener listener) {
        Button b = new Button(this);
        b.setAllCaps(false);
        b.setText(text);
        b.setTextSize(10.5f);
        b.setPadding(dp(4), 0, dp(4), 0);
        b.setMinHeight(dp(28));
        b.setMinimumHeight(dp(28));
        b.setSingleLine(true);
        b.setEllipsize(TextUtils.TruncateAt.END);
        b.setOnClickListener(listener);
        return b;
    }

    private void styleToggleBtn(Button b, boolean active) {
        if (b == null) return;
        GradientDrawable bg = new GradientDrawable();
        bg.setCornerRadius(dp(10));
        if (active) {
            bg.setColor(0xFF10B981);
            b.setTextColor(0xFF04140E);
            b.setTypeface(Typeface.DEFAULT_BOLD);
        } else {
            bg.setColor(0xFF0E1714);
            bg.setStroke(dp(1), 0xFF1E322B);
            b.setTextColor(0xFFA7BDB4);
            b.setTypeface(Typeface.DEFAULT);
        }
        b.setBackground(bg);
    }

    private void refreshSettingsUi() {
        if (cityStatusText != null) {
            String mLabel = WearPrayerCalculator.METHOD_FAZILET.equals(methodId) ? "Fazilet" : "Diyanet";
            cityStatusText.setText(currentCity.name + " · " + mLabel);
        }
        boolean isFazilet = WearPrayerCalculator.METHOD_FAZILET.equals(methodId);
        boolean isHanafi = WearPrayerCalculator.MADHAB_HANAFI.equals(madhabId);
        styleToggleBtn(diyanetBtn, !isFazilet);
        styleToggleBtn(faziletBtn, isFazilet);
        styleToggleBtn(shafiBtn, !isHanafi);
        styleToggleBtn(hanafiBtn, isHanafi);

        for (int i = 0; i < 6; i++) {
            if (temkinValueViews[i] != null) {
                int v = temkinOffsets[i];
                temkinValueViews[i].setText(v > 0 ? ("+" + v + "d") : (v + "d"));
                temkinValueViews[i].setTextColor(v != 0 ? 0xFF34D399 : 0xFF9DB0A8);
            }
            if (temkinTimeViews[i] != null && todaySchedule != null && i < todaySchedule.prayers.length) {
                temkinTimeViews[i].setText(todaySchedule.prayers[i].formattedTime);
            }
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_WATCH_PERMS) {
            boolean locGranted = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                == PackageManager.PERMISSION_GRANTED
                || ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION)
                == PackageManager.PERMISSION_GRANTED;
            if (locGranted && activeTab == 4) {
                detectWatchGps();
            }
            WearPrayerCalculator.syncToPrayerBarHelper(this, currentCity, methodId, madhabId, temkinOffsets);
        }
    }

    private void detectWatchGps() {
        boolean fine = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
            == PackageManager.PERMISSION_GRANTED;
        boolean coarse = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION)
            == PackageManager.PERMISSION_GRANTED;

        if (!fine && !coarse) {
            ActivityCompat.requestPermissions(
                this,
                new String[] { Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION },
                REQ_WATCH_PERMS
            );
            cityStatusText.setText("GPS izni verip tekrar dokunun");
            return;
        }

        try {
            LocationManager lm = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
            if (lm == null) {
                cityStatusText.setText("GPS servisi bulunamadı");
                return;
            }
            Location loc = lm.getLastKnownLocation(LocationManager.GPS_PROVIDER);
            if (loc == null) loc = lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
            if (loc == null) loc = lm.getLastKnownLocation(LocationManager.PASSIVE_PROVIDER);

            if (loc != null) {
                WearPrayerCalculator.WatchCity nearest = WearPrayerCalculator.findNearestCity(
                    loc.getLatitude(), loc.getLongitude()
                );
                WearPrayerCalculator.WatchCity gpsCity = new WearPrayerCalculator.WatchCity(
                    "gps",
                    nearest.name,
                    loc.getLatitude(),
                    loc.getLongitude(),
                    TimeZone.getDefault().getID()
                );
                saveCity(gpsCity);
                cityStatusText.setText("GPS: " + nearest.name);
                vibrateMs(25);
                switchTab(0);
            } else {
                cityStatusText.setText("GPS sinyali bekleniyor, listeden seçebilirsiniz");
            }
        } catch (SecurityException e) {
            cityStatusText.setText("Konum izni gerekli");
        }
    }

    private void incrementZikir() {
        int target = ZIKIR_TARGETS[zikirIdx];
        int next = zikirCounts[zikirIdx] + 1;
        if (next >= target) {
            zikirRounds[zikirIdx]++;
            zikirCounts[zikirIdx] = 0;
            if (zikirIdx < 3) {
                zikirIdx = (zikirIdx + 1) % 3;
            }
            vibrateMs(55);
        } else {
            zikirCounts[zikirIdx] = next;
            vibrateMs(14);
        }
        saveZikirState();
        refreshZikirUi();
    }

    private void refreshZikirUi() {
        if (zikirTitleView == null) return;
        zikirTitleView.setText(ZIKIR_TITLES[zikirIdx]);
        zikirCountText.setText(String.valueOf(zikirCounts[zikirIdx]));
        zikirTargetText.setText("/ " + ZIKIR_TARGETS[zikirIdx] + " · Tur " + zikirRounds[zikirIdx]);
    }

    private void refreshPrayerListUi() {
        if (prayerListContainer == null || todaySchedule == null) return;
        prayerListContainer.removeAllViews();

        TextView title = new TextView(this);
        String calName = WearPrayerCalculator.METHOD_FAZILET.equals(methodId) ? "Fazilet" : "Diyanet";
        title.setText(currentCity.name + " · " + calName + " ⚙");
        title.setTextColor(0xFF9DB0A8);
        title.setTextSize(11f);
        title.setGravity(Gravity.CENTER);
        title.setPadding(0, 0, 0, dp(6));
        title.setOnClickListener(v -> switchTab(4));
        prayerListContainer.addView(title);

        NextInfo info = computeNextInfo();
        for (WearPrayerCalculator.PrayerEntry p : todaySchedule.prayers) {
            boolean isNext = p.key.equals(info.next.key) && info.next.epochMs == p.epochMs;
            boolean isCur = info.current != null && p.key.equals(info.current.key);

            LinearLayout row = new LinearLayout(this);
            row.setOrientation(LinearLayout.HORIZONTAL);
            row.setGravity(Gravity.CENTER_VERTICAL);
            row.setPadding(dp(12), dp(7), dp(12), dp(7));
            GradientDrawable bg = new GradientDrawable();
            bg.setCornerRadius(dp(12));
            if (isNext) {
                bg.setColor(0xFF0E2B20);
                bg.setStroke(dp(1), 0xFF34D399);
            } else if (isCur) {
                bg.setColor(0xFF1D1B10);
                bg.setStroke(dp(1), 0xFFFBBF24);
            } else {
                bg.setColor(0xFF0A120F);
                bg.setStroke(dp(1), 0xFF16241F);
            }
            row.setBackground(bg);

            TextView lbl = new TextView(this);
            lbl.setText(p.label);
            lbl.setTextSize(12f);
            lbl.setTextColor(isNext ? 0xFFFFFFFF : (isCur ? 0xFFFDE68A : 0xFFB7C7C0));
            if (isNext) lbl.setTypeface(Typeface.DEFAULT_BOLD);

            TextView tm = new TextView(this);
            tm.setText(p.formattedTime);
            tm.setTextSize(12f);
            tm.setTypeface(Typeface.MONOSPACE, isNext ? Typeface.BOLD : Typeface.NORMAL);
            tm.setTextColor(isNext ? 0xFF34D399 : 0xFFEDF2F0);

            row.addView(lbl, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
            row.addView(tm);

            LinearLayout.LayoutParams rLp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT
            );
            rLp.setMargins(0, 0, 0, dp(4));
            prayerListContainer.addView(row, rLp);
        }

        TextView extra = new TextView(this);
        extra.setText("Sabah " + todaySchedule.sabah + " · Teheccüd " + todaySchedule.teheccud);
        extra.setTextColor(0xFF7D9189);
        extra.setTextSize(10f);
        extra.setGravity(Gravity.CENTER);
        extra.setPadding(0, dp(4), 0, dp(6));
        prayerListContainer.addView(extra);

        Button cfgBtn = makeToggleBtn("Takvim, Temkin & Konum", v -> switchTab(4));
        styleToggleBtn(cfgBtn, false);
        LinearLayout.LayoutParams cfgLp = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, dp(30)
        );
        cfgLp.setMargins(0, dp(2), 0, dp(6));
        prayerListContainer.addView(cfgBtn, cfgLp);
    }

    private void switchTab(int tab) {
        activeTab = tab;
        for (int i = 0; i < contentHost.getChildCount(); i++) {
            contentHost.getChildAt(i).setVisibility(i == tab ? View.VISIBLE : View.GONE);
        }
        for (int i = 0; i < 4; i++) {
            Button b = navButtons[i];
            if (b == null) continue;
            boolean active = (i == tab);
            GradientDrawable bg = new GradientDrawable();
            bg.setCornerRadius(dp(14));
            bg.setColor(active ? 0xFF10B981 : 0xFF101C18);
            b.setBackground(bg);
            b.setTextColor(active ? 0xFF04120C : 0xFF8EA39B);
        }
        if (tab == 1) refreshPrayerListUi();
        if (tab == 2) registerCompassSensors();
        else unregisterCompassSensors();
    }

    private Button makeMiniBtn(String text, View.OnClickListener listener) {
        Button b = new Button(this);
        b.setAllCaps(false);
        b.setText(text);
        b.setTextSize(11f);
        b.setTextColor(0xFFCBD5E1);
        b.setPadding(0, 0, 0, 0);
        b.setMinHeight(dp(26));
        b.setMinimumHeight(dp(26));
        b.setMinWidth(dp(28));
        b.setMinimumWidth(dp(28));
        GradientDrawable bg = new GradientDrawable();
        bg.setCornerRadius(dp(12));
        bg.setColor(0xFF111D18);
        bg.setStroke(dp(1), 0xFF21332C);
        b.setBackground(bg);
        b.setOnClickListener(listener);
        return b;
    }

    private void registerCompassSensors() {
        if (sensorManager == null) return;
        if (rotSensor != null) {
            sensorManager.registerListener(this, rotSensor, SensorManager.SENSOR_DELAY_UI);
        } else {
            if (accelSensor != null) {
                sensorManager.registerListener(this, accelSensor, SensorManager.SENSOR_DELAY_UI);
            }
            if (magSensor != null) {
                sensorManager.registerListener(this, magSensor, SensorManager.SENSOR_DELAY_UI);
            }
        }
    }

    private void unregisterCompassSensors() {
        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
        }
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (activeTab != 2) return;
        float rawDeg = Float.NaN;

        if (event.sensor.getType() == Sensor.TYPE_ROTATION_VECTOR) {
            float[] rotMat = new float[9];
            float[] orient = new float[3];
            SensorManager.getRotationMatrixFromVector(rotMat, event.values);
            SensorManager.getOrientation(rotMat, orient);
            rawDeg = (float) ((Math.toDegrees(orient[0]) + 360.0) % 360.0);
        } else if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            System.arraycopy(event.values, 0, lastAccel, 0, 3);
            hasAccel = true;
        } else if (event.sensor.getType() == Sensor.TYPE_MAGNETIC_FIELD) {
            System.arraycopy(event.values, 0, lastMag, 0, 3);
            hasMag = true;
        }

        if (Float.isNaN(rawDeg) && hasAccel && hasMag) {
            float[] R = new float[9];
            float[] I = new float[9];
            if (SensorManager.getRotationMatrix(R, I, lastAccel, lastMag)) {
                float[] orient = new float[3];
                SensorManager.getOrientation(R, orient);
                rawDeg = (float) ((Math.toDegrees(orient[0]) + 360.0) % 360.0);
            }
        }

        if (!Float.isNaN(rawDeg)) {
            if (smoothedHeading == null) {
                smoothedHeading = rawDeg;
            } else {
                float diff = rawDeg - smoothedHeading;
                if (diff > 180f) diff -= 360f;
                if (diff < -180f) diff += 360f;
                smoothedHeading = (smoothedHeading + diff * 0.22f + 360f) % 360f;
            }
            refreshCompassLabel(smoothedHeading);
            if (compassView != null) compassView.invalidate();
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
    }

    private void refreshCompassLabel(Float headingDeg) {
        if (compassLabelText == null || todaySchedule == null) return;
        double qibla = todaySchedule.qiblaAngle;
        String base = String.format(Locale.US, "%.1f° %s", qibla, todaySchedule.qiblaDirection);
        if (headingDeg != null) {
            double diff = ((qibla - headingDeg + 540.0) % 360.0) - 180.0;
            if (Math.abs(diff) <= 6.0) {
                compassLabelText.setTextColor(0xFF34D399);
                compassLabelText.setText(base + " · Kıble Hizalı");
                long now = System.currentTimeMillis();
                if (now - lastAlignedBuzzMs > 3000L) {
                    lastAlignedBuzzMs = now;
                    vibrateMs(22);
                }
                return;
            }
        }
        compassLabelText.setTextColor(0xFFFBBF24);
        compassLabelText.setText(base);
    }

    private static class NextInfo {
        WearPrayerCalculator.PrayerEntry current;
        WearPrayerCalculator.PrayerEntry next;
        long remainingMs;
        float progress;
    }

    private NextInfo computeNextInfo() {
        long now = System.currentTimeMillis();
        WearPrayerCalculator.PrayerEntry[] list = todaySchedule.prayers;
        int nextIdx = -1;
        for (int i = 0; i < list.length; i++) {
            if (list[i].epochMs > now) {
                nextIdx = i;
                break;
            }
        }

        NextInfo info = new NextInfo();
        if (nextIdx == -1) {
            recomputeSchedulesIfDayRolled(now);
            list = todaySchedule.prayers;
            info.current = list[list.length - 1];
            info.next = tomorrowSchedule.prayers[0];
        } else if (nextIdx == 0) {
            info.current = yesterdaySchedule.prayers[yesterdaySchedule.prayers.length - 1];
            info.next = list[0];
        } else {
            info.current = list[nextIdx - 1];
            info.next = list[nextIdx];
        }

        long start = info.current.epochMs;
        long end = info.next.epochMs;
        long span = Math.max(1L, end - start);
        info.remainingMs = Math.max(0L, end - now);
        info.progress = Math.max(0f, Math.min(1f, (float) (now - start) / (float) span));
        return info;
    }

    private void recomputeSchedulesIfDayRolled(long now) {
        if (now > tomorrowSchedule.prayers[0].epochMs) {
            recomputeSchedules();
        }
    }

    private void vibrateMs(long ms) {
        try {
            Vibrator vib = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (vib == null || !vib.hasVibrator()) return;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vib.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE));
            } else {
                vib.vibrate(ms);
            }
        } catch (Throwable ignored) {
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        recomputeSchedules();
        if (activeTab == 2) registerCompassSensors();
        ticker = new Runnable() {
            @Override
            public void run() {
                if (dialView != null && activeTab == 0) {
                    dialView.invalidate();
                }
                handler.postDelayed(this, 1000L);
            }
        };
        handler.post(ticker);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (ticker != null) handler.removeCallbacks(ticker);
        unregisterCompassSensors();
    }

    private int dp(int v) {
        return Math.round(v * getResources().getDisplayMetrics().density);
    }

    private class WatchDialView extends View {
        private final Paint trackPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint arcPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint cityPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint subPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint titlePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint timerPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final RectF oval = new RectF();

        public WatchDialView(Context c) {
            super(c);
            trackPaint.setStyle(Paint.Style.STROKE);
            trackPaint.setColor(0xFF13221C);
            trackPaint.setStrokeWidth(dp(5));

            arcPaint.setStyle(Paint.Style.STROKE);
            arcPaint.setColor(0xFF10B981);
            arcPaint.setStrokeWidth(dp(5));
            arcPaint.setStrokeCap(Paint.Cap.ROUND);

            cityPaint.setTextAlign(Paint.Align.CENTER);
            cityPaint.setColor(0xFF9DB0A8);
            cityPaint.setTextSize(dp(11));

            subPaint.setTextAlign(Paint.Align.CENTER);
            subPaint.setColor(0xFF8EA39B);
            subPaint.setTextSize(dp(10));

            titlePaint.setTextAlign(Paint.Align.CENTER);
            titlePaint.setColor(0xFFFFFFFF);
            titlePaint.setTextSize(dp(19));
            titlePaint.setTypeface(Typeface.DEFAULT_BOLD);

            timerPaint.setTextAlign(Paint.Align.CENTER);
            timerPaint.setColor(0xFF34D399);
            timerPaint.setTextSize(dp(25));
            timerPaint.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            int w = getWidth();
            int h = getHeight();
            int size = Math.min(w, h);
            int pad = dp(8);
            float cx = w / 2f;
            float cy = h / 2f;
            float r = (size / 2f) - pad;
            oval.set(cx - r, cy - r, cx + r, cy + r);

            NextInfo info = computeNextInfo();
            canvas.drawArc(oval, 0, 360, false, trackPaint);
            canvas.drawArc(oval, -90, 360f * info.progress, false, arcPaint);

            String clock = WearPrayerCalculator.formatHHMM(
                System.currentTimeMillis(),
                TimeZone.getTimeZone(currentCity.tz)
            );
            String mTag = WearPrayerCalculator.METHOD_FAZILET.equals(methodId) ? "Fazilet · " : "";
            canvas.drawText(currentCity.name + " · " + mTag + clock + " ⚙", cx, cy - r * 0.44f, cityPaint);

            subPaint.setColor(0xFF34D399);
            canvas.drawText("Sıradaki · " + info.next.formattedTime, cx, cy - r * 0.20f, subPaint);

            canvas.drawText(info.next.label, cx, cy + dp(4), titlePaint);

            long secTotal = info.remainingMs / 1000L;
            long hh = secTotal / 3600L;
            long mm = (secTotal % 3600L) / 60L;
            long ss = secTotal % 60L;
            String countdown = String.format(Locale.US, "%02d:%02d:%02d", hh, mm, ss);
            canvas.drawText(countdown, cx, cy + dp(32), timerPaint);

            subPaint.setColor(0xFF8EA39B);
            canvas.drawText(
                "Şu an: " + info.current.label + " (" + info.current.formattedTime + ")",
                cx,
                cy + r * 0.46f,
                subPaint
            );
        }
    }

    private class WatchCompassView extends View {
        private final Paint ringPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint arrowPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint tailPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint dotPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Path needlePath = new Path();

        public WatchCompassView(Context c) {
            super(c);
            ringPaint.setStyle(Paint.Style.STROKE);
            ringPaint.setStrokeWidth(dp(2));

            arrowPaint.setStyle(Paint.Style.FILL);
            tailPaint.setStyle(Paint.Style.FILL);
            tailPaint.setColor(0xFF273D35);
            dotPaint.setStyle(Paint.Style.FILL);
            dotPaint.setColor(0xFFEDF2F0);
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            float cx = getWidth() / 2f;
            float cy = getHeight() / 2f;
            float r = Math.min(cx, cy) - dp(4);

            double qibla = todaySchedule != null ? todaySchedule.qiblaAngle : 151.0;
            double delta = smoothedHeading != null
                ? (((qibla - smoothedHeading + 540.0) % 360.0) - 180.0)
                : qibla;
            boolean aligned = smoothedHeading != null && Math.abs(delta) <= 6.0;

            ringPaint.setColor(aligned ? 0xFF34D399 : 0xFF1E332B);
            canvas.drawCircle(cx, cy, r, ringPaint);

            canvas.save();
            canvas.rotate((float) delta, cx, cy);

            arrowPaint.setColor(aligned ? 0xFF34D399 : 0xFFFBBF24);
            needlePath.reset();
            needlePath.moveTo(cx, cy - r + dp(10));
            needlePath.lineTo(cx - dp(8), cy);
            needlePath.lineTo(cx + dp(8), cy);
            needlePath.close();
            canvas.drawPath(needlePath, arrowPaint);

            needlePath.reset();
            needlePath.moveTo(cx, cy + r - dp(14));
            needlePath.lineTo(cx - dp(6), cy);
            needlePath.lineTo(cx + dp(6), cy);
            needlePath.close();
            canvas.drawPath(needlePath, tailPaint);

            canvas.drawCircle(cx, cy, dp(4), dotPaint);
            canvas.restore();
        }
    }
}
`,
  'utf8'
);

console.log('AndroidManifest.xml, bildirim düzenleri, widgetlar ve WebView-siz native WearWatchActivity başarıyla yapılandırıldı.');

