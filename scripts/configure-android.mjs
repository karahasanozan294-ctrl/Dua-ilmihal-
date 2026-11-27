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

        Intent launchIntent = new Intent(context, MainActivity.class);
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

        Intent launchIntent = new Intent(context, MainActivity.class);
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

        Intent launchIntent = new Intent(context, MainActivity.class);
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

        Intent launchIntent = new Intent(context, MainActivity.class);
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

console.log('AndroidManifest.xml, bildirim düzenleri, ana ekran widgetları ve native MihrabNotificationPlugin başarıyla yapılandırıldı.');
