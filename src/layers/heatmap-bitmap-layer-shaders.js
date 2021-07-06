import glsl from 'glslify';

/**
 * No change to the vertex shader from the base BitmapLayer.
 * Reference: https://github.com/visgl/deck.gl/blob/8.2-release/modules/layers/src/bitmap-layer/bitmap-layer-vertex.js
 */
export const vertexShader = glsl`
#define SHADER_NAME heatmap-bitmap-layer-vertex-shader

attribute vec2 texCoords;
attribute vec3 positions;
attribute vec3 positions64Low;

varying vec2 vTexCoord;

const vec3 pickingColor = vec3(1.0, 0.0, 0.0);

void main(void) {
  geometry.worldPosition = positions;
  geometry.uv = texCoords;
  geometry.pickingColor = pickingColor;

  gl_Position = project_position_to_clipspace(positions, positions64Low, vec3(0.0), geometry.position);
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  vTexCoord = texCoords;

  vec4 color = vec4(0.0);
  DECKGL_FILTER_COLOR(color, geometry);
}
`;

/**
 * Fragment shader adapted to perform aggregation and
 * take color scale functions + sliders into account.
 * Reference: https://github.com/visgl/deck.gl/blob/8.2-release/modules/layers/src/bitmap-layer/bitmap-layer-fragment.js
 * Reference: https://github.com/hms-dbmi/viv/blob/06231ae02cac1ff57ba458c71e9bc59ed2fc4f8b/src/layers/XRLayer/xr-layer-fragment-colormap.webgl1.glsl
 */
export const fragmentShader = glsl`
#define SHADER_NAME heatmap-bitmap-layer-fragment-shader

#ifdef GL_ES
precision mediump float;
#endif

#pragma glslify: rdbu = require("glsl-colormap/rdbu")
#pragma glslify: jet = require("glsl-colormap/jet")
#pragma glslify: viridis = require("glsl-colormap/viridis")
#pragma glslify: inferno = require("glsl-colormap/inferno")
#pragma glslify: magma = require("glsl-colormap/magma")
#pragma glslify: plasma = require("glsl-colormap/plasma")

// The texture (GL.LUMINANCE & Uint8Array).
uniform sampler2D uBitmapTexture;

// What are the dimensions of the texture (width, height)?
uniform vec2 uTextureSize;

// How many consecutive pixels should be aggregated together along each axis?
uniform vec2 uAggSize;

// What are the values of the color scale sliders?
uniform vec2 uColorScaleRange;

// The texture coordinate, varying (interpolated between values set by the vertex shader).
varying vec2 vTexCoord;

void main(void) {
  // Compute 1 pixel in texture coordinates
  vec2 onePixel = vec2(1.0, 1.0) / uTextureSize;
  
  vec2 viewCoord = vec2(floor(vTexCoord.x * uTextureSize.x), floor(vTexCoord.y * uTextureSize.y));

  // Compute (x % aggSizeX, y % aggSizeY).
  // These values will be the number of values to the left / above the current position to consider.
  vec2 modAggSize = vec2(-1.0 * mod(viewCoord.x, uAggSize.x), -1.0 * mod(viewCoord.y, uAggSize.y));

  // Take the sum of values along each axis.
  float intensitySum = 0.0;
  vec2 offsetPixels = vec2(0.0, 0.0);

  for(int i = 0; i < 16; i++) {
    // Check to break outer loop early.
    // Uniforms cannot be used as conditions in GLSL for loops.
    if(float(i) >= uAggSize.y) {
      // Done in the y direction.
      break;
    }

    offsetPixels = vec2(offsetPixels.x, (modAggSize.y + float(i)) * onePixel.y);

    for(int j = 0; j < 16; j++) {
      // Check to break inner loop early.
      // Uniforms cannot be used as conditions in GLSL for loops.
      if(float(j) >= uAggSize.x) {
        // Done in the x direction.
        break;
      }

      offsetPixels = vec2((modAggSize.x + float(j)) * onePixel.x, offsetPixels.y);
      intensitySum += texture2D(uBitmapTexture, vTexCoord + offsetPixels).r;
    }
  }
  
  // Compute the mean value.
  float intensityMean = intensitySum / (uAggSize.x * uAggSize.y);
  
  // Re-scale using the color scale slider values.
  float scaledIntensityMean = (intensityMean - uColorScaleRange[0]) / max(0.005, (uColorScaleRange[1] - uColorScaleRange[0]));

  gl_FragColor = __colormap(clamp(scaledIntensityMean, 0.0, 1.0));

  geometry.uv = vTexCoord;
  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;
