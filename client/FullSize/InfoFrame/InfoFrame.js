import FullSize from "../FullSize";
import Draw from "../../Draw/Draw";

export default class InfoFrame extends FullSize {
    
    constructor(message) {
        //TODO: This screen int is unnecessary...
        super(0);
        
        this.message = message;
        
        this.render = function () {

            Draw.text(this.message, this.width / 2, 369, '#208C30', 16, 1, 'center');
            
            for (let i = 0; i < 36; i++) {
                [410, 520, 630, 740, 850].forEach((y) => {
                    Draw.text('=', (i * 25) + (this.cX) - 455, y);
                });
            }
            for (let i = 0; i < 76; i++) {
                [430, -460].forEach((x) => {
                    Draw.text('+', x + (this.cX), (i * 7) + 320, undefined, 24);
                })
            }

            [410, 520, 630, 740].forEach((y)=> {
                Draw.square(this.width / 2 - 435, y + 3, 80, 80, 'white', 0.2)
            });
            
        }
    }
}