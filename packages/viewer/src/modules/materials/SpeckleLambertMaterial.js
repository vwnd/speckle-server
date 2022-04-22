/* eslint-disable */
import {
    speckle_lambert_vert
  } from './shaders/SpeckleLambertMaterial-vert'
  import {
    speckle_lambert_frag
  } from './shaders/SpeckleLambertMaterial-frag'
  import {
    MeshStandardMaterial,
    UniformsUtils,
    ShaderLib,
    Vector3
  } from 'three';
  import {
    Matrix4
  } from 'three';
import { MeshLambertMaterial } from 'three';
  
  
  class SpeckleLambertMaterial extends MeshLambertMaterial {
  
    constructor(parameters, defines = []) {
      super(parameters);
  
      this.vecBuff0 = new Vector3();
      this.matBuff0 = new Matrix4();
      this.matBuff1 = new Matrix4();
  
      this.userData.rtcMatrix = {
        value: new Matrix4()
      };
  
      this.vertProgram = speckle_lambert_vert;
      this.fragProgram = speckle_lambert_frag;
  
      this.uniforms = UniformsUtils.merge([
        ShaderLib.lambert.uniforms,
        {
          rtcMatrix: {
            value: this.userData.rtcMatrix.value
          }
        }
      ]);
  
      this.onBeforeCompile = function (shader) {
        shader.uniforms.rtcMatrix = this.userData.rtcMatrix;
        shader.vertexShader = this.vertProgram;
        shader.fragmentShader = this.fragProgram;
      };
  
      for (var k = 0; k < defines.length; k++) {
        this.defines[defines[k]] = "";
      }
    }
  
    copy( source ) {
  
        super.copy(source)
        this.userData = {};
        this.userData.rtcMatrix = {
            value: new Matrix4()
        };
  
        return this;
      }
  
    onBeforeRender( _this, scene, camera, geometry, object, group ) {
      this.matBuff0.identity();
      this.matBuff1.identity();
      
      if(!geometry.boundingBox) {
        geometry.computeBoundingBox();
      }
  
      geometry.boundingBox.getCenter(this.vecBuff0);
      object.updateMatrixWorld(true);
      this.matBuff0.setPosition(-this.vecBuff0.x, -this.vecBuff0.y, -this.vecBuff0.z);
      this.matBuff1.multiplyMatrices(this.matBuff0, object.matrixWorld);
      this.userData.rtcMatrix.value.copy(this.matBuff1);
      
  
      this.matBuff0.copy(camera.matrixWorld);
      this.matBuff0.setPosition(camera.position.x - this.vecBuff0.x, camera.position.y - this.vecBuff0.y, camera.position.z - this.vecBuff0.z);
      this.matBuff0.invert();
  
      camera.matrixWorldInverse.copy(this.matBuff0);
      object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, this.matBuff1 );
          object.normalMatrix.getNormalMatrix( object.modelViewMatrix );
      
    }
  
  }
  
  export default SpeckleLambertMaterial
  