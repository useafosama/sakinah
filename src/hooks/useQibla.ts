import { useState, useEffect, useCallback, useRef } from 'react';
import { UserPrayerLocation, QiblaDirectionInfo, CompassOrientationState } from '../types/prayer';
import { fetchQiblaDirection, getShortestAngleDelta } from '../services/qiblaService';

interface UseQiblaOptions {
  location: UserPrayerLocation;
}

export function useQibla({ location }: UseQiblaOptions) {
  const [qiblaInfo, setQiblaInfo] = useState<QiblaDirectionInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Orientation state
  const [rawHeading, setRawHeading] = useState<number | null>(null);
  const [smoothedHeading, setSmoothedHeading] = useState<number | null>(null);
  const [permissionState, setPermissionState] = useState<'granted' | 'prompt' | 'denied' | 'unsupported'>('prompt');
  const [hasSensors, setHasSensors] = useState<boolean>(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);

  const targetHeadingRef = useRef<number | null>(null);
  const currentHeadingRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastVibrationTimeRef = useRef<number>(0);
  const wasAlignedRef = useRef<boolean>(false);

  // Fetch Qibla bearing when location changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchQiblaDirection(location.lat, location.lng)
      .then((info) => {
        if (isMounted) {
          setQiblaInfo(info);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'تعذر جلب اتجاه القبلة');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [location.lat, location.lng]);

  // Check initial permission & sensor availability
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isIOS =
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function';

    if (isIOS) {
      setPermissionState('prompt');
    } else if (typeof window.DeviceOrientationEvent !== 'undefined') {
      // Modern Android / Desktop browsers
      setPermissionState('granted');
    } else {
      setPermissionState('unsupported');
    }
  }, []);

  // Smooth animation loop using lerp & shortest angle delta
  useEffect(() => {
    const animate = () => {
      if (targetHeadingRef.current !== null) {
        if (currentHeadingRef.current === null) {
          currentHeadingRef.current = targetHeadingRef.current;
        } else {
          const delta = getShortestAngleDelta(currentHeadingRef.current, targetHeadingRef.current);
          // Lerp interpolation (0.15 for snappy yet buttery smooth feel)
          currentHeadingRef.current = (currentHeadingRef.current + delta * 0.15 + 360) % 360;
        }
        setSmoothedHeading(currentHeadingRef.current);
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Device orientation event listener
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    setHasSensors(true);

    let heading: number | null = null;

    // 1. iOS Safari native webkitCompassHeading (0 = True North, clockwise)
    if ('webkitCompassHeading' in event && typeof (event as { webkitCompassHeading: number }).webkitCompassHeading === 'number') {
      const compassHeading = (event as { webkitCompassHeading: number; webkitCompassAccuracy?: number }).webkitCompassHeading;
      if (!isNaN(compassHeading) && compassHeading >= 0) {
        heading = compassHeading;
      }
      if (typeof (event as { webkitCompassAccuracy?: number }).webkitCompassAccuracy === 'number') {
        setAccuracy((event as { webkitCompassAccuracy?: number }).webkitCompassAccuracy || null);
      }
    }
    // 2. Android / standard absolute device orientation
    else if (event.alpha !== null && !isNaN(event.alpha)) {
      // Check absolute heading
      const alpha = event.alpha;
      const screenAngle = typeof window.screen?.orientation?.angle === 'number' ? window.screen.orientation.angle : 0;
      heading = (360 - alpha + screenAngle + 360) % 360;
    }

    if (heading !== null) {
      setRawHeading(heading);
      targetHeadingRef.current = heading;
    }
  }, []);

  // Start listening to orientation events when permission is granted
  useEffect(() => {
    if (permissionState !== 'granted') return;

    let attached = false;

    // Try absolute orientation first (better precision on Android)
    const onAbsolute = (e: Event) => handleOrientation(e as DeviceOrientationEvent);
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', onAbsolute, true);
      attached = true;
    }

    // Fallback standard deviceorientation
    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      if (attached) {
        window.removeEventListener('deviceorientationabsolute', onAbsolute, true);
      }
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [permissionState, handleOrientation]);

  // Request sensor permission (required for iOS 13+)
  const requestPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    const maybeIOSDeviceOrientation = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
    };

    if (typeof maybeIOSDeviceOrientation.requestPermission === 'function') {
      try {
        const response = await maybeIOSDeviceOrientation.requestPermission();
        if (response === 'granted') {
          setPermissionState('granted');
          return true;
        } else {
          setPermissionState('denied');
          return false;
        }
      } catch (err) {
        console.error('Permission request failed:', err);
        setPermissionState('denied');
        return false;
      }
    } else {
      setPermissionState('granted');
      return true;
    }
  };

  // Compute alignment & relative direction
  const qiblaAngle = qiblaInfo?.qiblaAngle ?? 0;
  const currentHeading = smoothedHeading ?? rawHeading;

  // relative angle: how much to rotate the needle on screen so it points towards Kaaba
  // if device points True North (0°), needle should point qiblaAngle
  // if device turns to qiblaAngle, needle points straight up (0° relative)
  const relativeAngle = currentHeading !== null ? (qiblaAngle - currentHeading + 360) % 360 : qiblaAngle;

  const diffDegrees = currentHeading !== null ? Math.abs(getShortestAngleDelta(currentHeading, qiblaAngle)) : 0;

  const isAligned = currentHeading !== null && diffDegrees <= 3;
  const isClose = currentHeading !== null && diffDegrees > 3 && diffDegrees <= 12;

  let turnDirection: 'left' | 'right' | 'aligned' = 'aligned';
  if (currentHeading !== null) {
    const delta = getShortestAngleDelta(currentHeading, qiblaAngle);
    if (Math.abs(delta) <= 3) {
      turnDirection = 'aligned';
    } else if (delta > 0) {
      turnDirection = 'right';
    } else {
      turnDirection = 'left';
    }
  }

  // Trigger gentle haptic vibration when entering aligned state
  useEffect(() => {
    if (isAligned && !wasAlignedRef.current) {
      const now = Date.now();
      if (now - lastVibrationTimeRef.current > 1500) {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([40, 60, 40]);
          } catch {
            // ignore
          }
        }
        lastVibrationTimeRef.current = now;
      }
    }
    wasAlignedRef.current = isAligned;
  }, [isAligned]);

  const orientationState: CompassOrientationState = {
    deviceHeading: currentHeading,
    smoothedHeading,
    qiblaAngle,
    relativeAngle,
    accuracy,
    hasSensors: hasSensors && currentHeading !== null,
    permissionState,
    isAligned,
    isClose,
    turnDirection,
    diffDegrees: Math.round(diffDegrees * 10) / 10,
  };

  return {
    qiblaInfo,
    loading,
    error,
    orientation: orientationState,
    requestPermission,
    isCalibrating,
    setIsCalibrating,
  };
}
