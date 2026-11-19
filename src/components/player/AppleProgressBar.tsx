import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Easing, PanResponder, StyleSheet, View, type LayoutChangeEvent } from 'react-native'
import { useTheme } from '@/store/theme/hook'
import { scaleSizeH, scaleSizeW } from '@/utils/pixelRatio'

export interface AppleProgressBarProps {
  /** 当前播放进度 0 - 1 */
  progress: number
  /** 已缓冲进度 0 - 1 */
  buffered: number
  /** 歌曲总时长(ms) */
  duration: number
  /** 拖动回调，progress 为 0 - 1，dragging 表示是否正在拖动 */
  onDragChange?: (progress: number, dragging: boolean) => void
  /** 松手后回调，默认跳转到对应进度 */
  onSeek?: (progress: number) => void
}

const BAR_HEIGHT = scaleSizeH(4)
const THUMB_SIZE = scaleSizeW(11)

const clamp = (value: number, min = 0, max = 1) => (value < min ? min : value > max ? max : value)

export default memo(({ progress, buffered, duration, onDragChange, onSeek }: AppleProgressBarProps) => {
  const theme = useTheme()
  const [width, setWidth] = useState(0)

  const animProgress = useRef(new Animated.Value(clamp(progress))).current
  const animBuffered = useRef(new Animated.Value(clamp(buffered))).current
  const thumbScale = useRef(new Animated.Value(0)).current
  const barScaleY = useRef(new Animated.Value(1)).current

  const widthRef = useRef(0)
  const progressRef = useRef(clamp(progress))
  const startProgressRef = useRef(0)
  const draggingRef = useRef(false)
  const durationRef = useRef(duration)
  const onSeekRef = useRef(onSeek)
  const onDragChangeRef = useRef(onDragChange)

  useEffect(() => {
    durationRef.current = duration
  }, [duration])
  useEffect(() => {
    onSeekRef.current = onSeek
  }, [onSeek])
  useEffect(() => {
    onDragChangeRef.current = onDragChange
  }, [onDragChange])

  useEffect(() => {
    const value = clamp(progress)
    progressRef.current = value
    // 拖动时不跟随播放进度
    if (draggingRef.current) return
    Animated.timing(animProgress, {
      toValue: value,
      duration: 260,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start()
  }, [progress, animProgress])

  useEffect(() => {
    Animated.timing(animBuffered, {
      toValue: clamp(buffered),
      duration: 400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start()
  }, [buffered, animBuffered])

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const layoutWidth = event.nativeEvent.layout.width
    widthRef.current = layoutWidth
    setWidth(layoutWidth)
  }, [])

  const updateDragProgress = useCallback((value: number) => {
    const next = clamp(value)
    progressRef.current = next
    animProgress.setValue(next)
    onDragChangeRef.current?.(next, true)
  }, [animProgress])

  const handleDragEnd = useCallback(() => {
    if (!draggingRef.current) return
    draggingRef.current = false
    Animated.parallel([
      Animated.spring(thumbScale, { toValue: 0, speed: 40, bounciness: 0, useNativeDriver: true }),
      Animated.spring(barScaleY, { toValue: 1, speed: 40, bounciness: 0, useNativeDriver: true }),
    ]).start()
    const next = progressRef.current
    onDragChangeRef.current?.(next, false)
    if (onSeekRef.current) {
      onSeekRef.current(next)
    } else {
      global.app_event.setProgress(next * durationRef.current)
    }
  }, [barScaleY, thumbScale])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (event) => {
        draggingRef.current = true
        const w = widthRef.current || 1
        const next = clamp(event.nativeEvent.locationX / w)
        startProgressRef.current = next
        updateDragProgress(next)
        Animated.parallel([
          Animated.spring(thumbScale, { toValue: 1, speed: 30, bounciness: 8, useNativeDriver: true }),
          Animated.spring(barScaleY, { toValue: 1.8, speed: 30, bounciness: 0, useNativeDriver: true }),
        ]).start()
      },
      onPanResponderMove: (event, gestureState) => {
        if (!draggingRef.current) return
        const w = widthRef.current || 1
        updateDragProgress(startProgressRef.current + gestureState.dx / w)
      },
      onPanResponderRelease: handleDragEnd,
      onPanResponderTerminate: handleDragEnd,
    }),
  ).current

  // 以中心缩放 + 位移补偿，使用原生驱动保证拖动/播放时的流畅度
  const fillTransform = [
    { translateX: animProgress.interpolate({ inputRange: [0, 1], outputRange: [-width / 2, 0] }) },
    { scaleX: animProgress },
    { scaleY: barScaleY },
  ]
  const bufferedTransform = [
    { translateX: animBuffered.interpolate({ inputRange: [0, 1], outputRange: [-width / 2, 0] }) },
    { scaleX: animBuffered },
    { scaleY: barScaleY },
  ]

  return (
    <View style={styles.container} onLayout={onLayout} {...panResponder.panHandlers}>
      <View style={styles.barWrap} pointerEvents="none">
        <Animated.View style={[styles.track, { backgroundColor: theme['c-primary-alpha-800'], transform: [{ scaleY: barScaleY }] }]} />
        <Animated.View style={[styles.bar, { backgroundColor: theme['c-primary-alpha-600'], transform: bufferedTransform }]} />
        <Animated.View style={[styles.bar, { backgroundColor: theme['c-font'], transform: fillTransform }]} />
        <Animated.View
          style={[styles.thumb, {
            backgroundColor: theme['c-font'],
            opacity: thumbScale,
            transform: [
              { translateX: animProgress.interpolate({ inputRange: [0, 1], outputRange: [0, width] }) },
              { scale: thumbScale },
            ],
          }]}
        />
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 12,
    justifyContent: 'center',
  },
  barWrap: {
    width: '100%',
    height: BAR_HEIGHT,
  },
  track: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BAR_HEIGHT / 2,
  },
  bar: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BAR_HEIGHT / 2,
  },
  thumb: {
    position: 'absolute',
    left: 0,
    top: (BAR_HEIGHT - THUMB_SIZE) / 2,
    marginLeft: -THUMB_SIZE / 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
  },
})
