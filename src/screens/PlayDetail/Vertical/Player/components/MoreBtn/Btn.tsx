import { Icon } from '@/components/common/Icon'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import { scaleSizeW } from '@/utils/pixelRatio'
import PressScale from '../../../components/PressScale'

export const BTN_WIDTH = scaleSizeW(36)
export const BTN_ICON_SIZE = 24

export default ({ icon, color, onPress, onLongPress }: {
  icon: string
  color?: string
  onPress: () => void
  onLongPress?: () => void
}) => {
  const theme = useTheme()
  return (
    <PressScale
      style={{ ...styles.cotrolBtn, width: BTN_WIDTH, height: BTN_WIDTH }}
      activeScale={0.84}
      hitSlop={8}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <Icon name={icon} color={color ?? theme['c-font-label']} size={BTN_ICON_SIZE} />
    </PressScale>
  )
}

const styles = createStyle({
  cotrolBtn: {
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
