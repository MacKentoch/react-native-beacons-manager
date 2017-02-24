package com.mackentoch.beaconsandroid;

import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.RemoteException;
import android.support.annotation.Nullable;
import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.altbeacon.beacon.Beacon;
import org.altbeacon.beacon.BeaconConsumer;
import org.altbeacon.beacon.BeaconManager;
import org.altbeacon.beacon.BeaconParser;
import org.altbeacon.beacon.BeaconTransmitter;
import org.altbeacon.beacon.Identifier;
import org.altbeacon.beacon.MonitorNotifier;
import org.altbeacon.beacon.RangeNotifier;
import org.altbeacon.beacon.Region;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

public class BeaconsAndroidModule extends ReactContextBaseJavaModule implements BeaconConsumer {
    private static final String LOG_TAG = "BeaconsAndroidModule";
    private ReactApplicationContext mReactContext;
    private Context mApplicationContext;
    private BeaconManager mBeaconManager;

    public BeaconsAndroidModule(ReactApplicationContext reactContext) {
        super(reactContext);
        Log.d(LOG_TAG, "BeaconsAndroidModule - started");
        this.mReactContext = reactContext;
        this.mApplicationContext = reactContext.getApplicationContext();
        this.mBeaconManager = BeaconManager.getInstanceForApplication(mApplicationContext);
        // Detect iBeacons ( http://stackoverflow.com/questions/25027983/is-this-the-correct-layout-to-detect-ibeacons-with-altbeacons-android-beacon-li )
        addParser("m:0-3=4c000215,i:4-19,i:20-21,i:22-23,p:24-24");
        mBeaconManager.bind(this);
    }

    @Override
    public String getName() {
        return LOG_TAG;
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("SUPPORTED", BeaconTransmitter.SUPPORTED);
        constants.put("NOT_SUPPORTED_MIN_SDK", BeaconTransmitter.NOT_SUPPORTED_MIN_SDK);
        constants.put("NOT_SUPPORTED_BLE", BeaconTransmitter.NOT_SUPPORTED_BLE);
        constants.put("NOT_SUPPORTED_CANNOT_GET_ADVERTISER_MULTIPLE_ADVERTISEMENTS", BeaconTransmitter.NOT_SUPPORTED_CANNOT_GET_ADVERTISER_MULTIPLE_ADVERTISEMENTS);
        constants.put("NOT_SUPPORTED_CANNOT_GET_ADVERTISER", BeaconTransmitter.NOT_SUPPORTED_CANNOT_GET_ADVERTISER);
        return constants;
    }

    @ReactMethod
    public void setHardwareEqualityEnforced(Boolean e) {
      Beacon.setHardwareEqualityEnforced(e.booleanValue());
    }

    @ReactMethod
    public void addParser(String parser) {
        mBeaconManager.getBeaconParsers().add(new BeaconParser().setBeaconLayout(parser));
    }

    @ReactMethod
    public void removeParser(String parser) {
        mBeaconManager.getBeaconParsers().remove(new BeaconParser().setBeaconLayout(parser));
    }

    @ReactMethod
    public void setBackgroundScanPeriod(int period) {
        mBeaconManager.setBackgroundScanPeriod((long) period);
    }

    @ReactMethod
    public void setBackgroundBetweenScanPeriod(int period) {
        mBeaconManager.setBackgroundBetweenScanPeriod((long) period);
    }

    @ReactMethod
    public void setForegroundScanPeriod(int period) {
        mBeaconManager.setForegroundScanPeriod((long) period);
    }

    @ReactMethod
    public void setForegroundBetweenScanPeriod(int period) {
        mBeaconManager.setForegroundBetweenScanPeriod((long) period);
    }

    @ReactMethod
    public void checkTransmissionSupported(Callback callback) {
        int result = BeaconTransmitter.checkTransmissionSupported(mReactContext);
        callback.invoke(result);
    }

    @ReactMethod
    public void getMonitoredRegions(Callback callback) {
        WritableArray array = new WritableNativeArray();
        for (Region region: mBeaconManager.getMonitoredRegions()) {
            WritableMap map = new WritableNativeMap();
            map.putString("identifier", region.getUniqueId());
            map.putString("uuid", region.getId1().toString());
            map.putInt("major", region.getId2() != null ? region.getId2().toInt() : 0);
            map.putInt("minor", region.getId3() != null ? region.getId3().toInt() : 0);
            array.pushMap(map);
        }
        callback.invoke(array);
    }

    @ReactMethod
    public void getRangedRegions(Callback callback) {
        WritableArray array = new WritableNativeArray();
        for (Region region: mBeaconManager.getRangedRegions()) {
            WritableMap map = new WritableNativeMap();
            map.putString("region", region.getUniqueId());
            map.putString("uuid", region.getId1().toString());
            array.pushMap(map);
        }
        callback.invoke(array);
    }

    /***********************************************************************************************
     * BeaconConsumer
     **********************************************************************************************/
    @Override
    public void onBeaconServiceConnect() {
        Log.v(LOG_TAG, "onBeaconServiceConnect");

        // deprecated since v2.9 (see github: https://github.com/AltBeacon/android-beacon-library/releases/tag/2.9)
        // mBeaconManager.setMonitorNotifier(mMonitorNotifier);
        // mBeaconManager.setRangeNotifier(mRangeNotifier);

        mBeaconManager.addMonitorNotifier(mMonitorNotifier);
        mBeaconManager.addRangeNotifier(mRangeNotifier);
    }

    @Override
    public Context getApplicationContext() {
        return mApplicationContext;
    }

