import { memo, useCallback, useState } from 'react'
import { View } from 'react-native'

import AppleProgressBar from '@/components/player/AppleProgressBar'
import Text from '@/components/common/Text'
import Status from './Status'
import { useProgress } from '@/store/player/hook'
import { useTheme } from '@/store/theme/hook'
import { createStyle } from '@/utils/tools'
import { useBufferProgress } from '@/plugins/player'
import { scaleSizeW } from '@/utils/pixelRatio'

/** 把毫秒格式化为 `分:秒` */
const formatPlayTime = (time: number) => {
  if (!Number.isFinite(time) || time < 0) time = 0
  const totalSecond = Math.floor(time / 1000)
  const minute = Math.floor(totalSecond / 60)
  const second = totalSecond % 60
  return `${minute}:${second < 10 ? '0' : ''}${second}`
}

const PlayTime = memo(({ time, prefix = '', align = 'left' }: { time: number, prefix?: string, align?: 'left' | 'right' }) => {
  const theme = useTheme()
  return (
    <Text
      size={11}
      numberOfLines={1}
      color={theme['c-500']}
      style={[styles.playTime, align == 'right' ? styles.playTimeRight : null]}
    >
      {prefix}{formatPlayTime(time)}
    </Text>
  )
})

export default () => {
  const { nowPlayTime, maxPlayTime, progress } = useProgress()
  const buffered = useBufferProgress()
  // 拖动进度条时时间跟随手指，松手后回到真实播放进度
  const [dragProgress, setDragProgress] = useState<number | null>(null)

  const handleDragChange = useCallback((nextProgress: number, dragging: boolean) => {
    setDragProgress(dragging ? nextProgress : null)
  }, [])

  const showTime = dragProgress == null ? nowPlayTime : maxPlayTime * dragProgress
  const remainTime = Math.max(maxPlayTime - showTime, 0)

  return (
    <>
      <AppleProgressBar
        progress={progress}
        buffered={buffered}
        duration={maxPlayTime}
        onDragChange={handleDragChange}
      />
      <View style={styles.info}>
        <PlayTime time={showTime} />
        <View style={styles.status}>
          <Status />
        </View>
        <PlayTime time={remainTime} prefix='-' align='right' />
      </View>
    </>
  )
}

const styles = createStyle({
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    paddingHorizontal: scaleSizeW(2),
  },
  status: {
    flexGrow: 1,
    flexShrink: 1,
    paddingHorizontal: scaleSizeW(12),
  },
  playTime: {
    minWidth: scaleSizeW(34),
    // 避免数字宽度变化导致时间左右跳动
    fontVariant: ['tabular-nums'],
  },
  playTimeRight: {
    textAlign: 'right',
  },
})
