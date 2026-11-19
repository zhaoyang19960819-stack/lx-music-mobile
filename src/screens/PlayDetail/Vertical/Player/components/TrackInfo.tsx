import { memo } from 'react'
import { View } from 'react-native'

import Text from '@/components/common/Text'
import { usePlayerMusicInfo } from '@/store/player/hook'
import { useTheme } from '@/store/theme/hook'
import { createStyle } from '@/utils/tools'
import { scaleSizeH, scaleSizeW } from '@/utils/pixelRatio'

/** 进度条上方的歌曲信息，排版参考 Apple Music */
export default memo(() => {
  const musicInfo = usePlayerMusicInfo()
  const theme = useTheme()

  return (
    <View style={styles.container}>
      <Text
        size={19}
        numberOfLines={1}
        color={theme['c-font']}
        style={styles.name}
      >
        {musicInfo.name || '-'}
      </Text>
      <Text
        size={14}
        numberOfLines={1}
        color={theme['c-font-label']}
        style={styles.singer}
      >
        {musicInfo.singer || ''}{musicInfo.album ? ` — ${musicInfo.album}` : ''}
      </Text>
    </View>
  )
})

const styles = createStyle({
  container: {
    flex: 0,
    // 与进度条保持左对齐
    paddingHorizontal: scaleSizeW(2),
    paddingTop: scaleSizeH(4),
    paddingBottom: scaleSizeH(10),
  },
  name: {
    fontWeight: '600',
  },
  singer: {
    marginTop: scaleSizeH(3),
  },
})
