import React from 'react';
import { Animated, Platform, StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import Logger from '../../src/api/Logger';

const ios = Platform.OS === 'ios';
const { width, height } = Dimensions.get('window');
// from native-base
const isIphoneX = () => {
  if (Platform.OS === 'android') {
    return false;
  }
  if (width === 375 && height === 812 || width === 812 && height === 375) {
    return true;
  }
  if (width === 414 && height === 896 || width === 896 && height === 414) {
    return true;
  }
  return false;
};

const iphoneXTopInset = 24;
const initToolbarHeight = ios ? 46 : 56;

const paddingTop = ios ? 18 : 0;
const topInset = isIphoneX() ? iphoneXTopInset : 0;

const toolbarHeight = initToolbarHeight + topInset + paddingTop;

export default class Header extends React.PureComponent {

  constructor(props) {
    super(props);
    this.headerHeight = props.headerMaxHeight;
    this.state = {
      scrollOffset: new Animated.Value(0),
      left: 0,
      bottom: 0,
      y: 0,
    };
  }

  onScroll = e => {
    if (this.props.disabled) {
      return;
    }
    this.state.scrollOffset.setValue(e.nativeEvent.contentOffset.y);
    this.setState({ y: e.nativeEvent.contentOffset.y });
  };

  onBackLayout = (e) => {
    const layout = e.nativeEvent.layout;
    const bottom = toolbarHeight - layout.y - layout.height - paddingTop - topInset;
    this.setState({ bottom: bottom, left: e.nativeEvent.layout.x })
  }

  _getFontSize = () => {
    const { scrollOffset } = this.state;
    const backFontSize = this.props.backTextStyle.fontSize;
    const titleFontSize = this.props.titleStyle.fontSize;
    return scrollOffset.interpolate({
      inputRange: [0, this.headerHeight - toolbarHeight],
      outputRange: [titleFontSize, backFontSize],
      extrapolate: 'clamp',
    });
  }

  _getLeft = () => {
    const { scrollOffset } = this.state;
    const left = this.props.titleStyle.left || Header.defaultProps.titleStyle.left;
    return scrollOffset.interpolate({
      inputRange: [0, this.headerHeight - toolbarHeight],
      outputRange: [left, this.state.left],
      extrapolate: 'clamp',
    });
  }

  _getHeight = () => {
    const { scrollOffset } = this.state;
    return scrollOffset.interpolate({
      inputRange: [0, this.headerHeight - toolbarHeight],
      outputRange: [this.headerHeight, toolbarHeight],
      extrapolate: 'clamp',
    })
  }

  _getBottom = () => {
    const { scrollOffset } = this.state;
    const bottom = this.props.titleStyle.bottom || Header.defaultProps.titleStyle.bottom;
    return scrollOffset.interpolate({
      inputRange: [0, this.headerHeight - toolbarHeight],
      outputRange: [bottom, this.state.bottom],
      extrapolate: 'clamp',
    });
  }

  _getOpacity = () => {
    const { scrollOffset } = this.state;
    return this.props.backText ? scrollOffset.interpolate({
      inputRange: [0, this.headerHeight - toolbarHeight],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    }) : 0
  }

  _getImageOpacity = () => {
    const { scrollOffset } = this.state;
    return this.props.imageSource ? scrollOffset.interpolate({
      inputRange: [0, this.headerHeight - toolbarHeight],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    }) : 0
  }

  _onPressBigTitle = () => {
    const { y } = this.state;
    const { onBackPress } = this.props;
    if (toolbarHeight - y <= 0) {
      onBackPress && onBackPress();
    }
  }

  render() {
    const { imageSource, toolbarColor, titleStyle, onBackPress, backStyle, backTextStyle } = this.props;
    const height = this._getHeight();
    const left = this._getLeft();
    const bottom = this._getBottom();
    const opacity = this._getOpacity();
    const fontSize = this._getFontSize();
    const imageOpacity = this._getImageOpacity();
    const headerStyle = this.props.noBorder ? undefined : { borderBottomWidth: 1, borderColor: '#a7a6ab' }


    return (
      <Animated.View
        style={[
          styles.header,
          headerStyle,
          {
            height: height,
            backgroundColor: toolbarColor,
          },
        ]}>
        {imageSource && <Animated.Image
          style={[StyleSheet.absoluteFill, { width: null, height: null, opacity: imageOpacity }]}
          source={imageSource}
          resizeMode='cover'
        />}
        <View style={styles.toolbarContainer}>
          <View style={styles.statusBar} />
          <View style={styles.toolbar}>
            {this.props.renderLeft && this.props.renderLeft()}
            <TouchableOpacity disabled={!onBackPress} onPress={onBackPress} activeOpacity={0.8} style={[styles.titleButton, backStyle]} onLayout={this.onBackLayout}>
              <Animated.Text allowFontScaling={false} style={[backTextStyle, { alignSelf: 'center', opacity: opacity }]}>{this.props.backText || 'Back2'}</Animated.Text>
            </TouchableOpacity>
            <View style={styles.flexView} />
            {this.props.renderRight && this.props.renderRight()}
          </View>
        </View>
        <Animated.Text
          allowFontScaling={false}
          style={[titleStyle, {
            position: 'absolute',
            left: left,
            bottom: bottom,
            fontSize,
          }]} onPress={this._onPressBigTitle}>
          {this.props.title}
        </Animated.Text>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  toolbarContainer: {
    height: toolbarHeight
  },
  statusBar: {
    height: topInset + paddingTop
  },
  toolbar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  titleButton: {
    flexDirection: 'row',
  },
  flexView: {
    flex: 1,
  },
});


Header.defaultProps = {
  backText: '',
  title: '',
  renderLeft: undefined,
  renderRight: undefined,
  backStyle: { marginLeft: 10 },
  backTextStyle: { fontSize: 16 },
  titleStyle: { fontSize: 20, left: 40, bottom: 30 },
  toolbarColor: '#FFF',
  headerMaxHeight: 200,
  disabled: false,
  imageSource: undefined,
}