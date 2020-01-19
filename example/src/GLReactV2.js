//@flow
import React, { useState, useCallback } from 'react';
import { SafeAreaView, Image } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { Surface } from 'gl-react-native';
import GL from 'gl-react';
import Desc from './Desc';

const shaders = GL.Shaders.create({
  helloGL: {
    frag: `
precision highp float;
varying vec2 uv;
uniform float blue;
void main () {
  gl_FragColor = vec4(uv.x, uv.y, blue, 1.0);
}`,
  },
});

const HelloGL = GL.createComponent(
  ({ blue }) => <GL.Node shader={shaders.helloGL} uniforms={{ blue }} />,
  { displayName: 'HelloGL' },
);

const dimension = { width: 300, height: 300 };

const GLReactV2 = () => {
  const [source, setSource] = useState(null);
  const onCapture = useCallback(uri => setSource({ uri }), []);
  return (
    <SafeAreaView>
      <ViewShot onCapture={onCapture} captureMode="mount" style={dimension}>
        <Surface width={300} height={300}>
          <HelloGL blue={0.5} />
        </Surface>
      </ViewShot>

      <Desc desc="above is a gl-react surface and below is a capture of it" />

      <Image fadeDuration={0} source={source} style={dimension} />
    </SafeAreaView>
  );
};

GLReactV2.navigationOptions = {
  title: 'gl-react-native @ 2',
};

export default GLReactV2;
