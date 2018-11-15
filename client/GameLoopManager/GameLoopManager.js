import Draw from "../Draw/Draw";
import ScreenManager from "../Screen/ScreenManager";
import TitleScreen from "../Screen/TitleScreen/TitleScreen";

let instance = null;

export default class GameLoopManager {

   constructor(){

       if(instance) return instance;
       instance = this;

       this.MAX_FPS = 60;
       this.ctx = Draw.getCtx();
       this.lastFrameTimeMs = 0;
       this.screenManager = new ScreenManager()

   }

   loop(timestamp) {

       if (timestamp < this.lastFrameTimeMs + (1000 / this.MAX_FPS)) {
           requestAnimationFrame(this.loop.bind(this));
           return;
       }

       let delta = timestamp - this.lastFrameTimeMs;
       this.lastFrameTimeMs = timestamp;

       this.screenManager.tick(delta);

       this.ctx.font = "30px Arial";
       this.ctx.clearRect(0, 0, ScreenManager.width, ScreenManager.height);
       this.screenManager.render();
       this.ctx.font = "30px Arial";
       this.ctx.fillStyle = 'black';

       requestAnimationFrame(this.loop.bind(this));
   }

   init() {
       this.screenManager.set(new TitleScreen());
       requestAnimationFrame(this.loop.bind(this))
   }

}