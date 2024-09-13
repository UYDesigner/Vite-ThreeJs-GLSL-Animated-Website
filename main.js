import * as THREE from "three";
import { uniform } from "three/webgpu";
// import { alpha } from "three/webgpu";
import vertex from "./Shaders/vertex.glsl";
import fragment from "./Shaders/fragment.glsl";
import gsap from "gsap";

class Site {
   constructor({ dom }) {
      this.time = 0;
      this.container = dom;
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.images = [...document.querySelectorAll(".images img")]
      this.material;
      this.imageStore = [];
      this.uStartIndex = 0;
      this.uEndIndex = 1;
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(
         75,
         this.width / this.height,
         0.1,
         1000
      );
      this.camera.position.z = 200;
      this.camera.fov = 2 * Math.atan(this.height / 2 / 200) * (180 / Math.PI);
      this.renderer = new THREE.WebGLRenderer({
         antialias: true,
         alpha: true
      });
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(this.width, this.height)
      this.container.appendChild(this.renderer.domElement)
      this.renderer.render(this.scene, this.camera)
      this.resize()
      this.setUpResizee()
      this.addImages()
      this.setPostion()
      this.hoverOverLinks()
      this.render()
   }

   resize() {
      this.width = this.container.offsetWidth;
      this.height = this.container.offsetHeight;
      this.renderer.setSize(this.width, this.height);
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.setPostion();
   }

   setUpResizee() {
      window.addEventListener("resize", this.resize.bind(this));
   }

   setPostion() {
      this.imageStore.forEach((img) => {
         const bounds = img.img.getBoundingClientRect();
         img.mesh.position.y = -bounds.top + this.height / 2 - bounds.height / 2;
         img.mesh.position.x = bounds.left - this.width / 2 + bounds.width / 2;
      })
   }


   addImages() {
      const textureLoader = new THREE.TextureLoader()
      const texture = this.images.map(img => textureLoader.load(img.src))
      const uniforms = {
         uTime: { value: 0 },
         uTimeLine: { value: 0.2 },
         uStartIndex: { value: 0 },
         uEndIndex: { value: 1 },
         uImage1: { value: texture[0] },
         uImage2: { value: texture[1] },
         uImage3: { value: texture[2] },
         uImage4: { value: texture[3] }
     };
     
      this.material = new THREE.ShaderMaterial({
         uniforms: uniforms,
         vertexShader: vertex,
         fragmentShader: fragment,
         transparent: true,

      })
      this.images.forEach(img => {
         const bounds = img.getBoundingClientRect();
         const geometry = new THREE.PlaneGeometry(bounds.width, bounds.height);
         const mesh = new THREE.Mesh(geometry, this.material)
         this.scene.add(mesh);
         this.imageStore.push(
            {
               img: img,
               mesh: mesh,
               top: bounds.top,
               left: bounds.left,
               width: bounds.width,
               height: bounds.height
            }
         )
      })
   }

   hoverOverLinks() {
      const links = document.querySelectorAll(".links a");
      links.forEach((link, i) => {
          link.addEventListener("mouseover", () => {
              this.material.uniforms.uTimeLine.value = 0.0;
              gsap.to(this.material.uniforms.uTimeLine, {
                  value: 4.0,
                  duration: 2,
                  onStart: () => {
                      this.uEndIndex = i;
                      this.material.uniforms.uStartIndex.value = this.uStartIndex;
                      this.material.uniforms.uEndIndex.value = this.uEndIndex;
                  }
              });
          });
      });
  }
  



   render() {
      this.time += 0.4;
      //  console.log(this.time);
      this.material.uniforms.uTime.value = this.time;
      this.renderer.render(this.scene, this.camera)
      window.requestAnimationFrame(this.render.bind(this))
   }
}

new Site({
   dom: document.querySelector(".canvas")
});