import { useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Easing, View } from 'react-native'

import { createStyle } from '@/utils/tools'
import { useIsPlay, usePlayerMusicInfo } from '@/store/player/hook'
import { useWindowSize } from '@/utils/hooks'
import { NAV_SHEAR_NATIVE_IDS } from '@/config/constant'
import { useNavigationComponentDidAppear } from '@/navigation'
import { HEADER_HEIGHT } from './components/Header'
import Image from '@/components/common/Image'
import PressScale from './components/PressScale'
import { useStatusbarHeight } from '@/store/common/hook'
import commonState from '@/store/common/state'
import { scaleSizeH, scaleSizeW } from '@/utils/pixelRatio'

/** 播放控制区大致占用的高度（歌曲信息 + 进度条 + 时间行 + 按钮 + 指示点） */
const PLAYER_HEIGHT = 240
/** 暂停时封面缩放到的比例 */
const PAUSED_SCALE = 0.92

export default ({ componentId, onPress }: { componentId: string, onPress?: () => void }) => {
  const musicInfo = usePlayerMusicInfo()
  const isPlay = useIsPlay()
  const { width: winWidth, height: winHeight } = useWindowSize()
  const statusBarHeight = useStatusbarHeight()
  const [animated, setAnimated] = useState(!!commonState.componentIds.playDetail)
  const [pic, setPic] = useState(musicInfo.pic)
  const [prevPic, setPrevPic] = useState(musicInfo.pic)
  const fade = useRef(new Animated.Value(1)).current
  const scale = useRef(new Animated.Value(isPlay ? 1 : PAUSED_SCALE)).current

  useEffect(() => {
    if (pic === musicInfo.pic) return
    if (!animated) {
      setPic(musicInfo.pic)
      setPrevPic(musicInfo.pic)
      return
    }
    // 切歌时新封面淡入、旧封面垫底，避免闪白
    setPrevPic(pic)
    setPic(musicInfo.pic)
    fade.setValue(0)
    Animated.timing(fade, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicInfo.pic, animated])

  // 暂停时封面轻微缩小、播放时回弹
  useEffect(() => {
    Animated.spring(scale, {
      toValue: isPlay ? 1 : PAUSED_SCALE,
      speed: 14,
      bounciness: 6,
      useNativeDriver: true,
    }).start()
  }, [isPlay, scale])

  useNavigationComponentDidAppear(componentId, () => {
    setAnimated(true)
  })
  // console.log('render pic')

  const style = useMemo(() => {
    const availableHeight = winHeight - statusBarHeight - HEADER_HEIGHT - scaleSizeH(PLAYER_HEIGHT)
    const imgWidth = Math.max(Math.min(winWidth - scaleSizeW(56), availableHeight), scaleSizeW(140))
    return {
      width: imgWidth,
      height: imgWidth,
      borderRadius: scaleSizeW(10),
    }
  }, [statusBarHeight, winHeight, winWidth])

  return (
    <View style={styles.content}>
      <Animated.View
        style={[styles.picShadow, style, {
          elevation: animated ? 10 : 0,
          transform: [{ scale }],
        }]}
      >
        <PressScale
          onPress={onPress}
          activeScale={0.97}
          hitSlop={4}
          style={[styles.picContent, style]}
          contentStyle={styles.picInner}
        >
          {prevPic && prevPic !== pic ? <Image url={prevPic} style={[styles.picInner, styles.prevPic]} /> : null}
          <Animated.View style={[styles.picInner, { opacity: fade }]}>
            <Image url={pic} nativeID={NAV_SHEAR_NATIVE_IDS.playDetail_pic} style={styles.picInner} />
          </Animated.View>
        </PressScale>
      </Animated.View>
    </View>
  )
}

const styles = createStyle({
  content: {
    flexGrow: 1,
    flexShrink: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleSizeW(28),
  },
  picShadow: {
    backgroundColor: 'rgba(0,0,0,0)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 26,
  },
  picContent: {
    overflow: 'hidden',
  },
  picInner: {
    width: '100%',
    height: '100%',
  },
  prevPic: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
})

