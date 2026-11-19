import { useStatusText } from '@/store/player/hook'
import { createStyle } from '@/utils/tools'
import Text from '@/components/common/Text'
import { useTheme } from '@/store/theme/hook'


export default () => {
  const statusText = useStatusText()
  const theme = useTheme()
  // console.log('render status')

  return <Text style={styles.text} numberOfLines={1} size={11} color={theme['c-500']}>{statusText}</Text>
}

const styles = createStyle({
  text: {
    textAlign: 'center',
  },
})
