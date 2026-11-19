import { useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Easing, View } from 'react-native'
import { createStyle } from '@/utils/tools'
import { usePlayerMusicInfo } from '@/store/player/hook'
import { useWindowSize } from '@/utils/hooks'
import { NAV_SHEAR_NATIVE_IDS } from '@/config/constant'
import { useNavigationComponentDidAppear } from '@/navigation'
import { HEADER_HEIGHT } from './components/Header'
import Image from '@/components/common/Image'
import { useStatusbarHeight } from '@/store/common/hook'
import commonState from '@/store/common/state'
import { scaleSizeH, scaleSizeW } from '@/utils/pixelRatio'


export default ({ componentId }: { componentId: string }) => {
  const musicInfo = usePlayerMusicInfo()
  const { width: winWidth, height: winHeight } = useWindowSize()
  const statusBarHeight = useStatusbarHeight()

  const [animated, setAnimated] = useState(!!commonState.componentIds.playDetail)
  const [pic, setPic] = useState(musicInfo.pic)
  const [prevPic, setPrevPic] = useState(musicInfo.pic)
  const fade = useRef(new Animated.Value(1)).current

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

  useNavigationComponentDidAppear(componentId, () => {
    setAnimated(true)
  })
  // console.log('render pic')

  const style = useMemo(() => {
    const availableHeight = winHeight - statusBarHeight - HEADER_HEIGHT - scaleSizeH(232)
    const imgWidth = Math.max(Math.min(winWidth * 0.76, availableHeight), scaleSizeW(140))
    return {
      width: imgWidth,
      height: imgWidth,
      borderRadius: scaleSizeW(12),
    }
  }, [statusBarHeight, winHeight, winWidth])

  return (
    <View style={styles.content}>
      <View style={[styles.picContent, style, { elevation: animated ? 8 : 0 }]}>
        {prevPic && prevPic !== pic ? <Image url={prevPic} style={{ ...style, position: 'absolute' }} /> : null}
        <Animated.View style={[style, { opacity: fade }]}>
          <Image url={pic} nativeID={NAV_SHEAR_NATIVE_IDS.playDetail_pic} style={style} />
        </Animated.View>
      </View>
    </View>
  )
}

const styles = createStyle({
  content: {
    flexGrow: 1,
    flexShrink: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  picContent: {
    backgroundColor: 'rgba(0,0,0,0)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    overflow: 'hidden',
  },
})
