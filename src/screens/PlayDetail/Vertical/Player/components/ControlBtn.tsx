import { memo } from 'react'
import { View, type StyleProp, type ViewStyle } from 'react-native'

import { Icon } from '@/components/common/Icon'
import { useTheme } from '@/store/theme/hook'
import { playNext } from '@/core/player/player'
import { playPrev } from '@/core/player/player'
import { togglePlay } from '@/core/player/player'
import { useIsPlay } from '@/store/player/hook'
import { createStyle } from '@/utils/tools'
import { scaleSizeH, scaleSizeW } from '@/utils/pixelRatio'
import PressScale from '../../components/PressScale'

interface BtnProps {
  icon: string
  size: number
  color: string
  activeScale?: number
  style?: StyleProp<ViewStyle>
  onPress: () => void
}

const Btn = memo(({ icon, size, color, activeScale = 0.86, style, onPress }: BtnProps) => {
  return (
    <PressScale style={style} onPress={onPress} activeScale={activeScale} hitSlop={16}>
      <Icon name={icon} color={color} size={size} />
    </PressScale>
  )
})

export default memo(() => {
  const theme = useTheme()
  const isPlay = useIsPlay()

  const handlePlayPrev = () => {
    void playPrev()
  }
  const handlePlayNext = () => {
    void playNext()
  }

  return (
    <View style={styles.container}>
      <Btn icon='prevMusic' size={24} color={theme['c-button-font']} onPress={handlePlayPrev} />
      <Btn
        icon={isPlay ? 'pause' : 'play'}
        size={32}
        color={theme['c-button-font']}
        activeScale={0.9}
        style={styles.playBtn}
        onPress={togglePlay}
      />
      <Btn icon='nextMusic' size={24} color={theme['c-button-font']} onPress={handlePlayNext} />
    </View>
  )
})

const styles = createStyle({
  container: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scaleSizeH(14),
  },
  playBtn: {
    marginHorizontal: scaleSizeW(40),
  },
})
