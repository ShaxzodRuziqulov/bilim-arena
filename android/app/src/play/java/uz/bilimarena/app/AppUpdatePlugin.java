package uz.bilimarena.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "BilimUpdate")
public class AppUpdatePlugin extends Plugin {
    @PluginMethod
    public void info(PluginCall call) {
        JSObject info = new JSObject();
        info.put("version", BuildConfig.VERSION_NAME);
        info.put("enabled", false);
        call.resolve(info);
    }
}
