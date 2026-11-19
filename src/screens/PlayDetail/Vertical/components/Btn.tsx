import { Icon } from '@/components/common/Icon'
import { createStyle } from '@/utils/tools'
import { scaleSizeH } from '@/utils/pixelRatio'
import { HEADER_HEIGHT as _HEADER_HEIGHT } from '@/config/constant'
import PressScale from './PressScale'

export const HEADER_HEIGHT = scaleSizeH(_HEADER_HEIGHT)

export default ({ icon, color, onPress, rotate = 0, size = 18 }: {
  icon: string
  color?: string
  onPress: () => void
  /** 图标旋转角度 */
  rotate?: number
  size?: number
}) => {
  return (
    <PressScale onPress={onPress} activeScale={0.82} hitSlop={6} style={styles.button}>
      <Icon
        name={icon}
        color={color}
        size={size}
        style={rotate ? { transform: [{ rotate: `${rotate}deg` }] } : undefined}
      />
    </PressScale>
  )
}

const styles = createStyle({
  button: {
    width: _HEADER_HEIGHT,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0,
  },
})
