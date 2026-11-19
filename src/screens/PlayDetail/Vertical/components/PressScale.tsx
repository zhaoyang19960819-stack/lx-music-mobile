import { memo, useCallback, useMemo, useRef, type ReactNode } from 'react'
import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native'

interface PressScaleProps {
  children: ReactNode
  onPress?: () => void
  onLongPress?: () => void
  style?: StyleProp<ViewStyle>
  contentStyle?: StyleProp<ViewStyle>
  /** 按下时缩放到的比例 */
  activeScale?: number
  hitSlop?: number
}

/**
 * 通用按压反馈：按下轻微缩小，松开弹簧回弹
 */
export default memo(({ children, onPress, onLongPress, style, contentStyle, activeScale = 0.88, hitSlop = 8 }: PressScaleProps) => {
  const scale = useRef(new Animated.Value(1)).current

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: activeScale,
      speed: 40,
      bounciness: 0,
      useNativeDriver: true,
    }).start()
  }, [activeScale, scale])

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      speed: 24,
      bounciness: 10,
      useNativeDriver: true,
    }).start()
  }, [scale])

  const animatedStyle = useMemo(() => [contentStyle, { transform: [{ scale }] }], [contentStyle, scale])

  return (
    <Pressable
      style={style}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={hitSlop}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  )
})
