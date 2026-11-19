import { memo, useState, useRef, useMemo, useEffect, useCallback, type ElementRef } from 'react'
import { View, AppState, Animated, Easing } from 'react-native'

import Header from './components/Header'
import Background from './components/Background'
// import Aside from './components/Aside'
// import Main from './components/Main'
import Player from './Player'
import PagerView, { type PagerViewOnPageSelectedEvent } from 'react-native-pager-view'
import Pic from './Pic'
import Lyric from './Lyric'
import { screenkeepAwake, screenUnkeepAwake } from '@/utils/nativeModules/utils'
import commonState, { type InitState as CommonState } from '@/store/common/state'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import { scaleSizeH } from '@/utils/pixelRatio'

const LyricPage = ({ activeIndex }: { activeIndex: number }) => {
  const initedRef = useRef(false)
  const lyric = useMemo(() => <Lyric />, [])
  switch (activeIndex) {
    // case 3:
    case 1:
      if (!initedRef.current) initedRef.current = true
      return lyric
    default:
      return initedRef.current ? lyric : null
  }
  // return activeIndex == 0 || activeIndex == 1 ? setting : null
}

// global.iskeep = false
export default memo(({ componentId }: { componentId: string }) => {
  const theme = useTheme()
  const [pageIndex, setPageIndex] = useState(0)
  const showLyricRef = useRef(false)
  const pagerRef = useRef<ElementRef<typeof PagerView>>(null)
  const appear = useRef(new Animated.Value(0)).current

  // 进入页面时内容轻微上浮淡入
  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [appear])

  const onPageSelected = ({ nativeEvent }: PagerViewOnPageSelectedEvent) => {
    setPageIndex(nativeEvent.position)
    showLyricRef.current = nativeEvent.position == 1
    if (showLyricRef.current) {
      screenkeepAwake()
    } else {
      screenUnkeepAwake()
    }
  }

  // 点击封面切到歌词页
  const showLyric = useCallback(() => {
    pagerRef.current?.setPage(1)
  }, [])

  useEffect(() => {
    let appstateListener = AppState.addEventListener('change', (state) => {
      switch (state) {
        case 'active':
          if (showLyricRef.current && !commonState.componentIds.comment) screenkeepAwake()
          break
        case 'background':
          screenUnkeepAwake()
          break
      }
    })

    const handleComponentIdsChange = (ids: CommonState['componentIds']) => {
      if (ids.comment) screenUnkeepAwake()
      else if (AppState.currentState == 'active') screenkeepAwake()
    }

    global.state_event.on('componentIdsUpdated', handleComponentIdsChange)

    return () => {
      global.state_event.off('componentIdsUpdated', handleComponentIdsChange)
      appstateListener.remove()
      screenUnkeepAwake()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <View style={styles.root}>
      <Background />
      <Animated.View
        style={[styles.container, {
          opacity: appear,
          transform: [{ translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [scaleSizeH(24), 0] }) }],
        }]}
      >
        <Header />
        <View style={styles.body}>
          <PagerView
            ref={pagerRef}
            onPageSelected={onPageSelected}
            // onPageScrollStateChanged={onPageScrollStateChanged}
            style={styles.pagerView}
          >
            <View collapsable={false}>
              <Pic componentId={componentId} onPress={showLyric} />
            </View>
            <View collapsable={false}>
              <LyricPage activeIndex={pageIndex} />
            </View>
          </PagerView>
          <View style={styles.pageIndicator} pointerEvents='none'>
            <View style={[styles.pageIndicatorItem, { backgroundColor: theme['c-font'], opacity: pageIndex == 0 ? 0.9 : 0.25 }]} />
            <View style={[styles.pageIndicatorItem, { backgroundColor: theme['c-font'], opacity: pageIndex == 1 ? 0.9 : 0.25 }]} />
          </View>
          <Player />
        </View>
      </Animated.View>
    </View>
  )
})


const styles = createStyle({
  root: {
    flex: 1,
    // 背景由 Background 组件绘制，这里保持透明
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  body: {
    flex: 1,
    flexDirection: 'column',
  },
  pagerView: {
    flexGrow: 1,
    flexShrink: 1,
    // height: '100%',
    // backgroundColor: '#333',
  },
  pageIndicator: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scaleSizeH(6),
  },
  pageIndicatorItem: {
    width: scaleSizeH(5),
    height: scaleSizeH(5),
    borderRadius: scaleSizeH(3),
    marginHorizontal: scaleSizeH(3),
  },
})

