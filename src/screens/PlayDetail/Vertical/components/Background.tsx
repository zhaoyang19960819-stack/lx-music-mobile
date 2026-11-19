import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Easing, Image, StyleSheet, View } from 'react-native'

import { defaultHeaders } from '@/components/common/Image'
import { usePlayerMusicInfo } from '@/store/player/hook'
import { useTheme } from '@/store/theme/hook'
import { useWindowSize } from '@/utils/hooks'

/** 模糊半径，值越大越接近 Apple Music 的虚化效果 */
const BLUR_RADIUS = 32
/** 放大倍数，避免模糊后四周出现暗边 */
const OVERSCAN = 1.3
/** 整体压暗程度，保证文字在上面可读 */
const TINT_OPACITY = 0.55
/** 底部控制区额外压暗，让进度条与按钮更突出 */
const BOTTOM_SCRIM_OPACITY = 0.5

const normalizeUri = (url?: string | null) => {
  if (!url) return null
  // 本地文件路径需要补上 file:// 前缀
  return url.startsWith('/') ? `file://${url}` : url
}

/**
 * 播放详情页背景：当前封面放大模糊 + 主题底色压暗
 * 切歌时新旧封面淡入淡出，避免背景闪白
 */
export default memo(() => {
  const theme = useTheme()
  const musicInfo = usePlayerMusicInfo()
  const { width, height } = useWindowSize()
  const [pic, setPic] = useState<string | null>(musicInfo.pic ?? null)
  const [prevPic, setPrevPic] = useState<string | null>(null)
  const fade = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const nextPic = musicInfo.pic ?? null
    if (nextPic == pic) return
    // 新封面淡入，旧封面垫底
    setPrevPic(pic)
    setPic(nextPic)
    fade.setValue(0)
    Animated.timing(fade, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicInfo.pic])

  const imageStyle = useMemo(() => ({
    position: 'absolute' as const,
    width: width * OVERSCAN,
    height: height * OVERSCAN,
    left: -(width * (OVERSCAN - 1)) / 2,
    top: -(height * (OVERSCAN - 1)) / 2,
  }), [width, height])

  const picUri = normalizeUri(pic)
  const prevPicUri = normalizeUri(prevPic)
  const themeBgImage = theme['bg-image']

  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: theme['c-main-background'] }]}
      pointerEvents='none'
    >
      {picUri
        ? (
          <>
            {prevPicUri
              ? <Image source={{ uri: prevPicUri, headers: defaultHeaders }} style={imageStyle} blurRadius={BLUR_RADIUS} resizeMode='cover' />
              : null}
            <Animated.Image
              source={{ uri: picUri, headers: defaultHeaders }}
              style={[imageStyle, { opacity: fade }]}
              blurRadius={BLUR_RADIUS}
              resizeMode='cover'
            />
          </>
          )
        : themeBgImage
          ? <Image source={themeBgImage} style={{ width, height }} resizeMode='cover' />
          : null}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme['c-main-background'], opacity: TINT_OPACITY }]} />
      <View style={[styles.bottomScrim, { backgroundColor: theme['c-main-background'] }]} />
    </View>
  )
})

const styles = StyleSheet.create({
  bottomScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '42%',
    opacity: BOTTOM_SCRIM_OPACITY,
  },
})
