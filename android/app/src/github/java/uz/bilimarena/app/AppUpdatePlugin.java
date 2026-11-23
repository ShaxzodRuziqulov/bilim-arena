package uz.bilimarena.app;

import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.content.FileProvider;
import androidx.core.content.pm.PackageInfoCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;

import javax.net.ssl.HttpsURLConnection;

@CapacitorPlugin(name = "BilimUpdate")
public class AppUpdatePlugin extends Plugin {
    private static final String REPO = "ShaxzodRuziqulov/bilim-arena";
    private static final String APK = "Bilim-Arena.apk";
    private static final int MAX_APK_BYTES = 64 * 1024 * 1024;
    private static final Set<String> DOWNLOAD_HOSTS = new HashSet<>(Arrays.asList(
        "github.com", "release-assets.githubusercontent.com", "objects.githubusercontent.com"
    ));
    private final AtomicBoolean busy = new AtomicBoolean();

    @PluginMethod
    public void info(PluginCall call) {
        JSObject info = new JSObject();
        info.put("version", BuildConfig.VERSION_NAME);
        info.put("enabled", true);
        call.resolve(info);
    }

    @PluginMethod
    public void check(PluginCall call) {
        runNetwork(call, () -> call.resolve(latest()));
    }

    @PluginMethod
    public void prepare(PluginCall call) {
        String requested = call.getString("version", "");
        if (codeOf(requested) <= BuildConfig.VERSION_CODE) {
            call.reject("Yangilanish versiyasi yaroqsiz.");
            return;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !getContext().getPackageManager().canRequestPackageInstalls()) {
            Intent settings = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                Uri.parse("package:" + getContext().getPackageName()));
            launch(call, settings, "permission");
            return;
        }
        runNetwork(call, () -> {
            JSObject release = latest();
            if (!requested.equals(release.optString("available"))) {
                throw new IOException("Reliz o‘zgardi. Yangilanishni qayta tekshiring.");
            }
            File directory = new File(getContext().getCacheDir(), "app-update");
            if (!directory.isDirectory() && !directory.mkdirs()) throw new IOException("Yuklash papkasi ochilmadi.");
            File file = new File(directory, APK);
            try {
                download(requested, release.optLong("size"), file);
                verify(file, requested);
            } catch (Exception error) {
                file.delete();
                throw error;
            }
            resolveStatus(call, "prepared");
        });
    }

    @PluginMethod
    public void install(PluginCall call) {
        String requested = call.getString("version", "");
        runNetwork(call, () -> {
            File file = new File(new File(getContext().getCacheDir(), "app-update"), APK);
            verify(file, requested);
            Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", file);
            Intent installer = new Intent(Intent.ACTION_VIEW)
                .setDataAndType(uri, "application/vnd.android.package-archive")
                .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            launch(call, installer, "installer");
        });
    }

    private JSObject latest() throws Exception {
        HttpsURLConnection conn = connect(new URL("https://api.github.com/repos/" + REPO + "/releases/latest"));
        try {
            conn.setRequestProperty("Accept", "application/vnd.github+json");
            if (conn.getResponseCode() != 200) throw new IOException("GitHub bilan bog‘lanib bo‘lmadi. Keyinroq qayta urinib ko‘ring.");
            JSONObject release;
            try (InputStream input = conn.getInputStream(); ByteArrayOutputStream json = new ByteArrayOutputStream()) {
                copy(input, json, 1024 * 1024);
                release = new JSONObject(new String(json.toByteArray(), StandardCharsets.UTF_8));
            }
            String tag = release.optString("tag_name");
            String version = tag.startsWith("v") ? tag.substring(1) : "";
            int code = codeOf(version);
            if (code < 0 || release.optBoolean("draft") || release.optBoolean("prerelease")) {
                throw new IOException("GitHub relizi formati mos kelmadi.");
            }
            JSObject result = new JSObject();
            if (code <= BuildConfig.VERSION_CODE) return result;
            JSONArray assets = release.getJSONArray("assets");
            for (int i = 0; i < assets.length(); i++) {
                JSONObject asset = assets.getJSONObject(i);
                long size = asset.optLong("size");
                if (APK.equals(asset.optString("name")) && size > 0 && size <= MAX_APK_BYTES) {
                    result.put("available", version);
                    result.put("size", size);
                    return result;
                }
            }
            throw new IOException("Yangi relizda Android fayli topilmadi.");
        } finally {
            conn.disconnect();
        }
    }

    private void download(String version, long expectedSize, File target) throws Exception {
        URL url = new URL("https://github.com/" + REPO + "/releases/download/v" + version + "/" + APK);
        for (int redirects = 0; redirects < 5; redirects++) {
            if (!"https".equals(url.getProtocol()) || !DOWNLOAD_HOSTS.contains(url.getHost())
                || (url.getPort() != -1 && url.getPort() != 443)) {
                throw new IOException("GitHub yuklash manzili yaroqsiz.");
            }
            HttpsURLConnection conn = connect(url);
            try {
                int status = conn.getResponseCode();
                if (status >= 300 && status < 400) {
                    String location = conn.getHeaderField("Location");
                    if (location == null) break;
                    url = new URL(url, location);
                    continue;
                }
                if (status != 200) throw new IOException("APK yuklanmadi. Keyinroq qayta urinib ko‘ring.");
                try (InputStream input = conn.getInputStream(); FileOutputStream output = new FileOutputStream(target)) {
                    if (copy(input, output, expectedSize) != expectedSize) throw new IOException("APK to‘liq yuklanmadi.");
                }
                return;
            } finally {
                conn.disconnect();
            }
        }
        throw new IOException("GitHub yuklash manzili topilmadi.");
    }

    private void verify(File file, String version) throws Exception {
        PackageManager manager = getContext().getPackageManager();
        int flags = Build.VERSION.SDK_INT >= 28 ? PackageManager.GET_SIGNING_CERTIFICATES : PackageManager.GET_SIGNATURES;
        PackageInfo current = manager.getPackageInfo(getContext().getPackageName(), flags);
        PackageInfo candidate = manager.getPackageArchiveInfo(file.getAbsolutePath(), flags);
        if (candidate == null || !current.packageName.equals(candidate.packageName)
            || !version.equals(candidate.versionName) || PackageInfoCompat.getLongVersionCode(candidate) != codeOf(version)
            || PackageInfoCompat.getLongVersionCode(candidate) <= PackageInfoCompat.getLongVersionCode(current)
            || signers(current).isEmpty() || !signers(current).equals(signers(candidate))) {
            throw new IOException("APK versiyasi yoki imzosi o‘rnatilgan ilovaga mos kelmadi.");
        }
    }

    private static Set<Signature> signers(PackageInfo info) {
        Signature[] signatures = Build.VERSION.SDK_INT >= 28
            ? (info.signingInfo == null ? null : info.signingInfo.getApkContentsSigners()) : info.signatures;
        return signatures == null ? new HashSet<>() : new HashSet<>(Arrays.asList(signatures));
    }

    private static int codeOf(String version) {
        if (!version.matches("(0|[1-9][0-9]{0,3})\\.(0|[1-9][0-9]{0,2})\\.(0|[1-9][0-9]?)")) return -1;
        String[] parts = version.split("\\.");
        return Integer.parseInt(parts[0]) * 100000 + Integer.parseInt(parts[1]) * 100 + Integer.parseInt(parts[2]);
    }

    private static HttpsURLConnection connect(URL url) throws IOException {
        HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
        conn.setInstanceFollowRedirects(false);
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(15000);
        conn.setRequestProperty("User-Agent", "Bilim-Arena-Android");
        return conn;
    }

    private static long copy(InputStream input, java.io.OutputStream output, long limit) throws IOException {
        byte[] buffer = new byte[8192];
        long total = 0;
        int read;
        while ((read = input.read(buffer)) != -1) {
            total += read;
            if (total > limit) throw new IOException("Yuklangan fayl kutilganidan katta.");
            output.write(buffer, 0, read);
        }
        return total;
    }

    private void launch(PluginCall call, Intent intent, String status) {
        getActivity().runOnUiThread(() -> {
            try {
                getActivity().startActivity(intent);
                resolveStatus(call, status);
            } catch (Exception error) {
                call.reject("Android oynasini ochib bo‘lmadi.");
            }
        });
    }

    private static void resolveStatus(PluginCall call, String status) {
        JSObject result = new JSObject();
        result.put("status", status);
        call.resolve(result);
    }

    private interface NetworkAction { void run() throws Exception; }

    private void runNetwork(PluginCall call, NetworkAction action) {
        if (!busy.compareAndSet(false, true)) {
            call.reject("Yangilanish tekshiruvi hozir bajarilmoqda.");
            return;
        }
        new Thread(() -> {
            try {
                action.run();
            } catch (IOException error) {
                call.reject(error.getMessage());
            } catch (Exception error) {
                call.reject("Yangilanishni tayyorlab bo‘lmadi.");
            } finally {
                busy.set(false);
            }
        }, "bilim-update").start();
    }
}
