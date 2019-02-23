import InfoFrame from "../InfoFrame";

export default class SearchingFrame extends InfoFrame {
    constructor() {
        super('Searching');
        this.ellipsePhase = 0;
        this.interval(() => {
            this.ellipsePhase++;
            if(this.ellipsePhase > 3) this.ellipsePhase = 0;
            var ellipse = '';
            var padding = '';
            _.times(this.ellipsePhase, () => ellipse += '.');
            _.times(this.ellipsePhase, () => padding += ' ');
            this.message = padding + 'Searching' + ellipse;
        }, 1000);
    }
}