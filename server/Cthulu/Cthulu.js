/*
 ===========================================================================================================

 Yes this is not how you spell Cthulhu, I'm standing by this typo. Long live Cthulu!

 ^(;,;)^

 Thanks /u/Liz_Me for this really detailed artwork that I've stolen!
 I think this really helps to visualize Cthulu.

 https://www.reddit.com/r/Cthulhu/comments/6429gn/looking_for_ascii_art_of_the_great_old_ones/dfz680w

 ============================================================================================================

 This class is intended to act as the main thread, It's responsibilities are gobbling up sockets as they come into
 existence. It should send the socket off to the socket manager.

*/

import ExpressManager from "../Express/ExpressManager";
import IOManager from "../IO/IOManager";

export default class Cthulu {

    constructor() {
        this.expressManager = new ExpressManager();
        this.expressManager.init();
        this.ioManager = new IOManager(this.expressManager.server);
        this.ioManager.init();
    }

    awaken() {
        this.expressManager.listen();
        this.ioManager.listen();
    }

    sleep() {
        this.expressManager.sleep();
        this.ioManager.sleep();
    }

}