    @Override
    public void unbindService(ServiceConnection serviceConnection) {
        mApplicationContext.unbindService(serviceConnection);
    }

    @Override
    public boolean bindService(Intent intent, ServiceConnection serviceConnection, int i) {
        return mApplicationContext.bindService(intent, serviceConnection, i);
    }

    /***********************************************************************************************
     * Monitoring
     **********************************************************************************************/
    @ReactMethod
    public void startMonitoring(String regionId, String beaconUuid, int minor, int major, Callback resolve, Callback reject) {
        Log.d(LOG_TAG, "startMonitoring, monitoringRegionId: " + regionId + ", monitoringBeaconUuid: " + beaconUuid + ", minor: " + minor + ", major: " + major);
        try {
            Region region = createRegion(regionId, beaconUuid, minor, major);
            mBeaconManager.startMonitoringBeaconsInRegion(region);
            resolve.invoke();
        } catch (Exception e) {
            Log.e(LOG_TAG, "startMonitoring, error: ", e);
            reject.invoke(e.getMessage());
        }
    }

    private MonitorNotifier mMonitorNotifier = new MonitorNotifier() {
        @Override
        public void didEnterRegion(Region region) {
            sendEvent(mReactContext, "regionDidEnter", createMonitoringResponse(region));
        }

        @Override
        public void didExitRegion(Region region) {
            sendEvent(mReactContext, "regionDidExit", createMonitoringResponse(region));
        }

        @Override
        public void didDetermineStateForRegion(int i, Region region) {

        }
    };

    private WritableMap createMonitoringResponse(Region region) {
        WritableMap map = new WritableNativeMap();
        map.putString("identifier", region.getUniqueId());
        map.putString("uuid", region.getId1().toString());
        map.putInt("major", region.getId2() != null ? region.getId2().toInt() : 0);
        map.putInt("minor", region.getId3() != null ? region.getId3().toInt() : 0);
        return map;
    }

    @ReactMethod
    public void stopMonitoring(String regionId, String beaconUuid, int minor, int major, Callback resolve, Callback reject) {
        Region region = createRegion(regionId, beaconUuid, minor, major);
        try {
            mBeaconManager.stopMonitoringBeaconsInRegion(region);
            resolve.invoke();
        } catch (Exception e) {
            Log.e(LOG_TAG, "stopMonitoring, error: ", e);
            reject.invoke(e.getMessage());
        }
    }

    /***********************************************************************************************
     * Ranging
     **********************************************************************************************/
    @ReactMethod
    public void startRanging(String regionId, String beaconUuid, Callback resolve, Callback reject) {
        Log.d(LOG_TAG, "startRanging, rangingRegionId: " + regionId + ", rangingBeaconUuid: " + beaconUuid);
        try {
            Region region = createRegion(regionId, beaconUuid);
            mBeaconManager.startRangingBeaconsInRegion(region);
            resolve.invoke();
        } catch (Exception e) {
            Log.e(LOG_TAG, "startRanging, error: ", e);
            reject.invoke(e.getMessage());
        }
    }

    private RangeNotifier mRangeNotifier = new RangeNotifier() {
        @Override
        public void didRangeBeaconsInRegion(Collection<Beacon> beacons, Region region) {
            Log.d(LOG_TAG, "rangingConsumer didRangeBeaconsInRegion, beacons: " + beacons.toString());
            Log.d(LOG_TAG, "rangingConsumer didRangeBeaconsInRegion, region: " + region.toString());
            sendEvent(mReactContext, "beaconsDidRange", createRangingResponse(beacons, region));
        }
    };

    private WritableMap createRangingResponse(Collection<Beacon> beacons, Region region) {
        WritableMap map = new WritableNativeMap();
        map.putString("identifier", region.getUniqueId());
        map.putString("uuid", region.getId1() != null ? region.getId1().toString() : "");
        WritableArray a = new WritableNativeArray();
        for (Beacon beacon : beacons) {
            WritableMap b = new WritableNativeMap();
            b.putString("uuid", beacon.getId1().toString());
            b.putInt("major", beacon.getId2().toInt());
            b.putInt("minor", beacon.getId3().toInt());
            b.putInt("rssi", beacon.getRssi());
            b.putDouble("distance", beacon.getDistance());
            b.putString("proximity", getProximity(beacon.getDistance()));
            a.pushMap(b);
        }
        map.putArray("beacons", a);
        return map;
    }

    private String getProximity(double distance) {
        if (distance == -1.0) {
            return "unknown";
        } else if (distance < 1) {
            return "immediate";
        } else if (distance < 3) {
            return "near";
        } else {
            return "far";
        }
    }

    @ReactMethod
    public void stopRanging(String regionId, String beaconUuid, Callback resolve, Callback reject) {
        Region region = createRegion(regionId, beaconUuid);
        try {
            mBeaconManager.stopRangingBeaconsInRegion(region);
            resolve.invoke();
        } catch (Exception e) {
            Log.e(LOG_TAG, "stopRanging, error: ", e);
            reject.invoke(e.getMessage());
        }
    }


    /***********************************************************************************************
     * Utils
     **********************************************************************************************/
    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    private Region createRegion(String regionId, String beaconUuid) {
        Identifier id1 = (beaconUuid == null) ? null : Identifier.parse(beaconUuid);
        return new Region(regionId, id1, null, null);
    }

    private Region createRegion(String regionId, String beaconUuid, int minor, int major) {
        Identifier id1 = (beaconUuid == null) ? null : Identifier.parse(beaconUuid);
        return new Region(regionId, id1, Identifier.fromInt(major), Identifier.fromInt(minor));
    }
}
